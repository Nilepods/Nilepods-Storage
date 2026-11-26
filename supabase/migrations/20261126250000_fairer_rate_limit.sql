-- Anti-spam: limit unpaid holds (5 per email within an hour) plus a generous overall cap
-- (20 attempts per hour). Failed or expired attempts no longer block real customers.
-- Applied to the live database together with create_booking using np_too_many_attempts().
create or replace function public.np_too_many_attempts(p_email text)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select count(*) from public.bookings b where lower(b.email) = lower(trim(p_email)) and b.created_at > now() - interval '1 hour' and b.status = 'pending_payment') >= 5
      or (select count(*) from public.bookings b where lower(b.email) = lower(trim(p_email)) and b.created_at > now() - interval '1 hour') >= 20;
$$;
