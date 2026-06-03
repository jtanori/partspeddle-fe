import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB Boundary limit

export async function POST(request: Request) {
  try {
    // 1. Authorize session context via active Bearer token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication token required.' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid or expired session token.' }, { status: 401 });
    }

    // 2. Parse Multipart form data arrays
    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file) {
      return NextResponse.json({ error: 'No logo file provided.' }, { status: 400 });
    }

    // 3. Structural Payload Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file format. Please upload a JPEG, PNG, or WEBP image.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds the 5MB limit.' }, { status: 400 });
    }

    // 4. Transform file to an ArrayBuffer for transmission
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Format secure, non-enumerable deterministic filename: {userId}/logo-{timestamp}.{ext}
    const extension = file.type.split('/')[1];
    const filePath = `${user.id}/logo-${Date.now()}.${extension}`;

    // 5. Stream payload directly into the Supabase Storage Bucket
    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from('yard-assets')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (storageError) throw storageError;

    // 6. Generate the predictable public URL path structure
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/yard-assets/${filePath}`;

    // 7. Atomic transaction: update profile metadata tracking field
    const { error: dbError } = await supabaseAdmin
      .from('seller_profiles')
      .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, logoUrl: publicUrl });

  } catch (error: any) {
    console.error('Database/Storage Logo Upload Error:', error.message);
    return NextResponse.json({ error: 'Failed to upload logo and update profile.' }, { status: 500 });
  }
}
