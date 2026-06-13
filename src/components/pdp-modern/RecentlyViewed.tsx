import React from 'react';
import { PartSummaryViewModel } from '@/domain/types/pdp.types';

interface RecentlyViewedProps {
  parts: PartSummaryViewModel[];
}

export default function RecentlyViewed({ parts }: RecentlyViewedProps) {
  return (
    <div className="bg-white border border-zinc-250 rounded p-6 shadow-sm space-y-4">
      <h3 className="font-display font-bold uppercase text-sm">Recently Viewed</h3>
      <div className="space-y-4">
        {parts.map((part) => (
          <div key={part.id} className="flex justify-between items-center">
             <p className="text-sm">{part.title}</p>
             <p className="text-sm font-bold">${part.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
