-- INSTRUCCIONES:
-- 1. Ejecuta este script en el Editor SQL de Supabase.
--    Este script es más robusto: buscará tu usuario en la tabla de autenticación
--    y creará o actualizará tu perfil de administrador automáticamente.

INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
    id, 
    email, 
    'admin', 
    COALESCE(raw_user_meta_data->>'full_name', email) -- Usa el nombre o el email si no hay nombre
FROM auth.users
WHERE email = 'francoaguirre928@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- Verificación final
SELECT * FROM profiles WHERE email = 'francoaguirre928@gmail.com';
