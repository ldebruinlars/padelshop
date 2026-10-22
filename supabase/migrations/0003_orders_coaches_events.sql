-- Racket Lab: bestelaanvragen (via QR op de wand of de site), coachcodes, inkoopprijzen en testdag-aanmeldingen.
-- Bezoekers schrijven alleen via functies; lezen kan alleen de beheerder.

create table if not exists public.coach_codes (
  code text primary key check (code ~ '^[A-Z0-9]{3,16}$'),
  coach_name text not null,
  discount_pct int not null default 0 check (discount_pct between 0 and 25),
  commission_eur numeric(8,2) not null default 0 check (commission_eur >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  racket_id text not null check (char_length(racket_id) <= 120),
  racket_label text not null check (char_length(racket_label) <= 200),
  list_price numeric(8,2),
  accessories text[] not null default '{}',
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  phone text check (char_length(phone) <= 30),
  coach_code text references public.coach_codes (code),
  source text not null default 'web' check (source in ('web', 'wand', 'balie', 'testdag')),
  wants_lesson boolean not null default false,
  status text not null default 'nieuw' check (status in ('nieuw', 'klaar', 'opgehaald', 'geannuleerd')),
  sold_price numeric(8,2),
  note text
);
create index if not exists orders_created on public.orders (created_at desc);

create table if not exists public.racket_costs (
  racket_id text primary key,
  purchase_price numeric(8,2) not null check (purchase_price >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  level text check (char_length(level) <= 40),
  wants_tournament boolean not null default false
);
create unique index if not exists event_signups_email on public.event_signups (lower(email));

alter table public.coach_codes enable row level security;
alter table public.orders enable row level security;
alter table public.racket_costs enable row level security;
alter table public.event_signups enable row level security;

drop policy if exists "admins beheren coachcodes" on public.coach_codes;
create policy "admins beheren coachcodes" on public.coach_codes for all to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists "admins beheren bestellingen" on public.orders;
create policy "admins beheren bestellingen" on public.orders for all to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists "admins beheren inkoop" on public.racket_costs;
create policy "admins beheren inkoop" on public.racket_costs for all to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists "admins zien aanmeldingen" on public.event_signups;
create policy "admins zien aanmeldingen" on public.event_signups for all to authenticated using (private.is_admin()) with check (private.is_admin());

-- Coachcode controleren: geeft alleen de coachnaam en de korting terug, geen commissie
create or replace function public.check_coach_code(p_code text)
returns table (code text, coach_name text, discount_pct int)
language sql stable security definer set search_path = public as $$
  select c.code, c.coach_name, c.discount_pct from public.coach_codes c where c.code = upper(trim(p_code)) and c.active;
$$;

-- Bestelaanvraag: racket reserveren, betalen bij ophalen (of later online)
create or replace function public.request_order(
  p_racket_id text, p_racket_label text, p_list_price numeric, p_accessories text[],
  p_name text, p_email text, p_phone text, p_coach_code text, p_source text, p_wants_lesson boolean
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  new_id uuid;
  v_code text := nullif(upper(trim(coalesce(p_coach_code, ''))), '');
begin
  if v_code is not null and not exists (select 1 from public.coach_codes c where c.code = v_code and c.active) then
    v_code := null; -- onbekende code: bestelling gaat gewoon door, zonder koppeling
  end if;
  if coalesce(array_length(p_accessories, 1), 0) > 12 then
    raise exception 'te_veel_accessoires';
  end if;
  insert into public.orders (racket_id, racket_label, list_price, accessories, name, email, phone, coach_code, source, wants_lesson)
  values (
    left(p_racket_id, 120), left(p_racket_label, 200), p_list_price, coalesce(p_accessories, '{}'),
    trim(p_name), lower(trim(p_email)), nullif(left(trim(coalesce(p_phone, '')), 30), ''),
    v_code, case when p_source in ('web', 'wand', 'balie', 'testdag') then p_source else 'web' end, coalesce(p_wants_lesson, false)
  ) returning id into new_id;
  return new_id;
end;
$$;

-- Aanmelden voor de maandelijkse testdag (dubbel aanmelden is geen fout)
create or replace function public.signup_test_event(p_name text, p_email text, p_level text, p_tournament boolean)
returns void
language sql security definer set search_path = public as $$
  insert into public.event_signups (name, email, level, wants_tournament)
  values (trim(p_name), lower(trim(p_email)), left(p_level, 40), coalesce(p_tournament, false))
  on conflict ((lower(email))) do update set name = excluded.name, level = excluded.level, wants_tournament = excluded.wants_tournament;
$$;

revoke all on function public.check_coach_code(text) from public;
revoke all on function public.request_order(text, text, numeric, text[], text, text, text, text, text, boolean) from public;
revoke all on function public.signup_test_event(text, text, text, boolean) from public;
grant execute on function public.check_coach_code(text) to anon, authenticated;
grant execute on function public.request_order(text, text, numeric, text[], text, text, text, text, text, boolean) to anon, authenticated;
grant execute on function public.signup_test_event(text, text, text, boolean) to anon, authenticated;
