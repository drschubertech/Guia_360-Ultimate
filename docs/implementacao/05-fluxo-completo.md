# Fluxo Completo do Sistema de Claims

## Diagrama de Permissões

```
                    ┌─────────────────────────┐
                    │   ADMIN DO SISTEMA       │
                    │   (role: admin)          │
                    │   EDITAR/EXCLUIR TUDO    │
                    └──────────┬──────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │   Empresas    │    │  Entidades   │    │   Notícias   │
   │   (todas)     │    │  (todas)     │    │   (todas)    │
   └──────────────┘    └──────────────┘    └──────────────┘
          │                    │
          │  claimed_by = NULL │  claimed_by = NULL
          │  (não reivindicada)│  (não reivindicada)
          │  ↓                 │  ↓
          │  Só ADMIN edita    │  Só ADMIN edita
          │                    │
          │  claimed_by = X    │  claimed_by = X
          │  (reivindicada)    │  (reivindicada)
          │  ↓                 │  ↓
          │  ADMIN + X editam  │  ADMIN + X editam
          └────────────────────┘
```

## Fluxo Passo a Passo

### 1. Criação da Empresa/Entidade

```
Admin cria empresa via painel admin
  → INSERT em empresas com user_id = admin (opcional)
  → claimed_by = NULL, is_claimed = FALSE
  → Empresa visível para todos (SELECT público)
  → Apenas ADMIN pode editar
```

### 2. Usuário Encontra a Empresa

```
Usuário navega até o perfil da empresa
  → Vê informações públicas
  → Vê botão "Reivindicar esta empresa"
  → Clica no botão
```

### 3. Solicitação de Claim

```
ClaimModal abre
  → Usuário digita mensagem (ex: "Sou o proprietário")
  → Valida: já existe claim pendente? Já está reivindicada?
  → INSERT em claims (status: pending)
  → Feedback: "Solicitação enviada com sucesso!"
  → Botão muda para "Reivindicação pendente" (disabled)
```

### 4. Admin Analisa a Solicitação

```
Admin acessa /admin/claims
  → Vê lista de claims pendentes
  → Analisa dados do solicitante
  → Clica "Aprovar" ou "Rejeitar"
```

### 5a. Claim Aprovada

```
Admin clica "Aprovar"
  → Server Action (service_role):
    1. UPDATE empresas SET claimed_by = user_id, is_claimed = TRUE
    2. UPDATE claims SET status = 'approved', reviewed_by = admin_id
  → Usuário agora pode editar o perfil
  → Badge "Verificada" aparece no perfil
  → Admin ainda pode editar também
```

### 5b. Claim Rejeitada

```
Admin clica "Rejeitar"
  → UPDATE claims SET status = 'rejected', reviewed_by = admin_id
  → Usuário vê status "Rejeitada"
  → Botão "Reivindicar" reaparece (pode tentar novamente)
```

## Resumo de Quem Pode Fazer o Quê

| Ação | Anônimo | User logado | Dono da Claim | Admin |
|------|---------|-------------|---------------|-------|
| Ver perfil empresa | ✅ | ✅ | ✅ | ✅ |
| Ver perfil entidade | ✅ | ✅ | ✅ | ✅ |
| Reivindicar empresa | ❌ (login) | ✅ | — | — |
| Editar empresa (não reivindicada) | ❌ | ❌ | ❌ | ✅ |
| Editar empresa (reivindicada) | ❌ | ❌ | ✅ | ✅ |
| Excluir empresa | ❌ | ❌ | ❌ | ✅ |
| Gerenciar claims | ❌ | ❌ | ❌ | ✅ |
| Gerenciar admin geral | ❌ | ❌ | ❌ | ✅ |

## Arquivos Envolvidos

### Novos
- `supabase/migrations/20260725000000_claims_system.sql`
- `components/ClaimModal/ClaimModal.tsx`
- `components/ClaimModal/ClaimModal.module.css`
- `app/admin/claims/page.tsx`
- `app/actions/admin.ts` (adicionar `approveClaim`, `rejectClaim`)

### Modificados
- `app/empresa/[slug]/page.tsx` — botão reivindicar com modal
- `app/entidade/[slug]/page.tsx` — botão reivindicar com modal
- `app/empresa/[slug]/editar/page.tsx` — verificar claimed_by
- `app/entidade/[slug]/editar/page.tsx` — verificar claimed_by
- `app/admin/page.tsx` — card de claims pendentes
- `components/AdminGuard.tsx` — usar rpc is_admin
- `components/Header.tsx` — usar rpc is_admin
