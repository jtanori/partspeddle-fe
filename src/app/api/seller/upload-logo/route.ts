import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireSeller } from '@/lib/seller-auth';
import { safeErrorResponse } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rate-limit';
import { logger } from '@/lib/logger';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  const rateLimited = rateLimit(req, {
    keyPrefix: 'seller:logo:upload',
    limit: 30,
    windowSeconds: 60,
    userId: auth.user.id,
  });
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return safeErrorResponse('Missing file upload.', 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type || '')) {
      return safeErrorResponse(
        `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}.`,
        400,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return safeErrorResponse('File exceeds 5 MB limit.', 413);
    }

    const extension =
      file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const fileName = `logos/${auth.user.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('yard-assets')
      .upload(fileName, file, { contentType: file.type || 'image/jpeg' });

    if (uploadError) {
      logger.error('API Error (POST /api/seller/upload-logo)', { error: uploadError.message });
      return safeErrorResponse('Failed to upload logo.', 500);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('yard-assets')
      .getPublicUrl(fileName);

    return NextResponse.json({
      fileName,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (POST /api/seller/upload-logo)', { error: message });
    return safeErrorResponse('Internal server error.', 500);
  }
}
