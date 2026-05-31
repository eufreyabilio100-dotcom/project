-- ========================================
-- CORRECÇÃO: Políticas RLS para Admin
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- 1. Admin pode actualizar qualquer perfil
DROP POLICY IF EXISTS "admins_atualizam_perfis" ON profiles;
CREATE POLICY "admins_atualizam_perfis"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Admin pode ver todos os perfis (já existe, mas garantir)
DROP POLICY IF EXISTS "qualquer_utilizador_ve_perfis" ON profiles;
CREATE POLICY "qualquer_utilizador_ve_perfis"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- 3. Admin pode eliminar utilizadores (opcional)
DROP POLICY IF EXISTS "admins_eliminam_perfis" ON profiles;
CREATE POLICY "admins_eliminam_perfis"
ON profiles FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
