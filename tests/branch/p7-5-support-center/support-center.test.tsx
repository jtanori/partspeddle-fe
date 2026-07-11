import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf-8');
}

describe('P7.5 PartsPeddle Support Center', () => {
  describe('database migration', () => {
    const source = readSource('supabase/migrations/20260716000000_support_center.sql');

    it('creates support_conversations table', () => {
      expect(source).toContain('CREATE TABLE IF NOT EXISTS "public"."support_conversations"');
      expect(source).toContain('"status" "text"');
      expect(source).toContain('"created_by" "uuid"');
    });

    it('creates support_messages table', () => {
      expect(source).toContain('CREATE TABLE IF NOT EXISTS "public"."support_messages"');
      expect(source).toContain('"conversation_id" "uuid"');
      expect(source).toContain('"sender_type" "text"');
    });

    it('creates support_participants table', () => {
      expect(source).toContain('CREATE TABLE IF NOT EXISTS "public"."support_participants"');
    });

    it('enables RLS on support tables', () => {
      expect(source).toContain(
        'ALTER TABLE "public"."support_conversations" ENABLE ROW LEVEL SECURITY',
      );
      expect(source).toContain('ALTER TABLE "public"."support_messages" ENABLE ROW LEVEL SECURITY');
      expect(source).toContain(
        'ALTER TABLE "public"."support_participants" ENABLE ROW LEVEL SECURITY',
      );
    });
  });

  describe('API routes', () => {
    it('has POST /api/support/conversation', () => {
      const source = readSource('src/app/api/support/conversation/route.ts');
      expect(source).toContain("from('support_conversations')");
      expect(source).toContain('.insert(');
    });

    it('has POST /api/support/message', () => {
      const source = readSource('src/app/api/support/message/route.ts');
      expect(source).toContain("from('support_messages')");
      expect(source).toContain('.insert(');
    });

    it('has GET /api/support/history', () => {
      const source = readSource('src/app/api/support/history/route.ts');
      expect(source).toContain("from('support_conversations')");
      expect(source).toContain('export async function GET');
    });

    it('has POST /api/support/close', () => {
      const source = readSource('src/app/api/support/close/route.ts');
      expect(source).toContain("from('support_conversations')");
      expect(source).toContain("status: 'closed'");
    });
  });

  describe('UI components', () => {
    it('exports SupportLauncher and SupportMessenger', () => {
      const source = readSource('src/components/support/index.ts');
      expect(source).toContain('SupportLauncher');
      expect(source).toContain('SupportMessenger');
    });

    it('SupportLauncher renders SupportMessenger', () => {
      const source = readSource('src/components/support/SupportLauncher.tsx');
      expect(source).toContain('SupportMessenger');
    });

    it('SupportMessenger integrates realtime support channel', () => {
      const source = readSource('src/components/support/SupportMessenger.tsx');
      expect(source).toContain('subscribeToSupportConversation');
      expect(source).toContain('/api/support/conversation');
      expect(source).toContain('/api/support/message');
    });

    it('has a dedicated support realtime channel', () => {
      const source = readSource('src/lib/realtime/support-channel.ts');
      expect(source).toContain("table: 'support_messages'");
      expect(source).toContain('support-conversation:');
    });
  });

  describe('integration', () => {
    it('PublicShell renders SupportLauncher', () => {
      const source = readSource('src/components/layout/PublicShell.tsx');
      expect(source).toContain('SupportLauncher');
    });
  });
});
