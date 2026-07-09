import * as React from 'react';
import { cn } from '@/lib/utils';

interface InformationLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  main: React.ReactNode;
  sidebar?: React.ReactNode;
}

/**
 * Two-column editorial layout: 66/34 on desktop, stacked on tablet, single
 * column on mobile.
 */
export function InformationLayout({ main, sidebar, className, ...props }: InformationLayoutProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-12', className)} {...props}>
      <main className={cn('min-w-0', sidebar ? 'lg:col-span-8' : 'lg:col-span-12')}>{main}</main>
      {sidebar && <aside className="min-w-0 lg:col-span-4">{sidebar}</aside>}
    </div>
  );
}
