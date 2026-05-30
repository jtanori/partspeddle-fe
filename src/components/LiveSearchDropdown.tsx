import React, { useRef, useEffect, useState } from 'react';
import { Search, ArrowRight, Cog, Compass, Disc, Zap, Car, Armchair, Wrench, FolderOpen, ArrowRightLeft } from 'lucide-react';
import { MOCK_PARTS, SYSTEMS_TAXONOMY } from '../services/db';
import { PARTS_FALLBACK_IMAGE } from '../types';

interface LiveSearchDropdownProps {
  query: string;
  onSelectPart: (partId: string) => void;
  onSeeAll: (query: string) => void;
  onClose: () => void;
  className?: string;
}

const getSystemIcon = (sysId: string) => {
  switch (sysId) {
    case 'Powertrain':
      return Cog;
    case 'Suspension & Steering':
      return Compass;
    case 'Brake System':
      return Disc;
    case 'Electrical System':
      return Zap;
    case 'Body & Exterior':
      return Car;
    case 'Interior':
      return Armchair;
    default:
      return FolderOpen;
  }
};

const PART_THUMBNAILS: Record<string, string> = {
  '1100428': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=300',
  '1100429': 'https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?auto=format&fit=crop&q=80&w=300',
  '1100430': 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=300',
  '1100431': 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=300',
  '1100432': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=300',
  'th400-trans': 'https://images.unsplash.com/photo-150422014244-63be825126f5?auto=format&fit=crop&q=80&w=300',
  'holley-4160': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=300',
  'f150-door': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300',
  'ford9-rearend': 'https://images.unsplash.com/photo-1530047625168-4b18fa65f242?auto=format&fit=crop&q=80&w=300',
  'brembo-caliper-red': 'https://images.unsplash.com/photo-1606577924006-27d39b132af2?auto=format&fit=crop&q=80&w=300',
  'eibach-springs-sports': 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=300',
  'wilwood-disc-rotors': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=300',
  'bilstein-b6-strut': 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=300',
  'custom-steering-wheel': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300',
  'edelbrock-manifold': 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&q=80&w=300',
  'msd-ignition-box': 'https://images.unsplash.com/photo-1532585078488-03b0ff297fea?auto=format&fit=crop&q=80&w=300'
};

