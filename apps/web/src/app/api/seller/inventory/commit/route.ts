import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireSeller } from '@/lib/seller-auth';
import { validateBody, checkPayloadSize } from '@/lib/api/validation';
import { safeErrorResponse } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rate-limit';
import {
  getIdempotencyKey,
  getIdempotencyResponse,
  setIdempotencyResponse,
} from '@/lib/api/idempotency';
import { logger } from '@/lib/logger';

const commitInventorySchema = z.object({
  listing: z.record(z.unknown()),
  assets: z.array(z.record(z.unknown())).optional().default([]),
  fitment: z.record(z.unknown()).optional().default({}),
});

export async function POST(req: NextRequest) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  const rateLimited = rateLimit(req, {
    keyPrefix: 'seller:inventory:commit',
    limit: 60,
    windowSeconds: 60,
    userId: auth.user.id,
  });
  if (rateLimited) {
    return rateLimited;
  }

  const tooLarge = checkPayloadSize(req, 2 * 1024 * 1024); // 2 MB
  if (tooLarge) {
    return tooLarge;
  }

  const idempotencyKey = getIdempotencyKey(req);
  if (idempotencyKey) {
    const cached = getIdempotencyResponse(idempotencyKey);
    if (cached) {
      return cached;
    }
  }

  const validated = await validateBody(commitInventorySchema, req);
  if (!validated.success) {
    return validated.response;
  }

  const { listing, assets, fitment } = validated.data;

  try {
    const { error } = await supabaseAdmin.rpc('commit_inventory_package', {
      listing: {
        ...listing,
        seller_id: auth.user.id,
      },
      assets,
      fitment,
    });

    if (error) {
      logger.error('API Error (POST /api/seller/inventory/commit)', { error: error.message });
      return safeErrorResponse('Failed to commit inventory package.', 500);
    }

    const response = NextResponse.json({ success: true });
    if (idempotencyKey) {
      setIdempotencyResponse(idempotencyKey, response, { success: true });
    }
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (POST /api/seller/inventory/commit)', { error: message });
    return safeErrorResponse('Internal server error.', 500);
  }
}
