import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Custom hook to subscribe to new messages in a specific conversation.
 * 
 * @param conversationId - The ID of the conversation to subscribe to.
 * @param onMessageReceived - Callback function triggered when a new message arrives.
 */
export const useMessaging = (conversationId: string, onMessageReceived: (message: any) => void) => {
  useEffect(() => {
    if (!conversationId) return;

    // Create a real-time channel for this conversation
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessageReceived(payload.new);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to conversation: ${conversationId}`);
        }
      });

    // Cleanup: unsubscribe when the component unmounts or conversationId changes
    return () => {
      supabase.removeChannel(channel);
      console.log(`Unsubscribed from conversation: ${conversationId}`);
    };
  }, [conversationId, onMessageReceived]);
};
