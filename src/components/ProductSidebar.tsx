import React from 'react';
import { ChevronRight, ChevronDown, Sparkles, Cog, Compass, Disc, Zap, Car, Armchair, FolderOpen, Check } from 'lucide-react';
import { SearchFilters, PartCondition } from '../types';
import { SYSTEMS_TAXONOMY } from '../services/taxonomy';

const SYSTEMS_LIST = Object.keys(SYSTEMS_TAXONOMY);
const PART_TYPES = ['Alternator', 'Transmission', 'Engine', 'Door', 'Bumper', 'Wheel'];

const getSystemIcon = (sysName: string) => {
  switch (sysName) {
    case 'Powertrain': return Cog;
    case 'Suspension & Steering': return Compass;
    case 'Brake System': return Disc;
    case 'Electrical System': return Zap;
    case 'Body & Exterior': return Car;
    case 'Interior': return Armchair;
    default: return Cog;
  }
};

interface ProductSidebarProps {
  filters: SearchFilters;
  clearAllFilters: () => void;
  toggleSection: (sec: string) => void;
  collapsedSections: Record<string, boolean>;
  sortBy: string;
  setSortBy: (sort: string) => void;
  getSystemPartCount: (sys: string) => string;
  getConditionCount: (cond: PartCondition) => number;
  getSellerTypeCount: (type: 'all' | 'trusted') => number;
  togglePartType: (type: string) => void;
  toggleCondition: (cond: PartCondition) => void;
  handlePriceChange: (index: number, val: number) => void;
  setAndSyncFilters: (updateFn: (prev: SearchFilters) => SearchFilters) => void;
}

