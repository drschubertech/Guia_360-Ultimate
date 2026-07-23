# RLS Policies e Funções de Segurança

## 1. Função is_admin()

```sql
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
```

## 2. Função can_manage()

Verifica se o usuário pode gerenciar (editar/excluir) uma empresa ou entidade.

```sql
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
  -- Admin pode gerenciar tudo
  IF public.is_admin() THEN
    RETURN TRUE;
  END IF;

  -- Verifica se o usuário é o dono da claim
  IF tbl = 'empresas' THEN
    SELECT claimed_by INTO v_claimed_by
    FROM public.empresas
    WHERE id = eid;
  ELSIF tbl = 'entidades' THEN
    SELECT claimed_by INTO v_claimed_by
    FROM public.entidades
    WHERE id = eid;
  ELSE
    RETURN FALSE;
  END IF;

  RETURN v_claimed_by = auth.uid();
END;
$$;
```

## 3. RLS Policies

### empresas
```sql
-- SELECT público (todos podem ver)
DROP POLICY IF EXISTS "Leitura pública empresas" ON public.empresas;
CREATE POLICY "Leitura pública empresas" ON public.empresas
  FOR SELECT
  USING (true);

-- INSERT: apenas admin (can_manage)
CREATE POLICY "empresas_insert" ON public.empresas
  FOR INSERT
  WITH CHECK (public.can_manage('empresas', id));

-- UPDATE: admin ou dono da claim
CREATE POLICY "empresas_update" ON public.empresas
  FOR UPDATE
  USING (public.can_manage('empresas', id))
  WITH CHECK (public.can_manage('empresas', id));

-- DELETE: apenas admin (can_manage)
CREATE POLICY "empresas_delete" ON public.empresas
  FOR DELETE
  USING (public.can_manage('empresas', id));
```

### entidades
```sql
-- SELECT público
DROP POLICY IF EXISTS "Leitura pública entidades" ON public.entidades;
CREATE POLICY "Leitura pública entidades" ON public.entidades
  FOR SELECT
  USING (true);

-- INSERT: apenas admin
CREATE POLICY "entidades_insert" ON public.entidades
  FOR INSERT
  WITH CHECK (public.can_manage('entidades', id));

-- UPDATE: admin ou dono da claim
CREATE POLICY "entidades_update" ON public.entidades
  FOR UPDATE
  USING (public.can_manage('entidades', id))
  WITH CHECK (public.can_manage('entidades', id));

-- DELETE: apenas admin
CREATE POLICY "entidades_delete" ON public.entidades
  FOR DELETE
  USING (public.can_manage('entidades', id));
```

### claims
```sql
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "claims_select" ON public.claims
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "claims_insert" ON public.claims
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "claims_update" ON public.claims
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

## 4. Forçar RLS (recomendado)

```sql
ALTER TABLE public.empresas FORCE ROW LEVEL SECURITY;
ALTER TABLE public.entidades FORCE ROW LEVEL SECURITY;
ALTER TABLE public.claims FORCE ROW LEVEL SECURITY;
```
