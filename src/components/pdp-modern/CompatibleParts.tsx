'use client';

import React from 'react';
import Link from 'next/link';
import { PartSummaryViewModel } from '@/domain/types/pdp.types';

interface CompatiblePartsProps {
  partId: string;
  parts: PartSummaryViewModel[];
}

export default function CompatibleParts({ partId, parts }: CompatiblePartsProps) {
  return (
    <div className="bg-surface-primary border border-stroke-subtle rounded-xl p-6 shadow-card space-y-6">
      <h3 className="font-display font-black uppercase text-xs tracking-widest text-foreground-muted">
        Compatible Parts (Cross Sell)
      </h3>
      <div className="space-y-4">
        {parts.map((part) => (
          <Link
            key={part.id}
            href={`/listing/${part.id}`}
            className="flex items-center gap-3 pb-3 border-b border-stroke-subtle last:border-0 last:pb-0 group"
          >
            <div className="w-12 h-12 bg-surface-muted rounded border border-stroke-subtle flex-shrink-0 overflow-hidden">
              <img src={part.imageUrl} alt={part.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black text-foreground-primary uppercase truncate tracking-tight group-hover:text-brand-primary transition-colors">
                {part.title}
              </p>
              <p className="text-[11px] font-bold text-foreground-muted uppercase tracking-tighter">
                SKU: {part.id.slice(0, 8)}
              </p>
              <p className="text-sm font-black text-brand-primary mt-0.5">
                ${part.price.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <Link
        href={`/listing/${partId}/compatible-parts`}
        className="block text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] w-full text-center hover:underline pt-2"
      >
        View more compatible parts ({parts.length})
      </Link>
    </div>
  );
}
