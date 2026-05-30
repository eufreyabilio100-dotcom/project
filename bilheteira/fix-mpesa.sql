-- ========================================
-- CORRECÇÃO: Adicionar suporte M-Pesa
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- 1. Adicionar coluna phone à tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Adicionar colunas de pagamento à tabela tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mpesa';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS payment_phone TEXT;

-- 3. Actualizar política de UPDATE para incluir phone
DROP POLICY IF EXISTS "utilizador_atualiza_proprio_perfil" ON profiles;
CREATE POLICY "utilizador_atualiza_proprio_perfil"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
