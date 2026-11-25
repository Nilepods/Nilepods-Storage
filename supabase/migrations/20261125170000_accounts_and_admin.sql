-- Customer sign-in, staff dashboard access, sign-in history and test data.
--
-- Sign-in uses Supabase Auth email links (no passwords). Anyone can sign in as a
-- customer and see only bookings made with their own verified email address.
-- Only emails on the staff list can use the admin dashboard, with these roles:
--   owner      everything, including team & access and clearing test data
--   manager    everything except team & access
--   front_desk schedule, bookings and tours; can check guests in / mark no-shows

-- ---------------------------------------------------------------- bookings: new status + test flag

alter table public.bookings drop constraint bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending_payment', 'confirmed', 'in_studio', 'expired', 'cancelled', 'completed', 'no_show', 'needs_review'));
alter table public.bookings drop constraint bookings_no_overlap;
alter table public.bookings add constraint bookings_no_overlap exclude using gist (
  setup_id with =, tstzrange(starts_at, ends_at, '[)') with &&
) where (status in ('pending_payment', 'confirmed', 'in_studio', 'completed', 'no_show'));

-- Bookings paid with Paymob TEST keys are test data and can be cleared by the owner.
alter table public.bookings       add column is_test boolean not null default false;
alter table public.package_orders add column is_test boolean not null default false;
update public.bookings set is_test = true;        -- everything so far was made during testing
update public.package_orders set is_test = true;

create or replace function public.get_busy_slots(p_from date, p_to date)
returns table (setup_id text, day date, start_hour int, end_hour int)
language sql stable security definer set search_path = '' as $$
  select b.setup_id,
         (b.starts_at at time zone 'Africa/Cairo')::date,
         extract(hour from b.starts_at at time zone 'Africa/Cairo')::int,
         extract(hour from b.ends_at   at time zone 'Africa/Cairo')::int
  from public.bookings b
  where (b.status in ('confirmed', 'in_studio', 'completed', 'no_show')
         or (b.status = 'pending_payment' and b.hold_expires_at > now()))
    and (b.starts_at at time zone 'Africa/Cairo')::date between p_from and least(p_to, p_from + 92);
$$;

-- ---------------------------------------------------------------- staff

