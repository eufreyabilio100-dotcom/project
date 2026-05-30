-- ========================================
-- BILHETEIRA - Schema Completo da Base de Dados
-- Plataforma de Venda de Bilhetes para Eventos
-- Execute todo este SQL no Supabase SQL Editor
-- ========================================

-- ========================================
-- 1. TABELAS
-- ========================================

-- Tabela de perfis de utilizadores
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  available_tickets INTEGER NOT NULL CHECK (available_tickets >= 0),
  image_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de bilhetes comprados
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'mpesa',
  payment_phone TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 2. POLÍTICAS DE SEGURANÇA (RLS)
-- ========================================

-- Ativar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- --- PERFIS ---
-- Qualquer utilizador autenticado pode ver perfis
CREATE POLICY "qualquer_utilizador_ve_perfis"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Utilizador pode inserir o próprio perfil (registo)
CREATE POLICY "utilizador_insere_proprio_perfil"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Utilizador pode atualizar o próprio perfil
CREATE POLICY "utilizador_atualiza_proprio_perfil"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- --- EVENTOS ---
-- Qualquer pessoa pode ver eventos
CREATE POLICY "todos_veem_eventos"
ON events FOR SELECT
TO anon, authenticated
USING (true);

-- Só admins podem criar eventos
CREATE POLICY "admins_criam_eventos"
ON events FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Só admins podem atualizar eventos
CREATE POLICY "admins_atualizam_eventos"
ON events FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Só admins podem eliminar eventos
CREATE POLICY "admins_eliminam_eventos"
ON events FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- --- BILHETES ---
-- Utilizadores veem os seus próprios bilhetes, admins veem todos
CREATE POLICY "utilizadores_veem_bilhetes"
ON tickets FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Utilizadores autenticados podem comprar bilhetes
CREATE POLICY "utilizadores_compram_bilhetes"
ON tickets FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ========================================
-- 3. STORAGE (Imagens)
-- ========================================

-- Políticas para o bucket event-images
CREATE POLICY "authenticated_upload_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "public_view_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "authenticated_update_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images');

CREATE POLICY "authenticated_delete_images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');

-- ========================================
-- 4. TRIGGER: Criar perfil automático ao registar
-- ========================================

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

-- Trigger que cria perfil ao registar novo utilizador
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- 5. DADOS DE EXEMPLO (Opcional)
-- ========================================
-- Para criar um admin, execute após registar o utilizador:
-- UPDATE profiles SET role = 'admin' WHERE id = 'ID_DO_UTILIZADOR';
