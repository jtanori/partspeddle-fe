import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthClient } from '@/lib/supabase-server';
import { validateBody } from '@/lib/api/validation';
import { safeErrorResponse } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

const closeConversationSchema = z.object({
  conversationId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createAuthClient(req);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return safeErrorResponse('Unauthorized.', 401);
    }

    const validated = await validateBody(closeConversationSchema, req);
    if (!validated.success) {
      return validated.response;
    }

    const { conversationId } = validated.data;

    const { data, error } = await supabase
      .from('support_conversations')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', conversationId)
      .eq('created_by', userData.user.id)
      .select('*')
      .single();

    if (error || !data) {
      logger.error('API Error (POST /api/support/close)', { error: error?.message });
      return safeErrorResponse(
        error?.message || 'Failed to close conversation.',
        error?.code === 'PGRST116' ? 404 : 500,
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (POST /api/support/close)', { error: message });
    return safeErrorResponse('Internal server error.', 500);
  }
}
