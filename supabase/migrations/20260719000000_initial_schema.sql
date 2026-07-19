-- Habilitar a extensão pgcrypto para gerar UUIDs, se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. user_roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Inserir roles padrão
INSERT INTO public.user_roles (name, description) VALUES
  ('admin', 'Administrador do sistema'),
  ('user', 'Usuário comum');

-- 2. profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.user_roles(id) ON DELETE SET NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger de Autenticação para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. categories
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. subcategories
CREATE TABLE public.subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id, slug)
);

-- 5. companies
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    document TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    is_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. company_claims
CREATE TABLE public.company_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. entity_members
CREATE TABLE public.entity_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);

-- 8. places
CREATE TABLE public.places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    lat FLOAT,
    lng FLOAT,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. reviews
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. favorites
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, place_id)
);

-- 11. news
CREATE TABLE public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. place_images
CREATE TABLE public.place_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_360 BOOLEAN DEFAULT FALSE,
    caption TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. operating_hours
CREATE TABLE public.operating_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6),
    open_time TIME,
    close_time TIME,
    UNIQUE(place_id, day_of_week)
);

-- 14. amenities
CREATE TABLE public.amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT
);

-- 15. place_amenities
CREATE TABLE public.place_amenities (
    place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
    amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (place_id, amenity_id)
);

-- 16. events
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuração de Row Level Security (RLS)

-- Ativar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas de Leitura
CREATE POLICY "Leitura pública" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON public.entity_members FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON public.places FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON public.news FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON public.place_images FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON public.operating_hours FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON public.amenities FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON public.place_amenities FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON public.events FOR SELECT USING (true);

-- Políticas Privadas (Usuários Autenticados)
CREATE POLICY "Usuários podem atualizar seus próprios profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Company Claims
CREATE POLICY "Usuário pode criar claims" ON public.company_claims FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND is_claimed = FALSE) AND auth.uid() = user_id
);
CREATE POLICY "Usuário pode ler suas próprias claims" ON public.company_claims FOR SELECT USING (auth.uid() = user_id);

-- Favoritos
CREATE POLICY "Usuário lê seus favoritos" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuário insere seus favoritos" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuário deleta seus favoritos" ON public.favorites FOR DELETE USING (auth.uid() = user_id);
