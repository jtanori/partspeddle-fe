import React from 'react';
import { X } from 'lucide-react';

interface FilterChip {
  type: string;
  label: string;
  clear?: () => void;
}

interface FilterChipsProps {
  filters: FilterChip[];
}

export const FilterChips: React.FC<FilterChipsProps> = ({ filters }) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {filters.filter(f => f.type !== 'sort').map((filt, idx) => (
        <span 
          key={idx} 
          className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs rounded-full px-3 py-1 whitespace-nowrap"
        >
          {filt.label}
          {filt.clear && (
            <X 
              className="w-3 h-3 cursor-pointer hover:text-rust-copper transition-colors" 
              onClick={(e) => { 
                e.stopPropagation(); 
                filt.clear?.(); 
              }} 
            />
          )}
        </span>
      ))}
    </div>
  );
};
