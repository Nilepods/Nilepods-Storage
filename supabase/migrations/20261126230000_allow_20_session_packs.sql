-- The original table only accepted packs of 1, 3, 5 or 10 sessions.
alter table public.package_orders drop constraint package_orders_sessions_check;
alter table public.package_orders add constraint package_orders_sessions_check check (sessions in (1, 3, 5, 10, 20));
