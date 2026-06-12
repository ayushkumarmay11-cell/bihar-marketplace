-- ============================================================
-- BIHAR MARKETPLACE — CHAT DATABASE SCHEMA
-- Run this in the Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- ============================================================
-- 1. CONVERSATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID REFERENCES public.items(id) ON DELETE CASCADE,
  buyer_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, buyer_id)
);

-- Enable RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Allow buyers and sellers to read their own conversations
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Allow buyers to create conversations
CREATE POLICY "Buyers can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);


-- ============================================================
-- 2. MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content          TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow users to read messages in their conversations
CREATE POLICY "Users can read messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
    )
  );

-- Allow users to send messages to their conversations
CREATE POLICY "Users can insert messages to their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
    )
  );


-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON public.conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
