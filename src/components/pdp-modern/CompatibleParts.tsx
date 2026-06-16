import React from 'react';
import { PartSummaryViewModel } from '@/domain/types/pdp.types';

interface CompatiblePartsProps {
  parts: PartSummaryViewModel[];
}

export default function CompatibleParts({ parts }: CompatiblePartsProps) {
  return (
    <div className="bg-white border border-zinc-250 rounded p-6 shadow-sm space-y-4">
      <h3 className="font-display font-bold uppercase text-sm">Compatible Parts (Cross Sell)</h3>
      <div className="space-y-4">
        {parts.map((part) => (
          <div key={part.id} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-200 rounded" />
              <p className="text-sm font-bold">{part.title}</p>
            </div>
            <p className="text-sm font-bold">${part.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
      <button className="text-[#B87333] text-xs font-bold uppercase w-full text-center">
        View more compatible parts ({parts.length})
      </button>
    </div>
  );
}
