-- ⚠️ ATENCIÓN: Este script borrará la tabla properties y la creará de nuevo.
-- Úsalo solo si no tienes datos importantes que perder en esa tabla.

-- 1. Borrar la tabla problemática
drop table if exists public.properties cascade;

-- 2. Crear la tabla de nuevo CON la columna user_id desde el principio
create table public.properties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null, -- Esta era la columna que faltaba
  title text not null,
  price numeric not null,
  currency text default 'USD',
  location text not null,
  beds integer,
  baths numeric,
  sqft integer,
  type text,
  listing_type text default 'sale',
  image_url text,
  images text[],
  description text,
  features text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Habilitar seguridad
alter table public.properties enable row level security;

-- 4. Re-crear las políticas de acceso
create policy "Anyone can read properties"
  on public.properties for select
  using (true);

create policy "Authenticated users can insert properties"
  on public.properties for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update properties"
  on public.properties for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete properties"
  on public.properties for delete
  using (auth.role() = 'authenticated');

-- 5. Forzar recarga de caché de Supabase
NOTIFY pgrst, 'reload config';
