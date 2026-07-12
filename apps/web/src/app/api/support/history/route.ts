import { NextRequest, NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase-server';
import { safeErrorResponse } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const supabase = createAuthClient(req);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return safeErrorResponse('Unauthorized.', 401);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    let query = supabase
      .from('support_conversations')
      .select('*, support_messages(count)')
      .eq('created_by', userData.user.id)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('API Error (GET /api/support/history)', { error: error.message });
      return safeErrorResponse('Failed to load conversation history.', 500);
    }

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (GET /api/support/history)', { error: message });
    return safeErrorResponse('Internal server error.', 500);
  }
}
