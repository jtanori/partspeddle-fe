import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthClient } from '@/lib/supabase-server';
import { requireSeller } from '@/lib/seller-auth';
import { validateQuery } from '@/lib/api/validation';
import { safeErrorResponse } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rate-limit';
import { logger } from '@/lib/logger';

const querySchema = z.object({
  filter: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  const rateLimited = rateLimit(req, {
    keyPrefix: 'seller:inventory',
    limit: 60,
    windowSeconds: 60,
    userId: auth.user.id,
  });
  if (rateLimited) {
    return rateLimited;
  }

  const validated = validateQuery(querySchema, req.nextUrl.searchParams);
  if (!validated.success) {
    return validated.response;
  }

  try {
    const supabase = createAuthClient(req);
    let query = supabase
      .from('parts')
      .select('id, title, price_mxn, stock_number, images, status, views, offers(count)')
      .eq('seller_id', auth.user.id);

    if (validated.data.filter) {
      query = query.eq('status', validated.data.filter);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('API Error (GET /api/seller/inventory)', { error: error.message });
      return safeErrorResponse('Failed to load inventory.', 500);
    }

    return NextResponse.json(data || []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (GET /api/seller/inventory)', { error: message });
    return safeErrorResponse('Internal server error.', 500);
  }
}
