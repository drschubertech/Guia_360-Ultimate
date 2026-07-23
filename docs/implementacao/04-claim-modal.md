# Componente ClaimModal

Arquivo: `components/ClaimModal/ClaimModal.tsx`

## Funcionalidades

- Modal que abre ao clicar "Reivindicar esta empresa/entidade"
- Exibe nome da empresa/entidade
- Campo opcional de mensagem (ex: "Sou o proprietário desde 2010")
- Valida se o usuário está logado (redireciona para login se não)
- Previne claim duplicada (verifica se já existe claim pendente)
- Feedback de sucesso/erro

## Props

```ts
type ClaimModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetTable: 'empresas' | 'entidades';
  targetId: string;
  targetName: string;
};
```

## Fluxo

```
1. Usuário clica "Reivindicar"
2. Modal abre com nome do negócio
3. Usuário digita mensagem (opcional)
4. Clica "Enviar Solicitação"
5. Valida se já existe claim pendente para este par (user + target)
6. INSERT em claims (status: pending)
7. Modal fecha com toast de sucesso
8. Badge no perfil muda para "Reivindicado · Aguardando aprovação"
```

## Layout

```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐    │
│  │   Reivindicar Empresa           │    │
│  │                                 │    │
│  │   🏢 Padaria do João           │    │
│  │   Você está solicitando ser o   │    │
│  │   administrador deste perfil.   │    │
│  │                                 │    │
│  │   Mensagem (opcional):          │    │
│  │   ┌─────────────────────────┐   │    │
│  │   │ Sou o proprietário...   │   │    │
│  │   └─────────────────────────┘   │    │
│  │                                 │    │
│  │   [Cancelar] [Enviar Solicitação]│   │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Validações

- Usuário deve estar logado (auth.check())
- Não pode haver claim pendente para a mesma empresa + usuário
- Empresa não pode já estar reivindicada (is_claimed = FALSE)
