# Página Admin de Claims

Arquivo: `app/admin/claims/page.tsx`

## Funcionalidades

- Lista todas as solicitações de reivindicação com status:
  - **Pendentes** — aguardando aprovação (destacadas)
  - **Aprovadas** — já aprovadas
  - **Rejeitadas** — recusadas
- Admin pode **aprovar** ou **rejeitar** cada claim pendente
- Ao aprovar: `UPDATE empresas SET claimed_by = user_id, is_claimed = TRUE`
- Ao rejeitar: `UPDATE claims SET status = 'rejected'`

## Layout

```
┌─────────────────────────────────────────────────┐
│  Gerenciar Reivindicações                       │
│  3 pendentes · 5 aprovadas · 2 rejeitadas       │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ 🏢 Padaria do João          PENDENTE    │    │
│  │ Solicitante: joao@email.com            │    │
│  │ Mensagem: "Sou o proprietário..."      │    │
│  │ [✓ Aprovar] [✗ Rejeitar]              │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ 🏢 Clínica Sorriso           APROVADA   │    │
│  │ Solicitante: maria@email.com            │    │
│  │ Aprovado em: 25/07/2026                 │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Estados

| Estado | Cor | Ação |
|--------|-----|------|
| `pending` | Amarelo (#FEF3C7) | Exibe botões Aprovar/Rejeitar |
| `approved` | Verde (#DCFCE7) | Apenas exibição |
| `rejected` | Vermelho (#FEE2E2) | Apenas exibição |

## Server Action

A ação de aprovação deve ser feita via Server Action para usar a `service_role`:

```ts
export async function approveClaim(claimId: string) {
  const supabase = getServiceRoleClient();

  // Buscar dados da claim
  const { data: claim } = await supabase
    .from('claims')
    .select('*')
    .eq('id', claimId)
    .single();

  // Atualizar a tabela alvo
  await supabase
    .from(claim.target_table)
    .update({
      claimed_by: claim.user_id,
      claimed_at: new Date().toISOString(),
      is_claimed: true
    })
    .eq('id', claim.target_id);

  // Marcar claim como aprovada
  await supabase
    .from('claims')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', claimId);
}
```
