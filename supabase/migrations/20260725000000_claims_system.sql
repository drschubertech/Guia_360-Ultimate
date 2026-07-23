-- Migration: Sistema de Reivindicacao (Claims)

-- 1. Adicionar colunas de claim nas tabelas
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT FALSE;

ALTER TABLE public.entidades
  ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT FALSE;

-- 2. Tabela de solicitações de claim
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_table TEXT NOT NULL CHECK (target_table IN ('empresas', 'entidades')),
  target_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ
);

-- 3. Funcao is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.name = 'admin'
  );
$$;

-- 4. Funcao can_manage()
CREATE OR REPLACE FUNCTION public.can_manage(tbl TEXT, eid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_claimed_by UUID;
BEGIN
  IF public.is_admin() THEN
    RETURN TRUE;
  END IF;
  IF tbl = 'empresas' THEN
    SELECT claimed_by INTO v_claimed_by FROM public.empresas WHERE id = eid;
  ELSIF tbl = 'entidades' THEN
    SELECT claimed_by INTO v_claimed_by FROM public.entidades WHERE id = eid;
  ELSE
    RETURN FALSE;
  END IF;
  RETURN v_claimed_by = auth.uid();
END;
$$;

-- 5. Indices
CREATE INDEX IF NOT EXISTS idx_empresas_claimed_by ON public.empresas (claimed_by);
CREATE INDEX IF NOT EXISTS idx_entidades_claimed_by ON public.entidades (claimed_by);
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.claims (user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims (status);
CREATE INDEX IF NOT EXISTS idx_claims_target ON public.claims (target_table, target_id);

-- 6. RLS na tabela claims
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "claims_select" ON public.claims;
CREATE POLICY "claims_select" ON public.claims
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "claims_insert" ON public.claims;
CREATE POLICY "claims_insert" ON public.claims
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "claims_update" ON public.claims;
CREATE POLICY "claims_update" ON public.claims
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. Atualizar RLS em empresas e entidades
-- Manter SELECT público, restringir INSERT/UPDATE/DELETE
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas FORCE ROW LEVEL SECURITY;
ALTER TABLE public.entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entidades FORCE ROW LEVEL SECURITY;

-- Garantir que SELECT público existe
DROP POLICY IF EXISTS "Leitura pública empresas" ON public.empresas;
CREATE POLICY "Leitura pública empresas" ON public.empresas
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Leitura pública entidades" ON public.entidades;
CREATE POLICY "Leitura pública entidades" ON public.entidades
  FOR SELECT
  USING (true);

-- Políticas de modificação apenas para admin ou dono da claim
DROP POLICY IF EXISTS "empresas_manage" ON public.empresas;
DROP POLICY IF EXISTS "empresas_insert" ON public.empresas;
DROP POLICY IF EXISTS "empresas_update" ON public.empresas;
DROP POLICY IF EXISTS "empresas_delete" ON public.empresas;

CREATE POLICY "empresas_insert" ON public.empresas
  FOR INSERT
  WITH CHECK (public.can_manage('empresas', id));

CREATE POLICY "empresas_update" ON public.empresas
  FOR UPDATE
  USING (public.can_manage('empresas', id))
  WITH CHECK (public.can_manage('empresas', id));

CREATE POLICY "empresas_delete" ON public.empresas
  FOR DELETE
  USING (public.can_manage('empresas', id));

DROP POLICY IF EXISTS "entidades_manage" ON public.entidades;
DROP POLICY IF EXISTS "entidades_insert" ON public.entidades;
DROP POLICY IF EXISTS "entidades_update" ON public.entidades;
DROP POLICY IF EXISTS "entidades_delete" ON public.entidades;

CREATE POLICY "entidades_insert" ON public.entidades
  FOR INSERT
  WITH CHECK (public.can_manage('entidades', id));

CREATE POLICY "entidades_update" ON public.entidades
  FOR UPDATE
  USING (public.can_manage('entidades', id))
  WITH CHECK (public.can_manage('entidades', id));

CREATE POLICY "entidades_delete" ON public.entidades
  FOR DELETE
  USING (public.can_manage('entidades', id));
