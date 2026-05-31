-- ========================================
-- CORRECÇÃO: Adicionar email à tabela profiles
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- Adicionar coluna email
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Actualizar trigger para guardar email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Utilizador'),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Actualizar emails existentes
UPDATE profiles SET email = (
  SELECT email FROM auth.users WHERE auth.users.id = profiles.id
) WHERE email IS NULL;
