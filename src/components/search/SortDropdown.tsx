import React from "react";
import { ChevronDown } from "lucide-react";

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  const selectedLabel =
    sortOptions.find((opt) => opt.value === value)?.label || "Relevance";

  return (
    <div className="relative border border-zinc-200 rounded-lg px-3 py-2 flex items-center gap-2 text-sm text-zinc-600 bg-white">
      <span>
        Sort:{" "}
        <span className="font-semibold text-zinc-900">{selectedLabel}</span>
      </span>
      <ChevronDown className="w-4 h-4 text-zinc-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
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
