import * as React from 'react';
import { cn } from '@/lib/utils';
import { slugify } from './lib/slugify';

interface EditorialSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  id?: string;
  description?: React.ReactNode;
  headingLevel?: 'h2' | 'h3';
  showDivider?: boolean;
  children?: React.ReactNode;
}

/**
 * Long-form content section wrapper with an anchor-friendly heading.
 */
export function EditorialSection({
  title,
  id,
  description,
  headingLevel = 'h2',
  showDivider = true,
  children,
  className,
  ...props
}: EditorialSectionProps) {
  const sectionId = id ?? slugify(title);
  const Heading = headingLevel;

  const headingStyles =
    headingLevel === 'h2'
      ? 'font-display text-section font-bold uppercase tracking-tight text-foreground-primary'
      : 'font-display text-card-title font-bold uppercase tracking-tight text-foreground-primary';

  return (
    <section
      id={sectionId}
      className={cn(
        'py-8 first:pt-0',
        showDivider && 'border-t border-stroke-subtle',
        className,
      )}
      {...props}
    >
      <Heading className={headingStyles}>{title}</Heading>
      {description && (
        <p className="mt-3 font-sans text-body leading-relaxed text-foreground-secondary">
          {description}
        </p>
      )}
      {children && <div className="mt-4 font-sans text-body leading-relaxed text-foreground-secondary">{children}</div>}
    </section>
  );
}
