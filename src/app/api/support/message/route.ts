import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthClient } from '@/lib/supabase-server';
import { validateBody } from '@/lib/api/validation';
import { safeErrorResponse } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

const createMessageSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(4000),
  senderType: z.enum(['user', 'agent', 'bot', 'system']).default('user'),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createAuthClient(req);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return safeErrorResponse('Unauthorized.', 401);
    }

    const validated = await validateBody(createMessageSchema, req);
    if (!validated.success) {
      return validated.response;
    }

    const { conversationId, message, senderType } = validated.data;

    // Verify membership via RLS-friendly existence check.
    const { data: conversation, error: conversationError } = await supabase
      .from('support_conversations')
      .select('id, status')
      .eq('id', conversationId)
      .single();

    if (conversationError || !conversation) {
      return safeErrorResponse('Conversation not found.', 404);
    }

    if (conversation.status === 'closed') {
      return safeErrorResponse('Cannot add messages to a closed conversation.', 409);
    }

    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userData.user.id,
        sender_type: senderType,
        message,
      })
      .select('*')
      .single();

    if (error || !data) {
      logger.error('API Error (POST /api/support/message)', { error: error?.message });
      return safeErrorResponse(error?.message || 'Failed to send message.', 500);
    }

    // Touch conversation updated_at so sorting by recent activity stays accurate.
    const { error: touchError } = await supabase
      .from('support_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (touchError) {
      logger.error('API Error (POST /api/support/message touch)', { error: touchError.message });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (POST /api/support/message)', { error: message });
    return safeErrorResponse('Internal server error.', 500);
  }
}
