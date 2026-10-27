-- Racket Fit (plan van 27 oktober 2026): slots van 30 minuten op di/do/za, drie vormen (coach, koppel mij, balmachine-uur),
-- 1-4 personen, intake bij de boeking, betalen bij boeken (Mollie) en een wachtlijst met telefoonnummer.
-- Oude boekingen blijven staan. book_test blijft bestaan tot de nieuwe site live is, zodat de huidige site niet breekt.

alter table public.bookings add column if not exists kind text not null default 'duo' check (kind in ('duo', 'match', 'machine'));
alter table public.bookings add column if not exists persons int not null default 1 check (persons between 1 and 4);
alter table public.bookings add column if not exists slot_count int not null default 1 check (slot_count in (1, 2));
alter table public.bookings add column if not exists student boolean not null default false;
alter table public.bookings add column if not exists amount numeric(8,2);
alter table public.bookings add column if not exists phone text check (char_length(phone) <= 30);
alter table public.bookings add column if not exists intake jsonb not null default '{}'::jsonb;
alter table public.bookings add column if not exists payment text not null default 'open' check (payment in ('open', 'betaald', 'mislukt'));
alter table public.bookings add column if not exists payment_id text;
alter table public.bookings add column if not exists hold_until timestamptz; -- leeg = plek blijft vast tot de beheerder hem vrijgeeft
alter table public.bookings add column if not exists paid_at timestamptz;
alter table public.bookings add column if not exists notified_at timestamptz;

-- Een boeking kan nu twee slots beslaan; dubbel boeken voorkomen we in book_fit in plaats van met de oude unieke index.
-- Voor de oude book_test blijft de controle in die functie (exception op unique_violation) zonder index dus weg:
-- book_test krijgt hieronder ook een overlapcontrole.
drop index if exists public.bookings_one_per_slot;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 8 and 30),
  daypart text check (daypart in ('ochtend', 'lunch', 'middag', 'avond')),
  persons int not null default 1 check (persons between 1 and 2),
  preference text check (char_length(preference) <= 300),
  wish_slot text check (char_length(wish_slot) <= 60),
  status text not null default 'nieuw' check (status in ('nieuw', 'gebeld', 'geplaatst', 'vervallen')),
  notified_at timestamptz
);
create index if not exists waitlist_created on public.waitlist (created_at desc);
alter table public.waitlist enable row level security;
drop policy if exists "admins beheren wachtlijst" on public.waitlist;
create policy "admins beheren wachtlijst" on public.waitlist for all to authenticated using (private.is_admin()) with check (private.is_admin());

-- Telt een boeking mee als bezet? Een open betaling houdt de plek alleen vast tot hold_until.
create or replace function private.booking_active(b public.bookings) returns boolean
language sql stable as $$
  select b.status <> 'geannuleerd' and b.payment <> 'mislukt' and (b.payment = 'betaald' or b.hold_until is null or b.hold_until > now());
$$;

-- Starttijden per weekdag (0 = zondag), slots van 30 minuten. Gelijk aan SCHEDULE in src/lib/booking.ts.
create or replace function private.fit_times(p_date date) returns time[]
language sql immutable as $$
  select case extract(dow from p_date)::int
    when 2 then array['09:00','09:30','10:00','10:30','11:00']::time[]
    when 4 then array['12:00','12:30','13:00','13:30','14:00']::time[]
    when 6 then array['09:00','09:30','10:00','10:30','11:00']::time[]
    else array[]::time[] end;
$$;

-- Bezette momenten (zonder namen of e-mail). Een boeking van twee slots geeft ook het tweede slot terug.
create or replace function public.taken_slots(p_from date, p_to date)
returns table (slot_date date, slot_time time, whole_day boolean)
language sql stable security definer set search_path = public, private as $$
  select b.slot_date, (b.slot_time + make_interval(mins => 30 * g))::time, false
    from public.bookings b, generate_series(0, b.slot_count - 1) g
    where b.slot_date between p_from and p_to and private.booking_active(b)
  union all
  select s.slot_date, s.slot_time, s.slot_time is null from public.blocked_slots s
    where s.slot_date between p_from and p_to;
$$;

-- Boeken: prijs en aantal slots bepaalt de database, niet de browser.
create or replace function public.book_fit(
  p_kind text, p_persons int, p_student boolean, p_date date, p_time time,
  p_coach text, p_name text, p_phone text, p_email text, p_intake jsonb
) returns table (id uuid, amount numeric)
language plpgsql security definer set search_path = public, private as $$
#variable_conflict use_column
declare
  v_persons int := case when p_kind in ('match', 'machine') then 1 else greatest(1, least(4, coalesce(p_persons, 1))) end;
  v_student boolean := coalesce(p_student, false) and p_kind = 'duo' and v_persons = 1;
  v_slots int := case when p_kind = 'machine' or v_persons > 2 then 2 else 1 end;
  v_amount numeric(8,2);
  v_times time[] := private.fit_times(p_date);
  v_id uuid;
