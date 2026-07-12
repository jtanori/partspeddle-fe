import { NextRequest, NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase-server';
import { requireSeller } from '@/lib/seller-auth';
import { safeErrorResponse } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const supabase = createAuthClient(req);
    const { data, error } = await supabase
      .from('listing_drafts')
      .update({ status: 'discarded', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('seller_id', auth.user.id)
      .select('*')
      .single();

    if (error || !data) {
      logger.error('API Error (POST /api/seller/drafts/[id]/discard)', { error: error?.message });
      return safeErrorResponse(error?.message || 'Discard failed.', 500);
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (POST /api/seller/drafts/[id]/discard)', { error: message });
    return safeErrorResponse('Internal server error.', 500);
  }
}
