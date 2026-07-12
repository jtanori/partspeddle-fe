import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthClient } from '@/lib/supabase-server';
import { validateBody } from '@/lib/api/validation';
import { safeErrorResponse } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

const createConversationSchema = z.object({
  subject: z.string().min(1).max(200).optional(),
  channel: z.enum(['web', 'email', 'chat', 'bot']).default('web'),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createAuthClient(req);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return safeErrorResponse('Unauthorized.', 401);
    }

    const validated = await validateBody(createConversationSchema, req);
    if (!validated.success) {
      return validated.response;
    }

    const { subject, channel } = validated.data;

    const { data, error } = await supabase
      .from('support_conversations')
      .insert({
        created_by: userData.user.id,
        subject: subject ?? 'Support request',
        channel,
        status: 'open',
      })
      .select('*')
      .single();

    if (error || !data) {
      logger.error('API Error (POST /api/support/conversation)', { error: error?.message });
      return safeErrorResponse(error?.message || 'Failed to create conversation.', 500);
    }

    // Seed the creator as a participant for RLS and future multi-party threads.
    const { error: participantError } = await supabase.from('support_participants').insert({
      conversation_id: data.id,
      user_id: userData.user.id,
      role: 'customer',
    });

    if (participantError) {
      logger.error('API Error (POST /api/support/conversation participant)', {
        error: participantError.message,
      });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (POST /api/support/conversation)', { error: message });
    return safeErrorResponse('Internal server error.', 500);
  }
}
