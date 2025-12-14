-- Create table if not exists
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  role text default 'agent',
  primary key (id),
  unique(username),
  constraint username_length check (char_length(username) >= 3)
);

-- Enable RLS (safe to run multiple times)
alter table profiles enable row level security;

-- Drop policies to recreate them (avoids "policy already exists" error)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'agent')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: Drop first to avoid error 42710 if it exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
