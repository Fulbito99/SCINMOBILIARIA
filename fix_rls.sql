-- FIX RLS POLICIES (Reparar Permisos de Seguridad)
-- Este script soluciona el problema donde el usuario Admin no puede ver a otros usuarios
-- debido a un bloqueo de seguridad recursivo (RLS).

-- 1. Crear una verificacion segura de administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Eliminar politicas anteriores que podrian estar fallando
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- 3. Crear politicas nuevas limpias
-- Permitir que CUALQUIER usuario autenticado vea los perfiles (necesario para ver nombres de dueños)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Permitir que los ADMINS (verificados por la funcion segura) puedan insertar/actualizar/borrar
CREATE POLICY "Admins can do full access on profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin());

-- Verificacion visual (opcional)
-- SELECT * FROM profiles;
