import React from 'react';
import { PartSummaryViewModel } from '@/domain/types/pdp.types';

interface RecentlyViewedProps {
  parts: PartSummaryViewModel[];
}

export default function RecentlyViewed({ parts }: RecentlyViewedProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-pp-card p-6 shadow-sm space-y-6">
      <h3 className="font-display font-black uppercase text-xs tracking-widest text-zinc-500">Recently Viewed</h3>
      <div className="space-y-4">
        {parts.map((part) => (
          <div key={part.id} className="flex items-center gap-3">
             <div className="w-10 h-10 bg-zinc-50 rounded border border-zinc-100 overflow-hidden">
                <img src={part.imageUrl} alt={part.title} className="w-full h-full object-cover" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[12px] font-black text-zinc-800 uppercase truncate tracking-tight">{part.title}</p>
                <p className="text-xs font-black text-pp-primary">${part.price.toFixed(2)}</p>
             </div>
          </div>
        ))}
        {parts.length === 0 && (
           <p className="text-[11px] text-zinc-400 italic">No recently viewed parts.</p>
        )}
      </div>
      <button className="text-pp-primary text-[10px] font-black uppercase tracking-[0.2em] w-full text-center hover:underline pt-2 border-t border-zinc-50 mt-4">
        View all recently viewed
      </button>
    </div>
  );
}
