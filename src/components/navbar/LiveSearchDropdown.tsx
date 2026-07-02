import React, { useRef, useEffect, useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Part } from '../../types';
import { getSystemIcon } from '../../lib/utils/taxonomy';
import { useInstantSearch } from '@/hooks/useInstantSearch';

interface LiveSearchDropdownProps {
  query: string;
  onSelectPart: (partId: string) => void;
  onSeeAll: (query: string) => void;
  onClose: () => void;
  className?: string;
}

export default function LiveSearchDropdown({
  query,
  onSelectPart,
  onSeeAll,
  onClose,
  className = ''
}: LiveSearchDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { parts, loading } = useInstantSearch(query, { minLength: 2, limit: 8 });

  const suggestions = parts.map((part: Part) => ({
    id: `list-${part.id}`,
    type: 'listing' as const,
    partId: part.id,
    part,
    label: part.title,
    desc: `OEM Part • ${part.compatibility?.[0]?.make || part.subtitle || 'N/A'} ${part.compatibility?.[0]?.model || ''}`.trim(),
  }));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions.length, query]);

  useEffect(() => {
    if (suggestions.length === 0) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (suggestions[selectedIndex]) onSelectPart(suggestions[selectedIndex].partId);
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, suggestions, onClose, onSelectPart]);

  if (query.trim().length < 2) return null;

  return (
    <div 
      ref={containerRef}
      className={`absolute left-0 right-0 top-full mt-1.5 bg-steel-black border border-oil-dark rounded-sm shadow-xl overflow-hidden z-[9900] flex flex-col text-base-cream ${className}`}
    >
      <div className="px-3.5 py-2 bg-charcoal border-b border-oil-dark flex items-center justify-between text-[10px] uppercase font-mono text-warm-gray select-none">
        <span>{loading ? 'Searching...' : 'Suggested Autocomplete'}</span>
        <span>{suggestions.length} matches</span>
      </div>

      <div className="divide-y divide-oil-dark max-h-80 overflow-y-auto">
        {suggestions.map((s, idx) => {
          const isSelected = idx === selectedIndex;
          const IconComp = getSystemIcon(s.part.system || 'Powertrain');

          return (
            <div
              key={s.id}
              onClick={() => { onSelectPart(s.partId); onClose(); }}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`px-3.5 py-2.5 flex items-center gap-3.5 cursor-pointer transition-all text-left ${
                isSelected ? 'bg-charcoal' : 'hover:bg-charcoal'
              }`}
            >
              <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 bg-steel-black border border-oil-dark">
                <IconComp className="w-4 h-4 text-rust-copper" />
              </div>

              <div className="flex-grow min-w-0">
                <h5 className="text-xs font-bold font-sans text-base-cream truncate uppercase tracking-tight">
                  {s.label}
                </h5>
                <p className="text-[10px] text-warm-gray font-sans truncate font-medium">
                  {s.desc}
                </p>
              </div>

              <div className="flex-shrink-0 text-right">
                <span className="text-sm font-black text-rust-copper font-sans tracking-wide block">${s.part.price.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          onSeeAll(query);
          onClose();
        }}
        className="px-3.5 py-2.5 bg-charcoal hover:bg-oil-dark border-t border-oil-dark flex items-center justify-between text-xs font-display font-bold uppercase tracking-wider text-rust-copper transition-colors cursor-pointer text-left w-full"
      >
        <span className="flex items-center gap-1.5 font-semibold">
          <Search className="w-3.5 h-3.5 text-rust-copper" />
          <span>See all matches for "{query}"</span>
        </span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}