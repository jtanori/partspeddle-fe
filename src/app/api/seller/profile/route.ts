import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireSeller } from '@/lib/seller-auth';
import { validateBody, checkPayloadSize } from '@/lib/api/validation';
import { safeErrorResponse } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rate-limit';
import { logger } from '@/lib/logger';

const sellerProfileSchema = z.object({
  yardName: z.string().min(1).max(200),
  whatsappNumber: z.string().max(50).optional(),
  location: z.string().max(500).optional(),
  email: z.string().email().max(320),
});

export async function GET(req: NextRequest) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  try {
    const { data, error } = await supabaseAdmin
      .from('seller_profiles')
      .select('*')
      .eq('user_id', auth.user.id)
      .single();

    if (error) {
      logger.error('API Error (GET /api/seller/profile)', { error: error.message });
      return safeErrorResponse('Failed to load profile.', 500);
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('API Exception (GET /api/seller/profile)', { error: message });
    return safeErrorResponse('Internal server error.', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  const rateLimited = rateLimit(req, {
    keyPrefix: 'seller:profile',
    limit: 60,
    windowSeconds: 60,
    userId: auth.user.id,
  });
  if (rateLimited) {
    return rateLimited;
  }

  const tooLarge = checkPayloadSize(req, 1024 * 1024); // 1 MB
  if (tooLarge) {
    return tooLarge;
  }

  const validated = await validateBody(sellerProfileSchema, req);
  if (!validated.success) {
    return validated.response;
  }

  const { yardName, whatsappNumber, location, email } = validated.data;

  try {
    const sanitizedName = yardName.replace(/<\/?[^>]+(>|$)/g, '') || 'Unnamed Yard';

    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({ email, full_name: sanitizedName })
      .eq('id', auth.user.id);

    if (userError) throw userError;

    const { data, error: sellerError } = await supabaseAdmin
      .from('seller_profiles')
      .update({
        business_name: sanitizedName,
        location,
        whatsapp: whatsappNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', auth.user.id)
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
        email,
        status: data.verification_status,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    logger.error('API Exception (POST /api/seller/profile)', { error: message });
    return safeErrorResponse('Internal server synchronization error.', 500);
  }
}
