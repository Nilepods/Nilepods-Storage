-- New pack sizes: Pilot 3 (5%), Series 5 (10%), Season 10 (15%), Full Season 20 (20%).
-- Full Season is valid 180 days; the others 90. Single-session "packages" are no longer sold
-- (existing ones keep working).

create or replace function public.np_package_valid_days(p_sessions int)
returns int language sql immutable set search_path = '' as $$
  select case when p_sessions >= 20 then 180 else 90 end;
$$;

create or replace function public.create_package_order(p_service text, p_sessions integer, p_first_name text, p_last_name text, p_email text, p_phone text, p_whatsapp_ok boolean)
returns table(ref text, total_egp integer)
language plpgsql security definer set search_path to '' as $function$
declare
  v_price int := public.np_service_price(p_service);
  v_disc  numeric := case p_sessions when 3 then 0.05 when 5 then 0.10 when 10 then 0.15 when 20 then 0.20 end;
  v_total int;
  v_ref   text := public.np_new_ref();
  v_email text := lower(trim(p_email));
begin
  if v_price is null then raise exception 'invalid_service' using errcode = '22023'; end if;
  if v_disc is null then raise exception 'invalid_sessions' using errcode = '22023'; end if;
  if (select count(*) from public.package_orders o where lower(o.email) = v_email and o.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'too_many_requests' using errcode = '22023';
  end if;
  v_total := (round(v_price * p_sessions * (1 - v_disc) / 10.0) * 10)::int;

  insert into public.package_orders (ref, service, sessions, total_egp, first_name, last_name, email, phone, whatsapp_ok)
  values (v_ref, p_service, p_sessions, v_total, trim(p_first_name), trim(p_last_name), v_email,
          nullif(trim(p_phone), ''), coalesce(p_whatsapp_ok, false));

  return query select v_ref, v_total;
end;
$function$;

create or replace function public.apply_package_credit(p_booking_ref text, p_package_ref text, p_email text)
returns integer
language plpgsql security definer set search_path to '' as $function$
declare
  o public.package_orders%rowtype;
  b public.bookings%rowtype;
  v_total int;
begin
  select * into o from public.package_orders where ref = p_package_ref for update;
  if not found or lower(o.email) <> lower(trim(p_email)) then raise exception 'not_your_package' using errcode = '42501'; end if;
  if o.status <> 'active' then raise exception 'package_not_active' using errcode = '22023'; end if;
  if o.created_at + make_interval(days => public.np_package_valid_days(o.sessions)) < now() then raise exception 'package_expired' using errcode = '22023'; end if;
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
$function$;

create or replace function public.my_packages()
returns table(ref text, service text, sessions integer, used integer, remaining integer, expires_at timestamp with time zone, status text, payment_status text, payment_method text, created_at timestamp with time zone)
language sql stable security definer set search_path to '' as $function$
  select o.ref, o.service, o.sessions, public.np_credits_used(o.ref),
         greatest(o.sessions - public.np_credits_used(o.ref), 0),
         o.created_at + make_interval(days => public.np_package_valid_days(o.sessions)), o.status, o.payment_status, o.payment_method, o.created_at
  from public.package_orders o
  where lower(o.email) = public.np_my_email() and public.np_my_email() <> ''
    and o.status = 'active'
  order by o.created_at desc;
$function$;
