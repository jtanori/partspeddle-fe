import React, { useState } from 'react';
import { FitmentViewModel } from '@/domain/types/pdp.types';

interface DescriptionFitmentPanelProps {
  description: string;
  fitment: FitmentViewModel;
}

export default function DescriptionFitmentPanel({ description, fitment }: DescriptionFitmentPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-8 bg-white border border-zinc-250 rounded p-6 shadow-sm">
      <div>
        <h3 className="font-display font-bold uppercase text-sm mb-4">Description</h3>
        <p className={`text-sm text-zinc-600 ${isExpanded ? '' : 'line-clamp-4'}`}>
          {description}
        </p>
        {description.length > 200 && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#B87333] text-sm font-bold mt-2">
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>
      <div>
        <h3 className="font-display font-bold uppercase text-sm mb-4">Vehicle Fitment</h3>
        <p className="text-emerald-700 text-sm mb-4">✓ This part fits the following vehicles</p>
        <div className="space-y-2">
          {fitment.vehicles.map((v, i) => (
            <div key={i} className="flex justify-between border-b pb-2">
              <span className="font-bold">{v.year} {v.make} {v.model}</span>
              <span className="text-zinc-500">{v.engine}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
