import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    // 1. Autorización estricta del contexto del usuario de Supabase
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication token required.' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid or expired session token.' }, { status: 401 });
    }

    // 2. Extraer el lote FormData utilizando agregación múltiple (.getAll)
    const formData = await request.formData();
    const imageFiles = formData.getAll('image') as File[];
    const rawMode = formData.get('mode') as string | null;

    // Normalización forzada a minúsculas para coincidir con la lógica del backend
    const mode = rawMode?.toLowerCase() || null;

    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
    }

    if (!mode || (mode !== 'vehicle' && mode !== 'component')) {
      return NextResponse.json({ error: 'Invalid mode specified. Must be "vehicle" or "component".' }, { status: 400 });
    }

    // 3. CORTAFUEGOS DE CUOTAS SERVER-SIDE (Protección contra desborde de 500 RPD)
    const MAX_ALLOWED_IMAGES = mode === 'vehicle' ? 2 : 4;
    if (imageFiles.length > MAX_ALLOWED_IMAGES) {
      return NextResponse.json(
        { error: `SYS_QUOTA_BREACH: El lote en modo [${mode.toUpperCase()}] excede el límite de ${MAX_ALLOWED_IMAGES} imágenes.` },
        { status: 400 }
      );
    }

    // 4. Compilar el FormData de salida hacia la Edge Function
    const backendFormData = new FormData();
    imageFiles.forEach((file) => {
      backendFormData.append('image', file);
    });
    backendFormData.append('mode', mode);

    // 5. Invocación segura RPC interna
    const { data, error } = await supabaseAdmin.functions.invoke('analyze-part-image', {
      body: backendFormData,
    });

    if (error) {
      console.error('Edge Function invocation error:', error);
      return NextResponse.json(
        { error: 'Failed to process image through auto-parts identification service.' },
        { status: 502 }
      );
    }

    // 6. Retornar el esquema unificado e hidratado al cliente del asistente
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
    console.error('API Route /api/gemini/identify crash:', error);
    return NextResponse.json(
      { error: 'Internal server error during image analysis.' },
      { status: 500 }
    );
  }
}
