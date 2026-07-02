import React from 'react';
import { useIsClient } from '@/hooks/useIsClient';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';

interface FacetFilterProps {
  title: string;
  type: 'checkbox' | 'range' | 'select';
  options?: { label: string; value: string; count: number }[];
  selectedValues: string[];
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isDisabled: boolean;
}

export const FacetFilter: React.FC<FacetFilterProps> = ({
  title,
  type,
  options = [],
  selectedValues,
  onChange,
  isOpen,
  onToggle,
  isDisabled,
}) => {
  const isMounted = useIsClient();
  const disabled = isDisabled && isMounted;

  return (
    <div className="space-y-2">
      <div 
        onClick={disabled ? undefined : onToggle} 
        className={`flex items-center justify-between pb-2 border-b border-stone-800 ${disabled ? 'text-zinc-600 cursor-not-allowed' : 'text-warm-gray cursor-pointer'}`}
      >
        <span className="font-display text-sm uppercase tracking-wider">{title}</span>
        {isOpen && !disabled ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </div>
      
      {isOpen && !disabled && type === 'checkbox' && (
        <div className="space-y-1 pl-2">
          {options.map((option) => (
            <div 
              key={option.value} 
              className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white" 
              onClick={() => onChange(option.value)}
            >
              <div className={`w-4 h-4 rounded border ${selectedValues.includes(option.value) ? 'bg-rust-copper border-rust-copper' : 'border-stone-700'}`}>
                {selectedValues.includes(option.value) && <Check className="w-3 h-3 text-white" />}
              </div>
              {option.label} ({option.count})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
