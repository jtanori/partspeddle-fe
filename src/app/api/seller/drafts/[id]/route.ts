import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireSeller } from '@/lib/seller-auth';
import { scoreCompletion } from '@/lib/listing-completion';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const { data, error } = await supabaseAdmin
      .from('listing_drafts')
      .select('*')
      .eq('id', id)
      .eq('seller_id', auth.user.id)
      .single();

    if (error) {
      console.error('API Error (GET /api/seller/drafts/[id]):', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('API Exception (GET /api/seller/drafts/[id]):', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const body = await req.json();
    const { payload: payloadPatch, marketValueEstimate, suggestedPrice } = body;

    // Fetch current draft to merge payload modules.
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('listing_drafts')
      .select('payload')
      .eq('id', id)
      .eq('seller_id', auth.user.id)
      .single();

    if (fetchError || !current) {
      console.error('API Error (PATCH fetch draft):', fetchError);
      return NextResponse.json(
        { error: fetchError?.message || 'Draft not found' },
        { status: fetchError?.code === 'PGRST116' ? 404 : 500 },
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

    const { data, error } = await supabaseAdmin
      .from('listing_drafts')
      .update(update)
      .eq('id', id)
      .eq('seller_id', auth.user.id)
      .select('*')
      .single();

    if (error || !data) {
      console.error('API Error (PATCH /api/seller/drafts/[id]):', error);
      return NextResponse.json(
        { error: error?.message || 'Update failed' },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('API Exception (PATCH /api/seller/drafts/[id]):', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
