-- 1. INDEXES (SPEED UP SEARCHES)
-- Speed up looking for a user's profile
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Speed up looking for properties by owner (for the Dashboard)
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);

-- Speed up filtering properties by type or price (for the Public Search)
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);


-- 2. AUTOMATIC PROFILE CREATION TRIGGER
-- Ensures that as soon as a user signs up, their profile entry is created instantly.
-- This prevents the "Profile not found" delay or error.

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'agent')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. ANALYZE (Update statistics for query planner)
ANALYZE properties;
ANALYZE profiles;
