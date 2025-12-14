-- SCRIPT DE VERIFICACIÓN DE RLS Y DATOS
-- Ejecuta este script en el Editor SQL de Supabase para diagnosticar el problema.

-- 1. Verifica si existen propiedades en la tabla (sin importar permisos)
select count(*) as total_properties_in_db from public.properties;

-- 2. Lista las políticas de seguridad (RLS) activas para la tabla 'properties'
select schemaname, tablename, policyname, cmd, roles, qual, with_check 
from pg_policies 
where tablename = 'properties';

-- 3. Verifica si el RLS está habilitado en la tabla
select relname, relrowsecurity 
from pg_class 
where relname = 'properties';

-- 4. Intenta simular una consulta "anónima" (sin loguearse)
-- Esto nos dirá si un visitante normal puede ver las propiedades.
set role anon;
select count(*) as visible_to_anon from public.properties;
reset role;

-- 5. Verifica los usuarios y sus perfiles
select 
    u.email, 
    p.full_name, 
    p.role 
from auth.users u
left join public.profiles p on u.id = p.id;
