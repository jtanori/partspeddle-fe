'use client';

import * as React from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ConversationBubble, SupportSenderType } from './ConversationBubble';
import { SuggestionChip } from './SuggestionChip';
import {
  subscribeToSupportConversation,
  unsubscribeFromSupportChannel,
} from '@/lib/realtime/support-channel';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface SupportMessage {
  id: string;
  sender_type: SupportSenderType;
  sender_id: string;
  message: string;
  created_at: string;
}

export interface SupportConversation {
  id: string;
  status: string;
  subject: string;
}

export interface SupportMessengerProps {
  open: boolean;
  onClose: () => void;
  conversation: SupportConversation | null;
  loading: boolean;
  className?: string;
}

const suggestions = ['Track my order', 'Start a return', 'How do I sell parts?', 'Contact sales'];

export function SupportMessenger({
  open,
  onClose,
  conversation,
  loading,
  className,
}: SupportMessengerProps) {
  const [serverMessages, setServerMessages] = React.useState<SupportMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const welcomeMessage: SupportMessage = React.useMemo(
    () => ({
      id: 'welcome',
      sender_type: 'system',
      sender_id: 'system',
      message: 'Thanks for reaching out. A support agent will join shortly.',
      created_at: new Date().toISOString(),
    }),
    [],
  );

  const messages = React.useMemo(
    () => [welcomeMessage, ...serverMessages],
    [welcomeMessage, serverMessages],
  );

  const sendMessage = React.useCallback(
    async (text: string) => {
      if (!text.trim() || !conversation) return;
      setInput('');
      setSending(true);
      const optimisticId = `optimistic-${Date.now()}`;
      setServerMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          sender_type: 'user',
          sender_id: 'local',
          message: text,
          created_at: new Date().toISOString(),
        },
      ]);

      try {
        const response = await fetch('/api/support/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: conversation.id, message: text }),
        });
        if (!response.ok) throw new Error('Failed to send message');
      } catch (err) {
        console.error(err);
        setServerMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, message: `${m.message} (failed to send)` } : m,
          ),
        );
      } finally {
        setSending(false);
      }
    },
    [conversation],
  );

  React.useEffect(() => {
    if (!conversation?.id) return;

    const channel: RealtimeChannel = subscribeToSupportConversation(
      conversation.id,
      (newMessage) => {
        setServerMessages((prev) => {
          const message = newMessage as SupportMessage;
          // Avoid duplicating optimistic messages.
          if (
            message.sender_type === 'user' &&
            prev.some((m) => m.sender_id === message.sender_id)
          ) {
            return prev.map((m) =>
              m.sender_type === 'user' &&
              m.sender_id === message.sender_id &&
              m.id.startsWith('optimistic-')
                ? message
                : m,
            );
          }
          return [...prev, message];
        });
      },
    );

    return () => {
      unsubscribeFromSupportChannel(channel);
    };
  }, [conversation?.id]);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <Card
      className={cn(
        'fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-[420px] flex-col shadow-floating transition-all duration-200',
        open ? 'h-[600px] max-h-[80vh] opacity-100' : 'pointer-events-none h-0 opacity-0',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-stroke-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-brand-primary" />
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-primary">
              Support
            </h3>
            <p className="text-xs text-foreground-muted">
              {conversation ? conversation.subject : 'Starting conversation...'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-foreground-muted transition-colors hover:bg-surface-secondary hover:text-foreground-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          aria-label="Close support messenger"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading || !conversation ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <MessageCircle className="h-10 w-10 animate-pulse text-foreground-muted" />
            <p className="text-sm text-foreground-secondary">Starting support conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <MessageCircle className="h-10 w-10 text-foreground-muted" />
            <p className="text-sm text-foreground-secondary">How can we help today?</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <ConversationBubble
                key={message.id}
                senderType={message.sender_type}
                message={message.message}
                timestamp={message.created_at}
              />
            ))}
            <div ref={scrollRef} />
          </div>
        )}

        {conversation && messages.length <= 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((label) => (
              <SuggestionChip
                key={label}
                label={label}
                onClick={() => {
                  void sendMessage(label);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage(input);
        }}
        className="border-t border-stroke-subtle p-3"
      >
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!conversation || loading || sending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || !conversation || loading || sending}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
