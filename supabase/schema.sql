-- StudHome — schema for real listings (run once in Supabase SQL Editor)

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  city text not null,
  quartier text not null,
  universities text[] not null default '{}',
  price numeric not null default 0,
  period text not null default 'mois',
  description text not null default '',
  equipements text[] not null default '{}',
  image text not null default '',
  gallery text[] not null default '{}',
  status text not null default 'En attente'
    check (status in ('En attente', 'Publiée', 'Modifications demandées', 'Refusée')),
  submitted_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unlock_cost integer not null default 10,

  owner_id text not null,
  owner_name text not null,
  owner_phone text not null,
  owner_avatar_img text,
  owner_member_since timestamptz not null default now(),

  modification_message text,
  modification_reason text,

  views integer not null default 0,
  favorites_count integer not null default 0,
  unlocks_count integer not null default 0,
  last_stats_update timestamptz not null default now(),
  daily_stats jsonb not null default '[]'::jsonb
);

create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_owner_id_idx on public.listings (owner_id);

alter table public.listings enable row level security;

drop policy if exists "listings_select_all_temp" on public.listings;
drop policy if exists "listings_insert_all_temp" on public.listings;
drop policy if exists "listings_update_all_temp" on public.listings;
drop policy if exists "listings_delete_all_temp" on public.listings;

-- TEMPORARY policies: the app has no real Supabase Auth yet (student/owner/admin
-- logins are still simulated client-side). These allow the anon key to read/write
-- freely, matching today's security level (none). Replace with auth.uid()-scoped
-- policies once real login is wired for each of the 4 roles.
create policy "listings_select_all_temp" on public.listings
  for select using (true);

create policy "listings_insert_all_temp" on public.listings
  for insert with check (true);

create policy "listings_update_all_temp" on public.listings
  for update using (true);

create policy "listings_delete_all_temp" on public.listings
  for delete using (true);

-- Atomic counter increments (views / favorites_count / unlocks_count), so two
-- students acting at the same time can't overwrite each other's count.
create or replace function public.increment_listing_counter(
  p_listing_id uuid,
  p_field text,
  p_delta integer
) returns void
language sql
security definer
as $$
  update public.listings
  set
    views = case when p_field = 'views' then views + p_delta else views end,
    favorites_count = case when p_field = 'favorites_count' then greatest(0, favorites_count + p_delta) else favorites_count end,
    unlocks_count = case when p_field = 'unlocks_count' then unlocks_count + p_delta else unlocks_count end,
    last_stats_update = now()
  where id = p_listing_id;
$$;

grant execute on function public.increment_listing_counter to anon, authenticated;

-- Storage bucket for real listing photos (replaces base64 data URLs)
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

drop policy if exists "listing_photos_read" on storage.objects;
drop policy if exists "listing_photos_write_temp" on storage.objects;

create policy "listing_photos_read" on storage.objects
  for select using (bucket_id = 'listing-photos');

create policy "listing_photos_write_temp" on storage.objects
  for insert with check (bucket_id = 'listing-photos');

drop policy if exists "listing_photos_delete_temp" on storage.objects;
create policy "listing_photos_delete_temp" on storage.objects
  for delete using (bucket_id = 'listing-photos');

-- Enable realtime broadcasts for this table. Without this, changes made in one
-- browser tab/session never push to other open tabs/sessions — they'd only see
-- the update after a manual page reload.
alter publication supabase_realtime add table public.listings;

-- ============================================================================
-- Migration 2: exact address (private, revealed only after unlock) + reviews
-- ============================================================================

alter table public.listings add column if not exists address text not null default '';

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  status text not null default 'En attente'
    check (status in ('En attente', 'Publié', 'Rejeté')),
  moderation_reason text,
  created_at timestamptz not null default now()
);

create index if not exists reviews_listing_id_idx on public.reviews (listing_id);
create index if not exists reviews_status_idx on public.reviews (status);

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_all_temp" on public.reviews;
drop policy if exists "reviews_insert_all_temp" on public.reviews;
drop policy if exists "reviews_update_all_temp" on public.reviews;
drop policy if exists "reviews_delete_all_temp" on public.reviews;

-- TEMPORARY policies, same rationale as the listings table above.
create policy "reviews_select_all_temp" on public.reviews
  for select using (true);

create policy "reviews_insert_all_temp" on public.reviews
  for insert with check (true);

create policy "reviews_update_all_temp" on public.reviews
  for update using (true);

create policy "reviews_delete_all_temp" on public.reviews
  for delete using (true);

alter publication supabase_realtime add table public.reviews;

-- ============================================================================
-- Migration 3: signalements (students reporting a listing to admins)
-- ============================================================================

create table if not exists public.signalements (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  listing_title text not null,
  reported_by text not null,
  reason text not null,
  details text not null default '',
  status text not null default 'Nouveau'
    check (status in ('Nouveau', 'En cours', 'Résolu')),
  created_at timestamptz not null default now()
);

create index if not exists signalements_listing_id_idx on public.signalements (listing_id);
create index if not exists signalements_status_idx on public.signalements (status);

alter table public.signalements enable row level security;

drop policy if exists "signalements_select_all_temp" on public.signalements;
drop policy if exists "signalements_insert_all_temp" on public.signalements;
drop policy if exists "signalements_update_all_temp" on public.signalements;
drop policy if exists "signalements_delete_all_temp" on public.signalements;

-- TEMPORARY policies, same rationale as the listings table above.
create policy "signalements_select_all_temp" on public.signalements
  for select using (true);

create policy "signalements_insert_all_temp" on public.signalements
  for insert with check (true);

create policy "signalements_update_all_temp" on public.signalements
  for update using (true);

create policy "signalements_delete_all_temp" on public.signalements
  for delete using (true);

alter publication supabase_realtime add table public.signalements;
