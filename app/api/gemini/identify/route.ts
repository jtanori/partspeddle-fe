import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a secure, server-only Supabase client using the privileged service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    // 1. Authorize session context via active Bearer token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing credentials.' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized user context.' }, { status: 401 });
    }

    // 2. Extract the multi-part form data from the incoming frontend request
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const mode = formData.get('mode') as string | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Missing image asset payload.' },
        { status: 400 }
      );
    }

    if (!mode || (mode !== 'vehicle' && mode !== 'component')) {
      return NextResponse.json(
        { error: 'Invalid listing scope mode provided.' },
        { status: 400 }
      );
    }

    // 3. Reconstruct the payload to safely forward to the isolated Supabase Edge Function
    const backendFormData = new FormData();
    backendFormData.append('image', imageFile);
    backendFormData.append('mode', mode);

    // 4. Call the Supabase edge function securely from the backend environment
    const { data, error } = await supabaseAdmin.functions.invoke('analyze-part-image', {
      body: backendFormData,
    });

    if (error) {
      console.error('Supabase edge service invocation error:', error);
      return NextResponse.json(
        { error: 'Failed to extract part data from image via database bridge.' },
        { status: 502 }
      );
    }

    // 5. Return the clean, structured metadata back to the client wizard application
    return NextResponse.json({
      system: data?.system || '',
      category: data?.category || '',
      part_type: data?.part_type || '',
      brand: data?.brand || '',
      model: data?.model || '',
      oem_part_number: data?.oem_part_number || '',
      confidence_scores: {
        part_type_accuracy: data?.confidence_scores?.part_type_accuracy ?? 0,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Critical failure in Next.js analyze API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error encountered during secure cataloging.' },
      { status: 500 }
    );
  }
}
