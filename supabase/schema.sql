-- TITANS FC · Supabase schema
-- Run this once in Supabase → SQL Editor.
-- Ids are text because the app uses values like "p-1", "t-1", "n-1" and short
-- generated ids. (lang, id) is the primary key: every language keeps its own dataset.

create table if not exists public.players (
  lang text not null,
  id text not null,
  name text not null,
  surname text not null,
  number int not null default 1,
  position text not null default 'Midfielder',
  age int not null default 18,
  country text not null default '',
  photo text not null default '',
  description text not null default '',
  primary key (lang, id)
);

create table if not exists public.club (
  lang text primary key,
  id text not null default 'club-1',
  name text not null default 'TITANS FC',
  slogan text not null default '',
  description text not null default '',
  coach text not null default '',
  captain text not null default '',
  history text not null default '',
  philosophy text not null default '',
  goals text not null default '',
  staff text not null default '',
  founded text not null default '',
  stadium text not null default ''
);

create table if not exists public.tactics (
  lang text not null,
  id text not null,
  formation text not null,
  player_positions jsonb not null default '{}'::jsonb,
  description text not null default '',
  primary key (lang, id)
);

create table if not exists public.news (
  lang text not null,
  id text not null,
  title text not null,
  description text not null default '',
  image text not null default '',
  created_at timestamptz not null default now(),
  primary key (lang, id)
);

create index if not exists players_lang_idx on public.players (lang);
create index if not exists tactics_lang_idx on public.tactics (lang);
create index if not exists news_lang_idx on public.news (lang);

-- Row Level Security: everyone may read the public website, only signed-in
-- administrators may write. The anon key is public, so these policies are the
-- actual access control.
alter table public.players enable row level security;
alter table public.club enable row level security;
alter table public.tactics enable row level security;
alter table public.news enable row level security;

drop policy if exists "players read" on public.players;
create policy "players read" on public.players for select using (true);
drop policy if exists "players write" on public.players;
create policy "players write" on public.players for all to authenticated using (true) with check (true);

drop policy if exists "club read" on public.club;
create policy "club read" on public.club for select using (true);
drop policy if exists "club write" on public.club;
create policy "club write" on public.club for all to authenticated using (true) with check (true);

drop policy if exists "tactics read" on public.tactics;
create policy "tactics read" on public.tactics for select using (true);
drop policy if exists "tactics write" on public.tactics;
create policy "tactics write" on public.tactics for all to authenticated using (true) with check (true);

drop policy if exists "news read" on public.news;
create policy "news read" on public.news for select using (true);
drop policy if exists "news write" on public.news;
create policy "news write" on public.news for all to authenticated using (true) with check (true);
