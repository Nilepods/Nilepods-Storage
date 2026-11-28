-- Cyclorama: photo shoots keep a 2-hour minimum; recording services are booked by the hour (1 hour minimum).
-- Either way a cyclorama booking is at most 8 hours.
alter table public.bookings drop constraint bookings_extra_hours_check;
alter table public.bookings add constraint bookings_extra_hours_check check (extra_hours >= 0 and extra_hours <= 7);

do $do$
declare f text := pg_get_functiondef('public.create_booking'::regproc);
begin
  if position('case when v_cyc then 6 else 3 end' in f) = 0 or position('case when v_cyc then 2 else 1 end' in f) = 0 then
    raise exception 'create_booking changed: patch by hand';
  end if;
  f := replace(f, 'case when v_cyc then 6 else 3 end', $r$case when v_cyc and p_service = 'photo' then 6 when v_cyc then 7 else 3 end$r$);
  f := replace(f, 'case when v_cyc then 2 else 1 end', $r$case when v_cyc and p_service = 'photo' then 2 else 1 end$r$);
  execute f;
end
$do$;
