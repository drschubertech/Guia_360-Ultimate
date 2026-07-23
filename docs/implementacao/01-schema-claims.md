# Schema do Sistema de Claims

## 1. Adicionar Colunas nas Tabelas Existentes

### empresas
```sql
ALTER TABLE public.empresas
  ADD COLUMN claimed_by UUID REFERENCES auth.users(id),
  ADD COLUMN claimed_at TIMESTAMPTZ,
  ADD COLUMN is_claimed BOOLEAN DEFAULT FALSE;
```

### entidades
```sql
ALTER TABLE public.entidades
  ADD COLUMN claimed_by UUID REFERENCES auth.users(id),
  ADD COLUMN claimed_at TIMESTAMPTZ,
  ADD COLUMN is_claimed BOOLEAN DEFAULT FALSE;
```

## 2. Nova Tabela: claims

```sql
CREATE TABLE public.claims (
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
```

## 3. Índices

```sql
CREATE INDEX idx_empresas_claimed_by ON public.empresas (claimed_by);
CREATE INDEX idx_entidades_claimed_by ON public.entidades (claimed_by);
CREATE INDEX idx_claims_user_id ON public.claims (user_id);
CREATE INDEX idx_claims_status ON public.claims (status);
CREATE INDEX idx_claims_target ON public.claims (target_table, target_id);
```

## 4. Relacionamentos

```
claims.user_id ───> auth.users(id)
claims.reviewed_by ───> auth.users(id)
empresas.claimed_by ───> auth.users(id)
entidades.claimed_by ───> auth.users(id)
```
