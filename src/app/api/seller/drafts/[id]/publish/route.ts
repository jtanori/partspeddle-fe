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
    const { data, error } = await supabaseAdmin.rpc('publish_listing_draft', {
      draft_id: id,
    });

    if (error) {
      console.error('API Error (POST /api/seller/drafts/[id]/publish):', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ partId: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('API Exception (POST /api/seller/drafts/[id]/publish):', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
