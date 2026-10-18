-- is_admin hoort niet in de openbare API: naar een niet-blootgesteld schema
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "admins lezen zichzelf" on public.admins;
create policy "admins lezen zichzelf" on public.admins for select to authenticated using (private.is_admin());
drop policy if exists "admins beheren boekingen" on public.bookings;
create policy "admins beheren boekingen" on public.bookings for all to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists "admins beheren blokkades" on public.blocked_slots;
create policy "admins beheren blokkades" on public.blocked_slots for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop function if exists public.is_admin();