export const ProductSidebar: React.FC<ProductSidebarProps> = ({
  filters, clearAllFilters, toggleSection, collapsedSections,
  sortBy, setSortBy, getSystemPartCount, getConditionCount, getSellerTypeCount, togglePartType,
  toggleCondition, handlePriceChange, setAndSyncFilters
}) => {
  const categories = filters.system ? Object.keys(SYSTEMS_TAXONOMY[filters.system]?.assemblies || {}) : [];
  const partTypes = filters.category && filters.system ? SYSTEMS_TAXONOMY[filters.system].assemblies[filters.category] : [];

  return (
    <div className="bg-[#1A1A1A] border border-stone-800 rounded-xl p-5 space-y-6 text-zinc-300 relative shadow-2xl" id="unified-filters-card">
      <div className="rivet top-2 left-2" /><div className="rivet top-2 right-2" /><div className="rivet bottom-2 left-2" /><div className="rivet bottom-2 right-2" />

      {/* FILTER BY Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 pb-1">
          <h2 className="font-display font-black text-[11px] uppercase tracking-widest text-rust-copper select-none">
            FILTER BY
          </h2>
          <div className="flex-grow h-px bg-stone-800" />
        </div>
        <button onClick={clearAllFilters} className="text-[10px] font-bold uppercase text-zinc-500 hover:text-rust-copper transition-colors cursor-pointer bg-transparent border-none">Clear All</button>
      </div>

      {/* Sort Section */}
      <div className="space-y-2">
        <div onClick={() => toggleSection('sort')} className="flex items-center justify-between cursor-pointer pb-2 border-b border-stone-800">
          <span className="font-display text-sm uppercase tracking-wider text-warm-gray">Sort Order</span>
          {collapsedSections.sort ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        {!collapsedSections.sort && (
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-[#1A1A1A] border border-stone-800 rounded p-2 text-sm text-base-cream">
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low - High</option>
            <option value="price-high">Price: High - Low</option>
          </select>
        )}
      </div>

      {/* Featured Filter */}
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setAndSyncFilters((p) => ({...p, featured: !p.featured}))}>
        <span className="font-display text-sm uppercase tracking-wider text-warm-gray flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rust-copper" /> Featured Only
        </span>
        <div className={'w-8 h-4 rounded-full border transition-colors ' + (filters.featured ? 'bg-rust-copper border-rust-copper' : 'bg-stone-800 border-stone-700')}></div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <div onClick={() => toggleSection('category')} className="flex items-center justify-between cursor-pointer pb-2 border-b border-stone-800">
          <span className="font-display text-sm uppercase tracking-wider text-warm-gray">System</span>
          {collapsedSections.category ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        {!collapsedSections.category && (
          <div className="space-y-3 pl-2">
            <select value={filters.system} onChange={(e) => setAndSyncFilters((p) => ({...p, system: e.target.value, category: '', partTypes: []}))} className="w-full bg-[#1A1A1A] border border-stone-800 rounded p-2 text-sm text-base-cream">
                <option value="">All Systems</option>
                {SYSTEMS_LIST.map(sys => <option key={sys} value={sys}>{sys}</option>)}
            </select>
            {filters.system && (
                <select value={filters.category} onChange={(e) => setAndSyncFilters((p) => ({...p, category: e.target.value, partTypes: []}))} className="w-full bg-[#1A1A1A] border border-stone-800 rounded p-2 text-sm text-base-cream">
                    <option value="">All Assemblies</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            )}
          </div>
        )}
      </div>

      {/* Part Types */}
      <div className="space-y-2">
        <div onClick={() => toggleSection('partType')} className="flex items-center justify-between cursor-pointer pb-2 border-b border-stone-800">
          <span className="font-display text-sm uppercase tracking-wider text-warm-gray">Part Type</span>
          {collapsedSections.partType ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        {!collapsedSections.partType && (
          <div className="space-y-1 max-h-40 overflow-y-auto">
             {partTypes.map((type) => (
                <div key={type} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer" onClick={() => togglePartType(type)}>
                    <div className={'w-4 h-4 rounded border ' + (filters.partTypes.includes(type) ? 'bg-rust-copper' : 'border-stone-700')}></div>
                    {type}
                </div>
             ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <div onClick={() => toggleSection('price')} className="flex items-center justify-between cursor-pointer pb-2 border-b border-stone-800">
          <span className="font-display text-sm uppercase tracking-wider text-warm-gray">Price Range</span>
          {collapsedSections.price ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        {!collapsedSections.price && (
          <div className="flex items-center gap-2">
            <input type="number" value={filters.priceRange[0]} onChange={(e) => handlePriceChange(0, parseInt(e.target.value))} className="w-full bg-[#1A1A1A] border border-stone-800 rounded p-2 text-sm text-base-cream" />
            <span className="text-stone-600">-</span>
            <input type="number" value={filters.priceRange[1]} onChange={(e) => handlePriceChange(1, parseInt(e.target.value))} className="w-full bg-[#1A1A1A] border border-stone-800 rounded p-2 text-sm text-base-cream" />
          </div>
        )}
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <div onClick={() => toggleSection('condition')} className="flex items-center justify-between cursor-pointer pb-2 border-b border-stone-800">
          <span className="font-display text-sm uppercase tracking-wider text-warm-gray">Condition</span>
          {collapsedSections.condition ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        {!collapsedSections.condition && (
          <div className="space-y-1">
             {(['Used OEM', 'OEM Original', 'Excellent', 'Good', 'For Parts'] as PartCondition[]).map((cond) => (
                <div key={cond} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer" onClick={() => toggleCondition(cond)}>
                    <div className={'w-4 h-4 rounded border ' + (filters.conditions.includes(cond) ? 'bg-rust-copper' : 'border-stone-700')}></div>
                    {cond} ({getConditionCount(cond)})
                </div>
             ))}
          </div>
        )}
      </div>
      
      {/* Seller Type */}
      <div className="space-y-2">
        <div onClick={() => toggleSection('seller')} className="flex items-center justify-between cursor-pointer pb-2 border-b border-stone-800">
          <span className="font-display text-sm uppercase tracking-wider text-warm-gray">Seller Type</span>
          {collapsedSections.seller ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        {!collapsedSections.seller && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm cursor-pointer" onClick={() => setAndSyncFilters((p) => ({...p, sellerType: 'all'}))}>
              <div className={'w-4 h-4 rounded border ' + (filters.sellerType === 'all' ? 'bg-rust-copper' : 'border-stone-700')}></div>
              All Sellers ({getSellerTypeCount('all')})
            </div>
            <div className="flex items-center gap-2 text-sm cursor-pointer" onClick={() => setAndSyncFilters((p) => ({...p, sellerType: 'trusted'}))}>
              <div className={'w-4 h-4 rounded border ' + (filters.sellerType === 'trusted' ? 'bg-rust-copper' : 'border-stone-700')}></div>
              Trusted Sellers Only ({getSellerTypeCount('trusted')})
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
