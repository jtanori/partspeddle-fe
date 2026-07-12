import { NextResponse } from 'next/server';
import { createRepositories } from '@/backend/modules/shared/application/repository-factory';
import { safeErrorResponse } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const { catalog } = createRepositories('public');
    const taxonomy = await catalog.getTaxonomy();
    return NextResponse.json(taxonomy);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (/api/taxonomy)', { error: message });
    return safeErrorResponse('Failed to load taxonomy.', 500);
  }
}
