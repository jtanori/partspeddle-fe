import React from 'react';
import { HeaderViewModel, BadgeViewModel } from '@/domain/types/pdp.types';

interface ProductHeaderProps {
  header: HeaderViewModel;
  badges: BadgeViewModel;
}

export default function ProductHeader({ header, badges }: ProductHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {badges.isGoodFit && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase bg-status-success-soft text-status-success border border-status-success tracking-[0.15em]">
            <span className="text-base leading-none">✓</span> Good Fit
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <h1 className="font-display text-4xl font-black uppercase text-foreground-primary leading-[1.1] tracking-tight">
          {header.title}
        </h1>
        <p className="text-[13px] font-bold text-foreground-muted uppercase tracking-[0.2em]">
          {header.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4 text-[13px]">
        <div className="flex items-center gap-1.5">
           <div className="flex text-brand-primary text-xs">
              {"★".repeat(Math.round(header.rating))}
              <span className="text-stroke-default">{"★".repeat(5 - Math.round(header.rating))}</span>
           </div>
           <span className="font-black text-foreground-primary tracking-tighter">({header.ratingCount})</span>
        </div>
        <span className="text-stroke-default">|</span>
        <div className="text-foreground-muted font-bold uppercase tracking-widest text-[11px]">
          SKU: <span className="text-foreground-primary font-black">{header.sku}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {badges.isOEM && (
          <span className="px-3 py-1.5 bg-surface-muted text-foreground-primary text-[10px] font-black uppercase tracking-[0.15em] rounded-md border border-stroke-subtle shadow-card">
            OEM
          </span>
        )}
        <span className="px-3 py-1.5 bg-surface-muted text-foreground-primary text-[10px] font-black uppercase tracking-[0.15em] rounded-md border border-stroke-subtle shadow-card">
          160,000 Miles
        </span>
        {badges.isTested && (
          <span className="px-3 py-1.5 bg-surface-muted text-foreground-primary text-[10px] font-black uppercase tracking-[0.15em] rounded-md border border-stroke-subtle shadow-card">
            Tested
          </span>
        )}
        {badges.warrantyIncluded && (
          <span className="px-3 py-1.5 bg-surface-muted text-foreground-primary text-[10px] font-black uppercase tracking-[0.15em] rounded-md border border-stroke-subtle shadow-card">
            Warranty Included
          </span>
        )}
      </div>
    </div>
  );
}
