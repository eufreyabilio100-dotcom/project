-- ========================================
-- CORRECÇÃO: Políticas de RLS para perfis
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- Eliminar TODAS as políticas existentes em profiles
DROP POLICY IF EXISTS "Perfis visíveis para autenticados" ON profiles;
DROP POLICY IF EXISTS "Utilizador vê próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Perfis visíveis para todos os autenticados" ON profiles;
DROP POLICY IF EXISTS "Utilizador atualiza o próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Utilizador insere próprio perfil" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- 1. SELECT: qualquer utilizador autenticado pode ver perfis
CREATE POLICY "qualquer_utilizador_ve_perfis"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- 2. INSERT: utilizador pode inserir o próprio perfil
CREATE POLICY "utilizador_insere_proprio_perfil"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 3. UPDATE: utilizador pode atualizar o próprio perfil
CREATE POLICY "utilizador_atualiza_proprio_perfil"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());
