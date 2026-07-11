'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSupportConversation } from '@/hooks/useSupportConversation';

const SupportMessenger = dynamic(
  () => import('./SupportMessenger').then((mod) => mod.SupportMessenger),
  {
    ssr: false,
  },
);

export interface SupportLauncherProps {
  className?: string;
}

export function SupportLauncher({ className }: SupportLauncherProps) {
  const [open, setOpen] = React.useState(false);
  const { conversation, loading, start } = useSupportConversation();

  const handleOpen = React.useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        void start();
      }
      return next;
    });
  }, [start]);

  return (
    <>
      <SupportMessenger
        key={conversation?.id ?? 'closed'}
        open={open}
        onClose={() => setOpen(false)}
        conversation={conversation}
        loading={loading}
      />
      <Button
        type="button"
        onClick={handleOpen}
        size="icon-lg"
        className={cn(
          'fixed right-4 bottom-4 z-40 h-14 w-14 rounded-full shadow-floating',
          className,
        )}
        aria-label={open ? 'Close support' : 'Open support'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </>
  );
}

export default SupportLauncher;
