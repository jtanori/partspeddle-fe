import React, { useState } from 'react';
import { FitmentViewModel } from '@/domain/types/pdp.types';

interface DescriptionFitmentPanelProps {
  description: string;
  fitment: FitmentViewModel;
}

export default function DescriptionFitmentPanel({ description, fitment }: DescriptionFitmentPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-surface-primary border border-stroke-subtle rounded-xl shadow-card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 border-r border-stroke-subtle">
          <h3 className="font-display font-black uppercase text-sm mb-6 tracking-widest text-foreground-primary">Description</h3>
          <div className={`text-[13px] leading-relaxed text-foreground-secondary ${isExpanded ? '' : 'line-clamp-6'}`}>
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
              className="text-brand-primary text-xs font-black uppercase tracking-widest mt-6 hover:underline"
            >
              {isExpanded ? 'Read Less \u25B4' : 'Read More \u25BE'}
            </button>
          )}
        </div>
        
        <div className="p-8 bg-surface-muted/30">
          <h3 className="font-display font-bold uppercase text-sm mb-6 tracking-widest text-foreground-primary">Vehicle Fitment</h3>
          <div className="flex items-center gap-2 text-status-success text-xs font-black uppercase tracking-wide mb-6">
             <span className="w-5 h-5 flex items-center justify-center bg-status-success-soft rounded-full text-[10px]">✓</span>
             This part fits the following vehicles
          </div>
          
          <div className="space-y-3">
            {fitment.vehicles.slice(0, 5).map((v, i) => (
              <div key={i} className="flex justify-between items-center text-[13px] border-b border-stroke-subtle pb-2 last:border-0">
                <span className="font-black text-foreground-primary uppercase tracking-tight">{v.year} {v.make} {v.model}</span>
                <span className="text-foreground-muted font-medium italic">{v.engine}</span>
              </div>
            ))}
          </div>

          <button className="text-brand-primary text-[11px] font-black uppercase tracking-widest mt-8 w-full text-center hover:underline">
            View all {fitment.vehicles.length || 12} compatible vehicles
          </button>
        </div>
      </div>
    </div>
  );
}
