import React from 'react';

interface StageTwoTaxonomyProps {
  formData: any;
  setFormData: (data: any) => void;
  aiResult: any;
}

export const StageTwoTaxonomy: React.FC<StageTwoTaxonomyProps> = ({ formData, setFormData, aiResult }) => {
  return (
    <div className="grid grid-cols-12 gap-6 w-full min-h-0 overflow-hidden items-stretch flex-1">
      
      {/* LEFT COLUMN (40%): AI Vision Intake Pipeline View */}
      <div className="col-span-5 flex flex-col gap-4 min-h-0 overflow-hidden border-r border-zinc-800/50 pr-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          {'>>'} SYSTEM INGESTION LOOKUP VISUAL
        </div>
        
        {/* Container that dynamically bounds the image preview frame */}
        <div className="flex-1 relative bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden flex items-center justify-center p-4">
          <div className="w-full h-full bg-zinc-900/40 rounded-sm flex flex-col justify-between p-3 relative group">
            <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-mono text-xs">
              [ {aiResult ? 'PARSED COMPONENT VISUAL BUFFER' : 'NO IMAGE STAGED'} ]
            </div>
            
            {/* Top HUD Row - AI Analysis Confidence Indicator */}
            {aiResult && (
                <div className="z-10 flex justify-between items-start w-full">
                <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] px-2 py-0.5 rounded-sm tracking-wider uppercase">
                    ANALYSIS COMPLETE // {(aiResult.confidence_scores?.part_type_accuracy * 100).toFixed(1)}% CONFIDENCE
                </span>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (60%): High-Density Taxonomy & Mapping Input Grid */}
      <div className="col-span-7 flex flex-col min-h-0 justify-between">
        
        {/* INDEPENDENT FORM SCROLL LANE: Contains the deep metadata grid */}
        <div className="flex-1 overflow-y-auto pr-2 min-h-0 space-y-4 custom-scrollbar">
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
            {'>>'} PARTSPEDDLE TAXONOMY ENTRY MATRIX
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">System *</label>
              <input type="text" placeholder="e.g., Powertrain" value={formData.system} onChange={(e) => setFormData({...formData, system: e.target.value})} className="bg-zinc-900 border border-zinc-800 text-zinc-100 p-2 text-xs font-mono rounded-sm focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Category *</label>
              <input type="text" placeholder="e.g., Transmission" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="bg-zinc-900 border border-zinc-800 text-zinc-100 p-2 text-xs font-mono rounded-sm focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Part Title *</label>
              <input type="text" placeholder="e.g., Automatic Transmission Assembly 4R70W" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-zinc-900 border border-zinc-800 text-zinc-100 p-2 text-xs font-mono rounded-sm focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Part Type</label>
              <input type="text" placeholder="e.g., Component" value={formData.part_type} onChange={(e) => setFormData({...formData, part_type: e.target.value})} className="bg-zinc-900 border border-zinc-800 text-zinc-100 p-2 text-xs font-mono rounded-sm focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Brand/Model *</label>
              <input type="text" placeholder="e.g., Ford / F-150" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="bg-zinc-900 border border-zinc-800 text-zinc-100 p-2 text-xs font-mono rounded-sm focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">OEM Part Number</label>
              <input type="text" placeholder="e.g., F4TP-7000-A" value={formData.oem_part_number} onChange={(e) => setFormData({...formData, oem_part_number: e.target.value})} className="bg-zinc-900 border border-zinc-800 text-zinc-100 p-2 text-xs font-mono rounded-sm focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Yard Stock Number *</label>
              <input type="text" placeholder="e.g., STK-1994-F150-002" value={formData.stock_number} onChange={(e) => setFormData({...formData, stock_number: e.target.value})} className="bg-zinc-900 border border-zinc-800 text-zinc-100 p-2 text-xs font-mono rounded-sm focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-900 mt-2 flex items-center justify-between">
          <p className="text-[10px] font-mono text-zinc-500 uppercase">
            * Indicates a mission-critical warehouse index payload entry field.
          </p>
        </div>

      </div>
    </div>
  );
};
