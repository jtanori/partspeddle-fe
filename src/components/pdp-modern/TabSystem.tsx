import React, { useState } from 'react';
import { PartViewModel } from '@/domain/types/pdp.types';

interface TabSystemProps {
  viewModel: PartViewModel;
}

export default function TabSystem({ viewModel }: TabSystemProps) {
  const [activeTab, setActiveTab] = useState(viewModel.tabs[0].id);

  return (
    <div className="w-full bg-surface-primary border border-stroke-subtle rounded-xl shadow-card overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-stroke-subtle bg-surface-muted/30">
        {viewModel.tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 sm:px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative shrink-0 ${
              activeTab === tab.id
                ? 'text-brand-primary'
                : 'text-foreground-muted hover:text-foreground-secondary'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
               <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-10">
        {activeTab === 'spec' ? (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
              {/* Left Side: Spec Data (span 7) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-[13px] min-w-0">
                 <div className="space-y-6">
                    <div className="pb-3 border-b border-stroke-subtle">
                       <p className="text-foreground-muted font-bold uppercase text-[9px] tracking-[0.2em] mb-1.5">Condition</p>
                       <p className="font-black text-foreground-primary uppercase tracking-tight">Used OEM</p>
                    </div>
                    <div className="pb-3 border-b border-stroke-subtle">
                       <p className="text-foreground-muted font-bold uppercase text-[9px] tracking-[0.2em] mb-1.5">Mileage</p>
                       <p className="font-black text-foreground-primary uppercase tracking-tight">160,000 Miles</p>
                    </div>
                    <div className="pb-3 border-b border-stroke-subtle">
                       <p className="text-foreground-muted font-bold uppercase text-[9px] tracking-[0.2em] mb-1.5">Brand</p>
                       <p className="font-black text-foreground-primary uppercase tracking-tight">Denso</p>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="pb-3 border-b border-stroke-subtle">
                       <p className="text-foreground-muted font-bold uppercase text-[9px] tracking-[0.2em] mb-1.5">Voltage</p>
                       <p className="font-black text-foreground-primary uppercase tracking-tight">12V</p>
                    </div>
                    <div className="pb-3 border-b border-stroke-subtle">
                       <p className="text-foreground-muted font-bold uppercase text-[9px] tracking-[0.2em] mb-1.5">Amperage</p>
                       <p className="font-black text-foreground-primary uppercase tracking-tight">120A</p>
                    </div>
                    <div className="pb-3 border-b border-stroke-subtle">
                       <p className="text-foreground-muted font-bold uppercase text-[9px] tracking-[0.2em] mb-1.5">Pulley Type</p>
                       <p className="font-black text-foreground-primary uppercase tracking-tight">Serpentine</p>
                    </div>
                 </div>
              </div>
              
              {/* Right Side: Visual Asset (span 5) */}
              <div className="lg:col-span-5 rounded-xl bg-surface-muted/50 border border-stroke-subtle p-6 aspect-square flex items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-surface-primary/40 to-transparent pointer-events-none" />
                 {viewModel.images?.[0] && (
                    <img 
                      src={viewModel.images[0]} 
                      alt="spec visual" 
                      className="w-full h-full object-contain opacity-30 grayscale contrast-125 transition-transform duration-700 group-hover:scale-110" 
                    />
                 )}
              </div>
           </div>
        ) : (
           <div className="text-[14px] leading-loose text-foreground-muted font-medium">
             {viewModel.tabs.find((t) => t.id === activeTab)?.content}
           </div>
        )}
      </div>
    </div>
  );
}
