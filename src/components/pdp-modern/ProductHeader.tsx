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
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pp-atom text-[10px] font-black uppercase bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] tracking-[0.15em]">
            <span className="text-base leading-none">✓</span> Good Fit
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <h1 className="font-display text-4xl font-black uppercase text-pp-text leading-[1.1] tracking-tight">
          {header.title}
        </h1>
        <p className="text-[13px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
          {header.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4 text-[13px]">
        <div className="flex items-center gap-1.5">
           <div className="flex text-pp-primary text-xs">
              {"★".repeat(Math.round(header.rating))}
              <span className="text-zinc-200">{"★".repeat(5 - Math.round(header.rating))}</span>
           </div>
           <span className="font-black text-pp-text tracking-tighter">({header.ratingCount})</span>
        </div>
        <span className="text-zinc-200">|</span>
        <div className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">
          SKU: <span className="text-pp-text font-black">{header.sku}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {badges.isOEM && (
          <span className="px-3 py-1.5 bg-zinc-50 text-pp-text text-[10px] font-black uppercase tracking-[0.15em] rounded-pp-atom border border-zinc-200 shadow-sm">
            OEM
          </span>
        )}
        <span className="px-3 py-1.5 bg-zinc-50 text-pp-text text-[10px] font-black uppercase tracking-[0.15em] rounded-pp-atom border border-zinc-200 shadow-sm">
          160,000 Miles
        </span>
        {badges.isTested && (
          <span className="px-3 py-1.5 bg-zinc-50 text-pp-text text-[10px] font-black uppercase tracking-[0.15em] rounded-pp-atom border border-zinc-200 shadow-sm">
            Tested
          </span>
        )}
        {badges.warrantyIncluded && (
          <span className="px-3 py-1.5 bg-zinc-50 text-pp-text text-[10px] font-black uppercase tracking-[0.15em] rounded-pp-atom border border-zinc-200 shadow-sm">
            Warranty Included
          </span>
        )}
      </div>
    </div>
  );
}
