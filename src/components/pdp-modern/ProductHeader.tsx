import React from 'react';
import { HeaderViewModel, BadgeViewModel } from '@/domain/types/pdp.types';

interface ProductHeaderProps {
  header: HeaderViewModel;
  badges: BadgeViewModel;
}

export default function ProductHeader({ header, badges }: ProductHeaderProps) {
  return (
    <div className="space-y-4">
      {badges.isGoodFit && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="text-emerald-600">✓</span> GOOD FIT
        </span>
      )}
      
      <h1 className="font-display text-3xl font-black uppercase text-[#1E1E1E] tracking-tight">
        {header.title}
      </h1>
      
      <p className="text-sm text-zinc-600 font-sans">
        {header.subtitle}
      </p>

      <div className="flex items-center gap-4 text-sm text-zinc-500 font-mono">
        <span>{"★".repeat(Math.round(header.rating))} ({header.ratingCount})</span>
        <span className="text-zinc-300">|</span>
        <span>SKU: {header.sku}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {badges.isOEM && <span className="px-2 py-1 bg-zinc-200 text-zinc-800 text-xs font-bold rounded">OEM</span>}
        {badges.isTested && <span className="px-2 py-1 bg-zinc-200 text-zinc-800 text-xs font-bold rounded">Tested</span>}
        {badges.warrantyIncluded && <span className="px-2 py-1 bg-zinc-200 text-zinc-800 text-xs font-bold rounded">Warranty Included</span>}
      </div>
    </div>
  );
}
