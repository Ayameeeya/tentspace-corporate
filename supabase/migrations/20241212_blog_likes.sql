-- Enable required extension for gen_random_uuid
create extension if not exists "pgcrypto";

-- Table: public.blog_likes
create table public.blog_likes (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  client_id text not null,
  user_agent text,
  ip_addr inet,
  created_at timestamptz not null default now()
);

-- Prevent duplicate likes per client per post
create unique index blog_likes_unique on public.blog_likes (post_slug, client_id);

-- Aggregated counts per post
create or replace view public.blog_like_counts as
select post_slug, count(*) as likes
from public.blog_likes
group by post_slug;

-- RLS: allow inserts and reads
alter table public.blog_likes enable row level security;

create policy "Allow insert from anon" on public.blog_likes
  for insert to anon, authenticated
  with check (true);

create policy "Allow read counts" on public.blog_likes
  for select to anon, authenticated
  using (true);
