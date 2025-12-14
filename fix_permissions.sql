-- Enable RLS (Row Level Security) just in case
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 1. Allow EVERYONE (public/anon) to SEE (Select) properties
DROP POLICY IF EXISTS "Public can view properties" ON properties;
CREATE POLICY "Public can view properties" ON properties
FOR SELECT USING (true);

-- 2. Allow LOGGED IN users (agents) to INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Agents can manage properties" ON properties;
CREATE POLICY "Agents can manage properties" ON properties
FOR ALL USING (auth.role() = 'authenticated');

-- Verify data exists
SELECT count(*) as total_properties FROM properties;
