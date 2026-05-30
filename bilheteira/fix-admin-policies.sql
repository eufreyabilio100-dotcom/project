-- ========================================
-- CORRECÇÃO: Políticas para Admin ver todos os bilhetes
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- 1. Eliminar política existente de SELECT em tickets
DROP POLICY IF EXISTS "Utilizadores veem próprios bilhetes" ON tickets;

-- 2. Criar nova política: utilizadores veem os seus bilhetes
CREATE POLICY "Utilizadores veem próprios bilhetes"
  ON tickets FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Garantir que admins podem ver todos os perfis
DROP POLICY IF EXISTS "Utilizador vê próprio perfil" ON profiles;
CREATE POLICY "Perfis visíveis para autenticados"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
