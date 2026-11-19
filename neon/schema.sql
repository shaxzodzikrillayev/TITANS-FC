-- TITANS FC · Neon schema
-- Run this once in the Neon SQL Editor on the branch you want to use.
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

-- Revision counter: the SPA polls this table to notice changes made from
-- another browser/device (Neon has no Realtime push).
create table if not exists public.sync_state (
  lang text primary key,
  rev bigint not null default 0
);

insert into public.sync_state (lang, rev) values ('ru', 0), ('uz', 0), ('en', 0)
on conflict (lang) do nothing;

create index if not exists players_lang_idx on public.players (lang);
create index if not exists tactics_lang_idx on public.tactics (lang);
create index if not exists news_lang_idx on public.news (lang);

-- Recommended: use a dedicated role for the connection string instead of the
-- project owner. For example:
--   create role titans_app login password 'change-me';
--   grant usage on schema public to titans_app;
--   grant select, insert, update, delete on public.players, public.club,
--     public.tactics, public.news, public.sync_state to titans_app;
