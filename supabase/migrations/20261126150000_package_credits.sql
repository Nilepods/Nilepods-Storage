-- Package credits ("balance"). Additive only: nothing is dropped or deleted.
--
-- A package order (3/5/10 sessions) that is active gives the buyer that many credits,
-- valid for 90 days from purchase. Booking while signed in with the same verified email
-- spends one credit: it covers the first hour of the package's service; extra hours and
-- extras are still paid (card or at the studio). Credits used = the package's bookings
-- that are not cancelled or expired, so cancelling a booking gives the credit back.

alter table public.bookings add column if not exists package_ref text references public.package_orders(ref);
create index if not exists bookings_package_ref_idx on public.bookings (package_ref);

-- Credits used on a package (live count, so cancellations refund automatically).
create or replace function public.np_credits_used(p_package_ref text)
returns int language sql stable set search_path = '' as $$
  select count(*)::int from public.bookings b
  where b.package_ref = p_package_ref and b.status in ('pending_payment', 'confirmed', 'in_studio', 'completed', 'no_show');
$$;
revoke all on function public.np_credits_used(text) from public, anon, authenticated;

-- The signed-in customer's packages with what's left.
create or replace function public.my_packages()
returns table (ref text, service text, sessions int, used int, remaining int, expires_at timestamptz,
               status text, payment_status text, payment_method text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select o.ref, o.service, o.sessions, public.np_credits_used(o.ref),
         greatest(o.sessions - public.np_credits_used(o.ref), 0),
         o.created_at + interval '90 days', o.status, o.payment_status, o.payment_method, o.created_at
  from public.package_orders o
  where lower(o.email) = public.np_my_email() and public.np_my_email() <> ''
    and o.status = 'active'
  order by o.created_at desc;
$$;
revoke all on function public.my_packages() from public, anon;
grant execute on function public.my_packages() to authenticated;

-- Spends one credit on a just-created booking (service role only, called by checkout).
-- Locks the package row so two bookings can't spend the same last credit.
-- Returns the booking's new total. If nothing is left to pay, the booking is confirmed.
create or replace function public.apply_package_credit(p_booking_ref text, p_package_ref text, p_email text)
returns int language plpgsql volatile security definer set search_path = '' as $$
declare
  o public.package_orders%rowtype;
  b public.bookings%rowtype;
  v_total int;
begin
  select * into o from public.package_orders where ref = p_package_ref for update;
  if not found or lower(o.email) <> lower(trim(p_email)) then raise exception 'not_your_package' using errcode = '42501'; end if;
  if o.status <> 'active' then raise exception 'package_not_active' using errcode = '22023'; end if;
  if o.created_at + interval '90 days' < now() then raise exception 'package_expired' using errcode = '22023'; end if;
  if public.np_credits_used(o.ref) >= o.sessions then raise exception 'no_credits_left' using errcode = '22023'; end if;

  select * into b from public.bookings where ref = p_booking_ref and status = 'pending_payment' for update;
  if not found then raise exception 'booking_not_found' using errcode = '22023'; end if;
  if b.service <> o.service then raise exception 'wrong_service' using errcode = '22023'; end if;
  if lower(b.email) <> lower(o.email) then raise exception 'not_your_package' using errcode = '42501'; end if;

  v_total := greatest(b.total_egp - public.np_service_price(b.service), 0);
  update public.bookings set package_ref = o.ref, total_egp = v_total where id = b.id;
  if v_total = 0 then
    update public.bookings set status = 'confirmed', hold_expires_at = null, payment_status = 'paid', paid_at = now() where id = b.id;
  end if;
  return v_total;
end;
$$;
revoke all on function public.apply_package_credit(text, text, text) from public, anon, authenticated;
