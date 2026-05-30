import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Heart, CheckCircle2, ShieldCheck, Mail, SlidersHorizontal, ArrowRight, DollarSign, Lock, AlertTriangle, RefreshCw, Send, X } from 'lucide-react';
import { MOCK_SELLERS, MOCK_PARTS, offersMock } from '../services/db';
import { supabaseDb } from '../services/supabase-db';
import { Part, Seller, Offer, PARTS_FALLBACK_IMAGE } from '../types';
import { NegotiationModal } from './catalog/detail/NegotiationModal';

interface ProductDetailProps {
  partId: string;
  onBack: () => void;
  onAddToCart: (part: Part) => void;
  onSelectPart: (partId: string) => void;
}

export default function ProductDetail({ partId, onBack, onAddToCart, onSelectPart }: ProductDetailProps) {
  const [part, setPart] = useState<Part | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  // Component state
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [offerMessage, setOfferMessage] = useState("Hi builder! Submitting an offer for my vintage restorers stack.");
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [negotiationState, setNegotiationState] = useState<'idle' | 'sending' | 'replied'>('idle');

  useEffect(() => {
    let isCurrentFetch = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const partData = await supabaseDb.getPartById(partId);
        if (isCurrentFetch && partData) {
          setPart(partData);
          setOfferPrice(Math.round(partData.price * 0.85));
          const sellerData = await supabaseDb.getSellerById(partData.sellerId);
          if (isCurrentFetch) setSeller(sellerData);
        }
      } catch (err) {
        console.error('Failed to load part detail:', err);
      } finally {
        if (isCurrentFetch) setLoading(false);
      }
    };
    loadData();
    return () => { isCurrentFetch = false; };
  }, [partId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0EB]">
        <div className="w-8 h-8 border-4 border-[#B87333] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0EB] text-zinc-500 space-y-4">
        <AlertTriangle className="w-12 h-12 text-[#B87333]" />
        <h2 className="text-xl font-display font-bold uppercase">Part Not Found</h2>
        <button onClick={onBack} className="text-[#B87333] hover:underline uppercase text-sm font-bold">Back to Marketplace</button>
      </div>
    );
  }

  // Multi-angle imagery mapping for each specific part to keep illustrations fully themed
  const detailPartImages: Record<string, string[]> = {
    '1100428': [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800', // 1987 alternator
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517524006129-4a3a3eac48cd?auto=format&fit=crop&q=80&w=800'
    ],
    '1100429': [
      'https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?auto=format&fit=crop&q=80&w=800', // 1985 alternator bay detail
      'https://images.unsplash.com/photo-1517524006129-4a3a3eac48cd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800'
    ],
    '1100430': [
      'https://images.unsplash.com/photo-1627454823403-4905cfbc29eb?auto=format&fit=crop&q=80&w=800', // 1986 polished alternator cover
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800'
    ],
    '1100431': [
      'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=800', // 1982 alternator core
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517524006129-4a3a3eac48cd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800'
    ],
    '1100432': [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800', // 1981 bare alternator copper coil
      'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517524006129-4a3a3eac48cd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800'
    ],
    'th400-trans': [
      'https://images.unsplash.com/photo-1504222014244-63be825126f5?auto=format&fit=crop&q=80&w=800', // Transmission gears
      'https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1530047625168-4b18fa65f242?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800'
    ],
    'holley-4160': [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800', // Carburetor close-up
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=800'
    ],
    'f150-door': [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800', // Ford door panels
      'https://images.unsplash.com/photo-1532585078488-03b0ff297fea?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800'
    ],
    'ford9-rearend': [
      'https://images.unsplash.com/photo-1530047625168-4b18fa65f242?auto=format&fit=crop&q=80&w=800', // Heavy metal axle / casing
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517524006129-4a3a3eac48cd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1562620644-666e927f12bc?auto=format&fit=crop&q=80&w=800'
    ]
  };

  const inlinePartImages = detailPartImages[part.id] || detailPartImages['1100428'];

  const handleNextPhoto = () => {
    setActiveImageIdx((prev) => (prev + 1) % inlinePartImages.length);
  };

  const handlePrevPhoto = () => {
    setActiveImageIdx((prev) => (prev - 1 + inlinePartImages.length) % inlinePartImages.length);
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Process Live Mechanic Negotiations
  const triggerSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setNegotiationState('sending');
    const responseOffer = await offersMock.makeOffer(part.id, offerPrice, offerMessage);
    setActiveOffer(responseOffer);
    setNegotiationState('replied');
  };

  const getConditionColor = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('new') || c.includes('oem original') || c.includes('original')) {
      return 'bg-[#B87333] text-zinc-950 font-black border border-[#A25D1D]/20';
    }
    if (c.includes('excellent')) {
      return 'bg-[#7A8B6F] text-zinc-950 font-black';
    }
    if (c.includes('good')) {
      return 'bg-[#E9DEC1] text-zinc-950 font-bold';
    }
    return 'bg-[#8B6239] text-[#FCFAF8] font-semibold';
  };

  // Find related inventory (same system)
  const relatedParts = MOCK_PARTS.filter((p) => p.system === part.system && p.id !== part.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans space-y-12" id="tour-part-view">
      
      {/* 1. Header Navigation block */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-display font-black uppercase tracking-wider text-zinc-650 hover:text-[#B87333] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <span className="text-xs font-mono text-zinc-400 uppercase hidden sm:inline">
          Catalog stock status: <span className="text-emerald-700 font-bold">● In Stock (Shippable)</span>
        </span>
      </div>

      {/* 2. Main Page Scaffold layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side: Photo gallery & Sourced specifications block */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main Display frame */}
          <div className="relative rounded overflow-hidden aspect-video border border-zinc-200 bg-zinc-950 shadow flex items-center justify-center group">
            <img 
              src={inlinePartImages[activeImageIdx]} 
              alt={part.title} 
              className="w-full h-full object-cover brightness-95"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PARTS_FALLBACK_IMAGE;
              }}
            />

            {/* Carousel navigation triggers */}
            <button 
              onClick={handlePrevPhoto}
              className="absolute left-3 p-2 bg-black/60 hover:bg-[#B87333] text-white rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextPhoto}
              className="absolute right-3 p-2 bg-black/60 hover:bg-[#B87333] text-white rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Heart save badge */}
            <button 
              onClick={() => toggleFavorite(part.id)}
              className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white hover:text-red-500 transition-colors"
            >
              <Heart className={`w-4 h-4 ${favorites.includes(part.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </button>

            {/* Condition float */}
            <span className={`absolute bottom-4 left-4 text-xs font-display font-medium uppercase tracking-wider py-1 px-3.5 rounded-sm shadow-md ${getConditionColor(part.condition)}`}>
              {part.condition}
            </span>
          </div>

          {/* Thumbnail Rail */}
          <div className="grid grid-cols-4 gap-4" id="image-thumbnail-rail">
            {inlinePartImages.map((img, i) => (
              <div 
                key={i}
                onClick={() => setActiveImageIdx(i)}
                className={`aspect-video rounded overflow-hidden cursor-pointer border-2 bg-zinc-800 relative ${activeImageIdx === i ? 'border-[#B87333]' : 'border-transparent opacity-75 hover:opacity-100'}`}
              >
                <img 
                  src={img} 
                  alt="thumbnail" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = PARTS_FALLBACK_IMAGE;
                  }}
                />
              </div>
            ))}
          </div>

          {/* About this part paragraph */}
          <div className="space-y-3 bg-white border border-zinc-250 p-6 rounded shadow-sm">
            <h3 className="font-display text-lg font-bold uppercase text-[#1E1E1E] tracking-tight border-b border-zinc-100 pb-2">
              Sourced Extraction History
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed font-sans">
              {part.description}
            </p>
            {part.notes && (
              <p className="p-3 bg-[#F5F0EB]/60 rounded-sm italic text-xs text-zinc-500 border-l-2 border-[#B87333]">
                ✏ Yard Note: "{part.notes}"
              </p>
            )}
          </div>

          {/* Sourced Vehicle Identification Plate Visual (Figure 7 tag) */}
          <div className="p-5 bg-zinc-900 border border-zinc-700/80 rounded shadow-md text-white grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
            {/* Rivets decoration at 4 corners */}
            <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full absolute top-1 right-1"></div>
            <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full absolute top-1 left-1"></div>
            <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full absolute bottom-1 right-1"></div>
            <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full absolute bottom-1 left-1"></div>

            <div className="space-y-2">
              <span className="text-[10px] tracking-widest font-display text-zinc-400 uppercase font-semibold">
                Physical Inventory Tag
              </span>
              <div className="font-display font-black text-2xl tracking-wider text-[#C4A882] py-1 border-y border-zinc-800/60 uppercase">
                {part.trackingNumber}
              </div>
              <span className="text-[9px] text-[#7A8B6F] font-mono font-bold uppercase">
                ⚙ Verified OEM Original Provenance
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono text-zinc-400">
              <div>
                <span className="text-zinc-500 block">VIN Sourced:</span>
                <span className="text-zinc-200 text-[11px] truncate uppercase block">{part.vinRemovedFrom || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Stock Code:</span>
                <span className="text-zinc-200 text-[11px] uppercase block">{part.stockNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Harvest Date:</span>
                <span className="text-zinc-200 text-[11px] block">{part.dateRemoved || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Inspected By:</span>
                <span className="text-zinc-350 text-[11px] block">Shop Certified (Bill)</span>
              </div>
            </div>
          </div>

          {/* Vehicle Compatibility Grid list */}
          <div className="bg-white border border-zinc-250 rounded p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold uppercase text-[#1E1E1E]">
                Explicit Fitment Matrix
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Calculated dynamic fit records across 1980s GM truck frameworks
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600 divide-y divide-zinc-200 border border-zinc-100">
                <thead className="bg-[#F5F0EB]/60 text-zinc-700 font-display font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Make</th>
                    <th className="py-2.5 px-3">Model</th>
                    <th className="py-2.5 px-3">Years</th>
                    <th className="py-2.5 px-3">Engine Compatibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 font-sans">
                  {part.compatibility.map((fit, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-zinc-800">{fit.make}</td>
                      <td className="py-2.5 px-3">{fit.model}</td>
                      <td className="py-2.5 px-3 font-mono">{fit.years}</td>
                      <td className="py-2.5 px-3 text-[#B87333] font-semibold">{fit.engine}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: CTA box, Seller detail, & Trust signals */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Pricing & Shopping Actions box (Figure 7 Style) */}
          <div className="bg-white border border-zinc-250 rounded p-6 shadow-xl space-y-5" id="tour-cta">
            <div className="flex items-end justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[10px] text-zinc-400 font-sans uppercase tracking-widest block font-semibold">
                  OEM Part Ask
                </span>
                <span className="font-display font-black text-4xl text-[#1E1E1E]">
                  ${part.price.toFixed(2)}
                </span>
                {part.originalPrice && (
                  <span className="text-sm text-zinc-400 line-through ml-2.5">
                    ${part.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <span className="text-xs font-mono bg-emerald-50 text-emerald-800 py-1 px-2.5 rounded-sm border border-emerald-150">
                🌿 Free Shipping
              </span>
            </div>

            {/* CTA Option Buttons */}
            <div className="space-y-3">
              <button 
                onClick={() => onAddToCart(part)}
                className="w-full bg-[#B87333] hover:bg-[#8B6239] hover:border-[#1E1E1E] transition-all text-white font-display font-bold uppercase tracking-wider py-3.5 px-4 rounded-sm shadow-md active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                id="btn-add-cart-detail"
              >
                <span>ADD TO CART</span>
              </button>

              <button 
                onClick={() => setIsOfferModalOpen(true)}
                className="w-full border-2 border-zinc-800 text-zinc-800 hover:bg-zinc-50 font-display font-bold uppercase tracking-wider py-3 px-4 rounded-sm transition-all text-center cursor-pointer"
                id="btn-make-offer-detail"
              >
                MAKE OFFER
              </button>
            </div>

            {/* Information badges */}
            <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-zinc-100 text-center select-none text-[10px] text-zinc-500 font-semibold uppercase">
              <div className="p-2 bg-[#F5F0EB]/40 rounded flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-[#B87333] mb-1" />
                <span>OEM Verified</span>
              </div>
              <div className="p-2 bg-[#F5F0EB]/40 rounded flex flex-col items-center">
                <RefreshCw className="w-4 h-4 text-[#B87333] mb-1" />
                <span>30-Day Escrow</span>
              </div>
              <div className="p-2 bg-[#F5F0EB]/40 rounded flex flex-col items-center">
                <Lock className="w-4 h-4 text-[#B87333] mb-1" />
                <span>Secure SSL Checkout</span>
              </div>
            </div>
          </div>

          {/* Sourced Yard Details Card */}
          <div className="bg-white border border-zinc-250 rounded p-6 shadow-sm space-y-4">
            <span className="text-[10px] uppercase font-display font-bold text-zinc-400 tracking-wider block">
              Sourced Salvage Yard
            </span>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-zinc-900 overflow-hidden border border-zinc-200 text-zinc-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-display font-bold text-base text-[#1E1E1E]">
                  {seller.name}
                </h4>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-zinc-500 font-sans">{seller.location}</span>
                  <span className="text-zinc-300">•</span>
                  <div className="flex items-center text-xs text-amber-500 font-mono font-bold">
                    <span>{seller.rating}</span>
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500 ml-0.5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between text-zinc-650">
                <span>Certified Feedback:</span>
                <span className="font-mono font-bold text-[#7A8B6F]">{seller.feedbackPercentage}% Positive</span>
              </div>
              <div className="flex items-center justify-between text-zinc-650">
                <span>Shipping Dispatch:</span>
                <span className="font-sans font-medium text-zinc-850">Dispatches in {seller.shipsWithin}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-650">
                <span>Warrant Period:</span>
                <span className="font-sans text-[#B87333] font-semibold">{seller.returnPolicy} guarantee</span>
              </div>
            </div>

            <a
              href="#contact-yard" 
              onClick={(e) => {
                e.preventDefault();
                setIsOfferModalOpen(true);
              }}
              className="block w-full text-center border border-zinc-200 hover:border-zinc-800 text-xs font-display font-bold py-2 rounded-sm transition-colors"
            >
              INQUIRE DIRECT WITH YARD
            </a>
          </div>

          {/* Specifications Table (Figure 8 element) */}
          <div className="bg-white border border-zinc-250 p-6 rounded shadow-xs space-y-4">
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-[#1E1E1E] border-b border-zinc-100 pb-2">
              Part Technical Parameters
            </h3>
            
            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between py-1 border-b border-zinc-50">
                <span className="text-zinc-400">OEM System</span>
                <span className="text-zinc-850 font-medium">{part.system}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-50">
                <span className="text-zinc-400">Assembly Group</span>
                <span className="text-zinc-850 font-medium">{part.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-50">
                <span className="text-zinc-400">Part Type</span>
                <span className="text-zinc-850 font-medium">{part.partType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-50">
                <span className="text-zinc-400">OEM Stock #</span>
                <span className="text-zinc-850 font-mono text-[11px]">{part.oemPartNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-50">
                <span className="text-zinc-400">Harvester Mileage</span>
                <span className="text-zinc-850 font-mono text-[11px]">
                  {typeof part.mileage === 'number' ? `${part.mileage.toLocaleString()} mi` : 'N/A'}
                </span>
              </div>
              {part.voltage && (
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-zinc-400">Operating Voltage</span>
                  <span className="text-zinc-850 font-medium">{part.voltage}</span>
                </div>
              )}
              {part.amperage && (
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-zinc-400">Amperage Rating</span>
                  <span className="text-zinc-850 font-medium">{part.amperage}</span>
                </div>
              )}
              {part.pulleyType && (
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-zinc-400">Pulley Drive Code</span>
                  <span className="text-zinc-850 font-medium">{part.pulleyType}</span>
                </div>
              )}
              {part.weight && (
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-zinc-400">Shipping Weight</span>
                  <span className="text-zinc-850 font-medium">{part.weight}</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 3. Related Inventory Suggestions Carousel */}
      {relatedParts.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-zinc-200">
          <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-[#1E1E1E]">
            You May Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedParts.map((rel) => {
              const relSeller = MOCK_SELLERS.find((s) => s.id === rel.sellerId);
              return (
                <div
                  key={rel.id}
                  onClick={() => {
                    setActiveImageIdx(0);
                    onSelectPart(rel.id);
                  }}
                  className="bg-white border border-zinc-200 rounded p-3 cursor-pointer group hover:border-[#B87333] transition-all flex flex-col justify-between"
                >
                  <div className="aspect-video relative overflow-hidden bg-zinc-900 rounded mb-3">
                    <img 
                      src={inlinePartImages[MOCK_PARTS.indexOf(rel) % inlinePartImages.length]} 
                      alt={rel.title}
                      className="w-full h-full object-cover grayscale-15 group-hover:grayscale-0 transition-all"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PARTS_FALLBACK_IMAGE;
                      }}
                    />
                    <span className="absolute bottom-2 left-2 text-[8px] tracking-widest bg-zinc-900 text-white uppercase py-0.5 px-1.5 rounded-sm font-bold">
                      {rel.condition}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display text-sm font-bold uppercase text-[#1E1E1E] group-hover:text-[#B87333] transition-colors line-clamp-1">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-sans truncate">{rel.subtitle}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                      <span className="font-display font-black text-sm text-[#1E1E1E]">
                        ${rel.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono font-medium truncate max-w-[120px]">
                        ★ {relSeller?.name.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Interactive Make Offer Chat Dialog Overlay */}
      <NegotiationModal
        isOpen={isOfferModalOpen}
        onClose={() => {
          setIsOfferModalOpen(false);
          setNegotiationState('idle');
          setActiveOffer(null);
        }}
        part={part}
        activeOffer={activeOffer}
        offerPrice={offerPrice}
        setOfferPrice={setOfferPrice}
        offerMessage={offerMessage}
        setOfferMessage={setOfferMessage}
        onSubmitOffer={triggerSendOffer}
        onAcceptCounter={(price) => {
          onAddToCart({ ...part, price });
          setIsOfferModalOpen(false);
          setNegotiationState('idle');
        }}
        negotiationState={negotiationState}
        sellerName={seller.name}
      />


    </div>
  );
}
