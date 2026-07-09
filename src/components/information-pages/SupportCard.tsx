import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';

interface SupportCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  cta?: {
    label: string;
    href: string;
  };
  className?: string;
}

/**
 * CTA card for support, onboarding, or help resources.
 */
export function SupportCard({ icon, title, description, cta, className }: SupportCardProps) {
  return (
    <Card className={cn('p-5', className)}>
      {icon && <div className="mb-4 text-brand-primary">{icon}</div>}
      <h3 className="font-display text-card-title font-bold uppercase tracking-tight text-foreground-primary">
        {title}
      </h3>
      <p className="mt-2 font-sans text-body leading-relaxed text-foreground-secondary">
        {description}
      </p>
      {cta && (
        <Link
          href={cta.href}
          className={cn(buttonVariants({ variant: 'default' }), 'mt-4 inline-flex w-full sm:w-auto')}
        >
          {cta.label}
        </Link>
      )}
    </Card>
  );
}
