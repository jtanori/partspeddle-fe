import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '4', 10);
    
    const { data, error } = await supabaseAdmin
      .from('parts')
      .select('id, title, description, price_mxn, status, created_at, part_images(url)')
      .eq('status', 'available')
      .limit(limit);
    
    if (error) {
      console.error("API Error (/api/parts/featured):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("API Exception (/api/parts/featured):", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
