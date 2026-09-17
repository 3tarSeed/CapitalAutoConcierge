-- Capital Auto Concierge: leads table (ported from D1/Drizzle schema).
create table if not exists public.leads (
  id        uuid primary key,
  owner     uuid not null references auth.users (id) on delete cascade,
  created   bigint not null,               -- ms since epoch; desk.tsx does new Date(created)
  data      jsonb not null,
  status    text not null default 'New',
  notes     text not null default '',
  assignee  text not null default '',
  followup  text not null default ''
);
create index if not exists leads_owner_created on public.leads (owner, created desc);

-- Owner-scoped RLS. The API also filters by owner; this is defense in depth.
alter table public.leads enable row level security;

create policy "leads: owner select" on public.leads
  for select to authenticated using (owner = auth.uid());
create policy "leads: owner insert" on public.leads
  for insert to authenticated with check (owner = auth.uid());
create policy "leads: owner update" on public.leads
  for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
