'use client';

import * as React from 'react';

export interface SupportConversation {
  id: string;
  status: string;
  subject: string;
}

export interface UseSupportConversationResult {
  conversation: SupportConversation | null;
  loading: boolean;
  error: string | null;
  start: () => Promise<void>;
}

export function useSupportConversation(): UseSupportConversationResult {
  const [conversation, setConversation] = React.useState<SupportConversation | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const start = React.useCallback(async () => {
    if (conversation) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/support/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'Support request from messenger' }),
      });
      if (!response.ok) throw new Error('Failed to start conversation');
      const data = (await response.json()) as SupportConversation;
      setConversation(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start conversation';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [conversation]);

  return { conversation, loading, error, start };
}
