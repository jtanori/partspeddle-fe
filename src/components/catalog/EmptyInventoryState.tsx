import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface EmptyInventoryStateProps {
  onReset: () => void;
}

export const EmptyInventoryState: React.FC<EmptyInventoryStateProps> = ({ onReset }) => {
  return (
    <div className="p-12 text-center bg-white border border-zinc-200 rounded max-w-md mx-auto space-y-4 font-sans shadow-xs">
      <AlertTriangle className="w-12 h-12 text-rust-copper mx-auto animate-bounce" />
      <h3 className="font-display text-lg font-bold uppercase text-zinc-850">Empty Inventory Match</h3>
      <p className="text-xs text-zinc-500 leading-relaxed font-medium">
        We couldn't locate any auto parts matches inside this yard matrix. Try modifying your dynamic search query, selecting another category, or resetting fitments.
      </p>
      <button 
        onClick={onReset}
        className="bg-rust-copper hover:bg-[#8B6239] text-white text-xs font-display font-extrabold uppercase py-3 px-8 rounded-sm transition-all shadow-md active:translate-y-0.5"
      >
        Reset Search Filters
      </button>
    </div>
  );
};
