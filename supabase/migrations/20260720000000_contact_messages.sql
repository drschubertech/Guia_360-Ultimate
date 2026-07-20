-- Tabela de Fale Conosco (Contact Messages)
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Políticas
-- Qualquer pessoa pode inserir uma mensagem de contato (pública)
CREATE POLICY "Leitura e Inserção pública para mensagens" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- Apenas admins podem ler e atualizar as mensagens
CREATE POLICY "Admins controlam contact_messages" ON public.contact_messages FOR ALL USING (public.is_admin());
