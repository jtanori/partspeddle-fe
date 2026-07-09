import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';

interface ContactMethodCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
  className?: string;
}

/**
 * Display card for a single contact channel.
 */
export function ContactMethodCard({
  icon,
  title,
  value,
  description,
  cta,
  className,
}: ContactMethodCardProps) {
  return (
    <Card className={cn('flex h-full flex-col p-5', className)}>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
        {icon}
      </div>
      <h3 className="font-display text-card-title font-bold uppercase tracking-tight text-foreground-primary">
        {title}
      </h3>
      <p className="mt-1 font-sans text-body font-medium text-foreground-primary">{value}</p>
      {description && (
        <p className="mt-2 flex-grow font-sans text-caption text-foreground-secondary">
          {description}
        </p>
      )}
      {cta && (
        <Link
          href={cta.href}
          className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 inline-flex w-full')}
        >
          {cta.label}
        </Link>
      )}
    </Card>
  );
}
