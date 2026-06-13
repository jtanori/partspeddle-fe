'use client';

import { GridSkeleton } from '../shared/GridSkeleton';
import React from 'react';

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
  children
}: GridWrapperProps) {

  const gridClass = gridCols === '3' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  if (!loading && !children) return null;

  return (
    <div className="w-full bg-zinc-100">
      <section className="pp-container py-12">
        <div className="space-y-12">
          <div className="space-y-2 border-l-4 border-[#B87333] pl-6 mb-12">
            <h2 className="text-4xl font-display font-black uppercase text-zinc-900 tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-zinc-500 font-sans">
              {subtitle}
            </p>
          </div>
          
          <div className={`grid ${gridClass} gap-6`}>
            {loading && Array.from({ length: skeletonCount }).map((_, i) => (
              <GridSkeleton key={`skel-${i}`} />
            ))}
            {!loading && children}
          </div>
        </div>
      </section>
    </div>
  );
}