export default function LiveSearchDropdown({
  query,
  onSelectPart,
  onSeeAll,
  onClose,
  className = ''
}: LiveSearchDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trimmed = query.trim().toLowerCase();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Mixed suggestions parser
  const getSuggestions = () => {
    if (trimmed.length < 2) return [];

    // 1. Systems matching
    const systemsList = Object.keys(SYSTEMS_TAXONOMY);
    const systemSuggestions = systemsList
      .filter((sys) => sys.toLowerCase().includes(trimmed))
      .map((sys) => ({
        id: `sys-${sys}`,
        type: 'system',
        value: sys,
        label: `Jump to ${sys} System`,
        desc: 'Explore all subsystems and assemblies'
      }));

    // 2. Part Type matching
    const partTypeSuggestions: any[] = [];
    Object.entries(SYSTEMS_TAXONOMY).forEach(([sys, data]) => {
      Object.entries(data.assemblies).forEach(([assy, types]) => {
        types.forEach((type) => {
          if (type.toLowerCase().includes(trimmed) && !partTypeSuggestions.some((p) => p.value === type)) {
            partTypeSuggestions.push({
              id: `pt-${type}`,
              type: 'partType',
              value: type,
              system: sys,
              subsystem: assy,
              label: `Search "${type}" in ${sys}`,
              desc: `Assembly: ${assy}`
            });
          }
        });
      });
    });

    // 3. Vehicle Fitment matching
    const fitmentSuggestions: any[] = [];
    const uniqueMakes = Array.from(new Set(MOCK_PARTS.flatMap((p) => p.compatibility?.map((c) => c.make) || [])));
    const uniqueModels = Array.from(new Set(MOCK_PARTS.flatMap((p) => p.compatibility?.map((c) => c.model) || [])));

    uniqueMakes.forEach((make) => {
      if (make.toLowerCase().includes(trimmed)) {
        fitmentSuggestions.push({
          id: `fit-make-${make}`,
          type: 'fitment',
          make: make,
          label: `Filter by vehicle make: ${make}`,
          desc: 'Automotive catalog match'
        });
      }
    });

    uniqueModels.forEach((model) => {
      if (model.toLowerCase().includes(trimmed)) {
        const matchingPart = MOCK_PARTS.flatMap((p) => p.compatibility || []).find(
          (c) => c.model.toLowerCase() === model.toLowerCase()
        );
        const makeName = matchingPart ? matchingPart.make : '';
        fitmentSuggestions.push({
          id: `fit-model-${model}`,
          type: 'fitment',
          make: makeName,
          model: model,
          label: `Filter by model: ${makeName} ${model}`,
          desc: 'Vehicle compatibility match'
        });
      }
    });

    // 4. Listing suggestions
    const listingSuggestions = MOCK_PARTS.filter((part) => {
      return (
        part.title.toLowerCase().includes(trimmed) ||
        part.oemPartNumber.toLowerCase().includes(trimmed)
      );
    }).map((part) => ({
      id: `list-${part.id}`,
      type: 'listing',
      partId: part.id,
      part: part,
      label: part.title,
      desc: `OEM Part: #${part.oemPartNumber} • ${part.condition} Condition`
    }));

    return [
      ...systemSuggestions,
      ...partTypeSuggestions.slice(0, 3),
      ...fitmentSuggestions.slice(0, 3),
      ...listingSuggestions.slice(0, 4)
    ].slice(0, 8); // Cap suggestions count at 8
  };

  const suggestions = getSuggestions();

  // Reset index when suggestions list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global Keydown interceptor
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
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, suggestions]);

  if (trimmed.length < 2) return null;

  const handleSelectSuggestion = (s: any) => {
    const searchParams = new URLSearchParams();

    if (s.type === 'system') {
      searchParams.set('system', s.value);
      const url = `/results?${searchParams.toString()}`;
      window.history.pushState({ view: 'listing' }, '', url);
      onSeeAll(query);
    } else if (s.type === 'partType') {
      searchParams.set('system', s.system);
      searchParams.set('subsystem', s.subsystem);
      searchParams.set('part_type', s.value);
      const url = `/results?${searchParams.toString()}`;
      window.history.pushState({ view: 'listing' }, '', url);
      onSeeAll(query);
    } else if (s.type === 'fitment') {
      if (s.make) searchParams.set('make', s.make);
      if (s.model) searchParams.set('model', s.model);
      const url = `/results?${searchParams.toString()}`;
      window.history.pushState({ view: 'listing' }, '', url);
      onSeeAll(query);
    } else if (s.type === 'listing') {
      onSelectPart(s.partId);
    }
    onClose();
  };

  if (suggestions.length === 0) {
    return (
      <div 
        ref={containerRef}
        className={`absolute left-0 right-0 top-full mt-1.5 bg-white border border-zinc-200 rounded-md shadow-lg py-4 px-4 text-center z-50 text-zinc-500 font-sans text-xs ${className}`}
      >
        No results match <span className="font-semibold text-zinc-850">"{query}"</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`absolute left-0 right-0 top-full mt-1.5 bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden z-[9900] flex flex-col text-[#1E1E1E] ${className}`}
    >
      {/* Header index info */}
      <div className="px-3.5 py-2 bg-zinc-50 border-b border-zinc-150 flex items-center justify-between text-[10px] uppercase font-mono text-zinc-400 select-none">
        <span>Suggested Search Autocomplete</span>
        <span>{suggestions.length} dynamic suggestions</span>
      </div>

      {/* Suggested matches */}
      <div className="divide-y divide-zinc-100 max-h-80 overflow-y-auto">
        {suggestions.map((s, idx) => {
          const isSelected = idx === selectedIndex;
          
          // Determine Icon and visual assets based on suggestion type
          let IconComp = Search;
          let colorClass = 'text-[#B87333]';
          let imageThumb: string | null = null;
          let priceLabel: string | null = null;

          if (s.type === 'system') {
            IconComp = getSystemIcon(s.value);
            colorClass = 'text-blue-600 bg-blue-55';
          } else if (s.type === 'partType') {
            IconComp = Wrench;
            colorClass = 'text-[#B87333] bg-amber-55';
          } else if (s.type === 'fitment') {
            IconComp = Car;
            colorClass = 'text-emerald-600 bg-emerald-55';
          } else if (s.type === 'listing') {
            imageThumb = PART_THUMBNAILS[s.partId] || PARTS_FALLBACK_IMAGE;
            priceLabel = `$${s.part.price.toFixed(2)}`;
          }

          return (
            <div
              key={s.id}
              onClick={() => handleSelectSuggestion(s)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`px-3.5 py-2.5 flex items-center gap-3.5 cursor-pointer transition-all text-left border-l-3 ${
                isSelected 
                  ? 'bg-zinc-50 border-l-[#B87333]' 
                  : 'bg-white border-l-transparent'
              }`}
            >
              {/* Icon/Thumb container */}
              {imageThumb ? (
                <img 
                  src={imageThumb} 
                  alt={s.label} 
                  className="w-10 h-10 object-cover rounded bg-zinc-150 flex-shrink-0"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = PARTS_FALLBACK_IMAGE;
                  }}
                />
              ) : (
                <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <IconComp className="w-4.5 h-4.5 stroke-[1.5]" />
                </div>
              )}

              {/* Suggestion specifications details */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-zinc-400">
                    {s.type}
                  </span>
                </div>
                <h5 className="text-xs font-bold font-sans text-zinc-900 truncate uppercase tracking-tight mt-0.5 leading-tight">
                  {s.label}
                </h5>
                <p className="text-[10px] text-zinc-400 font-sans truncate font-medium">
                  {s.desc}
                </p>
              </div>

              {/* Right panel, e.g. price */}
              {priceLabel && (
                <div className="flex-shrink-0 text-right pr-1">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase leading-none">Asking</span>
                  <span className="text-sm font-black text-zinc-900 font-sans tracking-wide block mt-0.5">{priceLabel}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Direct execution search link */}
      <button
        type="button"
        onClick={() => {
          onSeeAll(query);
          onClose();
        }}
        className="px-3.5 py-2.5 bg-zinc-50 hover:bg-[#B87333]/10 border-t border-zinc-150 flex items-center justify-between text-xs font-display font-bold uppercase tracking-wider text-[#B87333] transition-colors cursor-pointer text-left w-full"
      >
        <span className="flex items-center gap-1.5 font-semibold">
          <Search className="w-3.5 h-3.5 text-[#B87333]" />
          <span>See all matches for "{query}"</span>
        </span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
