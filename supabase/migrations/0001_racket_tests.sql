-- Racket Lab: boekingen voor de racket-test, geblokkeerde momenten en beheerders.
-- Bezoekers lezen of schrijven de tabellen nooit direct: alleen via de twee functies hieronder.
-- Beheerders (e-mail in public.admins) zien en wijzigen alles na inloggen.

create table if not exists public.admins (
  email text primary key
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slot_date date not null,
  slot_time time not null,
  coach text not null default 'Eerste beschikbare coach',
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  status text not null default 'nieuw' check (status in ('nieuw', 'playtomic', 'geannuleerd')),
  note text
);

-- Eén actieve boeking per moment: zo kan een tijd nooit dubbel geboekt worden
create unique index if not exists bookings_one_per_slot on public.bookings (slot_date, slot_time) where status <> 'geannuleerd';
create index if not exists bookings_date on public.bookings (slot_date);

create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  slot_date date not null,
  slot_time time, -- leeg = de hele dag dicht
  reason text,
  created_at timestamptz not null default now()
);
create unique index if not exists blocked_one_per_slot on public.blocked_slots (slot_date, coalesce(slot_time, '00:00'::time), (slot_time is null));

alter table public.admins enable row level security;
alter table public.bookings enable row level security;
alter table public.blocked_slots enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

drop policy if exists "admins lezen zichzelf" on public.admins;
create policy "admins lezen zichzelf" on public.admins for select to authenticated using (public.is_admin());

drop policy if exists "admins beheren boekingen" on public.bookings;
create policy "admins beheren boekingen" on public.bookings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins beheren blokkades" on public.blocked_slots;
create policy "admins beheren blokkades" on public.blocked_slots for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Bezette momenten (zonder namen of e-mail), voor de agenda op de site
create or replace function public.taken_slots(p_from date, p_to date)
returns table (slot_date date, slot_time time, whole_day boolean)
language sql stable security definer set search_path = public as $$
  select b.slot_date, b.slot_time, false from public.bookings b
    where b.status <> 'geannuleerd' and b.slot_date between p_from and p_to
  union all
  select s.slot_date, s.slot_time, s.slot_time is null from public.blocked_slots s
    where s.slot_date between p_from and p_to;
$$;

-- Boeken: controleert het moment en voorkomt dubbele boekingen
create or replace function public.book_test(p_date date, p_time time, p_coach text, p_name text, p_email text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  new_id uuid;
begin
  if p_date <= current_date or p_date > current_date + 60 then
    raise exception 'datum_ongeldig';
  end if;
  if p_time not in ('09:00','09:45','10:30','11:15','13:00','13:45','14:30','17:00','17:45','18:30','19:15','20:00') then
    raise exception 'tijd_ongeldig';
  end if;
  if exists (select 1 from public.blocked_slots s where s.slot_date = p_date and (s.slot_time is null or s.slot_time = p_time)) then
    raise exception 'moment_bezet';
  end if;
  insert into public.bookings (slot_date, slot_time, coach, name, email)
    values (p_date, p_time, left(coalesce(nullif(trim(p_coach), ''), 'Eerste beschikbare coach'), 80), trim(p_name), lower(trim(p_email)))
    returning id into new_id;
  return new_id;
exception when unique_violation then
  raise exception 'moment_bezet';
end;
$$;

revoke all on function public.taken_slots(date, date) from public;
revoke all on function public.book_test(date, time, text, text, text) from public;
grant execute on function public.taken_slots(date, date) to anon, authenticated;
grant execute on function public.book_test(date, time, text, text, text) to anon, authenticated;

insert into public.admins (email) values ('ldebruinlars@gmail.com') on conflict do nothing;
