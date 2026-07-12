import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  const selectedLabel = sortOptions.find((opt) => opt.value === value)?.label || 'Relevance';

  return (
    <div className="relative flex items-center gap-2 rounded-lg border border-stroke-subtle bg-surface-primary px-3 py-2 text-sm text-foreground-secondary">
      <span>
        Sort: <span className="font-semibold text-foreground-primary">{selectedLabel}</span>
      </span>
      <ChevronDown className="h-4 w-4 text-foreground-muted" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;
