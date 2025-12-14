-- 1. ASEGURAR TABLA PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  role text default 'agent',
  constraint username_length check (char_length(username) >= 3)
);

-- 2. RESETEAR POLÍTICAS DE PROFILES (Para evitar conflictos)
alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 3. BACKFILL (RELLENAR) PERFILES FALTANTES
-- Inserta un perfil para cada usuario que exista en auth.users pero no en public.profiles
insert into public.profiles (id, full_name, role)
select id, coalesce(raw_user_meta_data->>'full_name', email), 'agent'
from auth.users
where id not in (select id from public.profiles);

-- 4. ASEGURAR TABLA PROPERTIES
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  price numeric not null,
  currency text default 'EUR',
  location text not null,
  beds integer default 0,
  baths numeric default 0,
  sqft numeric default 0,
  type text default 'House',
  image_url text,
  description text,
  features text[] default '{}'::text[]
);

-- 5. RESETEAR POLÍTICAS DE PROPIEDADES
alter table public.properties enable row level security;

drop policy if exists "Public properties are viewable by everyone" on properties;
create policy "Public properties are viewable by everyone" on properties for select using (true);

drop policy if exists "Agents can insert properties" on properties;
create policy "Agents can insert properties" on properties for insert with check (auth.uid() = user_id);

drop policy if exists "Owners can update their properties" on properties;
create policy "Owners can update their properties" on properties for update using (auth.uid() = user_id);

drop policy if exists "Owners can delete their properties" on properties;
create policy "Owners can delete their properties" on properties for delete using (auth.uid() = user_id);

-- 6. VERIFICACIÓN FINAL
select count(*) as matching_profiles from public.profiles;
