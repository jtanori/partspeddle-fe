'use client';

import { cn } from '@/lib/utils';
import { DensityProvider } from './density-provider';
import { Skeleton } from '@/components/ui/skeleton';

interface WorkspaceLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
  topNav: React.ReactNode;
  inspector?: React.ReactNode;
  loading?: boolean;
  density?: 'comfortable' | 'compact' | 'dense';
}

/**
 * Canonical workspace layout: sidebar + top navigation + content + optional inspector.
 */
export function WorkspaceLayout({
  sidebar,
  topNav,
  inspector,
  loading = false,
  density = 'compact',
  children,
  className,
  ...props
}: WorkspaceLayoutProps) {
  return (
    <DensityProvider defaultDensity={density}>
      <div
        className={cn(
          'flex h-screen overflow-hidden bg-surface-secondary text-foreground-primary',
          className,
        )}
        {...props}
      >
        {sidebar}

        <div className="flex min-w-0 flex-1 flex-col">
          {topNav}

          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
              {loading ? (
                <div className="mx-auto max-w-7xl space-y-6">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <div className="mx-auto max-w-7xl">{children}</div>
              )}
            </main>

            {inspector && <div className="hidden shrink-0 lg:block">{inspector}</div>}
          </div>
        </div>
      </div>
    </DensityProvider>
  );
}
