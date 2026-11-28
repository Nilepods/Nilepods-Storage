-- Cyclorama room: its own bookable "setup" (cyc), a Photo shoot service (space + lighting only),
-- a 2-hour minimum, and up to 8 hours (2 + up to 6 extra hours).

alter table public.bookings drop constraint bookings_setup_id_check;
alter table public.bookings add constraint bookings_setup_id_check
  check (setup_id in ('s1', 's2', 's3', 's4', 's5', 's6', 's7', 'cyc'));
alter table public.bookings drop constraint bookings_service_check;
alter table public.bookings add constraint bookings_service_check
  check (service in ('rec', 'mix', 'pro', 'photo'));
alter table public.bookings drop constraint bookings_extra_hours_check;
alter table public.bookings add constraint bookings_extra_hours_check
  check (extra_hours between 0 and 6);

-- Photo shoot is cyclorama-only; create_booking enforces that.
create or replace function public.np_service_price(p_service text)
returns integer language sql immutable set search_path = '' as $$
  select case p_service when 'rec' then 1150 when 'mix' then 1450 when 'pro' then 1950 when 'photo' then 1000 end;
$$;

create or replace function public.create_booking(p_service text, p_setup_id text, p_date date, p_start_hour integer, p_people integer, p_extra_hours integer, p_extra_cameras integer, p_extra_mics integer, p_photographer boolean, p_first_name text, p_last_name text, p_email text, p_phone text, p_whatsapp_ok boolean)
 returns table(ref text, total_egp integer)
 language plpgsql security definer set search_path to ''
as $function$
declare
  v_now_cairo timestamp := now() at time zone 'Africa/Cairo';
  v_cyc       boolean := p_setup_id = 'cyc';
  v_hours     int;
  v_cap       int;
  v_price     int := public.np_service_price(p_service);
  v_total     int;
  v_start     timestamptz;
  v_ref       text := public.np_new_ref();
  v_email     text := lower(trim(p_email));
begin
  if v_price is null then raise exception 'invalid_service' using errcode = '22023'; end if;
  if p_service = 'photo' and not v_cyc then raise exception 'invalid_service' using errcode = '22023'; end if;
  if coalesce(p_extra_hours, 0) < 0 or coalesce(p_extra_hours, 0) > case when v_cyc then 6 else 3 end then
    raise exception 'invalid_hours' using errcode = '22023'; end if;
  -- The cyclorama has a 2-hour minimum; the setups start at 1 hour.
  v_hours := case when v_cyc then 2 else 1 end + coalesce(p_extra_hours, 0);
  v_cap := case p_setup_id when 's1' then 1 when 's2' then 2 when 's3' then 1 when 's4' then 2
                           when 's5' then 2 when 's6' then 1 when 's7' then 1 when 'cyc' then 2 end;
  if v_cap is null then raise exception 'invalid_setup' using errcode = '22023'; end if;
  if p_people is null or p_people < 1 or p_people > v_cap then raise exception 'invalid_people' using errcode = '22023'; end if;
  -- The cyclorama has no add-on equipment.
  if v_cyc and (coalesce(p_extra_cameras, 0) > 0 or coalesce(p_extra_mics, 0) > 0 or coalesce(p_photographer, false)) then
    raise exception 'invalid_extras' using errcode = '22023'; end if;
  if extract(isodow from p_date) = 5 then raise exception 'closed_friday' using errcode = '22023'; end if;
  if p_date > v_now_cairo::date + 60 then raise exception 'too_far_ahead' using errcode = '22023'; end if;
  if p_start_hour is null or p_start_hour < 15 or p_start_hour + v_hours > 23 then raise exception 'outside_opening_hours' using errcode = '22023'; end if;
  if (p_date + make_time(p_start_hour, 0, 0)) <= v_now_cairo then raise exception 'in_the_past' using errcode = '22023'; end if;

  if public.np_too_many_attempts(v_email) then
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
$function$;

-- Package credits are for the 1-hour setups only, never the cyclorama.
do $do$
declare d text;
begin
  d := pg_get_functiondef('public.apply_package_credit(text,text,text)'::regprocedure);
  d := replace(d, $x$if b.service <> o.service then raise exception 'wrong_service' using errcode = '22023'; end if;$x$,
                  $x$if b.service <> o.service or b.setup_id = 'cyc' then raise exception 'wrong_service' using errcode = '22023'; end if;$x$);
  execute d;
end $do$;
