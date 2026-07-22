-- Migration: Ajustes e Tabelas para o Painel Administrativo (/admin)

-- 1. Tabela de Cidades
CREATE TABLE IF NOT EXISTS public.cidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    uf TEXT DEFAULT 'SC',
    status TEXT DEFAULT 'EM BREVE', -- 'ATIVA' ou 'EM BREVE'
    slug TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir Cidades Padrão (se vazia)
INSERT INTO public.cidades (nome, uf, status, slug)
SELECT 'Balneário Piçarras', 'SC', 'ATIVA', 'balneario-picarras'
WHERE NOT EXISTS (SELECT 1 FROM public.cidades WHERE nome = 'Balneário Piçarras');

INSERT INTO public.cidades (nome, uf, status, slug)
SELECT 'Penha', 'SC', 'EM BREVE', 'penha'
WHERE NOT EXISTS (SELECT 1 FROM public.cidades WHERE nome = 'Penha');

INSERT INTO public.cidades (nome, uf, status, slug)
SELECT 'Barra Velha', 'SC', 'EM BREVE', 'barra-velha'
WHERE NOT EXISTS (SELECT 1 FROM public.cidades WHERE nome = 'Barra Velha');

-- 2. Garantir colunas 'tipo', 'responsavel', 'verificada' na tabela de entidades
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='entidades' AND column_name='tipo'
    ) THEN
        ALTER TABLE public.entidades ADD COLUMN tipo TEXT DEFAULT 'Associação';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='entidades' AND column_name='responsavel'
    ) THEN
        ALTER TABLE public.entidades ADD COLUMN responsavel TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='entidades' AND column_name='verificada'
    ) THEN
        ALTER TABLE public.entidades ADD COLUMN verificada BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 3. Garantir coluna 'status' na tabela de noticias (para moderação)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='noticias' AND column_name='status'
    ) THEN
        ALTER TABLE public.noticias ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- 4. Garantir coluna 'tipo' na tabela de categorias
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='categorias' AND column_name='tipo'
    ) THEN
        ALTER TABLE public.categorias ADD COLUMN tipo TEXT DEFAULT 'EMPRESA';
    END IF;
END $$;
