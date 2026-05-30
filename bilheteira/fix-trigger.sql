-- ========================================
-- CORRECÇÃO DO TRIGGER DE REGISTO
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- 1. Eliminar o trigger e a função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Recriar a função com SECURITY DEFINER e search_path
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Utilizador'),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Garantir que a política de INSERT existe
DROP POLICY IF EXISTS "Utilizador insere próprio perfil" ON public.profiles;
CREATE POLICY "Utilizador insere próprio perfil"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
