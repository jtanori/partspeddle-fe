import * as React from 'react';
import { cn } from '@/lib/utils';

interface StickySidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Sticky right-hand sidebar container for information pages.
 */
export function StickySidebar({ children, className, ...props }: StickySidebarProps) {
  return (
    <div
      className={cn('sticky top-[120px] flex flex-col gap-6', className)}
      {...props}
    >
      {children}
    </div>
  );
}
