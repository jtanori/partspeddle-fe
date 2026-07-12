import { useEffect } from 'react';
import {
  subscribeToConversation,
  unsubscribeFromChannel,
} from '@/lib/realtime/messaging-channel';

/**
 * Custom hook to subscribe to new messages in a specific conversation.
 *
 * @param conversationId - The ID of the conversation to subscribe to.
 * @param onMessageReceived - Callback function triggered when a new message arrives.
 */
export const useMessaging = (
  conversationId: string,
  onMessageReceived: (message: Record<string, unknown>) => void,
) => {
  useEffect(() => {
    if (!conversationId) return;

    const channel = subscribeToConversation(conversationId, onMessageReceived);

    return () => {
      unsubscribeFromChannel(channel);
      console.log(`Unsubscribed from conversation: ${conversationId}`);
    };
  }, [conversationId, onMessageReceived]);
};