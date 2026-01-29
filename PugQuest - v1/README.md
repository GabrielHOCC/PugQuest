
# Pug Quest - O Guia do Mestre

Este projeto é um gerenciador de campanhas épico utilizando **React, TailwindCSS e Supabase**.

---

## 🗄️ Configuração do Banco de Dados (SQL Definitivo)

**IMPORTANTE:** Copie e cole todo o código abaixo no **SQL Editor** do seu Supabase. Ele criará as tabelas e o sistema de perfis automaticamente.

```sql
-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis (Sincronizada com o Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar TEXT DEFAULT 'Shield',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Gatilho para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', new.email), COALESCE(new.raw_user_meta_data->>'avatar', 'Shield'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove o trigger se já existir para não dar erro ao rodar de novo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Popular perfis existentes (caso você já tenha criado contas)
INSERT INTO public.profiles (id, email, name, avatar)
SELECT id, email, COALESCE(raw_user_meta_data->>'name', email), COALESCE(raw_user_meta_data->>'avatar', 'Shield')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Tabelas da Campanha
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'Ativa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('MASTER', 'PLAYER')) NOT NULL,
  UNIQUE(user_id, campaign_id)
);

CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  history TEXT,
  image_url TEXT,
  status TEXT,
  character_type TEXT,
  is_visible_to_players BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_visible_to_players BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_visible_to_players BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS infos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Outro',
  image_url TEXT,
  is_visible_to_players BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monsters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL DEFAULT 'Médio',
  image_url TEXT,
  is_visible_to_players BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS e Políticas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE monsters ENABLE ROW LEVEL SECURITY;

-- Políticas de Perfil
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Funções Auxiliares de Segurança
CREATE OR REPLACE FUNCTION check_is_owner(camp_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM campaigns WHERE id = camp_id AND owner_id = auth.uid()) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_is_member(camp_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM memberships WHERE campaign_id = camp_id AND user_id = auth.uid()) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de Campanha e Itens
CREATE POLICY "camp_owner" ON campaigns FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "camp_member" ON campaigns FOR SELECT USING (check_is_member(id));

CREATE POLICY "mem_owner" ON memberships FOR SELECT USING (check_is_owner(campaign_id));
CREATE POLICY "mem_self" ON memberships FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "item_master" ON characters FOR ALL USING (check_is_owner(campaign_id));
CREATE POLICY "item_player" ON characters FOR SELECT USING (is_visible_to_players = true AND check_is_member(campaign_id));

CREATE POLICY "loc_master" ON locations FOR ALL USING (check_is_owner(campaign_id));
CREATE POLICY "loc_player" ON locations FOR SELECT USING (is_visible_to_players = true AND check_is_member(campaign_id));

CREATE POLICY "story_master" ON stories FOR ALL USING (check_is_owner(campaign_id));
CREATE POLICY "story_player" ON stories FOR SELECT USING (is_visible_to_players = true AND check_is_member(campaign_id));

CREATE POLICY "info_master" ON infos FOR ALL USING (check_is_owner(campaign_id));
CREATE POLICY "info_player" ON infos FOR SELECT USING (is_visible_to_players = true AND check_is_member(campaign_id));

CREATE POLICY "monster_master" ON monsters FOR ALL USING (check_is_owner(campaign_id));
CREATE POLICY "monster_player" ON monsters FOR SELECT USING (is_visible_to_players = true AND check_is_member(campaign_id));
```
---
