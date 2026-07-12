import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRepositories } from '@/backend/modules/shared/application/repository-factory';
import { validateQuery } from '@/lib/api/validation';
import { safeErrorResponse } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rate-limit';
import { logger } from '@/lib/logger';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(4),
});

export async function GET(req: NextRequest) {
  const rateLimited = rateLimit(req, {
    keyPrefix: 'public:sellers:top',
    limit: 30,
    windowSeconds: 60,
  });
  if (rateLimited) {
    return rateLimited;
  }

  const validated = validateQuery(querySchema, req.nextUrl.searchParams);
  if (!validated.success) {
    return validated.response;
  }

  try {
    const { seller } = createRepositories('public');
    const data = await seller.findTopSellers(validated.data.limit ?? 4);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (/api/sellers/top)', { error: message });
    return safeErrorResponse('Failed to load sellers.', 500);
  }
}
