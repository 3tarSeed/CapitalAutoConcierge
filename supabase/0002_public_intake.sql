-- Public intake: leads are submitted anonymously and reviewed by any allowlisted staff member.
alter table public.leads alter column owner drop not null;

drop policy if exists "leads: owner select" on public.leads;
drop policy if exists "leads: owner insert" on public.leads;
drop policy if exists "leads: owner update" on public.leads;

-- Any signed-in user may read/update. The app's STAFF_EMAILS allowlist is the real gate;
-- Supabase Auth has no public sign-up path in this app, so "authenticated" == staff.
create policy "leads: staff select" on public.leads for select to authenticated using (true);
create policy "leads: staff update" on public.leads for update to authenticated using (true) with check (true);
-- Inserts come only from the server via the service role (bypasses RLS); no anon/authenticated insert policy.
