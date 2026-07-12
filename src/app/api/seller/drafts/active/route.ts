import { NextRequest, NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase-server';
import { requireSeller } from '@/lib/seller-auth';
import { DEFAULT_DRAFT_PAYLOAD } from '@/domain/types/listing-draft';
import { safeErrorResponse } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  try {
    const supabase = createAuthClient(req);
    const { data: existing, error: fetchError } = await supabase
      .from('listing_drafts')
      .select('*')
      .eq('seller_id', auth.user.id)
      .in('status', ['draft', 'publishing'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      logger.error('API Error (GET /api/seller/drafts/active)', { error: fetchError.message });
      return safeErrorResponse('Failed to load draft.', 500);
    }

    if (existing) {
      return NextResponse.json(existing);
    }

    const { data: created, error: createError } = await supabase
      .from('listing_drafts')
      .insert({
        seller_id: auth.user.id,
        status: 'draft',
        payload: DEFAULT_DRAFT_PAYLOAD,
        completion_score: 0,
      })
      .select('*')
      .single();

    if (createError || !created) {
      logger.error('API Error (POST create draft)', { error: createError?.message });
      return safeErrorResponse(createError?.message || 'Failed to create draft.', 500);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (GET /api/seller/drafts/active)', { error: message });
    return safeErrorResponse('Internal server error.', 500);
  }
}
