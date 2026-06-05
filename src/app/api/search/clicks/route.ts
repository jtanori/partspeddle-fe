import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { searchEventId, partId, position } = await req.json();
    
    const { error } = await supabaseAdmin
      .from('search_click_events')
      .insert({
        search_event_id: searchEventId,
        part_id: partId,
        position
      });

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    logger.error('Failed to log search click', { error });
    return NextResponse.json({ error: 'Failed to log search click' }, { status: 500 });
  }
}
