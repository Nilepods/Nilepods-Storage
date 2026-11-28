-- Free pilot ("Auditions") applications from the website. Anyone can apply; only staff can read and update.
create table if not exists public.audition_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  show_name text not null check (char_length(show_name) between 2 and 120),
  idea text not null check (char_length(idea) between 20 and 3000),
  audience text check (char_length(audience) <= 500),
  contact_name text not null check (char_length(contact_name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200 and email like '%@%'),
  phone text not null check (char_length(phone) between 8 and 30),
  hosts text[] not null check (array_length(hosts, 1) = 3),
  links text check (char_length(links) <= 1000),
  agreed_rules boolean not null check (agreed_rules),
  status text not null default 'new' check (status in ('new', 'contacted', 'accepted', 'declined')),
  staff_note text check (char_length(staff_note) <= 2000)
);
alter table public.audition_applications enable row level security;
revoke all on public.audition_applications from anon, authenticated;
grant insert (show_name, idea, audience, contact_name, email, phone, hosts, links, agreed_rules) on public.audition_applications to anon, authenticated;
grant select on public.audition_applications to authenticated;
create policy public_apply on public.audition_applications for insert to anon, authenticated with check (status = 'new');
create policy staff_read_auditions on public.audition_applications for select to authenticated using (public.np_my_role() is not null);

create or replace function public.staff_update_audition(p_id uuid, p_status text default null, p_note text default null)
returns text language plpgsql volatile security definer set search_path = '' as $$
begin
  if public.np_my_role() is null then raise exception 'not_staff' using errcode = '42501'; end if;
  if p_status is not null and p_status not in ('new', 'contacted', 'accepted', 'declined') then raise exception 'invalid_status' using errcode = '22023'; end if;
  update public.audition_applications set status = coalesce(p_status, status), staff_note = coalesce(p_note, staff_note) where id = p_id;
  if not found then raise exception 'not_found' using errcode = '22023'; end if;
  return 'ok';
end;
$$;
revoke all on function public.staff_update_audition(uuid, text, text) from public, anon;
grant execute on function public.staff_update_audition(uuid, text, text) to authenticated;
