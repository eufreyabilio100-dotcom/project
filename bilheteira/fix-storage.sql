-- ========================================
-- CORRECÇÃO: Políticas de Storage para imagens
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- Permitir que utilizadores autenticados façam upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- Permitir que todos vejam as imagens (público)
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- Permitir que utilizadores autenticados actualizem imagens
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images');

-- Permitir que utilizadores autenticados eliminem imagens
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');
