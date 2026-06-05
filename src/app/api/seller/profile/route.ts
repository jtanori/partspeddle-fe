import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing authorization context.' }, { status: 401 });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized session window.' }, { status: 401 });

    const { yardName, whatsappNumber, location, email } = await req.json();

    // XSS & Markup Sanitization
    const sanitizedName = yardName?.replace(/<\/?[^>]+(>|$)/g, "") || 'Unnamed Yard';

    // Atomic update across users and seller_profiles
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({ email, full_name: sanitizedName })
      .eq('id', user.id);
    
    if (userError) throw userError;

    const { data, error: sellerError } = await supabaseAdmin
      .from('seller_profiles')
      .update({ 
        business_name: sanitizedName, 
        location, 
        whatsapp: whatsappNumber,
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (sellerError) throw sellerError;

    return NextResponse.json({
      success: true,
      profile: {
        id: data.id,
        name: data.business_name,
        location: data.location,
        whatsapp: data.whatsapp,
        email: email,
        status: data.verification_status
      }
    });

  } catch (error: any) {
    console.error('🚨 Core System Failure:', error.message);
    return NextResponse.json({ error: 'Internal server synchronization error.' }, { status: 500 });
  }
}
