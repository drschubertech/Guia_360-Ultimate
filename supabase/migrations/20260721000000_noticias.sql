-- Script de migração para criar/atualizar a tabela 'noticias' no Supabase
CREATE TABLE IF NOT EXISTS public.noticias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    autor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    resumo TEXT,
    slug TEXT,
    imagem_url TEXT,
    data_publicacao TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir que as colunas existam caso a tabela já tenha sido criada anteriormente sem algumas colunas
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS autor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS resumo TEXT;
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS imagem_url TEXT;
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS data_publicacao TIMESTAMPTZ DEFAULT NOW();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem para evitar conflitos
DROP POLICY IF EXISTS "Noticias publicas" ON public.noticias;
DROP POLICY IF EXISTS "Admins inserem noticias" ON public.noticias;
DROP POLICY IF EXISTS "Admins atualizam noticias" ON public.noticias;
DROP POLICY IF EXISTS "Admins deletam noticias" ON public.noticias;

-- Políticas de Acesso
CREATE POLICY "Noticias publicas" ON public.noticias
    FOR SELECT USING (true);

CREATE POLICY "Admins inserem noticias" ON public.noticias
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins atualizam noticias" ON public.noticias
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins deletam noticias" ON public.noticias
    FOR DELETE USING (auth.uid() IS NOT NULL);
