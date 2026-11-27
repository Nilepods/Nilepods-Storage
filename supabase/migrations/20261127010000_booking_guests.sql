-- Guests who come along but are not on camera (0-2), set by checkout after the booking is created.
alter table public.bookings
  add column if not exists guests int not null default 0 check (guests between 0 and 2);