create table public.staff (
  email       text primary key check (email = lower(email) and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  name        text not null check (char_length(name) between 1 and 80),
  role        text not null check (role in ('owner', 'manager', 'front_desk')),
  status      text not null default 'invited' check (status in ('invited', 'active', 'paused')),
  invited_by  text,
  created_at  timestamptz not null default now(),
  last_sign_in_at timestamptz
);
alter table public.staff enable row level security;
revoke all on public.staff from anon, authenticated;

create table public.sign_ins (
  id        bigint generated always as identity primary key,
  email     text not null,
  kind      text not null check (kind in ('staff', 'customer')),
  at        timestamptz not null default now()
);
create index sign_ins_at_idx on public.sign_ins (at desc);
alter table public.sign_ins enable row level security;
revoke all on public.sign_ins from anon, authenticated;

-- Verified email of the signed-in user ('' when signed out).
create or replace function public.np_my_email()
returns text language sql stable set search_path = '' as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- Role of the signed-in user if they are active staff, else null.
create or replace function public.np_my_role()
returns text language sql stable security definer set search_path = '' as $$
  select s.role from public.staff s where s.email = public.np_my_email() and s.status in ('invited', 'active');
$$;
revoke all on function public.np_my_email(), public.np_my_role() from public, anon;
grant execute on function public.np_my_email(), public.np_my_role() to authenticated;

-- ---------------------------------------------------------------- sign-in (called by the site right after signing in)

-- Records the sign-in and returns who you are: { role, name, email } (role is null for customers).
create or replace function public.record_sign_in()
returns table (email text, name text, role text)
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_email text := public.np_my_email();
  v_staff public.staff%rowtype;
  v_is_staff boolean;
begin
  if v_email = '' then raise exception 'not_signed_in' using errcode = '28000'; end if;
  select * into v_staff from public.staff s where s.email = v_email;
  v_is_staff := found and v_staff.status <> 'paused';
  -- at most one history row per person per 10 minutes
  if not exists (select 1 from public.sign_ins i where i.email = v_email and i.at > now() - interval '10 minutes') then
    insert into public.sign_ins (email, kind) values (v_email, case when v_is_staff then 'staff' else 'customer' end);
  end if;
  if v_is_staff then
    update public.staff s set status = 'active', last_sign_in_at = now() where s.email = v_email;
    return query select v_email, v_staff.name, v_staff.role;
  else
    return query select v_email, null::text, null::text;
  end if;
end;
$$;
revoke all on function public.record_sign_in() from public, anon;
grant execute on function public.record_sign_in() to authenticated;

-- ---------------------------------------------------------------- customers: their own bookings

create or replace function public.my_bookings()
returns table (ref text, kind text, service text, setup_id text, starts_at timestamptz, ends_at timestamptz,
               sessions int, total_egp int, status text, payment_status text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select b.ref, 'session', b.service, b.setup_id, b.starts_at, b.ends_at, null::int, b.total_egp, b.status, b.payment_status, b.created_at
  from public.bookings b
  where lower(b.email) = public.np_my_email() and public.np_my_email() <> ''
    and b.status not in ('pending_payment', 'expired')
  union all
  select o.ref, 'package', o.service, null, null, null, o.sessions, o.total_egp, o.status, o.payment_status, o.created_at
  from public.package_orders o
  where lower(o.email) = public.np_my_email() and public.np_my_email() <> ''
    and o.status not in ('pending_payment', 'expired')
  order by 5 desc nulls last, 11 desc;
$$;
revoke all on function public.my_bookings() from public, anon;
grant execute on function public.my_bookings() to authenticated;

-- ---------------------------------------------------------------- staff: read access (row level security)

create policy staff_read_bookings on public.bookings for select to authenticated
  using (public.np_my_role() is not null);
create policy staff_read_orders on public.package_orders for select to authenticated
  using (public.np_my_role() in ('owner', 'manager'));
create policy staff_read_staff on public.staff for select to authenticated
  using (public.np_my_role() is not null);
create policy staff_read_sign_ins on public.sign_ins for select to authenticated
  using (public.np_my_role() in ('owner', 'manager'));
grant select on public.bookings, public.package_orders, public.staff, public.sign_ins to authenticated;

-- ---------------------------------------------------------------- staff: actions

create or replace function public.staff_update_booking(p_ref text, p_status text default null, p_mark_paid boolean default false)
returns text language plpgsql volatile security definer set search_path = '' as $$
declare v_role text := public.np_my_role(); b public.bookings%rowtype;
begin
  if v_role is null then raise exception 'not_staff' using errcode = '42501'; end if;
  select * into b from public.bookings where ref = p_ref for update;
  if not found then raise exception 'not_found' using errcode = '22023'; end if;
  if p_status is not null then
    if p_status not in ('in_studio', 'completed', 'no_show', 'cancelled', 'confirmed') then raise exception 'invalid_status' using errcode = '22023'; end if;
    if p_status = 'cancelled' and v_role = 'front_desk' then raise exception 'not_allowed' using errcode = '42501'; end if;
    update public.bookings set status = p_status where id = b.id;
  end if;
  if p_mark_paid then
    update public.bookings set payment_status = 'paid', paid_at = coalesce(paid_at, now()) where id = b.id;
  end if;
  return 'ok';
end;
$$;

create or replace function public.staff_invite(p_email text, p_role text)
returns text language plpgsql volatile security definer set search_path = '' as $$
declare v_email text := lower(trim(p_email)); v_name text;
begin
  if public.np_my_role() is distinct from 'owner' then raise exception 'owner_only' using errcode = '42501'; end if;
  if p_role not in ('manager', 'front_desk') then raise exception 'invalid_role' using errcode = '22023'; end if;
  v_name := initcap(regexp_replace(split_part(v_email, '@', 1), '[._-]+', ' ', 'g'));
  insert into public.staff (email, name, role, status, invited_by) values (v_email, v_name, p_role, 'invited', public.np_my_email());
  return 'ok';
exception when unique_violation then raise exception 'already_on_team' using errcode = '22023';
end;
$$;

create or replace function public.staff_change(p_email text, p_role text default null, p_status text default null, p_remove boolean default false)
returns text language plpgsql volatile security definer set search_path = '' as $$
declare v_target public.staff%rowtype;
begin
  if public.np_my_role() is distinct from 'owner' then raise exception 'owner_only' using errcode = '42501'; end if;
  select * into v_target from public.staff where email = lower(p_email) for update;
  if not found then raise exception 'not_found' using errcode = '22023'; end if;
  if v_target.role = 'owner' then raise exception 'cannot_change_owner' using errcode = '42501'; end if;
  if p_remove then delete from public.staff where email = v_target.email; return 'removed'; end if;
  if p_role is not null then
    if p_role not in ('manager', 'front_desk') then raise exception 'invalid_role' using errcode = '22023'; end if;
    update public.staff set role = p_role where email = v_target.email;
  end if;
  if p_status is not null then
    if p_status not in ('active', 'paused') then raise exception 'invalid_status' using errcode = '22023'; end if;
    update public.staff set status = p_status where email = v_target.email;
  end if;
  return 'ok';
end;
$$;

-- Deletes only bookings / package orders flagged as test data. Owner only.
create or replace function public.clear_test_data()
returns table (bookings_deleted int, orders_deleted int)
language plpgsql volatile security definer set search_path = '' as $$
declare v_nb int; v_no int;
begin
  if public.np_my_role() is distinct from 'owner' then raise exception 'owner_only' using errcode = '42501'; end if;
  delete from public.bookings where is_test; get diagnostics v_nb = row_count;
  delete from public.package_orders where is_test; get diagnostics v_no = row_count;
  return query select v_nb, v_no;
end;
$$;

revoke all on function public.staff_update_booking(text, text, boolean), public.staff_invite(text, text),
                       public.staff_change(text, text, text, boolean), public.clear_test_data() from public, anon;
grant execute on function public.staff_update_booking(text, text, boolean), public.staff_invite(text, text),
                          public.staff_change(text, text, text, boolean), public.clear_test_data() to authenticated;

-- ---------------------------------------------------------------- mark new bookings as test while Paymob is in test mode

create or replace function public.mark_test(p_ref text)
returns void language sql volatile security definer set search_path = '' as $$
  update public.bookings set is_test = true where ref = p_ref;
  update public.package_orders set is_test = true where ref = p_ref;
$$;
revoke all on function public.mark_test(text) from public, anon, authenticated;

-- First owner of the admin dashboard
insert into public.staff (email, name, role, status, invited_by)
values ('admin@nilepods.com', 'Studio Owner', 'owner', 'invited', 'setup');
