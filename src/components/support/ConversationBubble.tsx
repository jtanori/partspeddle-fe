import * as React from 'react';
import { cn } from '@/lib/utils';

export type SupportSenderType = 'user' | 'agent' | 'bot' | 'system';

export interface ConversationBubbleProps {
  senderType: SupportSenderType;
  message: string;
  timestamp?: string;
  className?: string;
}

const senderStyles: Record<SupportSenderType, string> = {
  user: 'ml-auto bg-brand-primary text-white',
  agent: 'bg-surface-primary text-foreground-primary',
  bot: 'bg-surface-secondary text-foreground-primary',
  system: 'mx-auto w-full max-w-md bg-transparent text-center text-foreground-muted italic',
};

const senderLabel: Record<SupportSenderType, string> = {
  user: 'You',
  agent: 'Support Agent',
  bot: 'Support Bot',
  system: 'System',
};

export function ConversationBubble({
  senderType,
  message,
  timestamp,
  className,
}: ConversationBubbleProps) {
  return (
    <div
      className={cn(
        'flex w-full',
        senderType === 'user'
          ? 'justify-end'
          : senderType === 'system'
            ? 'justify-center'
            : 'justify-start',
        className,
      )}
    >
      <div className={cn('max-w-[80%] rounded-2xl px-4 py-3 text-sm', senderStyles[senderType])}>
        {senderType !== 'system' && (
          <span className="mb-1 block text-xs font-semibold opacity-80">
            {senderLabel[senderType]}
          </span>
        )}
        <p className="leading-relaxed whitespace-pre-wrap">{message}</p>
        {timestamp && senderType !== 'system' && (
          <time className="mt-1 block text-right text-xs opacity-70">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        )}
      </div>
    </div>
  );
}
