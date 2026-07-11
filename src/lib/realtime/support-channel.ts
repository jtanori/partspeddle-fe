import { supabase } from '@/lib/supabase';
import type {
  RealtimeChannel,
  RealtimePostgresInsertPayload,
  REALTIME_SUBSCRIBE_STATES,
} from '@supabase/supabase-js';

export function subscribeToSupportConversation(
  conversationId: string,
  onMessageReceived: (message: Record<string, unknown>) => void,
): RealtimeChannel {
  return supabase
    .channel(`support-conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: RealtimePostgresInsertPayload<Record<string, unknown>>) => {
        onMessageReceived(payload.new);
      },
    )
    .subscribe((status: `${REALTIME_SUBSCRIBE_STATES}`) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to support conversation: ${conversationId}`);
      }
    });
}

export function unsubscribeFromSupportChannel(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
