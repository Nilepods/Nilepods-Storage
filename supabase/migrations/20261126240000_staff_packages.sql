-- Admin: list packages and cancel them (Owner / Manager only).

alter table public.package_orders
  add column if not exists cancelled_at timestamptz;

-- Every package with usage, for the admin Packages section.
create or replace function public.staff_packages()
returns table (ref text, created_at timestamptz, first_name text, last_name text, email text, phone text,
               service text, sessions int, used int, remaining int, upcoming int, total_egp int,
               status text, payment_status text, payment_method text, expires_at timestamptz,
               cancelled_at timestamptz, is_test boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if coalesce(public.np_my_role(), '') not in ('owner', 'manager') then raise exception 'not_allowed' using errcode = '42501'; end if;
  return query
    select o.ref, o.created_at, o.first_name, o.last_name, o.email, o.phone, o.service, o.sessions,
           public.np_credits_used(o.ref), greatest(o.sessions - public.np_credits_used(o.ref), 0),
           (select count(*)::int from public.bookings b where b.package_ref = o.ref and b.status = 'confirmed' and b.starts_at > now()),
           o.total_egp, o.status, o.payment_status, o.payment_method,
           o.created_at + make_interval(days => public.np_package_valid_days(o.sessions)), o.cancelled_at, o.is_test
    from public.package_orders o
    where o.status in ('active', 'cancelled')
    order by o.created_at desc
    limit 500;
end;
$$;
revoke all on function public.staff_packages() from public, anon;
grant execute on function public.staff_packages() to authenticated;

-- Cancels a package: its remaining sessions can no longer be used.
-- p_cancel_bookings: also cancel the upcoming sessions already booked with it.
-- Returns how many upcoming sessions were cancelled.
create or replace function public.staff_cancel_package(p_ref text, p_cancel_bookings boolean default false)
returns int
language plpgsql volatile security definer set search_path = '' as $$
declare o public.package_orders%rowtype; v_n int := 0;
begin
  if coalesce(public.np_my_role(), '') not in ('owner', 'manager') then raise exception 'not_allowed' using errcode = '42501'; end if;
  select * into o from public.package_orders x where x.ref = p_ref for update;
  if not found then raise exception 'not_found' using errcode = '22023'; end if;
  if o.status <> 'active' then raise exception 'cannot_cancel' using errcode = '22023'; end if;
  update public.package_orders set status = 'cancelled', cancelled_at = now() where ref = o.ref;
  if p_cancel_bookings then
    update public.bookings set status = 'cancelled'
      where package_ref = o.ref and status = 'confirmed' and starts_at > now();
    get diagnostics v_n = row_count;
  end if;
  return v_n;
end;
$$;
revoke all on function public.staff_cancel_package(text, boolean) from public, anon;
grant execute on function public.staff_cancel_package(text, boolean) to authenticated;
