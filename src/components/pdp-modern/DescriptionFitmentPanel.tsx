import React, { useState } from 'react';
import { FitmentViewModel } from '@/domain/types/pdp.types';

interface DescriptionFitmentPanelProps {
  description: string;
  fitment: FitmentViewModel;
}

export default function DescriptionFitmentPanel({ description, fitment }: DescriptionFitmentPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-zinc-200 rounded-pp-card shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 border-r border-zinc-100">
          <h3 className="font-display font-black uppercase text-sm mb-6 tracking-widest text-zinc-800">Description</h3>
          <div className={`text-[13px] leading-relaxed text-zinc-600 ${isExpanded ? '' : 'line-clamp-6'}`}>
            <p className="mb-4">{description}</p>
            <ul className="space-y-2 list-disc list-inside">
               <li>OEM quality and fit</li>
               <li>Built to meet or exceed OEM specifications</li>
               <li>Tested and verified functionality</li>
            </ul>
          </div>
          {description.length > 200 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="text-pp-primary text-xs font-black uppercase tracking-widest mt-6 hover:underline"
            >
              {isExpanded ? 'Read Less \u25B4' : 'Read More \u25BE'}
            </button>
          )}
        </div>
        
        <div className="p-8 bg-zinc-50/30">
          <h3 className="font-display font-bold uppercase text-sm mb-6 tracking-widest text-zinc-800">Vehicle Fitment</h3>
          <div className="flex items-center gap-2 text-[#2E7D32] text-xs font-black uppercase tracking-wide mb-6">
             <span className="w-5 h-5 flex items-center justify-center bg-[#E8F5E9] rounded-full text-[10px]">✓</span>
             This part fits the following vehicles
          </div>
          
          <div className="space-y-3">
            {fitment.vehicles.slice(0, 5).map((v, i) => (
              <div key={i} className="flex justify-between items-center text-[13px] border-b border-zinc-100 pb-2 last:border-0">
                <span className="font-black text-zinc-800 uppercase tracking-tight">{v.year} {v.make} {v.model}</span>
                <span className="text-zinc-500 font-medium italic">{v.engine}</span>
              </div>
            ))}
          </div>

          <button className="text-pp-primary text-[11px] font-black uppercase tracking-widest mt-8 w-full text-center hover:underline">
            View all {fitment.vehicles.length || 12} compatible vehicles
          </button>
        </div>
      </div>
    </div>
  );
}
