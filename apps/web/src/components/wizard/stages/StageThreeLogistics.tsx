import React from 'react';

interface StageThreeLogisticsProps {
  formData: any;
  setFormData: (data: any) => void;
  fitmentArray: string[];
  setFitmentArray: (fitment: string[]) => void;
}

export const StageThreeLogistics: React.FC<StageThreeLogisticsProps> = ({ formData, setFormData, fitmentArray, setFitmentArray }) => {
  return (
    <div className="grid grid-cols-12 gap-6 w-full min-h-0 overflow-hidden items-stretch flex-1">
      {/* Left: Commercial */}
      <div className="col-span-6 space-y-4 overflow-y-auto pr-4 min-h-0">
        <div>
            <label className="text-[10px] font-mono text-text-muted uppercase">Transaction Base Price</label>
            <div className="flex items-center bg-shell-canvas border border-border-default mt-1">
                <span className="px-3 text-xs text-text-muted">$</span>
                <input type="number" value={formData.price_mxn / 100} onChange={(e) => setFormData({...formData, price_mxn: parseInt(e.target.value) * 100})} className="w-full bg-transparent p-3 text-xs outline-none" />
                <span className="px-3 text-xs text-text-muted">MXN</span>
            </div>
        </div>
        <div>
            <label className="text-[10px] font-mono text-text-muted uppercase">Asset Quality</label>
            <select value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} className="w-full bg-shell-canvas border border-border-default p-3 text-xs mt-1">
                <option>New Old Stock</option>
                <option>Excellent</option>
                <option>Used OEM</option>
                <option>For Parts</option>
            </select>
        </div>
        <textarea rows={4} placeholder="Salvage condition log..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-shell-canvas border border-border-default p-3 text-xs mt-1" />
      </div>

      {/* Right: Fitment */}
      <div className="col-span-6 bg-shell-sidebar border border-border-default p-4 flex flex-col min-h-0 overflow-hidden">
        <h4 className="text-[10px] font-black uppercase text-accent-amber mb-4">Fitment Catalog</h4>
        <div className="flex-1 border border-border-subtle bg-shell-canvas p-2 mb-4 overflow-y-auto">
            {fitmentArray.map(f => (
                <div key={f} className="flex justify-between items-center text-[10px] bg-shell-surface p-2 mb-1">
                    <span>{f}</span>
                    <button onClick={() => setFitmentArray(fitmentArray.filter(i => i !== f))} className="hover:text-accent-red">X</button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
