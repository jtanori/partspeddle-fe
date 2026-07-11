-- =============================================================================
-- P7.5 — PartsPeddle Support Center (PSC) Phase 12a MVP
-- =============================================================================
-- Canonical support conversation domain. Users, agents, bots, and system
-- messages all write into the same model so future channels share one history.
-- =============================================================================

-- Conversations
CREATE TABLE IF NOT EXISTS "public"."support_conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "subject" "text",
    "channel" "text" DEFAULT 'web'::"text" NOT NULL,
    "assigned_to" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "closed_at" timestamp with time zone,
    CONSTRAINT "support_conversations_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'waiting_customer'::"text", 'waiting_agent'::"text", 'closed'::"text"]))),
    CONSTRAINT "support_conversations_channel_check" CHECK (("channel" = ANY (ARRAY['web'::"text", 'email'::"text", 'chat'::"text", 'bot'::"text"])))
);

ALTER TABLE "public"."support_conversations" OWNER TO "postgres";

ALTER TABLE ONLY "public"."support_conversations"
    ADD CONSTRAINT "support_conversations_pkey" PRIMARY KEY ("id");

CREATE INDEX IF NOT EXISTS "idx_support_conversations_created_by" ON "public"."support_conversations" USING "btree" ("created_by", "updated_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_support_conversations_status" ON "public"."support_conversations" USING "btree" ("status", "updated_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_support_conversations_assigned" ON "public"."support_conversations" USING "btree" ("assigned_to", "status");

-- Messages
CREATE TABLE IF NOT EXISTS "public"."support_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_type" "text" DEFAULT 'user'::"text" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "attachments" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "support_messages_sender_type_check" CHECK (("sender_type" = ANY (ARRAY['user'::"text", 'agent'::"text", 'bot'::"text", 'system'::"text"])))
);

ALTER TABLE "public"."support_messages" OWNER TO "postgres";

ALTER TABLE ONLY "public"."support_messages"
    ADD CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."support_messages"
    ADD CONSTRAINT "support_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."support_conversations"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "idx_support_messages_conversation" ON "public"."support_messages" USING "btree" ("conversation_id", "created_at" DESC);

-- Participants (for future multi-party threads and agent reassignment)
CREATE TABLE IF NOT EXISTS "public"."support_participants" (
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'customer'::"text" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "support_participants_role_check" CHECK (("role" = ANY (ARRAY['customer'::"text", 'agent'::"text", 'bot'::"text", 'observer'::"text"])))
);

ALTER TABLE "public"."support_participants" OWNER TO "postgres";

ALTER TABLE ONLY "public"."support_participants"
    ADD CONSTRAINT "support_participants_pkey" PRIMARY KEY ("conversation_id", "user_id");

ALTER TABLE ONLY "public"."support_participants"
    ADD CONSTRAINT "support_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."support_conversations"("id") ON DELETE CASCADE;

-- Updated-at triggers
CREATE OR REPLACE FUNCTION public.set_support_conversations_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS "set_support_conversations_updated_at" ON "public"."support_conversations";
CREATE TRIGGER "set_support_conversations_updated_at"
    BEFORE UPDATE ON "public"."support_conversations"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."set_support_conversations_updated_at"();

CREATE OR REPLACE FUNCTION public.set_support_messages_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS "set_support_messages_updated_at" ON "public"."support_messages";
CREATE TRIGGER "set_support_messages_updated_at"
    BEFORE UPDATE ON "public"."support_messages"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."set_support_messages_updated_at"();

-- RLS
ALTER TABLE "public"."support_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."support_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."support_participants" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_conversations_select_owner" ON "public"."support_conversations";
CREATE POLICY "support_conversations_select_owner" ON "public"."support_conversations"
    FOR SELECT USING (("auth"."uid"() = "created_by") OR EXISTS (
        SELECT 1 FROM support_participants
        WHERE support_participants.conversation_id = support_conversations.id
          AND support_participants.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "support_conversations_insert_owner" ON "public"."support_conversations";
CREATE POLICY "support_conversations_insert_owner" ON "public"."support_conversations"
    FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));

DROP POLICY IF EXISTS "support_conversations_update_owner" ON "public"."support_conversations";
CREATE POLICY "support_conversations_update_owner" ON "public"."support_conversations"
    FOR UPDATE USING (("auth"."uid"() = "created_by")) WITH CHECK (("auth"."uid"() = "created_by"));

DROP POLICY IF EXISTS "support_messages_select_participant" ON "public"."support_messages";
CREATE POLICY "support_messages_select_participant" ON "public"."support_messages"
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM support_conversations
        WHERE support_conversations.id = support_messages.conversation_id
          AND (support_conversations.created_by = auth.uid()
               OR EXISTS (
                   SELECT 1 FROM support_participants
                   WHERE support_participants.conversation_id = support_conversations.id
                     AND support_participants.user_id = auth.uid()
               ))
    ));

DROP POLICY IF EXISTS "support_messages_insert_participant" ON "public"."support_messages";
CREATE POLICY "support_messages_insert_participant" ON "public"."support_messages"
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM support_conversations
        WHERE support_conversations.id = support_messages.conversation_id
          AND (support_conversations.created_by = auth.uid()
               OR EXISTS (
                   SELECT 1 FROM support_participants
                   WHERE support_participants.conversation_id = support_conversations.id
                     AND support_participants.user_id = auth.uid()
               ))
    ));

DROP POLICY IF EXISTS "support_participants_select_member" ON "public"."support_participants";
CREATE POLICY "support_participants_select_member" ON "public"."support_participants"
    FOR SELECT USING (("user_id" = "auth"."uid"()) OR EXISTS (
        SELECT 1 FROM support_conversations
        WHERE support_conversations.id = support_participants.conversation_id
          AND support_conversations.created_by = auth.uid()
    ));
