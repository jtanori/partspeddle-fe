import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function subscribeToConversation(
  conversationId: string,
  onMessageReceived: (message: Record<string, unknown>) => void,
): RealtimeChannel {
  return supabase
    .channel(`conversation:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessageReceived(payload.new as Record<string, unknown>);
      },
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`Subscribed to conversation: ${conversationId}`);
      }
    });
}

export function unsubscribeFromChannel(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}