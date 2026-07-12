import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface TrustFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

/**
 * Explanation card for a trust or product feature.
 */
export function TrustFeatureCard({ icon, title, description, className }: TrustFeatureCardProps) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
        {icon}
      </div>
      <h3 className="font-display text-card-title font-bold uppercase tracking-tight text-foreground-primary">
        {title}
      </h3>
      <p className="mt-2 font-sans text-body leading-relaxed text-foreground-secondary">
        {description}
      </p>
    </Card>
  );
}
