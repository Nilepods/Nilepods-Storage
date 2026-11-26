-- Rescheduling a booked session.
-- Customers: their own confirmed session, only while it is still 48+ hours away.
-- Staff (any role): any confirmed session, any time.
-- The new time keeps the same setup and length, follows the normal opening rules,
-- and cannot overlap another booking (bookings_no_overlap).

alter table public.bookings
  add column if not exists previous_starts_at timestamptz,
  add column if not exists rescheduled_at     timestamptz,
  add column if not exists reschedule_count   int not null default 0;

create or replace function public.reschedule_booking(p_ref text, p_date date, p_start_hour int)
returns table (ref text, starts_at timestamptz, ends_at timestamptz, old_starts_at timestamptz)
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_role  text := public.np_my_role();
  v_email text := public.np_my_email();
  v_now_cairo timestamp := now() at time zone 'Africa/Cairo';
  b public.bookings%rowtype;
  v_hours int;
  v_start timestamptz;
begin
  select * into b from public.bookings x where x.ref = p_ref for update;
  if not found then raise exception 'not_found' using errcode = '22023'; end if;

  if v_role is null then
    if coalesce(v_email, '') = '' or lower(b.email) <> v_email then raise exception 'not_your_booking' using errcode = '42501'; end if;
    if b.status <> 'confirmed' then raise exception 'cannot_reschedule' using errcode = '22023'; end if;
    if b.starts_at - now() < interval '48 hours' then raise exception 'too_late_to_reschedule' using errcode = '22023'; end if;
  else
    if b.status not in ('confirmed', 'needs_review') then raise exception 'cannot_reschedule' using errcode = '22023'; end if;
  end if;

  v_hours := round(extract(epoch from (b.ends_at - b.starts_at)) / 3600)::int;
  if extract(isodow from p_date) = 5 then raise exception 'closed_friday' using errcode = '22023'; end if;
  if p_date > v_now_cairo::date + 60 then raise exception 'too_far_ahead' using errcode = '22023'; end if;
  if p_start_hour is null or p_start_hour < 15 or p_start_hour + v_hours > 23 then raise exception 'outside_opening_hours' using errcode = '22023'; end if;
  if (p_date + make_time(p_start_hour, 0, 0)) <= v_now_cairo then raise exception 'in_the_past' using errcode = '22023'; end if;

  v_start := (p_date + make_time(p_start_hour, 0, 0)) at time zone 'Africa/Cairo';
  if v_start = b.starts_at then raise exception 'no_change' using errcode = '22023'; end if;

  perform public.np_expire_holds();
  begin
    update public.bookings x
      set starts_at = v_start, ends_at = v_start + make_interval(hours => v_hours),
          previous_starts_at = b.starts_at, rescheduled_at = now(),
          reschedule_count = x.reschedule_count + 1,
          status = case when x.status = 'needs_review' then 'confirmed' else x.status end
      where x.id = b.id;
  exception when exclusion_violation then
    raise exception 'slot_taken' using errcode = '23P01';
  end;

  return query select b.ref, v_start, v_start + make_interval(hours => v_hours), b.starts_at;
end;
$$;

revoke all on function public.reschedule_booking(text, date, int) from public, anon;
grant execute on function public.reschedule_booking(text, date, int) to authenticated;
