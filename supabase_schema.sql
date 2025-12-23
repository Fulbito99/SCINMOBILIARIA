-- 1. Create a profiles table to store user roles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text default 'agent' check (role in ('admin', 'agent')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on profiles
alter table public.profiles enable row level security;

-- 3. Create policies for profiles
create policy "Admins can do everything on profiles"
  on public.profiles for all
  using (
    auth.uid() in (
      select id from public.profiles where role = 'admin'
    )
  );

create policy "Authenticated users can view profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- 4. Trigger for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    coalesce(new.raw_user_meta_data->>'role', 'agent')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. CREATE PROPERTIES TABLE
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  price numeric not null,
  currency text default 'USD',
  location text not null,
  beds integer,
  baths numeric,
  sqft integer,
  type text,
  listing_type text default 'sale',
  image_url text,           -- Main image
  images text[],            -- Gallery images
  description text,
  features text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Enable RLS on properties
alter table public.properties enable row level security;

-- 7. Policies for properties
-- Reset policies to avoid duplicates
drop policy if exists "Anyone can read properties" on public.properties;
drop policy if exists "Authenticated users can insert properties" on public.properties;
drop policy if exists "Authenticated users can update properties" on public.properties;
drop policy if exists "Authenticated users can delete properties" on public.properties;

-- Everyone (even visitors) can READ properties
create policy "Anyone can read properties"
  on public.properties for select
  using (true);

-- Only Authenticated users (Agents/Admins) can INSERT
create policy "Authenticated users can insert properties"
  on public.properties for insert
  with check (auth.role() = 'authenticated');

-- Only Authenticated users can UPDATE
create policy "Authenticated users can update properties"
  on public.properties for update
  using (auth.role() = 'authenticated');

-- Only Authenticated users can DELETE
create policy "Authenticated users can delete properties"
  on public.properties for delete
  using (auth.role() = 'authenticated');

-- IMPORTANT: Run this AFTER executing the script to make yourself admin
-- update public.profiles set role = 'admin' where email = 'YOUR_EMAIL@gmail.com';
