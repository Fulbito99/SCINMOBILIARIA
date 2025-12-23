-- SCRIPT PARA CONFIGURAR ALMACENAMIENTO DE IMÁGENES
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Crear el "Bucket" (carpeta principal) de almacenamiento si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- 3. Crear Políticas de Seguridad (RLS) para el almacenamiento

-- PERMITIR QUE CUALQUIERA VEA LAS IMÁGENES (Público)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'properties' );

-- PERMITIR QUE USUARIOS CONECTADOS SUBAN IMÁGENES
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'properties' AND
  auth.role() = 'authenticated'
);

-- PERMITIR ACTUALIZAR IMÁGENES (Opcional)
CREATE POLICY "Users can update images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'properties' AND auth.role() = 'authenticated' );

-- PERMITIR BORRAR IMÁGENES (Opcional)
CREATE POLICY "Users can delete images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'properties' AND auth.role() = 'authenticated' );

-- Verificación
SELECT * FROM storage.buckets WHERE id = 'properties';
