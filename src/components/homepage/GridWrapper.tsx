'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Section } from '../layout/design-system/Section';
import { Content } from '../layout/design-system/Content';

interface GridWrapperProps {
  title: string;
  subtitle: string;
  loading?: boolean;
  skeletonCount?: number;
  gridCols?: '3' | '4';
  children?: React.ReactNode;
}

export function GridWrapper({
  title,
  subtitle,
  loading = false,
  skeletonCount = 4,
  gridCols = '4',
  children,
}: GridWrapperProps) {
  const gridClass =
    gridCols === '3'
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  if (!loading && !children) return null;

  return (
    <Section className="bg-surface-secondary">
      <Content>
        <div className="space-y-12">
          <div className="mb-12 space-y-2 border-l-4 border-brand-primary pl-6">
            <h2 className="font-display text-4xl font-black uppercase tracking-tight text-foreground-primary">
              {title}
            </h2>
            <p className="font-sans text-sm text-foreground-muted">{subtitle}</p>
          </div>

          <div className={`grid ${gridClass} gap-6`}>
            {loading &&
              Array.from({ length: skeletonCount }).map((_, i) => (
                <Skeleton.PartCard key={`grid-skeleton-${i}`} />
              ))}
            {!loading && children}
          </div>
        </div>
      </Content>
    </Section>
  );
}
