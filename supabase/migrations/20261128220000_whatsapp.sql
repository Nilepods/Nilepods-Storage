-- WhatsApp: studio operators get a message for every new or moved booking; customers verify their phone with a code.

-- Operators: any team member can be marked as operator and given a WhatsApp number (international format, digits only).
alter table public.staff add column if not exists whatsapp text check (whatsapp ~ '^[1-9][0-9]{7,14}$');
alter table public.staff add column if not exists is_operator boolean not null default false;

create or replace function public.staff_set_operator(p_email text, p_whatsapp text, p_is_operator boolean)
returns text language plpgsql volatile security definer set search_path = '' as $$
declare v_num text := nullif(regexp_replace(coalesce(p_whatsapp, ''), '[^0-9]', '', 'g'), '');
begin
  if public.np_my_role() not in ('owner', 'manager') then raise exception 'not_allowed' using errcode = '42501'; end if;
  -- Egyptian mobile typed locally (01x...) -> 201x...
  if v_num ~ '^01[0-9]{9}$' then v_num := '2' || v_num; end if;
  if v_num is not null and v_num !~ '^[1-9][0-9]{7,14}$' then raise exception 'invalid_phone' using errcode = '22023'; end if;
  if p_is_operator and v_num is null then raise exception 'invalid_phone' using errcode = '22023'; end if;
  update public.staff set whatsapp = v_num, is_operator = coalesce(p_is_operator, false) where email = lower(p_email);
  if not found then raise exception 'not_found' using errcode = '22023'; end if;
  return 'ok';
end;
$$;
revoke all on function public.staff_set_operator(text, text, boolean) from public, anon;
grant execute on function public.staff_set_operator(text, text, boolean) to authenticated;

-- One-time codes sent by WhatsApp. Only the phone-otp Edge Function (service role) reads or writes this table.
create table if not exists public.phone_otps (
  user_id uuid primary key references auth.users (id) on delete cascade,
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  sent_count int not null default 1,
  window_start timestamptz not null default now()
);
alter table public.phone_otps enable row level security;
revoke all on public.phone_otps from anon, authenticated;
