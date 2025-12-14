-- Force repair for the specific user
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Find the user ID by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'francoaguirre928@gmail.com';

  IF v_user_id IS NOT NULL THEN
    -- 2. Insert into profiles if not exists
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (v_user_id, 'Agente Franco', 'agent')
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name
    WHERE profiles.full_name IS NULL;
    
    RAISE NOTICE 'Profile repaired for user %', v_user_id;
  ELSE
    RAISE NOTICE 'User not found for email francoaguirre928@gmail.com';
  END IF;
END $$;

-- 3. Verify
SELECT * FROM public.profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'francoaguirre928@gmail.com');
