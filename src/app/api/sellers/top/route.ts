import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '4', 10);
    
    const { data, error } = await supabaseAdmin
      .from('seller_profiles')
      .select('id, business_name, location, whatsapp, verification_status, created_at, users(avatar_url)')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("API Error (/api/sellers/top):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("API Exception (/api/sellers/top):", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
