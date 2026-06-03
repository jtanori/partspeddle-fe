-- 1. Tabla de Conversaciones
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID REFERENCES public.parts(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.users(id),
    seller_id UUID NOT NULL REFERENCES public.users(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_conversations_participants ON public.conversations(buyer_id, seller_id);

-- 2. Tabla de Mensajes
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);

-- 3. Habilitar RLS (Seguridad Privada)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Seguridad (RLS)
-- Los usuarios solo pueden ver conversaciones donde son participantes
CREATE POLICY "Users can view their own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can insert conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Los usuarios solo pueden ver/enviar mensajes de sus propias conversaciones
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = messages.conversation_id 
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = conversation_id 
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );
