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

-- ============================================================================
-- Migration 4: real accounts (Supabase Auth + email OTP) — student & owner
-- profiles. Unlike the other tables in this file, RLS here is intentionally
-- STRICT (not "_temp" permissive): profiles hold real emails/phone numbers
-- behind real auth accounts, so each user may only read/edit their own row.
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'etudiant' check (role in ('etudiant', 'proprietaire')),
  first_name text not null default '',
  last_name text not null default '',
  email text,
  phone text not null default '',
  city text not null default '',
  university text not null default '',
  bio text not null default '',
  avatar text not null default '',
  referral_code text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row the moment a new auth user is created (right
-- after their first OTP verification), seeded from the metadata passed to
-- signInWithOtp's options.data — avoids a separate client-side insert call
-- that could be skipped or fail independently of the auth signup itself.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, first_name, last_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'etudiant'),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ============================================================================
-- Migration 5: real per-account credits, favorites, unlocks & transaction
-- history — replaces the browser-localStorage version of this state, which
-- followed the browser rather than the logged-in account. Strict per-user
-- RLS throughout, same rationale as the profiles table above.
-- ============================================================================

alter table public.profiles add column if not exists credits integer not null default 0;

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table if not exists public.unlocked_listings (
  user_id uuid not null references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('Achat', 'Utilisation', 'Remboursement')),
  description text not null,
  credits integer not null,
  amount numeric not null default 0,
  status text not null default 'Terminé' check (status in ('Terminé', 'En cours', 'Échoué')),
  created_at timestamptz not null default now()
);

create index if not exists favorites_user_id_idx on public.favorites (user_id);
create index if not exists unlocked_listings_user_id_idx on public.unlocked_listings (user_id);
create index if not exists credit_transactions_user_id_idx on public.credit_transactions (user_id);

alter table public.favorites enable row level security;
alter table public.unlocked_listings enable row level security;
alter table public.credit_transactions enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
drop policy if exists "favorites_insert_own" on public.favorites;
drop policy if exists "favorites_delete_own" on public.favorites;

create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

drop policy if exists "unlocked_listings_select_own" on public.unlocked_listings;
drop policy if exists "unlocked_listings_insert_own" on public.unlocked_listings;

create policy "unlocked_listings_select_own" on public.unlocked_listings
  for select using (auth.uid() = user_id);
create policy "unlocked_listings_insert_own" on public.unlocked_listings
  for insert with check (auth.uid() = user_id);

drop policy if exists "credit_transactions_select_own" on public.credit_transactions;
drop policy if exists "credit_transactions_insert_own" on public.credit_transactions;

create policy "credit_transactions_select_own" on public.credit_transactions
  for select using (auth.uid() = user_id);
create policy "credit_transactions_insert_own" on public.credit_transactions
  for insert with check (auth.uid() = user_id);

-- Atomic unlock: checks balance, deducts credits, records the unlock and the
-- transaction all in one statement — avoids a race where two quick clicks
-- (or two tabs) both read a stale balance and both succeed.
create or replace function public.unlock_listing(p_listing_id uuid, p_cost integer, p_label text)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  current_credits integer;
  already_unlocked boolean;
begin
  select exists(
    select 1 from public.unlocked_listings where user_id = auth.uid() and listing_id = p_listing_id
  ) into already_unlocked;
  if already_unlocked then
    return true;
  end if;

  select credits into current_credits from public.profiles where id = auth.uid() for update;
  if current_credits is null or current_credits < p_cost then
    return false;
  end if;

  update public.profiles set credits = credits - p_cost where id = auth.uid();
  insert into public.unlocked_listings (user_id, listing_id) values (auth.uid(), p_listing_id);
  insert into public.credit_transactions (user_id, type, description, credits, amount, status)
  values (auth.uid(), 'Utilisation', 'Contact propriétaire - ' || p_label, -p_cost, 0, 'Terminé');

  return true;
end;
$$;

create or replace function public.buy_credits(p_credits integer, p_amount numeric, p_pack_name text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles set credits = credits + p_credits where id = auth.uid();
  insert into public.credit_transactions (user_id, type, description, credits, amount, status)
  values (auth.uid(), 'Achat', p_pack_name || ' - ' || p_credits || ' crédits', p_credits, p_amount, 'Terminé');
end;
$$;

grant execute on function public.unlock_listing(uuid, integer, text) to authenticated;
grant execute on function public.buy_credits(integer, numeric, text) to authenticated;
