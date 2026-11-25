-- Bookings and package orders for the Nilepods website, paid by card through Paymob.
--
-- Flow
--   1. Website calls the `checkout` Edge Function with the booking details.
--   2. The function (service role) calls create_booking / create_package_order below.
--      These validate everything, compute the price on the server, and HOLD the slot
--      for 20 minutes with status 'pending_payment'.
--   3. The function creates a Paymob payment intention and sends the visitor to
--      Paymob's hosted checkout. Card details are entered on Paymob, never on this site.
--   4. Paymob calls the `paymob-webhook` Edge Function. After verifying the HMAC it calls
--      record_payment(), which marks the booking paid + confirmed, or releases the slot.
--
-- Security model
--   * RLS on, no policies: the publishable (anon) key cannot read or write these tables.
--   * The only thing the public can call is get_busy_slots(), which returns taken hours
--     without any names, emails or phone numbers.
--   * Everything else is callable only by the service role (Edge Functions).

create extension if not exists btree_gist with schema extensions;

-- ---------------------------------------------------------------- tables

create table public.bookings (
  id                     uuid primary key default gen_random_uuid(),
  ref                    text not null unique,
  service                text not null check (service in ('rec', 'mix', 'pro')),
  setup_id               text not null check (setup_id in ('s1', 's2', 's3', 's4', 's5', 's6', 's7')),
  starts_at              timestamptz not null,
  ends_at                timestamptz not null,
  people                 int  not null check (people between 1 and 2),
  extra_hours            int  not null default 0 check (extra_hours between 0 and 3),
  extra_cameras          int  not null default 0 check (extra_cameras between 0 and 2),
  extra_mics             int  not null default 0 check (extra_mics between 0 and 2),
  photographer           boolean not null default false,
  first_name             text not null check (char_length(first_name) between 1 and 80),
  last_name              text not null check (char_length(last_name) between 1 and 80),
  email                  text not null check (char_length(email) <= 254 and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  phone                  text check (char_length(phone) <= 30),
  whatsapp_ok            boolean not null default false,
  total_egp              int  not null check (total_egp >= 0),
  payment_status         text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  status                 text not null default 'pending_payment'
                           check (status in ('pending_payment', 'confirmed', 'expired', 'cancelled', 'completed', 'no_show', 'needs_review')),
  hold_expires_at        timestamptz,
  paymob_order_id        bigint,
  paymob_transaction_id  bigint,
  paid_at                timestamptz,
  created_at             timestamptz not null default now(),
  check (ends_at > starts_at),
  -- A setup can never be double-booked. Expired holds and cancellations free the slot.
  constraint bookings_no_overlap exclude using gist (
    setup_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending_payment', 'confirmed', 'completed', 'no_show'))
);

create index bookings_starts_at_idx on public.bookings (starts_at);
create index bookings_email_idx on public.bookings (lower(email));

create table public.package_orders (
  id                     uuid primary key default gen_random_uuid(),
  ref                    text not null unique,
  service                text not null check (service in ('rec', 'mix', 'pro')),
  sessions               int  not null check (sessions in (1, 3, 5, 10)),
  total_egp              int  not null check (total_egp >= 0),
  first_name             text not null check (char_length(first_name) between 1 and 80),
  last_name              text not null check (char_length(last_name) between 1 and 80),
  email                  text not null check (char_length(email) <= 254 and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  phone                  text check (char_length(phone) <= 30),
  whatsapp_ok            boolean not null default false,
  payment_status         text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  status                 text not null default 'pending_payment' check (status in ('pending_payment', 'active', 'expired', 'cancelled')),
  paymob_order_id        bigint,
  paymob_transaction_id  bigint,
  paid_at                timestamptz,
  created_at             timestamptz not null default now()
);

create index package_orders_email_idx on public.package_orders (lower(email));

alter table public.bookings       enable row level security;
alter table public.package_orders enable row level security;
revoke all on public.bookings, public.package_orders from anon, authenticated;

-- ---------------------------------------------------------------- helpers (not callable by the public)

create or replace function public.np_new_ref()
returns text language sql volatile set search_path = '' as $$
  select 'NP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

create or replace function public.np_service_price(p_service text)
returns int language sql immutable set search_path = '' as $$
  select case p_service when 'rec' then 1150 when 'mix' then 1450 when 'pro' then 1950 end;
$$;

-- Releases slots whose 20-minute payment hold has run out.
create or replace function public.np_expire_holds()
returns void language sql volatile set search_path = '' as $$
  update public.bookings set status = 'expired', payment_status = 'failed'
  where status = 'pending_payment' and hold_expires_at < now();
$$;

revoke all on function public.np_new_ref(), public.np_service_price(text), public.np_expire_holds() from public, anon, authenticated;

-- ---------------------------------------------------------------- availability (public, no personal data)

create or replace function public.get_busy_slots(p_from date, p_to date)
returns table (setup_id text, day date, start_hour int, end_hour int)
language sql stable security definer set search_path = '' as $$
  select b.setup_id,
         (b.starts_at at time zone 'Africa/Cairo')::date,
         extract(hour from b.starts_at at time zone 'Africa/Cairo')::int,
         extract(hour from b.ends_at   at time zone 'Africa/Cairo')::int
  from public.bookings b
  where (b.status in ('confirmed', 'completed', 'no_show')
         or (b.status = 'pending_payment' and b.hold_expires_at > now()))
    and (b.starts_at at time zone 'Africa/Cairo')::date between p_from and least(p_to, p_from + 92);
$$;
revoke all on function public.get_busy_slots(date, date) from public;
grant execute on function public.get_busy_slots(date, date) to anon, authenticated;

-- ---------------------------------------------------------------- create a session booking (service role only)

create or replace function public.create_booking(
  p_service text, p_setup_id text, p_date date, p_start_hour int, p_people int,
  p_extra_hours int, p_extra_cameras int, p_extra_mics int, p_photographer boolean,
  p_first_name text, p_last_name text, p_email text, p_phone text, p_whatsapp_ok boolean
)
returns table (ref text, total_egp int)
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_now_cairo timestamp := now() at time zone 'Africa/Cairo';
  v_hours     int := 1 + coalesce(p_extra_hours, 0);
  v_cap       int;
  v_price     int := public.np_service_price(p_service);
  v_total     int;
  v_start     timestamptz;
  v_ref       text := public.np_new_ref();
  v_email     text := lower(trim(p_email));
begin
  if v_price is null then raise exception 'invalid_service' using errcode = '22023'; end if;
  v_cap := case p_setup_id when 's1' then 1 when 's2' then 1 when 's3' then 2 when 's4' then 1
                           when 's5' then 2 when 's6' then 2 when 's7' then 1 end;
  if v_cap is null then raise exception 'invalid_setup' using errcode = '22023'; end if;
  if p_people is null or p_people < 1 or p_people > v_cap then raise exception 'invalid_people' using errcode = '22023'; end if;
  if extract(isodow from p_date) = 5 then raise exception 'closed_friday' using errcode = '22023'; end if;
  if p_date > v_now_cairo::date + 60 then raise exception 'too_far_ahead' using errcode = '22023'; end if;
  if p_start_hour is null or p_start_hour < 15 or p_start_hour + v_hours > 23 then raise exception 'outside_opening_hours' using errcode = '22023'; end if;
  if (p_date + make_time(p_start_hour, 0, 0)) <= v_now_cairo then raise exception 'in_the_past' using errcode = '22023'; end if;

  -- abuse guard: at most 5 booking attempts per email per hour
  if (select count(*) from public.bookings b where lower(b.email) = v_email and b.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'too_many_requests' using errcode = '22023';
  end if;

  perform public.np_expire_holds();

  v_total := v_price * v_hours + 90 * coalesce(p_extra_cameras, 0) + 100 * coalesce(p_extra_mics, 0)
             + case when p_photographer then 250 else 0 end;
  v_start := (p_date + make_time(p_start_hour, 0, 0)) at time zone 'Africa/Cairo';

  begin
    insert into public.bookings (ref, service, setup_id, starts_at, ends_at, people, extra_hours, extra_cameras,
      extra_mics, photographer, first_name, last_name, email, phone, whatsapp_ok, total_egp, hold_expires_at)
    values (v_ref, p_service, p_setup_id, v_start, v_start + make_interval(hours => v_hours), p_people,
      coalesce(p_extra_hours, 0), coalesce(p_extra_cameras, 0), coalesce(p_extra_mics, 0), coalesce(p_photographer, false),
      trim(p_first_name), trim(p_last_name), v_email, nullif(trim(p_phone), ''), coalesce(p_whatsapp_ok, false), v_total,
      now() + interval '20 minutes');
  exception when exclusion_violation then
    raise exception 'slot_taken' using errcode = '23P01';
  end;

  return query select v_ref, v_total;
end;
$$;

-- ---------------------------------------------------------------- create a package order (service role only)

create or replace function public.create_package_order(
  p_service text, p_sessions int,
  p_first_name text, p_last_name text, p_email text, p_phone text, p_whatsapp_ok boolean
)
returns table (ref text, total_egp int)
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_price int := public.np_service_price(p_service);
  v_disc  numeric := case p_sessions when 1 then 0 when 3 then 0.05 when 5 then 0.10 when 10 then 0.15 end;
  v_total int;
  v_ref   text := public.np_new_ref();
  v_email text := lower(trim(p_email));
begin
  if v_price is null then raise exception 'invalid_service' using errcode = '22023'; end if;
  if v_disc is null then raise exception 'invalid_sessions' using errcode = '22023'; end if;
  if (select count(*) from public.package_orders o where lower(o.email) = v_email and o.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'too_many_requests' using errcode = '22023';
  end if;
  -- same rounding as the website: nearest 10 EGP
  v_total := (round(v_price * p_sessions * (1 - v_disc) / 10.0) * 10)::int;

  insert into public.package_orders (ref, service, sessions, total_egp, first_name, last_name, email, phone, whatsapp_ok)
  values (v_ref, p_service, p_sessions, v_total, trim(p_first_name), trim(p_last_name), v_email,
          nullif(trim(p_phone), ''), coalesce(p_whatsapp_ok, false));

  return query select v_ref, v_total;
end;
$$;

-- ---------------------------------------------------------------- record a verified Paymob result (service role only)

create or replace function public.record_payment(
  p_ref text, p_success boolean, p_amount_cents bigint, p_paymob_order_id bigint, p_paymob_transaction_id bigint
)
returns text
language plpgsql volatile security definer set search_path = '' as $$
declare
  b public.bookings%rowtype;
  o public.package_orders%rowtype;
begin
  select * into b from public.bookings where ref = p_ref for update;
  if found then
    if b.payment_status = 'paid' then return 'already_paid'; end if;
    if not p_success then
      update public.bookings set payment_status = 'failed',
        status = case when status = 'pending_payment' then 'expired' else status end,
        paymob_order_id = p_paymob_order_id, paymob_transaction_id = p_paymob_transaction_id
      where id = b.id;
      return 'failed';
    end if;
    if p_amount_cents <> b.total_egp::bigint * 100 then
      update public.bookings set status = 'needs_review', payment_status = 'paid', paid_at = now(),
        paymob_order_id = p_paymob_order_id, paymob_transaction_id = p_paymob_transaction_id where id = b.id;
      return 'amount_mismatch';
    end if;
    begin
      update public.bookings set status = 'confirmed', payment_status = 'paid', paid_at = now(), hold_expires_at = null,
        paymob_order_id = p_paymob_order_id, paymob_transaction_id = p_paymob_transaction_id where id = b.id;
    exception when exclusion_violation then
      -- Paid after the hold ran out and someone else took the slot: staff must rebook or refund.
      update public.bookings set status = 'needs_review', payment_status = 'paid', paid_at = now(),
        paymob_order_id = p_paymob_order_id, paymob_transaction_id = p_paymob_transaction_id where id = b.id;
      return 'paid_slot_lost';
    end;
    return 'confirmed';
  end if;

  select * into o from public.package_orders where ref = p_ref for update;
  if found then
    if o.payment_status = 'paid' then return 'already_paid'; end if;
    if not p_success then
      update public.package_orders set payment_status = 'failed', status = 'expired',
        paymob_order_id = p_paymob_order_id, paymob_transaction_id = p_paymob_transaction_id where id = o.id;
      return 'failed';
    end if;
    update public.package_orders set payment_status = 'paid', paid_at = now(),
      status = case when p_amount_cents = o.total_egp::bigint * 100 then 'active' else 'pending_payment' end,
      paymob_order_id = p_paymob_order_id, paymob_transaction_id = p_paymob_transaction_id where id = o.id;
    return case when p_amount_cents = o.total_egp::bigint * 100 then 'confirmed' else 'amount_mismatch' end;
  end if;

  return 'not_found';
end;
$$;

-- Public status check for the "thank you" page: returns only the status of one reference.
create or replace function public.get_payment_status(p_ref text)
returns table (kind text, status text, payment_status text)
language sql stable security definer set search_path = '' as $$
  select 'session', b.status, b.payment_status from public.bookings b where b.ref = p_ref
  union all
  select 'package', o.status, o.payment_status from public.package_orders o where o.ref = p_ref;
$$;

revoke all on function public.create_booking(text, text, date, int, int, int, int, int, boolean, text, text, text, text, boolean),
                       public.create_package_order(text, int, text, text, text, text, boolean),
                       public.record_payment(text, boolean, bigint, bigint, bigint)
  from public, anon, authenticated;
revoke all on function public.get_payment_status(text) from public;
grant execute on function public.get_payment_status(text) to anon, authenticated;
