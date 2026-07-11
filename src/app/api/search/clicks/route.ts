import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAnonServerClient } from '@/lib/supabase-server';
import { validateBody } from '@/lib/api/validation';
import { safeErrorResponse } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rate-limit';
import { logger } from '@/lib/logger';

const searchClickSchema = z.object({
  searchEventId: z.string().uuid(),
  partId: z.string().uuid(),
  position: z.number().int().min(0),
});

export async function POST(req: NextRequest) {
  const rateLimited = rateLimit(req, { keyPrefix: 'search:clicks', limit: 30, windowSeconds: 60 });
  if (rateLimited) {
    return rateLimited;
  }

  const validated = await validateBody(searchClickSchema, req);
  if (!validated.success) {
    return validated.response;
  }

  const { searchEventId, partId, position } = validated.data;

  try {
    const supabase = createAnonServerClient();
    const { error } = await supabase.from('search_click_events').insert({
      search_event_id: searchEventId,
      part_id: partId,
      position,
    });

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to log search click', { error: message });
    return safeErrorResponse('Failed to log search click', 500);
  }
}
