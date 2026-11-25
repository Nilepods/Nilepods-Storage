-- "Pay at the studio" (cash) option. Additive only: nothing is dropped or deleted.
-- A cash booking is confirmed straight away with payment still pending; staff mark it
-- paid in the admin when the customer pays at the studio.

alter table public.bookings       add column if not exists payment_method text not null default 'card' check (payment_method in ('card', 'cash'));
alter table public.package_orders add column if not exists payment_method text not null default 'card' check (payment_method in ('card', 'cash'));

-- Called by the checkout function (service role) right after create_booking / create_package_order.
create or replace function public.confirm_cash(p_ref text)
returns text language plpgsql volatile security definer set search_path = '' as $$
begin
  update public.bookings set payment_method = 'cash', status = 'confirmed', hold_expires_at = null
  where ref = p_ref and status = 'pending_payment';
  if found then return 'confirmed'; end if;
  update public.package_orders set payment_method = 'cash', status = 'active'
  where ref = p_ref and status = 'pending_payment';
  if found then return 'confirmed'; end if;
  return 'not_found';
end;
$$;
revoke all on function public.confirm_cash(text) from public, anon, authenticated;

-- Staff can record cash collected for a package order too (bookings use staff_update_booking).
create or replace function public.staff_mark_order_paid(p_ref text)
returns text language plpgsql volatile security definer set search_path = '' as $$
begin
  if coalesce(public.np_my_role(), '') not in ('owner', 'manager') then raise exception 'not_allowed' using errcode = '42501'; end if;
  update public.package_orders set payment_status = 'paid', paid_at = coalesce(paid_at, now()) where ref = p_ref;
  return 'ok';
end;
$$;
revoke all on function public.staff_mark_order_paid(text) from public, anon;
grant execute on function public.staff_mark_order_paid(text) to authenticated;
