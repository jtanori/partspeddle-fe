import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actions,
  className = '',
  as: Tag = 'h2',
}) => {
  return (
    <div
      className={cn(
        'mb-8 flex flex-col justify-between gap-6 border-b border-stroke-subtle pb-8 md:flex-row md:items-end',
        className,
      )}
    >
      <div className="space-y-1.5">
        <Tag
          className={cn(
            'font-display font-extrabold uppercase tracking-tight text-foreground-primary',
            Tag === 'h1' ? 'text-3xl' : 'text-2xl sm:text-3xl',
          )}
        >
          {title}
        </Tag>
        {subtitle && <p className="font-sans text-xs text-foreground-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};
