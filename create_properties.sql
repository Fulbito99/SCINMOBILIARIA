-- Create properties table
create table if not exists properties (
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
  image_url text, -- Will map to imageUrl in frontend
  description text,
  features text[] default '{}'::text[] -- Array of strings for features
);

-- Enable RLS
alter table properties enable row level security;

-- Policies

-- Everyone can view properties
drop policy if exists "Public properties are viewable by everyone" on properties;
create policy "Public properties are viewable by everyone"
  on properties for select
  using ( true );

-- Only authenticated users (agents) can insert
drop policy if exists "Agents can insert properties" on properties;
create policy "Agents can insert properties"
  on properties for insert
  with check ( auth.uid() = user_id );

-- Only owner can update
drop policy if exists "Owners can update their properties" on properties;
create policy "Owners can update their properties"
  on properties for update
  using ( auth.uid() = user_id );

-- Only owner can delete
drop policy if exists "Owners can delete their properties" on properties;
create policy "Owners can delete their properties"
  on properties for delete
  using ( auth.uid() = user_id );
