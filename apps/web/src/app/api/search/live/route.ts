import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildLiveSearchViewModel } from '@/backend/modules/scgs/application/build-live-search-view-model';
import { liveSearchViewModelSchema } from '@/backend/modules/scgs/contract/live-search-view-model.contract';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/api/rate-limit';

const liveSearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  hitsPerPage: z.coerce.number().int().min(1).max(20).optional().default(10),
});

export async function GET(req: NextRequest) {
  const rateLimited = rateLimit(req, {
    keyPrefix: 'search:live',
    limit: 60,
    windowSeconds: 60,
  });
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const { searchParams } = new URL(req.url);
    const parsed = liveSearchQuerySchema.safeParse({
      q: searchParams.get('q') ?? '',
      hitsPerPage: searchParams.get('hitsPerPage') ?? '10',
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }

    const viewModel = await buildLiveSearchViewModel({
      query: parsed.data.q,
      hitsPerPage: parsed.data.hitsPerPage,
    });

    const validated = liveSearchViewModelSchema.safeParse(viewModel);
    if (!validated.success) {
      logger.error('Live search view model validation failed', { issues: validated.error.issues });
      return NextResponse.json({ error: 'Internal validation error' }, { status: 500 });
    }

    return NextResponse.json(validated.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Live search API failure', { error: message });
    return NextResponse.json(
      {
        error: 'Search currently unavailable',
        intent: { type: 'PART_NAME', raw: '', entities: {} },
        groups: [],
        meta: { query: '' },
      },
      { status: 500 },
    );
  }
}
