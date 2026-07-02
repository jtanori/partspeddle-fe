import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface YardControlCoreProps {
  onClose: () => void;
  // In a real implementation, these would come from an AppStore or context
  initialData: { max_row_slots: number; max_rack_tiers: number };
  onSave: (data: { max_row_slots: number; max_rack_tiers: number }) => void;
}

export const YardControlCore: React.FC<YardControlCoreProps> = ({ onClose, initialData, onSave }) => {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const isValidStorageTopology = 
    Number.isInteger(data.max_row_slots) && data.max_row_slots > 0 && data.max_row_slots <= 500 &&
    Number.isInteger(data.max_rack_tiers) && data.max_rack_tiers > 0 && data.max_rack_tiers <= 10;

  const handleRowSlotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setData(prev => ({ ...prev, max_row_slots: parseInt(val) || 0 }));
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-[460px] bg-shell-elevated border-l border-border-default shadow-neon-panel z-50 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-heading font-black uppercase tracking-widest text-text-primary">Yard Configuration</h2>
        <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Physical Inventory Location Matrix */}
        <div className="border border-border-muted bg-shell-matte/30 p-4 font-mono mb-6">
          <h3 className="text-xs font-black uppercase text-accent-amber mb-4 tracking-widest">Storage Layout</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-text-muted mb-1.5">Row Capacity</label>
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={data.max_row_slots || ''} 
                  onChange={handleRowSlotsChange}
                  className={`w-full bg-shell-elevated border ${!isValidStorageTopology && data.max_row_slots !== 0 ? 'border-accent-red' : 'border-border-default'} p-2 text-xs text-text-primary focus:border-accent-amber/60 outline-none`}
                />
                <span className="absolute right-3 text-[10px] text-text-muted select-none">Slots</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-muted mb-1.5">Shelves per Rack</label>
              <select 
                value={data.max_rack_tiers}
                onChange={(e) => setData(prev => ({ ...prev, max_rack_tiers: parseInt(e.target.value) }))}
                className="w-full bg-shell-elevated border border-border-default text-text-primary p-2 text-xs outline-none focus:border-accent-amber/60"
              >
                {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1} Shelves</option>)}
              </select>
            </div>
          </div>
          <p className="text-[9px] text-text-muted mt-3 leading-relaxed">
            Set your yard&apos;s physical storage layout limits. Adjusting row limits automatically updates the available coordinate options when assigning storage locations to incoming parts.
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-border-default flex justify-between gap-4">
        <button className="text-[10px] uppercase font-bold text-text-muted hover:text-text-primary">System Status: Ready</button>
        <button 
          onClick={() => onSave(data)}
          disabled={!isValidStorageTopology}
          className="px-6 py-2 bg-accent-amber text-neutral-950 font-bold text-[10px] uppercase tracking-widest hover:bg-accent-amber-hover disabled:opacity-50"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
