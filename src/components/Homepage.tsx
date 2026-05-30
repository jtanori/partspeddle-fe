import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronRight, Star, Heart, SlidersHorizontal, ArrowUpRight, Award, ShieldAlert, Sparkles, AlertCircle, Sparkle, Cog, Compass, Disc, Zap, Car, Armchair, ShieldCheck, Wrench } from 'lucide-react';
import { CATEGORIES, MOCK_PARTS, MOCK_SELLERS, algoliaMock } from '../services/db';
import { Part, Seller, PARTS_FALLBACK_IMAGE } from '../types';
import LiveSearchDropdown from './LiveSearchDropdown';

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
      return Cog;
  }
};
// @ts-ignore
import hero1 from '../assets/images/hero_1.png';
// @ts-ignore
import hero2 from '../assets/images/hero_2.png';
// @ts-ignore
import hero3 from '../assets/images/hero_3.png';
// @ts-ignore
import hero4 from '../assets/images/hero_4.png';
// @ts-ignore
import hero5 from '../assets/images/hero_5.png';

interface HomepageProps {
  onSearch: (args: { query: string; category: string }) => void;
  onSelectPart: (partId: string) => void;
  onCategoryClick: (catName: string) => void;
  onOpenTour: () => void;
  onViewSystems: () => void;
  onOpenSearchModal?: (initialQuery?: string) => void;
  user: any;
  userRole: 'buyer' | 'seller';
  onChangeUserRole?: (role: 'buyer' | 'seller') => void;
  onChangeView?: (view: string) => void;
  onSetSellerTab?: (tab: 'listings' | 'create' | 'settings' | 'snap') => void;
}

const HERO_BACKGROUNDS = [
  {
    id: 'hero2',
    url: hero2,
    title: 'Salvage Sunset',
    desc: 'Active salvage yard stacks'
  },
  {
    id: 'hero3',
    url: hero3,
    title: 'Tractor Repair Yard',
    desc: 'Iron Horse agricultural repair'
  },
  {
    id: 'hero4',
    url: hero4,
    title: 'Muscle Car Shop',
    desc: 'Vintage dodge restoration workshop'
  },
  {
    id: 'hero5',
    url: hero5,
    title: 'Repair Garage',
    desc: 'Pre-vetted mechanical diagnostic deck'
  }
];

export default function Homepage({ 
  onSearch, 
  onSelectPart, 
  onCategoryClick, 
  onOpenTour, 
  onViewSystems, 
  onOpenSearchModal,
  user,
  userRole = 'buyer',
  onChangeUserRole,
  onChangeView,
  onSetSellerTab
}: HomepageProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All Parts');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeBgIndex, setActiveBgIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isHoveredDropdown, setIsHoveredDropdown] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 16000); // Cycle every 16 seconds for a slower, more deliberate transition sequence
    return () => clearInterval(timer);
  }, []);

  const toggleFavorite = (partId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(partId)) {
      setFavorites(favorites.filter((id) => id !== partId));
    } else {
      setFavorites([...favorites, partId]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query, category });
  };

  const handleQuickCategory = (catId: string) => {
    onCategoryClick(catId);
  };

  // Sorter helpers for mock assets
  const getConditionColor = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('new') || c.includes('oem original') || c.includes('original')) {
      return 'bg-rust-copper text-steel-black font-bold';
    }
    if (c.includes('excellent')) {
      return 'bg-sage-green text-steel-black font-bold';
    }
    if (c.includes('good')) {
      return 'bg-warm-sand text-steel-black font-bold';
    }
    return 'bg-bronze text-base-cream font-semibold';
  };

  // Mock static visuals list representing category thumbnails
  const inlineCategoryImages = [
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=350', // Engine Block / Parts
    'https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?auto=format&fit=crop&q=80&w=350', // Transmission Gears inside casing
    'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=350', // Suspension Strut / Shock coil
    'https://images.unsplash.com/photo-1606577924006-27d39b132af2?auto=format&fit=crop&q=80&w=350', // Slotted Brake Disc & Caliper
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=350', // Steering linkages / gears
    'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&q=80&w=350'  // Alternator Electrical / wiring bay
  ];

  // Mock visual cards for popular stores (expanded to 7 items to perfectly match seeded MOCK_SELLERS size!)
  const sellerImages = [
    'https://images.unsplash.com/photo-1532585078488-03b0ff297fea?auto=format&fit=crop&q=80&w=300', // Rusty Acres Yard / stacks
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300', // Backroad Workshop / casings
    'https://images.unsplash.com/photo-1517524006129-4a3a3eac48cd?auto=format&fit=crop&q=80&w=300', // Midwest Steel grilles stack
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=300', // Old Iron block bench
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=300', // Southern Axles lift
    'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=300', // Twin Pines Import Yard
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=300'  // North Flow Salvage
  ];

  // Overlay listings representations for each seller (expanded to 7 items to prevent index mismatches!)
  const sellerListingsPreview = [
    ['Chevy C10 Alternator', 'GM V8 Starter', 'C1500 Grille Mold'],
    ['TH400 Transmission', 'Universal Torque Conv', 'Ford 31-S Axle'],
    ['F150 Door Shell', 'Bronco Body Panel', 'Scottsdale Fenders'],
    ['Holley 4160 Carb', 'Edelbrock Intake', 'Vintage Fuel Valve'],
    ['Ford 9" Rear End', 'Heavy Duty Leaf Springs', '4.1L Crankshaft'],
    ['Brembo Brake Calipers', 'Wilwood Brake Rotors', 'EBC Sport Pads'],
    ['Eibach Springs Set', 'Bilstein B6 Struts', 'Koni Sport Shocks']
  ];

  // Instant Autocomplete calculations
  const trimmed = query.toLowerCase().trim();
  const showInstantResults = trimmed.length >= 2;

  const instantMatchingParts = showInstantResults
    ? MOCK_PARTS.filter((p) => {
        return (
          p.title.toLowerCase().includes(trimmed) ||
          p.subtitle.toLowerCase().includes(trimmed) ||
          p.oemPartNumber.toLowerCase().includes(trimmed) ||
          p.partType.toLowerCase().includes(trimmed) ||
          p.fits.toLowerCase().includes(trimmed)
        );
      }).slice(0, 4)
    : [];

  const instantMatchingSellers = showInstantResults
    ? MOCK_SELLERS.filter((s) => {
        return (
          s.name.toLowerCase().includes(trimmed) ||
          s.location.toLowerCase().includes(trimmed) ||
          (s.specialty && s.specialty.toLowerCase().includes(trimmed))
        );
      }).slice(0, 3)
    : [];

  const partThumbnails: Record<string, string> = {
    '1100428': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=300', // 1987 alternator
    '1100429': 'https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?auto=format&fit=crop&q=80&w=300', // 1985 engine bay alternator wire detail
    '1100430': 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=300', // 1986 polished alternator casing
    '1100431': 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=300', // 1982 alternator core with patina
    '1100432': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=300', // 1981 non-charging alternator core
    'th400-trans': 'https://images.unsplash.com/photo-1504222014244-63be825126f5?auto=format&fit=crop&q=80&w=300', // TH400 transmission casing
    'holley-4160': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=300', // Holley carburetor mechanism
    'f150-door': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300', // Ford body panel door shell
    'ford9-rearend': 'https://images.unsplash.com/photo-1530047625168-4b18fa65f242?auto=format&fit=crop&q=80&w=300', // Ford 9-Inch heavy axle casing
    'brembo-caliper-red': 'https://images.unsplash.com/photo-1606577924006-27d39b132af2?auto=format&fit=crop&q=80&w=300', // red Brembo calipers
    'eibach-springs-sports': 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=300', // sports springs
    'wilwood-disc-rotors': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=300', // brake rotors
    'bilstein-b6-strut': 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=300', // Bilstein struts
    'custom-steering-wheel': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300', // wood steering wheel
    'edelbrock-manifold': 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&q=80&w=300', // intake manifold
    'msd-ignition-box': 'https://images.unsplash.com/photo-1532585078488-03b0ff297fea?auto=format&fit=crop&q=80&w=300' // MSD red ignition box
  };

  return (
    <div className="space-y-12">
      
      {/* 1. Dramatic Hero Section with Mechanic Background (Figure 3 Style) */}
      <section className="relative bg-[#0E0E0E] text-white py-12 px-4 md:py-20 overflow-hidden" id="hero-banner">
        
        {/* Real Cover Background Image with high-contrast presentation */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out pointer-events-none"
          style={{
            backgroundImage: `url("${hero1}")`,
            opacity: 0.55,
          }}
        />

        {/* Diagonal lighting gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent pointer-events-none"></div>

        {/* Hero Interactive Workspace Container */}
        <div className="max-w-7xl mx-auto relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-fade-in z-10">
          
          {/* Left Side: Emotional Conversion & Dual Conversion Card Dashboard */}
          <div className="md:col-span-8 lg:col-span-7 xl:col-span-6 space-y-6">
            
            <div className="space-y-3">
              <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-tight leading-none text-left">
                KEEP EQUIPMENT WORKING.<br />
                <span className="text-[#C4A882]">BUY. SELL. TRADE PARTS LOCALLY.</span>
              </h1>
              <p className="font-sans text-xs sm:text-sm text-zinc-350 max-w-lg leading-relaxed text-left">
                The marketplace for auto and farm parts — built for mechanics, enthusiasts, farmers, salvage yards, and independent sellers.
              </p>
            </div>

            {/* Dual Actions Column Grid Dashboard Card */}
            <div className="bg-zinc-950/75 backdrop-blur-md rounded-lg border border-zinc-900 p-5 shadow-2xl space-y-4 max-w-xl text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/80">
                
                {/* BUYERS Segment */}
                <div className="space-y-2.5 pr-0 sm:pr-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B87333]"></span>
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      FOR BUYERS
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    Locate hard-to-find components, verify fitment, and order safely from vetted yards.
                  </p>
                  <div className="flex flex-col gap-1.5 pt-1">
                    {/* Search Inventory Button */}
                    <button
                      onClick={() => onSearch({ query: '', category: 'All Parts' })}
                      className="w-full bg-[#1A1A1A] hover:bg-[#252525] border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded px-3 py-2 text-xs font-bold font-sans tracking-wide transition-all active:translate-y-[0.5px] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Search Inventory</span>
                    </button>
                  </div>
                </div>

                {/* SELLERS Segment */}
                <div className="space-y-2.5 pt-4 sm:pt-0 pl-0 sm:pl-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B87333]"></span>
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      FOR SELLERS
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    Clean out mechanical storage backlogs, list active dismantlers, and secure payouts.
                  </p>
                  <div className="flex flex-col gap-1.5 pt-1">
                    {/* Industrial Heavy Bronze CTA Option */}
                    <button
                      onClick={() => {
                        if (user) {
                          onChangeUserRole?.('seller');
                          onSetSellerTab?.('listings');
                          onChangeView?.('listings');
                        } else {
                          window.location.hash = '#signup?role=seller';
                          onChangeView?.('auth');
                        }
                      }}
                      className="w-full flex items-center justify-center border border-[#4d3119] border-t-[#8e6e4f] border-b-[#24170d] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_3px_rgba(0,0,0,0.65),0_1px_2px_rgba(0,0,0,0.35)] text-stone-100 hover:text-white rounded px-3 py-2 text-xs font-bold font-sans tracking-wide active:translate-y-[0.5px] transition-all cursor-pointer relative overflow-hidden"
                      style={{
                        backgroundImage: `linear-gradient(to bottom, rgba(139, 98, 57, 0.95), rgba(92, 62, 33, 0.98)), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='brushed'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.12 0.03' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0 0 0 0'/%3E%3C/filter%3E%3Cfilter id='rust'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.4 0 0 0 0 0.2 0 0 0 0 0.1 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23brushed)' opacity='0.45'/%3E%3Crect width='100%25' height='100%25' filter='url(%23rust)' opacity='0.35' mix-blend-mode='color-burn'/%3E%3C/svg%3E")`,
                        backgroundBlendMode: 'overlay',
                      }}
                    >
                      <span className="relative z-10">SELL PARTS</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Utility Link Footer */}
              <div className="pt-2 text-center border-t border-zinc-900/60">
                <button
                  type="button"
                  onClick={onOpenTour}
                  className="text-[11px] text-zinc-400 hover:text-[#B87333] transition-colors cursor-pointer font-sans inline-flex items-center gap-1 bg-transparent border-0"
                >
                  <span>How Peer-to-Peer Trading Works</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
                </button>
              </div>
            </div>

            {/* Marketplace Trust Signals below */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-w-xl text-left" id="tour-trust">
              <div className="flex items-center gap-1.5 bg-zinc-950/50 border border-zinc-900/40 p-2 rounded-xs">
                <Award className="w-4 h-4 text-[#B87333] flex-shrink-0" />
                <span className="text-[10.5px] text-zinc-300 font-sans tracking-wide font-medium">Verified Sellers</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-950/50 border border-zinc-900/40 p-2 rounded-xs">
                <Wrench className="w-4 h-4 text-[#B87333] flex-shrink-0" />
                <span className="text-[10.5px] text-zinc-300 font-sans tracking-wide font-medium">Farm Equipment</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-950/50 border border-zinc-900/40 p-2 rounded-xs">
                <Car className="w-4 h-4 text-[#B87333] flex-shrink-0" />
                <span className="text-[10.5px] text-zinc-300 font-sans tracking-wide font-medium">Auto Parts</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-950/50 border border-zinc-900/40 p-2 rounded-xs">
                <Compass className="w-4 h-4 text-[#B87333] flex-shrink-0" />
                <span className="text-[10.5px] text-zinc-300 font-sans tracking-wide font-medium">Local Pickup</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-950/50 border border-zinc-900/40 p-2 rounded-xs">
                <Disc className="w-4 h-4 text-[#B87333] flex-shrink-0" />
                <span className="text-[10.5px] text-zinc-300 font-sans tracking-wide font-medium">Nationwide Shipping</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-950/50 border border-zinc-900/40 p-2 rounded-xs">
                <ShieldCheck className="w-4 h-4 text-[#B87333] flex-shrink-0" />
                <span className="text-[10.5px] text-zinc-300 font-sans tracking-wide font-medium">Buyer Protection</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. Categorized Browse Grid (Figure 3 Style, 6 units) - Commented out
      <section className="max-w-7xl mx-auto px-4" id="tour-categories">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="font-display text-[#1E1E1E] text-2xl sm:text-3xl font-bold uppercase tracking-tight">
              Browse Parts by System
            </h2>
            <p className="text-xs text-zinc-500 font-sans">
              Hand-tested and ready to ship out of regional yards
            </p>
          </div>
          <button 
            onClick={onViewSystems} 
            className="text-xs uppercase tracking-wider font-display font-bold text-[#B87333] hover:text-[#8B6239] transition-colors"
          >
            View All Systems
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={cat.id}
              onClick={() => handleQuickCategory(cat.id)}
              className="bg-white border border-zinc-200 rounded overflow-hidden shadow-xs hover:shadow-lg hover:border-[#B87333] transition-all cursor-pointer group flex flex-col justify-between"
              id={`cat-card-${cat.id}`}
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-[#FCFAF7] to-[#F1EAE2] flex items-center justify-center border-b border-zinc-200/60 group-hover:from-[#F9F6F1] group-hover:to-[#E9DEC1]/20 transition-all duration-355 w-full h-13 sm:h-13 sm:w-20 sm:mx-auto sm:my-2 sm:rounded lg:w-full lg:h-15 lg:m-0 lg:rounded-none">
                <div 
                  className="absolute inset-0 opacity-[0.14] pointer-events-none mix-blend-multiply"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2500/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='%238B6239' fill-opacity='0.45'><circle cx='10' cy='15' r='1.5'/><circle cx='45' cy='10' r='1'/><circle cx='12' cy='45' r='0.8'/><circle cx='65' cy='25' r='2'/><circle cx='30' cy='55' r='1.2'/><circle cx='55' cy='50' r='1.8'/><circle cx='70' cy='65' r='1'/><path d='M 15 60 Q 18 58 20 62 T 25 60' stroke='%238B6239' stroke-width='0.5' fill='none'/><path d='M 50 30 Q 53 35 52 38' stroke='%238B6239' stroke-width='0.7' fill='none'/></g></svg>")`,
                    backgroundSize: '45px 45px'
                  }}
                />
                <div className="absolute w-20 h-20 bg-[#B87333] rounded-full filter blur-[20px] opacity-10 group-hover:opacity-15 group-hover:scale-125 transition-all duration-500"></div>
                {(() => {
                  const IconComp = getSystemIcon(cat.id);
                  return (
                    <IconComp className="w-7 h-7 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-[#B87333] group-hover:scale-105 transition-transform duration-300 stroke-[1.2] relative z-10" />
                  );
                })()}
              </div>
              <div className="p-2 sm:p-3 text-center lg:text-left">
                <h3 className="font-display text-xs lg:text-sm font-bold uppercase text-[#1E1E1E] leading-tight flex items-center justify-center lg:justify-between">
                  <span>{cat.name}</span>
                </h3>
                <span className="block text-[9px] text-zinc-400 font-sans mt-0.5 font-medium">{cat.count} listings</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      */}

      {/* 3. Horizontally Scrollable Featured Parts (Figure 6 Style) */}
      <section className="max-w-7xl mx-auto px-4" id="id-home-featured">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#1E1E1E]">
              Featured Parts Index
            </h2>
            <p className="text-xs text-zinc-500 font-sans">
              Inspected listings from our highest rated sellers
            </p>
          </div>
          <button 
            onClick={() => onCategoryClick('All Parts')} 
            className="text-sm uppercase tracking-wider font-display font-bold text-[#B87333] hover:text-[#C4A882] transition-colors flex items-center gap-1"
          >
            View All Parts
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Mobile horizontal scroll / Desktop responsive grid */}
        <div 
          className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 scrollbar-none sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6"
        >
          {MOCK_PARTS.map((part) => {
            const partSeller = MOCK_SELLERS.find((s) => s.id === part.sellerId);
            const cleanedTitle = part.title.replace(/^\d{4}\s+/, '');
            const yearMatch = part.subtitle.match(/\d{4}-\d{4}/) || part.subtitle.match(/\d{4}/);
            const years = yearMatch ? yearMatch[0] : '1981–1987';
            const engines = part.fits.replace(/\s+Engines?/gi, '').trim();
            const consolidatedSubtitle = `${years} • ${engines}`;
            return (
              <div
                key={part.id}
                onClick={() => onSelectPart(part.id)}
                className="w-[82%] sm:w-full flex-shrink-0 sm:flex-shrink snap-start bg-white border border-stone-800/10 rounded shadow-sm shadow-black/5 hover:shadow-xl hover:shadow-black/10 hover:border-[#B87333] transition-all flex flex-col justify-between cursor-pointer group"
                id={`part-featured-${part.id}`}
              >
                
                {/* Photo Header block */}
                <div className="aspect-video relative overflow-hidden bg-zinc-900 rounded-t">
                  <img 
                    src={partThumbnails[part.id] || PARTS_FALLBACK_IMAGE} 
                    alt={part.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-95"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = PARTS_FALLBACK_IMAGE;
                    }}
                  />
                  
                  {/* Save favorite toggle */}
                  <button 
                    onClick={(e) => toggleFavorite(part.id, e)}
                    className="absolute top-2 right-2 p-1.5 bg-[#FCFAF7]/85 backdrop-blur-xs rounded-full text-zinc-705 border border-stone-800/5 hover:text-red-500 transition-colors shadow"
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorites.includes(part.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>

                  {/* Condition Badge */}
                  <span className={`absolute bottom-2 left-2 text-[10px] font-display font-bold uppercase tracking-wider py-0.5 px-2 rounded-sm ${getConditionColor(part.condition)}`}>
                    {part.condition}
                  </span>
                </div>

                {/* Info parameters */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    {/* Tiny category tag */}
                    <div className="flex items-center gap-1 text-[10px] text-[#B87333] font-display font-semibold uppercase tracking-wider mb-1">
                      {(() => {
                        const IconComp = getSystemIcon(part.system);
                        return <IconComp className="w-3 h-3 stroke-[2.5]" />;
                      })()}
                      <span>{part.system}</span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-[#1E1E1E] tracking-tight group-hover:text-[#B87333] transition-colors line-clamp-1">
                      {cleanedTitle}
                    </h3>
                    <p className="text-sm text-stone-500 font-sans leading-relaxed">{consolidatedSubtitle}</p>
                    
                    {/* Basic specs tags - Only mileage chip displayed */}
                    {part.mileage && (
                      <div className="flex flex-wrap gap-1 pt-1.5 text-[9px] font-sans font-semibold uppercase">
                        <span className="bg-[#F5F0EB] px-1.5 py-0.5 rounded border border-zinc-200 text-zinc-500">
                          {typeof part.mileage === 'number' ? `${part.mileage.toLocaleString()} mi` : 'Tested'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Divider and Footer row */}
                  <div className="border-t border-[#1A1A1A]/10 pt-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-xl text-[#1E1E1E] leading-none" id={`price-label-${part.id}`}>
                        ${part.price.toFixed(2)}
                      </span>
                      <span className="font-sans text-[11px] text-zinc-700 font-bold tracking-tight">
                        {partSeller?.name ? partSeller.name.split(' ')[0] + ' Salvage' : 'Rusty Salvage'} ★ {partSeller?.rating || '4.8'}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-sans">
                      Ships from {partSeller?.location || 'Detroit, MI'} • Local pickup
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Popular Yards / Sellers List */}
      <section className="max-w-7xl mx-auto px-4" id="id-popular-sellers">
        <div className="space-y-1 mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#1E1E1E]">
            Popular Vetted Sellers
          </h2>
          <p className="text-xs text-zinc-500 font-sans">
            Regional yards committing to 1-day freight dispatch and 30-day warrant indexes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {MOCK_SELLERS.map((seller, idx) => (
            <div
              key={seller.id}
              className="bg-white border border-zinc-200 rounded p-4 shadow-xs relative flex flex-col justify-between hover:shadow-lg transition-all"
              id={`seller-card-${seller.id}`}
            >
              <div className="space-y-3">
                {/* Visual Cover snippet */}
                <div className="aspect-video relative rounded overflow-hidden bg-zinc-800">
                  <img 
                    src={sellerImages[idx]} 
                    alt={seller.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-2 left-2 text-[9px] bg-black/60 text-white font-mono px-1.5 py-0.5 rounded">
                    ★ VETTED YARD ★
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-base font-bold text-[#1E1E1E] leading-tight line-clamp-1">
                    {seller.name}
                  </h3>
                  <span className="block text-[10px] text-zinc-400 font-sans font-semibold uppercase">
                    {seller.location}
                  </span>
                </div>

                {/* Score panel */}
                <div className="space-y-1 pt-1 border-t border-zinc-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Yard Rating:</span>
                    <div className="flex items-center gap-0.5 text-zinc-700">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="font-mono font-bold">{seller.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Active Parts:</span>
                    <span className="font-mono font-bold text-[#B87333]">{seller.partCount} listings</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pb-1">
                    <span className="text-zinc-400">Spec Tags:</span>
                    <span className="font-sans font-medium text-emerald-700 text-right truncate max-w-[110px]">{seller.specialty}</span>
                  </div>
                </div>

                {/* Specific listings preview section – Show real parts in stock inside each card */}
                <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                  <span className="text-[9px] uppercase font-display font-black text-zinc-400 tracking-wider block">
                    In-Stock Specials:
                  </span>
                  <div className="flex flex-col gap-1">
                    {(sellerListingsPreview[idx] || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10.5px] text-zinc-700 bg-[#F5F0EB]/40 border border-zinc-200/50 py-1 px-2 rounded-sm hover:border-[#B87333]/35 transition-colors font-sans truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B87333] flex-shrink-0 animate-pulse"></span>
                        <span className="truncate font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Direct Query trigger */}
              <button 
                onClick={() => onCategoryClick('All Parts')}
                className="mt-4 w-full text-center text-[10px] font-display font-medium border border-zinc-200 hover:border-[#B87333] hover:text-[#B87333] py-2 rounded-sm transition-all"
              >
                BROWSE YARD INVENTORY
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Reassurance Banner */}
      <section className="bg-gradient-to-r from-[#1E1E1E] via-[#2D2D2D] to-[#3D3632] text-white p-8 rounded border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto select-none" id="tour-cta">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-widest text-[#C4A882]">
            Vetted Builder Guarantee index
          </h3>
          <p className="font-sans text-sm text-zinc-350 max-w-xl">
            We hold payments for 30 days. If the part doesn't fit standard vehicle parameters indicated inside our fitment catalog, get a full refund including shipping.
          </p>
        </div>
        <button 
          onClick={onOpenTour}
          className="bg-white/10 hover:bg-white/20 text-[#C4A882] hover:text-white font-display text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-sm border border-[#C4A882]/40 hover:border-white transition-all whitespace-nowrap"
          id="btn-footer-tour-trigger"
        >
          See How It Works
        </button>
      </section>

    </div>
  );
}
