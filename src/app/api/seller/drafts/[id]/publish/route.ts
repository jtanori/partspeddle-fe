import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireSeller } from '@/lib/seller-auth';
import { safeErrorResponse } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rate-limit';
import {
  getIdempotencyKey,
  getIdempotencyResponse,
  setIdempotencyResponse,
} from '@/lib/api/idempotency';
import { logger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  const rateLimited = rateLimit(req, {
    keyPrefix: 'seller:draft:publish',
    limit: 60,
    windowSeconds: 60,
    userId: auth.user.id,
  });
  if (rateLimited) {
    return rateLimited;
  }

  const idempotencyKey = getIdempotencyKey(req);
  if (idempotencyKey) {
    const cached = getIdempotencyResponse(idempotencyKey);
    if (cached) {
      return cached;
    }
  }

  const { id } = await params;

  try {
    const { data, error } = await supabaseAdmin.rpc('publish_listing_draft', {
      draft_id: id,
    });

    if (error) {
      logger.error('API Error (POST /api/seller/drafts/[id]/publish)', { error: error.message });
      return safeErrorResponse('Failed to publish draft.', 500);
    }

    const response = NextResponse.json({ partId: data });
    if (idempotencyKey) {
      setIdempotencyResponse(idempotencyKey, response, { partId: data });
    }
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (POST /api/seller/drafts/[id]/publish)', { error: message });
    return safeErrorResponse('Internal server error.', 500);
  }
}