begin
  if p_kind not in ('duo', 'match', 'machine') then raise exception 'vorm_ongeldig'; end if;
  if p_date <= current_date or p_date > current_date + 60 then raise exception 'datum_ongeldig'; end if;
  if not (p_time = any (v_times)) or (v_slots = 2 and not ((p_time + interval '30 minutes')::time = any (v_times))) then
    raise exception 'tijd_ongeldig';
  end if;
  if char_length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) < 8 then raise exception 'telefoon_ongeldig'; end if;
  v_amount := case
    when p_kind = 'machine' then 60
    when p_kind = 'match' then 26.25
    when v_student then 15
    when v_persons = 1 then 30
    when v_persons = 2 then 52.50
    when v_persons = 3 then 82.50
    else 105 end;

  -- Eén boeking tegelijk per dag beoordelen, dan kan een slot nooit dubbel weggaan
  perform pg_advisory_xact_lock(hashtext('racket-fit-' || p_date::text));
  if exists (
    select 1 from public.bookings b
    where b.slot_date = p_date and private.booking_active(b)
      and tsrange(p_date + b.slot_time, p_date + b.slot_time + make_interval(mins => 30 * b.slot_count))
       && tsrange(p_date + p_time, p_date + p_time + make_interval(mins => 30 * v_slots))
  ) or exists (
    select 1 from public.blocked_slots s
    where s.slot_date = p_date and (s.slot_time is null or s.slot_time = p_time or (v_slots = 2 and s.slot_time = (p_time + interval '30 minutes')::time))
  ) then
    raise exception 'moment_bezet';
  end if;

  insert into public.bookings (slot_date, slot_time, coach, name, email, phone, kind, persons, slot_count, student, amount, intake)
  values (
    p_date, p_time,
    left(coalesce(nullif(trim(p_coach), ''), 'Maakt niet uit'), 80),
    trim(p_name), lower(trim(p_email)), left(trim(p_phone), 30),
    p_kind, v_persons, v_slots, v_student, v_amount,
    case when pg_column_size(coalesce(p_intake, '{}'::jsonb)) <= 4000 then coalesce(p_intake, '{}'::jsonb) else '{}'::jsonb end
  ) returning bookings.id into v_id;
  return query select v_id, v_amount;
end;
$$;

-- Oude functie: zelfde overlapcontrole, zodat de huidige site blijft werken tot de nieuwe live staat
create or replace function public.book_test(p_date date, p_time time, p_coach text, p_name text, p_email text)
returns uuid
language plpgsql security definer set search_path = public, private as $$
declare
  new_id uuid;
begin
  if p_date <= current_date or p_date > current_date + 60 then raise exception 'datum_ongeldig'; end if;
  perform pg_advisory_xact_lock(hashtext('racket-fit-' || p_date::text));
  if exists (select 1 from public.blocked_slots s where s.slot_date = p_date and (s.slot_time is null or s.slot_time = p_time))
     or exists (select 1 from public.bookings b where b.slot_date = p_date and b.slot_time = p_time and private.booking_active(b)) then
    raise exception 'moment_bezet';
  end if;
  insert into public.bookings (slot_date, slot_time, coach, name, email)
    values (p_date, p_time, left(coalesce(nullif(trim(p_coach), ''), 'Maakt niet uit'), 80), trim(p_name), lower(trim(p_email)))
    returning id into new_id;
  return new_id;
end;
$$;

-- Na de betaalpagina: alleen de status, geen persoonsgegevens. Het id is een willekeurige uuid.
create or replace function public.booking_state(p_id uuid)
returns table (slot_date date, slot_time time, kind text, amount numeric, payment text)
language sql stable security definer set search_path = public as $$
  select b.slot_date, b.slot_time, b.kind, b.amount, b.payment from public.bookings b where b.id = p_id;
$$;

create or replace function public.join_waitlist(p_name text, p_phone text, p_daypart text, p_persons int, p_preference text, p_wish_slot text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if char_length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) < 8 then raise exception 'telefoon_ongeldig'; end if;
  insert into public.waitlist (name, phone, daypart, persons, preference, wish_slot)
  values (
    trim(p_name), left(trim(p_phone), 30),
    case when p_daypart in ('ochtend', 'lunch', 'middag', 'avond') then p_daypart end,
    case when p_persons = 2 then 2 else 1 end,
    nullif(left(trim(coalesce(p_preference, '')), 300), ''),
    nullif(left(trim(coalesce(p_wish_slot, '')), 60), '')
  ) returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.book_fit(text, int, boolean, date, time, text, text, text, text, jsonb) from public;
revoke all on function public.booking_state(uuid) from public;
revoke all on function public.join_waitlist(text, text, text, int, text, text) from public;
grant execute on function public.book_fit(text, int, boolean, date, time, text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.booking_state(uuid) to anon, authenticated;
grant execute on function public.join_waitlist(text, text, text, int, text, text) to anon, authenticated;
