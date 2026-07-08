import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireSeller } from '@/lib/seller-auth';
import { DEFAULT_DRAFT_PAYLOAD } from '@/domain/types/listing-draft';

export async function GET(req: NextRequest) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  try {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('listing_drafts')
      .select('*')
      .eq('seller_id', auth.user.id)
      .in('status', ['draft', 'publishing'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('API Error (GET /api/seller/drafts/active):', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json(existing);
    }

    const { data: created, error: createError } = await supabaseAdmin
      .from('listing_drafts')
      .insert({
        seller_id: auth.user.id,
        status: 'draft',
        payload: DEFAULT_DRAFT_PAYLOAD,
        completion_score: 0,
      })
      .select('*')
      .single();

    if (createError || !created) {
      console.error('API Error (POST create draft):', createError);
      return NextResponse.json(
        { error: createError?.message || 'Failed to create draft' },
        { status: 500 },
      );
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('API Exception (GET /api/seller/drafts/active):', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
