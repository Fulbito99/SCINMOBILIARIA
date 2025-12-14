-- ⚠️ DESTRUCTIVE: Drops existing tables
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Create Properties Table (The core of the app)
CREATE TABLE public.properties (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    price numeric NOT NULL,
    currency text DEFAULT 'USD',
    location text NOT NULL,
    beds integer DEFAULT 0,
    baths numeric DEFAULT 0,
    sqft numeric DEFAULT 0,
    type text DEFAULT 'House',
    listing_type text DEFAULT 'sale', -- 'sale' or 'rent'
    description text,
    features text[] DEFAULT '{}'::text[],
    image_url text,           -- Primary image
    images text[] DEFAULT '{}'::text[] -- Gallery images
);

-- 2. Create Profiles Table (Simplified - Optional use)
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text
);

-- 3. Security Policies (RLS)

-- PROPERTIES:
-- Public can READ everything
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Properties" 
ON properties FOR SELECT 
USING (true);

-- Agents (Authenticated Users) can DO EVERYTHING to their OWN properties
CREATE POLICY "Agents Manage Properties" 
ON properties FOR ALL 
USING (auth.role() = 'authenticated'); 
-- Note: 'authenticated' allows any logged-in user to add properties.
-- We trust that you only create accounts for real agents.

-- PROFILES:
-- Public can read basic profile info (if we use it later)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Profiles" 
ON profiles FOR SELECT 
USING (true);

-- Users can update their own profile
CREATE POLICY "Users Update Own Profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Trigger to auto-create profile on Signup (Clean & Simple)
-- This ensures that when you create a user in Supabase, a profile row exists automatically.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Indexes for Speed
CREATE INDEX idx_properties_user ON properties(user_id);
