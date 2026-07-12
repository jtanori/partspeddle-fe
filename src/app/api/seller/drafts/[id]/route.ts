import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthClient } from '@/lib/supabase-server';
import { requireSeller } from '@/lib/seller-auth';
import { scoreCompletion } from '@/lib/listing-completion';
import { validateBody } from '@/lib/api/validation';
import { safeErrorResponse } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const patchDraftSchema = z.object({
  payload: z.record(z.unknown()).optional(),
  marketValueEstimate: z.number().optional(),
  suggestedPrice: z.number().optional(),
});

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const supabase = createAuthClient(req);
    const { data, error } = await supabase
      .from('listing_drafts')
      .select('*')
      .eq('id', id)
      .eq('seller_id', auth.user.id)
      .single();

    if (error) {
      logger.error('API Error (GET /api/seller/drafts/[id])', { error: error.message });
      return safeErrorResponse('Failed to load draft.', error.code === 'PGRST116' ? 404 : 500);
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (GET /api/seller/drafts/[id])', { error: message });
    return safeErrorResponse('Internal server error.', 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  const validated = await validateBody(patchDraftSchema, req);
  if (!validated.success) {
    return validated.response;
  }

  const { payload: payloadPatch, marketValueEstimate, suggestedPrice } = validated.data;
  const { id } = await params;

  try {
    const supabase = createAuthClient(req);

    // Fetch current draft to merge payload modules.
    const { data: current, error: fetchError } = await supabase
      .from('listing_drafts')
      .select('payload')
      .eq('id', id)
      .eq('seller_id', auth.user.id)
      .single();

    if (fetchError || !current) {
      logger.error('API Error (PATCH fetch draft)', { error: fetchError?.message });
      return safeErrorResponse(
        fetchError?.message || 'Draft not found.',
        fetchError?.code === 'PGRST116' ? 404 : 500,
      );
    }

    const nextPayload = {
      ...current.payload,
      ...(payloadPatch || {}),
    };

    const completion = scoreCompletion(nextPayload);

    const update: Record<string, unknown> = {
      payload: nextPayload,
      completion_score: completion.total,
      updated_at: new Date().toISOString(),
    };

    if (marketValueEstimate !== undefined) {
      update.market_value_estimate = marketValueEstimate;
    }
    if (suggestedPrice !== undefined) {
      update.suggested_price = suggestedPrice;
    }

    const { data, error } = await supabase
      .from('listing_drafts')
      .update(update)
      .eq('id', id)
      .eq('seller_id', auth.user.id)
      .select('*')
      .single();

    if (error || !data) {
      logger.error('API Error (PATCH /api/seller/drafts/[id])', { error: error?.message });
      return safeErrorResponse(error?.message || 'Update failed.', 500);
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (PATCH /api/seller/drafts/[id])', { error: message });
    return safeErrorResponse('Internal server error.', 500);
  }
}
