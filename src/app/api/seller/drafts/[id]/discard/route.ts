import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireSeller } from '@/lib/seller-auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const { data, error } = await supabaseAdmin
      .from('listing_drafts')
      .update({ status: 'discarded', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('seller_id', auth.user.id)
      .select('*')
      .single();

    if (error || !data) {
      console.error('API Error (POST /api/seller/drafts/[id]/discard):', error);
      return NextResponse.json(
        { error: error?.message || 'Discard failed' },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('API Exception (POST /api/seller/drafts/[id]/discard):', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
