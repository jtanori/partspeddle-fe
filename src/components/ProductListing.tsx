import React, { useState, useEffect, useRef } from 'react';
import { 
  SlidersHorizontal, 
  Star, 
  Search, 
  X, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  Cog, 
  Compass, 
  Disc, 
  Zap, 
  Car, 
  Armchair, 
  Wrench, 
  FolderOpen, 
  CheckSquare, 
  Square,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LayoutGrid,
  List,
  Heart,
  SlidersHorizontal as Sliders
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MOCK_PARTS, MOCK_SELLERS, SYSTEMS_TAXONOMY } from '../services/db';
import { supabaseDb } from '../services/supabase-db';
import { Part, SearchFilters, PartCondition, PARTS_FALLBACK_IMAGE } from '../types';

const SYSTEMS_LIST = ['Powertrain', 'Suspension & Steering', 'Brake System', 'Electrical System', 'Body & Exterior', 'Interior'];

const getSystemIcon = (sysName: string) => {
  switch (sysName) {
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
      return Cog;
  }
};

interface ProductListingProps {
  initialSearchText?: string;
  initialCategory?: string;
  onSelectPart: (partId: string) => void;
}

export default function ProductListing({
  initialSearchText = '',
  initialCategory = 'All Parts',
  onSelectPart
}: ProductListingProps) {
  // Master visual filters state (synced with algoliaMock)
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialSearchText,
    system: initialCategory !== 'All Parts' && SYSTEMS_LIST.includes(initialCategory) ? initialCategory : '',
    category: initialCategory !== 'All Parts' && !SYSTEMS_LIST.includes(initialCategory) ? initialCategory : '',
    partTypes: [],
    priceRange: [0, 500],
    conditions: [],
    sellerType: 'all',
    fitmentMake: 'All Makes',
    fitmentModel: 'All Models',
    fitmentYear: 'All Years',
    fitmentEngine: 'All Engines',
    featured: false
  });

  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (partId: string) => {
    setFavorites(prev => prev.includes(partId) ? prev.filter(id => id !== partId) : [...prev, partId]);
  };

  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    const saved = localStorage.getItem('parts_peddle_catalog_view_mode');
    return (saved === 'grid') ? 'grid' : 'list';
  });

  useEffect(() => {
    localStorage.setItem('parts_peddle_catalog_view_mode', viewMode);
  }, [viewMode]);

  const [matchingParts, setMatchingParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Expanded tree states for taxonomy drill-down
  const [expandedSystems, setExpandedSystems] = useState<string[]>([]);
  const [expandedSubsystems, setExpandedSubsystems] = useState<string[]>([]);

  // Accordion toggle states for filter sections (matches screenshot layout)
  // Default to true (collapsed)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    search: true,
    category: true,
    partType: true,
    fitment: true,
    price: true,
    condition: true,
    seller: true,
    sort: true,
  });

  const toggleSection = (sec: string) => {
    setCollapsedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllPartTypes, setShowAllPartTypes] = useState(false);

  // 1. URL search parameters sync on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    
    setFilters((prev) => {
      const updated = { ...prev };
      
      const system = params.get('system');
      if (system) {
        updated.system = system;
        // Auto-expand systems tree if specified
        setExpandedSystems(curr => curr.includes(system) ? curr : [...curr, system]);
      }
      
      const subsystem = params.get('subsystem');
      if (subsystem) {
        updated.category = subsystem;
        setExpandedSubsystems(curr => curr.includes(subsystem) ? curr : [...curr, subsystem]);
      }
      
      const part_type = params.get('part_type');
      if (part_type) {
        updated.partTypes = [part_type];
      }
      
      const make = params.get('make');
      if (make) updated.fitmentMake = make;
      
      const model = params.get('model');
      if (model) updated.fitmentModel = model;
      
      const year = params.get('year');
      if (year) updated.fitmentYear = year;
      
      const engine = params.get('engine');
      if (engine) updated.fitmentEngine = engine;
      
      const featured = params.get('featured');
      if (featured === 'true') updated.featured = true;

      const q = params.get('q');
      if (q) updated.query = q;
      
      return updated;
    });
  }, []);

  // Sync state filter updates to URL instantly
  const setAndSyncFilters = (updateFn: SearchFilters | ((prev: SearchFilters) => SearchFilters)) => {
    setFilters((prev) => {
      const next = typeof updateFn === 'function' ? updateFn(prev) : updateFn;
      
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams();
        if (next.query) params.set('q', next.query);
        if (next.system) params.set('system', next.system);
        if (next.category) params.set('subsystem', next.category);
        if (next.partTypes && next.partTypes.length > 0) params.set('part_type', next.partTypes[0]);
        if (next.fitmentMake && next.fitmentMake !== 'All Makes') params.set('make', next.fitmentMake);
        if (next.fitmentModel && next.fitmentModel !== 'All Models') params.set('model', next.fitmentModel);
        if (next.fitmentYear && next.fitmentYear !== 'All Years') params.set('year', next.fitmentYear);
        if (next.fitmentEngine && next.fitmentEngine !== 'All Engines') params.set('engine', next.fitmentEngine);
        if (next.featured) params.set('featured', 'true');
        
        const newurl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({ path: newurl }, '', newurl);
      }
      
      return next;
    });
  };

  // 2. Fetch matched entries on filter change
  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await supabaseDb.searchParts(filters);
        
        // Sort logic
        let sorted = [...results];
        if (sortBy === 'price-low') {
          sorted.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          sorted.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'mileage') {
          sorted.sort((a, b) => {
            const ma = typeof a.mileage === 'number' ? a.mileage : 999999;
            const mb = typeof b.mileage === 'number' ? b.mileage : 999999;
            return ma - mb;
          });
        }
        
        setMatchingParts(sorted);
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.message || 'Failed to fetch parts');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchParts, 300);
    return () => clearTimeout(debounceTimer);
  }, [filters, sortBy]);

  // Dynamic document tab title syncing with duplicate word safety filter
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let viewTitle = 'PartsPeddle Marketplace';
    if (filters.category) {
      viewTitle = `${filters.category} | ${viewTitle}`;
    } else if (filters.system) {
      viewTitle = `${filters.system} | ${viewTitle}`;
    } else {
      viewTitle = `Auto Parts Catalog | ${viewTitle}`;
    }
    // Deep double-word deduplication for "System System" if category or system names contain System
    viewTitle = viewTitle.replace(/\bSystem\s+System\b/gi, 'System');
    document.title = viewTitle;
    
    return () => {
      document.title = 'PartsPeddle — Used OEM Auto Parts Marketplace';
    };
  }, [filters.system, filters.category]);

  // Compute live parts counts for drill-down tree
  const getSystemPartCount = (sysName: string) => {
    return '-';
  };

  const getSubsystemPartCount = (sysName: string, subName: string) => {
    return '-';
  };

  const getPartTypePartCount = (sysName: string, subName: string, typeName: string) => {
    return '-';
  };

  // Fitment unique vectors extraction
  const getUniqueMakes = () => {
    const list = MOCK_PARTS.flatMap(p => p.compatibility?.map(c => c.make) || []);
    const uniqueList = Array.from(new Set(list)).filter(m => m.toLowerCase() !== 'all makes');
    return ['All Makes', ...uniqueList];
  };

  const getUniqueModels = () => {
    let list = MOCK_PARTS.flatMap(p => p.compatibility || []);
    if (filters.fitmentMake && filters.fitmentMake !== 'All Makes') {
      list = list.filter(c => c.make.toLowerCase() === (filters.fitmentMake as string).toLowerCase());
    }
    const models = Array.from(new Set(list.map(c => c.model))).filter(m => m.toLowerCase() !== 'all models');
    return ['All Models', ...models];
  };

  const getUniqueYears = () => {
    return ['All Years', '1981', '1982', '1983', '1984', '1985', '1986', '1987'];
  };

  const getUniqueEngines = () => {
    const list = MOCK_PARTS.flatMap(p => p.compatibility?.map(c => c.engine).filter(Boolean) || []) as string[];
    const uniqueList = Array.from(new Set(list)).filter(e => e.toLowerCase() !== 'all engines');
    return ['All Engines', ...uniqueList];
  };

  const togglePartType = (type: string) => {
    setAndSyncFilters((prev) => {
      const exists = prev.partTypes.includes(type);
      return {
        ...prev,
        partTypes: exists
          ? prev.partTypes.filter((t) => t !== type)
          : [...prev.partTypes, type]
      };
    });
  };

  const toggleCondition = (cond: PartCondition) => {
    setAndSyncFilters((prev) => {
      const exists = prev.conditions.includes(cond);
      return {
        ...prev,
        conditions: exists
          ? prev.conditions.filter((c) => c !== cond)
          : [...prev.conditions, cond]
      };
    });
  };

  const handlePriceChange = (index: number, val: number) => {
    setAndSyncFilters((prev) => {
      const newRange: [number, number] = [prev.priceRange[0], prev.priceRange[1]];
      newRange[index] = val;
      return { ...prev, priceRange: newRange };
    });
  };

  const clearAllFilters = () => {
    setAndSyncFilters({
      query: '',
      system: '',
      category: '',
      partTypes: [],
      priceRange: [0, 500],
      conditions: [],
      sellerType: 'all',
      fitmentMake: 'All Makes',
      fitmentModel: 'All Models',
      fitmentYear: 'All Years',
      fitmentEngine: 'All Engines',
      featured: false
    });
  };

  const getConditionColor = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('oem original') || c.includes('original')) {
      return 'bg-rust-copper';
    }
    if (c.includes('excellent')) {
      return 'bg-[#8B6239]';
    }
    if (c.includes('good')) {
      return 'bg-[#7A8B6F]';
    }
    return 'bg-[#4A4A4A]';
  };

  // Thumbnail links mapping
  const partThumbnails: Record<string, string> = {
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

  // Compile active filter chips
  const activeFiltersList: { type: string; label: string; clear?: () => void }[] = [];

  let sortByLabel = 'Relevance Index';
  if (sortBy === 'price-low') sortByLabel = 'Price: Low-to-High';
  if (sortBy === 'price-high') sortByLabel = 'Price: High-to-Low';
  if (sortBy === 'mileage') sortByLabel = 'Mileage: Lowest';

  activeFiltersList.push({
    type: 'sort',
    label: `Sort: ${sortByLabel}`,
    clear: () => setSortBy('relevance')
  });

  if (filters.query) {
    activeFiltersList.push({
      type: 'query',
      label: `Keyword: "${filters.query}"`,
      clear: () => setAndSyncFilters(prev => ({ ...prev, query: '' }))
    });
  }
  if (filters.system) {
    activeFiltersList.push({
      type: 'system',
      label: `System: ${filters.system}`,
      clear: () => setAndSyncFilters(prev => ({ ...prev, system: '', category: '', partTypes: [] }))
    });
  }
  if (filters.category) {
    activeFiltersList.push({
      type: 'category',
      label: `Subsystem: ${filters.category}`,
      clear: () => setAndSyncFilters(prev => ({ ...prev, category: '', partTypes: [] }))
    });
  }
  filters.partTypes.forEach((pt) => {
    activeFiltersList.push({
      type: 'partType',
      label: `Part: ${pt}`,
      clear: () => togglePartType(pt)
    });
  });
  filters.conditions.forEach((c) => {
    activeFiltersList.push({
      type: 'condition',
      label: `Cond: ${c}`,
      clear: () => toggleCondition(c)
    });
  });
  if (filters.priceRange[1] < 500) {
    activeFiltersList.push({
      type: 'price',
      label: `Max Price: $${filters.priceRange[1]}`,
      clear: () => setAndSyncFilters(prev => ({ ...prev, priceRange: [0, 500] }))
    });
  }
  if (filters.sellerType === 'trusted') {
    activeFiltersList.push({
      type: 'seller',
      label: 'Trusted Yards',
      clear: () => setAndSyncFilters(prev => ({ ...prev, sellerType: 'all' }))
    });
  }
  if (filters.fitmentMake && filters.fitmentMake !== 'All Makes') {
    activeFiltersList.push({
      type: 'make',
      label: `Make: ${filters.fitmentMake}`,
      clear: () => setAndSyncFilters(prev => ({ ...prev, fitmentMake: 'All Makes', fitmentModel: 'All Models' }))
    });
  }
  if (filters.fitmentModel && filters.fitmentModel !== 'All Models') {
    activeFiltersList.push({
      type: 'model',
      label: `Model: ${filters.fitmentModel}`,
      clear: () => setAndSyncFilters(prev => ({ ...prev, fitmentModel: 'All Models' }))
    });
  }
  if (filters.fitmentYear && filters.fitmentYear !== 'All Years') {
    activeFiltersList.push({
      type: 'year',
      label: `Year: ${filters.fitmentYear}`,
      clear: () => setAndSyncFilters(prev => ({ ...prev, fitmentYear: 'All Years' }))
    });
  }
  if (filters.fitmentEngine && filters.fitmentEngine !== 'All Engines') {
    activeFiltersList.push({
      type: 'engine',
      label: `Engine: ${filters.fitmentEngine}`,
      clear: () => setAndSyncFilters(prev => ({ ...prev, fitmentEngine: 'All Engines' }))
    });
  }
  if (filters.featured) {
    activeFiltersList.push({
      type: 'featured',
      label: 'Featured Listings Only',
      clear: () => setAndSyncFilters(prev => ({ ...prev, featured: false }))
    });
  }

  const toggleSystemExpanded = (sys: string) => {
    setExpandedSystems(prev => 
      prev.includes(sys) ? prev.filter(s => s !== sys) : [...prev, sys]
    );
  };


  const toggleSubsystemExpanded = (sub: string) => {
    setExpandedSubsystems(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  // Shared 7-Step configuration sequence block (desktop sidebar and mobile sheet parity)
  const renderMainFilterContent = (isMobile = false) => {
    // Dynamic inventory counts helpers matching backend MOCK data
    const getPartTypeGeneralCount = (ptName: string) => {
      return MOCK_PARTS.filter(p => p.partType.toLowerCase() === ptName.toLowerCase()).length;
    };

    const getConditionCount = (cond: PartCondition) => {
      // Robust mapping for label counts
      const mappedVal = cond === 'OEM Original' ? 'OEM Original' : cond;
      return MOCK_PARTS.filter(p => p.condition === mappedVal).length;
    };

    const getSellerTypeCount = (type: 'all' | 'trusted') => {
      if (type === 'trusted') {
        return MOCK_PARTS.filter(p => {
          const s = MOCK_SELLERS.find(sel => sel.id === p.sellerId);
          return s && s.rating >= 4.7;
        }).length;
      }
      return MOCK_PARTS.length;
    };

    // User-friendly mapping for category titles matching screenshot
    const displaySystemName = (sys: string) => {
      if (sys === 'Electrical System') return 'Electrical';
      if (sys === 'Powertrain') return 'Engine & Parts';
      if (sys === 'Brake System') return 'Brakes';
      if (sys === 'Suspension & Steering') return 'Suspension';
      return sys;
    };

    // Extract dynamic / popular part types for Category
    const getActivePartTypesList = () => {
      if (filters.system) {
        const sysData = SYSTEMS_TAXONOMY[filters.system];
        if (sysData) {
          const list: string[] = [];
          Object.values(sysData.assemblies).forEach(types => {
            list.push(...types);
          });
          return Array.from(new Set(list));
        }
      }
      // Warm fallback to popular default items on catalog home
      return ["Alternator", "Starter", "Battery", "Fuse Box", "Power Steering Pump", "Cylinder Head", "Brake Caliper", "Struts", "Leaf Spring"];
    };

    const activePartTypes = getActivePartTypesList();
    const visiblePartTypes = showAllPartTypes ? activePartTypes : activePartTypes.slice(0, 5);

    return (
      <div 
        className="bg-charcoal border border-oil-dark border-r-4 border-r-oil-dark rounded-md p-5 pb-6 space-y-6 shadow-xs font-sans text-left" 
        id="unified-filters-card"
      >
        {/* 1. Header with exact "FILTER BY" label and subtle line */}
        <div className="flex items-center gap-3 pb-1" id="filter-header-row">
          <span className="font-display font-black text-[11px] uppercase tracking-widest text-rust-copper select-none">
            FILTER BY
          </span>
          <div className="flex-grow h-px bg-oil-dark/60" />
        </div>

        {/* 2. Sort Order Priority (New #1) */}
        <div className="space-y-2.5 pt-0.5">
          <div 
            onClick={() => toggleSection('sort')} 
            className="flex items-center justify-between cursor-pointer pb-1.5 select-none group border-b border-oil-dark"
          >
            <span className="font-display text-base uppercase tracking-wider text-warm-gray group-hover:text-rust-copper transition-colors">
              Sort Order
            </span>

            {collapsedSections.sort ? (
              <ChevronRight className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            )}
          </div>
          {!collapsedSections.sort && (
             <div className="animate-fade-in pt-1">
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-steel-black border border-oil-dark rounded-lg py-2 px-3 text-sm text-base-cream focus:outline-none focus:border-rust-copper"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low - High</option>
                    <option value="price-high">Price: High - Low</option>
                    <option value="newest">Newest Listed</option>
                    <option value="mileage">Mileage: Low - High</option>
                    <option value="sellerRating">Seller Rating</option>
                </select>
             </div>
          )}
        </div>

        {/* 3. Part Category List Section */}
        <div className="space-y-2.5">
          <div 
            onClick={() => toggleSection('category')} 
            className="flex items-center justify-between cursor-pointer pb-1.5 select-none group border-b border-oil-dark"
          >
            <span className="font-display text-base uppercase tracking-wider text-warm-gray group-hover:text-rust-copper transition-colors">
              Part Category
            </span>
            {collapsedSections.category ? (
              <ChevronRight className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            )}
          </div>

          {!collapsedSections.category && (
            <div className="space-y-1.5 pt-1 animate-fade-in">
              {SYSTEMS_LIST.slice(0, showAllCategories ? SYSTEMS_LIST.length : 5).map((sysName) => {
                const isSystemActive = filters.system === sysName;
                const sysCount = getSystemPartCount(sysName);
                const Icon = getSystemIcon(sysName);
                const displayLabel = displaySystemName(sysName);

                return (
                  <div key={sysName} className="space-y-1">
                    {isSystemActive ? (
                      <div 
                        onClick={() => {
                          setAndSyncFilters(p => ({ ...p, system: '', category: '', partTypes: [] }));
                        }}
                        className="flex items-center justify-between p-2 rounded bg-steel-black border border-oil-dark text-base-cream transition-all cursor-pointer font-sans font-bold text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-5 h-5 bg-charcoal rounded-full flex items-center justify-center border border-oil-dark flex-shrink-0">
                            <Icon className="w-3.5 h-3.5 text-rust-copper stroke-[2.2]" />
                          </div>
                          <span className="truncate">{displayLabel}</span>
                        </div>
                        <span className="text-xs font-sans font-medium text-rust-copper bg-charcoal px-1.5 py-0.5 rounded-full select-none">
                          {sysCount.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <div 
                        onClick={() => {
                          setAndSyncFilters(p => ({ ...p, system: sysName, category: '', partTypes: [] }));
                        }}
                        className="flex items-center justify-between p-2 rounded hover:bg-steel-black/40 text-warm-gray transition-all cursor-pointer font-sans text-xs font-semibold"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-5 h-5 bg-steel-black/40 rounded-full flex items-center justify-center border border-oil-dark/60 flex-shrink-0">
                            <Icon className="w-3.5 h-3.5 text-warm-gray stroke-[1.8]" />
                          </div>
                          <span className="truncate text-warm-gray hover:text-base-cream">{displayLabel}</span>
                        </div>
                        <span className="text-xs font-sans font-normal text-warm-gray bg-steel-black/60 px-1.5 py-0.5 rounded-full select-none">
                          {sysCount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Expand assemblies directly underneath if selected Category for micro drill-down */}
                    {isSystemActive && (
                      <div className="pl-3.5 border-l-2 border-oil-dark ml-2.5 py-1 space-y-1 animate-fade-in bg-steel-black/30 rounded-r">
                        {Object.entries(SYSTEMS_TAXONOMY[sysName]?.assemblies || {}).map(([subName]) => {
                          const isSubActive = filters.category === subName;
                          const subCount = getSubsystemPartCount(sysName, subName);

                          return (
                            <div 
                              key={subName}
                              onClick={(e) => {
                                e.stopPropagation();
                                setAndSyncFilters(p => ({
                                  ...p,
                                  system: sysName,
                                  category: p.category === subName ? '' : subName,
                                  partTypes: []
                                }));
                              }}
                              className={`flex items-center justify-between p-1 rounded text-[10.5px] cursor-pointer transition-colors ${
                                isSubActive 
                                  ? 'text-rust-copper font-bold bg-steel-black/50' 
                                  : 'text-warm-gray hover:text-base-cream'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <FolderOpen className="w-3 h-3 text-warm-gray flex-shrink-0" />
                                <span className={isSubActive ? 'truncate text-rust-copper' : 'truncate'}>{subName}</span>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full select-none ${isSubActive ? 'text-rust-copper bg-steel-black font-medium' : 'text-warm-gray bg-steel-black/30'}`}>
                                {subCount}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {SYSTEMS_LIST.length > 5 && (
                <button 
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-warm-gray hover:text-rust-copper transition-colors pt-1 cursor-pointer select-none"
                >
                  <span className="font-serif font-bold">{showAllCategories ? '−' : '+'}</span>
                  <span>{showAllCategories ? 'Show less' : 'Show more'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4. Part Type Checkboxes Section */}
        <div className="space-y-2.5">
          <div 
            onClick={() => toggleSection('partType')} 
            className="flex items-center justify-between cursor-pointer pb-1.5 select-none group border-b border-oil-dark"
          >
            <span className="font-display text-base uppercase tracking-wider text-warm-gray group-hover:text-rust-copper transition-colors">
              Part Type
            </span>
            {collapsedSections.partType ? (
              <ChevronRight className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            )}
          </div>

          {!collapsedSections.partType && (
            <div className="space-y-1 pt-1 animate-fade-in">
              {visiblePartTypes.map((ptName) => {
                const isPtActive = filters.partTypes.includes(ptName);
                const ptCount = getPartTypeGeneralCount(ptName);

                return (
                  <div 
                    key={ptName}
                    onClick={() => togglePartType(ptName)}
                    className="flex items-center justify-between w-full py-1.5 text-xs text-zinc-200 hover:text-white font-medium cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isPtActive 
                          ? 'bg-rust-copper border-rust-copper text-white' 
                          : 'bg-steel-black border-oil-dark text-transparent hover:border-warm-gray'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3.5]" />
                      </div>
                      <span className={isPtActive ? 'font-bold text-rust-copper' : 'text-zinc-300 font-normal'}>
                        {ptName}
                      </span>
                    </div>
                    <span className={`text-xs font-sans px-1.5 py-0.5 rounded-full select-none ${isPtActive ? 'text-rust-copper bg-steel-black font-medium' : 'text-warm-gray bg-steel-black/30'}`}>
                      {ptCount.toLocaleString()}
                    </span>
                  </div>
                );
              })}

              {activePartTypes.length > 5 && (
                <button 
                  onClick={() => setShowAllPartTypes(!showAllPartTypes)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-warm-gray hover:text-rust-copper transition-colors pt-1.5 cursor-pointer select-none"
                >
                  <span className="font-serif font-bold">{showAllPartTypes ? '−' : '+'}</span>
                  <span>{showAllPartTypes ? 'Show less' : 'Show more'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 5. Price Range Slider & Dual Inputs Section */}
        <div className="space-y-2.5">
          <div 
            onClick={() => toggleSection('price')} 
            className="flex items-center justify-between cursor-pointer pb-1.5 select-none group border-b border-oil-dark"
          >
            <span className="font-display text-base uppercase tracking-wider text-warm-gray group-hover:text-rust-copper transition-colors">
              Price Range
            </span>
            {collapsedSections.price ? (
              <ChevronRight className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            )}
          </div>

          {!collapsedSections.price && (
            <div className="space-y-4 pt-2.5 pb-1 animate-fade-in">
              {/* Custom dual slider track with precise positioning representation */}
              <div className="relative w-full h-1 bg-steel-black rounded-lg">
                <div 
                  className="absolute h-full bg-rust-copper rounded-lg"
                  style={{
                    left: `${(filters.priceRange[0] / 500) * 100}%`,
                    right: `${100 - (filters.priceRange[1] / 500) * 100}%`
                  }}
                />
                
                {/* Min Slider handle */}
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  value={filters.priceRange[0]}
                  onChange={(e) => {
                    const val = Math.min(parseInt(e.target.value), filters.priceRange[1] - 10);
                    handlePriceChange(0, val);
                  }}
                  className="absolute pointer-events-none appearance-none bg-transparent w-full h-1 top-0 left-0 outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rust-copper [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-xs"
                />

                {/* Max Slider handle */}
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  value={filters.priceRange[1]}
                  onChange={(e) => {
                    const val = Math.max(parseInt(e.target.value), filters.priceRange[0] + 10);
                    handlePriceChange(1, val);
                  }}
                  className="absolute pointer-events-none appearance-none bg-transparent w-full h-1 top-0 left-0 outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rust-copper [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rust-copper [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                />
              </div>

              {/* Box inputs underneath with arrows and divider icon */}
              <div className="flex items-center justify-between gap-2 pt-1">
                {/* Min box */}
                <div className="flex-1 bg-steel-black border border-oil-dark rounded-lg px-2.5 py-1.5 flex items-center justify-between focus-within:ring-1 focus-within:ring-rust-copper/25 transition-all">
                  <span className="text-warm-gray font-sans text-[11px] font-bold">$</span>
                  <input 
                    type="number" 
                    value={filters.priceRange[0]}
                    min="0"
                    max="500"
                    onChange={(e) => {
                      const val = Math.min(Math.max(parseInt(e.target.value) || 0, 0), filters.priceRange[1] - 1);
                      handlePriceChange(0, val);
                    }}
                    className="w-full text-right bg-transparent text-xs text-base-cream font-bold focus:outline-none border-none p-0 focus:ring-0 cursor-pointer [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="flex flex-col ml-1.5 select-none text-[6.5px] leading-tight text-warm-gray">
                    <span>▲</span>
                    <span>▼</span>
                  </div>
                </div>

                {/* Separator / Division glyph */}
                <span className="text-warm-gray font-medium text-xs font-serif select-none px-0.5">÷</span>

                {/* Max box */}
                <div className="flex-1 bg-steel-black border border-oil-dark rounded-lg px-2.5 py-1.5 flex items-center justify-between focus-within:ring-1 focus-within:ring-rust-copper/25 transition-all">
                  <span className="text-warm-gray font-sans text-[11px] font-bold">$</span>
                  <input 
                    type="number" 
                    value={filters.priceRange[1]}
                    min="0"
                    max="500"
                    onChange={(e) => {
                      const val = Math.max(Math.min(parseInt(e.target.value) || 500, 500), filters.priceRange[0] + 1);
                      handlePriceChange(1, val);
                    }}
                    className="w-full text-right bg-transparent text-xs text-base-cream font-bold focus:outline-none border-none p-0 focus:ring-0 cursor-pointer [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-warm-gray font-sans text-[9px] font-bold ml-0.5 select-none">+</span>
                  <div className="flex flex-col ml-1.5 select-none text-[6.5px] leading-tight text-warm-gray">
                    <span>▲</span>
                    <span>▼</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. Grade / Condition Checklist Section */}
        <div className="space-y-2.5">
          <div 
            onClick={() => toggleSection('condition')} 
            className="flex items-center justify-between cursor-pointer pb-1.5 select-none group border-b border-oil-dark"
          >
            <span className="font-display text-base uppercase tracking-wider text-warm-gray group-hover:text-rust-copper transition-colors">
              Condition
            </span>
            {collapsedSections.condition ? (
              <ChevronRight className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            )}
          </div>

          {!collapsedSections.condition && (
            <div className="space-y-1 pt-1 animate-fade-in">
              {([
                { id: 'Used OEM', label: 'Used OEM' },
                { id: 'OEM Original', label: 'OEM Original' },
                { id: 'Excellent', label: 'Excellent (Like New)' },
                { id: 'Good', label: 'Good' },
                { id: 'For Parts', label: 'For Parts' }
              ] as { id: PartCondition; label: string }[]).map((condItem) => {
                const isSelected = filters.conditions.includes(condItem.id);
                const count = getConditionCount(condItem.id);

                return (
                  <div 
                    key={condItem.id}
                    onClick={() => toggleCondition(condItem.id)}
                    className="flex items-center justify-between w-full py-1.5 text-xs text-zinc-200 hover:text-white font-medium cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-rust-copper border-rust-copper text-white' 
                          : 'bg-steel-black border-oil-dark text-transparent hover:border-warm-gray'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3.5]" />
                      </div>
                      <span className={isSelected ? 'font-bold text-rust-copper' : 'text-zinc-300 font-normal'}>
                        {condItem.label}
                      </span>
                    </div>
                    <span className="text-xs font-sans px-1.5 py-0.5 rounded-full select-none text-warm-gray bg-steel-black/30">
                      {count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 7. Seller Type Section */}
        <div className="space-y-2.5">
          <div 
            onClick={() => toggleSection('seller')} 
            className="flex items-center justify-between cursor-pointer pb-1.5 select-none group border-b border-oil-dark"
          >
            <span className="font-display text-base uppercase tracking-wider text-warm-gray group-hover:text-rust-copper transition-colors">
              Seller Type
            </span>
            {collapsedSections.seller ? (
              <ChevronRight className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            )}
          </div>

          {!collapsedSections.seller && (
            <div className="space-y-1 pt-1 animate-fade-in">
              {[
                { id: 'all', label: 'All Sellers' },
                { id: 'trusted', label: 'Trusted Sellers' }
              ].map((item) => {
                const isSelected = filters.sellerType === item.id;
                const count = getSellerTypeCount(item.id as 'all' | 'trusted');

                return (
                  <div 
                    key={item.id}
                    onClick={() => setAndSyncFilters((p): SearchFilters => ({ ...p, sellerType: item.id as 'all' | 'trusted' }))}
                    className="flex items-center justify-between w-full py-1.5 text-xs text-zinc-200 hover:text-white font-medium cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-rust-copper border-rust-copper text-white' 
                          : 'bg-steel-black border-oil-dark text-transparent hover:border-warm-gray'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3.5]" />
                      </div>
                      <span className={isSelected ? 'font-bold text-rust-copper' : 'text-zinc-300 font-normal'}>
                        {item.label}
                      </span>
                    </div>
                    <span className={`text-xs font-sans px-1.5 py-0.5 rounded-full select-none ${isSelected ? 'text-rust-copper bg-steel-black font-medium' : 'text-warm-gray bg-steel-black/30'}`}>
                      {count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Vehicle Fitment (New #2) */}
        <div className="space-y-2.5 pt-0.5">
          <div 
            onClick={() => toggleSection('fitment')} 
            className="flex items-center justify-between cursor-pointer pb-1.5 select-none group border-b border-oil-dark"
          >
            <span className="font-display text-base uppercase tracking-wider text-warm-gray group-hover:text-rust-copper transition-colors">
              Vehicle Fitment
            </span>
            <button className="text-[9px] text-warm-gray hover:text-rust-copper underline" onClick={(e) => { e.stopPropagation(); /* Clear fitment logic */ }}>Clear</button>
            {collapsedSections.fitment ? (
              <ChevronRight className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            )}
          </div>

          {!collapsedSections.fitment && (
            <div className="space-y-3 pt-1 animate-fade-in">
              {/* Make */}
              <div>
                <label className="block text-[8.5px] uppercase font-mono text-warm-gray font-bold mb-1 select-none">Vehicle Make</label>
                <select 
                  value={filters.fitmentMake || 'All Makes'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAndSyncFilters(p => ({ ...p, fitmentMake: val, fitmentModel: 'All Models' }));
                  }}
                  className="w-full bg-steel-black border border-oil-dark rounded-lg py-1.5 px-2.5 text-xs text-base-cream focus:outline-none focus:border-rust-copper transition-all cursor-pointer font-sans"
                >
                  {getUniqueMakes().map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-[8.5px] uppercase font-mono text-warm-gray font-bold mb-1 select-none">Vehicle Model</label>
                <select 
                  value={filters.fitmentModel || 'All Models'}
                  disabled={!filters.fitmentMake || filters.fitmentMake === 'All Makes'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAndSyncFilters(p => ({ ...p, fitmentModel: val }));
                  }}
                  className="w-full bg-steel-black border border-oil-dark rounded-lg py-1.5 px-2.5 text-xs text-base-cream disabled:opacity-50 focus:outline-none focus:border-rust-copper transition-all cursor-pointer font-sans"
                >
                  {getUniqueModels().map(md => (
                    <option key={md} value={md}>{md}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-[8.5px] uppercase font-mono text-warm-gray font-bold mb-1 select-none">Production Year</label>
                <select 
                  value={filters.fitmentYear || 'All Years'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAndSyncFilters(p => ({ ...p, fitmentYear: val }));
                  }}
                  className="w-full bg-steel-black border border-oil-dark rounded-lg py-1.5 px-2.5 text-xs text-base-cream focus:outline-none focus:border-rust-copper transition-all cursor-pointer font-sans"
                >
                  {getUniqueYears().map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Engine */}
              <div>
                <label className="block text-[8.5px] uppercase font-mono text-warm-gray font-bold mb-1 select-none">Engine Spec</label>
                <select 
                  value={filters.fitmentEngine || 'All Engines'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAndSyncFilters(p => ({ ...p, fitmentEngine: val }));
                  }}
                  className="w-full bg-steel-black border border-oil-dark rounded-lg py-1.5 px-2.5 text-xs text-base-cream focus:outline-none focus:border-rust-copper transition-all cursor-pointer font-sans"
                >
                  {getUniqueEngines().map(en => (
                    <option key={en} value={en}>{en}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 9. Sort Order Priority Section */}
        <div className="space-y-2.5 pt-0.5">
          <div 
            onClick={() => toggleSection('sort')} 
            className="flex items-center justify-between cursor-pointer pb-1.5 select-none group border-b border-oil-dark"
          >
            <span className="font-display text-sm uppercase tracking-wider text-warm-gray group-hover:text-rust-copper transition-colors">
              Sort order priority
            </span>
            {collapsedSections.sort ? (
              <ChevronRight className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            )}
          </div>

          {!collapsedSections.sort && (
            <div className="pt-1 animate-fade-in">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-steel-black border border-oil-dark rounded-lg py-2 px-2.5 text-xs text-base-cream focus:outline-none focus:border-rust-copper transition-all cursor-pointer font-sans font-bold uppercase tracking-wider"
              >
                <option value="relevance">Relevance Index</option>
                <option value="price-low">Price: Low-to-High</option>
                <option value="price-high">Price: High-to-Low</option>
                <option value="mileage">Mileage: Lowest First</option>
              </select>
            </div>
          )}
        </div>

        {/* 10. Bottom Actions Footer mapping to Screenshot buttons */}
        <div className="pt-5 border-t border-oil-dark flex flex-col gap-3 w-full" id="filter-card-footer">
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-center font-mono text-[9px] uppercase tracking-widest font-black text-warm-gray hover:text-red-505 transition-colors cursor-pointer select-none"
          >
            Clear All
          </button>
        </div>

      </div>
    );
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen font-sans" id="id-catalog-root">
      <div className="max-w-7xl mx-auto px-4 py-8" id="catalog-container">
      
      {/* 1. Breadcrumbs Indicator */}
      <div className="text-xs text-zinc-500 flex items-center gap-1 mb-4 select-none">
        <span className="hover:underline cursor-pointer" onClick={clearAllFilters}>Home</span>
        <span>&gt;</span>
        <span className="hover:underline cursor-pointer" onClick={() => setAndSyncFilters(p => ({ ...p, system: '', category: '', partTypes: [] }))}>All Parts</span>
        {filters.system && (
          <>
            <span>&gt;</span>
            <span 
              className={`hover:underline cursor-pointer ${!filters.category ? 'font-semibold text-zinc-700' : ''}`}
              onClick={() => setAndSyncFilters(p => ({ ...p, category: '', partTypes: [] }))}
            >
              {filters.system}
            </span>
          </>
        )}
        {filters.category && (
          <>
            <span>&gt;</span>
            <span className="font-semibold text-zinc-700 uppercase">{filters.category}</span>
          </>
        )}
      </div>

      {/* 1. Page Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2 border-t border-zinc-100/60">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-[#1E1E1E] uppercase tracking-tight leading-none">
            {filters.category 
              ? `${filters.category}` 
              : filters.system 
                ? `${filters.system}` 
                : 'All Available Auto Parts'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1.5 font-sans">
            Displaying <span className="font-mono font-bold text-rust-copper">{matchingParts.length}</span> matching OEM parts listings
          </p>
        </div>

        {/* Sort and View controls (Desktop) / Filter button (Mobile) */}
        <div className="flex items-center gap-3">
          {/* Mobile Refine button */}
          <Sheet>
            <SheetTrigger
              className="lg:hidden bg-zinc-900 border border-zinc-800 hover:border-rust-copper text-white hover:text-rust-copper tracking-wider text-xs font-bold uppercase py-2 px-3 rounded transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:translate-y-0.5"
            >
              <Sliders className="w-3 h-3 text-[#C4A882]" />
              <span>Filter</span>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#1A1A1A] border-r border-[#8B6239]/30 p-0">
              <SheetTitle className="sr-only">Filters</SheetTitle>
              <ScrollArea className="h-[calc(100vh-20px)] p-6">
                {renderMainFilterContent(true)}
              </ScrollArea>
            </SheetContent>
          </Sheet>
          
          <div className="hidden lg:flex items-center gap-3">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-100 border border-zinc-200 rounded-lg py-2 px-3 text-sm text-zinc-800 focus:outline-none focus:border-rust-copper"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-low">Price: Low - High</option>
              <option value="price-high">Price: High - Low</option>
              <option value="newest">Newest Listed</option>
              <option value="mileage">Mileage: Low - High</option>
            </select>

            <div className="flex items-center bg-zinc-100 rounded-lg p-1 border border-zinc-200">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips Row */}
      {activeFiltersList.length > 0 && (
         <div className="flex flex-wrap items-center gap-2 mb-6">
            {activeFiltersList.filter(f => f.type !== 'sort').map((filt, idx) => (
                  <span 
                    key={idx} 
                    className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs rounded-full px-3 py-1 whitespace-nowrap"
                  >
                    {filt.label}
                    {filt.clear && (
                      <X className="w-3 h-3 cursor-pointer hover:text-rust-copper transition-colors" onClick={(e) => { e.stopPropagation(); filt.clear?.(); }} />
                    )}
                  </span>
            ))}
             <button onClick={clearAllFilters} className="text-xs text-zinc-500 underline hover:text-rust-copper">
                Clear All
            </button>
         </div>
      )}

      {/* 3. Main Catalog Feed Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="catalog-main-layout">
        
        {/* Left Persistent Sidebar (Fixed narrow width on large screens) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6" id="catalog-desktop-sidebar">
          {renderMainFilterContent(false)}
        </aside>

        {/* Right Catalog Feed List/Grid section - Constrained width */}
        <section className="col-span-12 lg:col-span-9 font-sans animate-fade-in max-w-full pb-24 md:pb-8" id="catalog-parts-feed">
          <div className="max-w-4xl lg:max-w-none">
          {matchingParts.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[20px] lg:gap-[24px] animate-fade-in" : "space-y-4 animate-fade-in"}>
              {matchingParts.map((part) => {
                const partSeller = MOCK_SELLERS.find((s) => s.id === part.sellerId);
                const cleanedTitle = part.title.replace(/^\d{4}\s+/, '');
                const yearMatch = part.subtitle.match(/\d{4}-\d_4}/) || part.subtitle.match(/\d{4}/);
                const years = yearMatch ? yearMatch[0] : '1981–1987';
                const engines = part.fits.replace(/\s+Engines?/gi, '').trim();
                const consolidatedSubtitle = `${years} • ${engines}`;
                const isFavorite = favorites.includes(part.id);

                if (viewMode === 'grid') {
                  const hasImage = !!partThumbnails[part.id];
                  return (
                    <div
                      key={part.id}
                      onClick={() => onSelectPart(part.id)}
                      className="bg-white border border-rust-copper/15 rounded-[8px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-[2px] transition-all duration-200 cursor-pointer group flex flex-row sm:flex-col h-full"
                      id={`catalog-grid-card-${part.id}`}
                    >
                      {/* 2. Image Area (Top Section - responsive aspect / height) */}
                      <div className="h-[180px] lg:h-[200px] w-1/3 sm:w-full relative overflow-hidden bg-[#2D2D2D] shrink-0 flex items-center justify-center">
                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                          <span className="font-display uppercase tracking-[0.2em] text-[1rem] sm:text-[1.5rem] text-white/[0.06]">PARTSPEDDLE</span>
                        </div>

                        {hasImage ? (
                          <img 
                            src={partThumbnails[part.id]} 
                            alt={part.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 relative z-10"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 sm:gap-2 relative z-10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#4A4A4A] flex items-center justify-center bg-transparent">
                              <Disc className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A4A4A]" />
                            </div>
                            <span className="font-sans text-[0.6rem] sm:text-[0.75rem] text-[#8A8A8A] font-normal tracking-[0.1em] uppercase">PHOTO COMING SOON</span>
                          </div>
                        )}

                        {/* 4. Favorite Button (Image Overlay) */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(part.id); }}
                          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 border border-black/10 flex items-center justify-center hover:bg-white hover:scale-110 transition-all z-20 shadow-sm"
                        >
                          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 stroke-[1.5] ${isFavorite ? 'fill-rust-copper text-rust-copper' : 'text-[#1E1E1E]'}`} />
                        </button>

                        {/* 3. Condition Badge (Image Overlay) */}
                        <span className={`absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-[6px] py-[2px] sm:px-[10px] sm:py-[4px] rounded-[4px] text-[0.6rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.05em] text-white z-20 shadow-sm ${getConditionColor(part.condition)}`}>
                          {part.condition}
                        </span>
                      </div>

                      {/* 5. Content Area (Below Image - scaled padding and width) */}
                      <div className="w-2/3 sm:w-full p-4 flex flex-col flex-grow bg-white">
                        <div className="flex items-center gap-[6px] mb-[6px]">
                          {(() => {
                            const IconComp = getSystemIcon(part.system);
                            return <IconComp className="w-[16px] h-[16px] text-rust-copper" />;
                          })()}
                          <span className="text-[0.8rem] text-rust-copper font-semibold uppercase tracking-[0.05em]">{part.system}</span>
                        </div>
                        <h2 className="font-display font-bold text-[1.25rem] text-[#1E1E1E] leading-[1.2] mb-[6px] line-clamp-2 h-12">
                          {cleanedTitle}
                        </h2>
                        <p className="text-[14px] text-[#8A8A8A] font-sans mb-[12px] line-clamp-1">{consolidatedSubtitle}</p>
                        
                        {part.mileage && (
                          <div className="mb-[14px]">
                            <span className="inline-block bg-[#F5F0EB] border border-[#E5E0DB] rounded-[4px] px-[10px] py-[4px] text-[0.8rem] text-[#3D3632] font-normal">
                              {typeof part.mileage === 'number' ? `${part.mileage.toLocaleString()} mi` : 'Tested'}
                            </span>
                          </div>
                        )}

                        {/* 5.5 Divider */}
                        <div className="h-px bg-[#E5E0DB] w-full mt-auto mb-[14px]" />
                        
                        {/* 5.6 Price & Seller Row */}
                        <div className="flex items-center justify-between">
                          <span className="text-[1.5rem] font-display font-bold text-[#1E1E1E] leading-none">
                            ${part.price.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[0.875rem] text-[#1E1E1E] font-sans">{partSeller?.name?.split(' ')[0]}</span>
                            <Star className="w-[14px] h-[14px] text-rust-copper fill-rust-copper" /> 
                            <span className="text-[0.875rem] text-[#1E1E1E] font-sans font-bold">{partSeller?.rating}</span>
                          </div>
                        </div>
                        
                        <div className="text-[0.8rem] text-[#8A8A8A] font-sans mt-[4px] truncate">
                          Ships from {partSeller?.location || 'Detroit, MI'} • Courier Ground
                        </div>
                      </div>
                    </div>
                  );
                }

                const hasImage = !!partThumbnails[part.id];
                return (
                  <div
                    key={part.id}
                    onClick={() => onSelectPart(part.id)}
                    className="bg-white border border-rust-copper/15 rounded-[8px] p-4 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center cursor-pointer hover:border-rust-copper transition-all duration-200 animate-fade-in shadow-[0_2px_8px_rgba(0,0,0,0.08)] w-full group"
                    id={`catalog-card-${part.id}`}
                  >
                    <div className="w-full sm:w-48 aspect-video relative overflow-hidden bg-[#2D2D2D] rounded-lg shrink-0 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                         <span className="font-display uppercase tracking-widest text-[1rem] text-white/5 opacity-60">PARTSPEDDLE</span>
                      </div>
                      {hasImage ? (
                        <img 
                          src={partThumbnails[part.id]} 
                          alt={part.title} 
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105`}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Disc className="w-8 h-8 text-[#4A4A4A]" />
                      )}
                      
                      <span className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-sm text-[0.65rem] font-bold uppercase tracking-wider text-white z-10 shadow-sm ${getConditionColor(part.condition)}`}>
                        {part.condition}
                      </span>
                    </div>
                    
                    <div className="flex-grow space-y-1.5 py-1">
                      <div className="flex items-center gap-1 text-[0.75rem] text-rust-copper font-semibold uppercase tracking-wider">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{part.system}</span>
                      </div>
                      <h2 className="font-display font-bold text-base sm:text-xl text-[#1E1E1E] leading-tight">{cleanedTitle}</h2>
                      <p className="text-xs sm:text-sm text-[#8A8A8A] font-medium">{consolidatedSubtitle}</p>
                      
                      <div className="flex items-center gap-3 pt-1">
                        {part.mileage && (
                          <span className="bg-[#F5F0EB] px-2 py-0.5 rounded text-[11px] text-[#3D3632] border border-[#E5E0DB]">
                            {typeof part.mileage === 'number' ? `${part.mileage.toLocaleString()} mi` : 'Tested'}
                          </span>
                        )}
                        <div className="text-[12px] text-[#1E1E1E] font-medium flex items-center gap-1.5">
                          <span>{partSeller?.name}</span>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-rust-copper fill-rust-copper" /> 
                            <span className="font-bold">{partSeller?.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto sm:border-l sm:border-zinc-200 sm:pl-6 flex flex-row sm:flex-col gap-2 items-center sm:items-end justify-between pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-2xl font-display font-bold text-[#1E1E1E]">${part.price.toFixed(2)}</span>
                        <span className="text-[11px] text-[#8A8A8A] font-sans">Ships from {partSeller?.location || 'Detroit, MI'}</span>
                      </div>
                      <button className="text-rust-copper text-[10px] font-black uppercase tracking-wider bg-rust-copper/5 px-4 py-2 rounded-md border border-rust-copper/20 hover:bg-rust-copper hover:text-white transition-all cursor-pointer">VIEW DETAILS</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-zinc-200 rounded max-w-md mx-auto space-y-4 font-sans shadow-xs">
              <AlertTriangle className="w-12 h-12 text-rust-copper mx-auto animate-bounce" />
              <h3 className="font-display text-lg font-bold uppercase text-zinc-850">Empty Inventory Match</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                We couldn't locate any auto parts matches inside this yard matrix. Try modifying your dynamic search query, selecting another category, or resting fitments.
              </p>
              <button 
                onClick={clearAllFilters}
                className="bg-rust-copper hover:bg-[#8B6239] text-white text-xs font-display font-extrabold uppercase py-3 px-8 rounded-sm transition-all shadow-md active:translate-y-0.5"
              >
                Reset Search Filters
              </button>
            </div>
          )}
          </div>
        </section>

      </div>
      </div>
    </div>
  );
}
