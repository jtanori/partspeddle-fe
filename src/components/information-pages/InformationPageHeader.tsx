import * as React from 'react';
import { cn } from '@/lib/utils';

interface InformationPageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Compact editorial page header used across public information pages.
 */
export function InformationPageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: InformationPageHeaderProps) {
  return (
    <header className={cn('pt-16 pb-8', className)}>
      <div className="max-w-[720px]">
        <span className="mb-3 block text-meta font-bold uppercase tracking-widest text-brand-primary">
          {eyebrow}
        </span>
        <h1 className="font-display text-display-l font-black uppercase leading-[1.15] tracking-tight text-foreground-primary">
          {title}
        </h1>
        {description && (
          <p className="mt-4 font-sans text-body leading-relaxed text-foreground-secondary">
            {description}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </header>
  );
}
