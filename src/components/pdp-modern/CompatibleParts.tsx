import React from 'react';
import { PartSummaryViewModel } from '@/domain/types/pdp.types';

interface CompatiblePartsProps {
  parts: PartSummaryViewModel[];
}

export default function CompatibleParts({ parts }: CompatiblePartsProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-pp-card p-6 shadow-sm space-y-6">
      <h3 className="font-display font-black uppercase text-xs tracking-widest text-zinc-500">Compatible Parts (Cross Sell)</h3>
      <div className="space-y-4">
        {parts.map((part) => (
          <div key={part.id} className="flex items-center gap-3 pb-3 border-b border-zinc-50 last:border-0 last:pb-0">
            <div className="w-12 h-12 bg-zinc-100 rounded border border-zinc-100 flex-shrink-0 overflow-hidden">
               <img src={part.imageUrl} alt={part.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black text-zinc-800 uppercase truncate tracking-tight">{part.title}</p>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-tighter">SKU: {part.id.slice(0, 8)}</p>
              <p className="text-sm font-black text-pp-primary mt-0.5">${part.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="text-pp-primary text-[10px] font-black uppercase tracking-[0.2em] w-full text-center hover:underline pt-2">
        View more compatible parts ({parts.length})
      </button>
    </div>
  );
}
