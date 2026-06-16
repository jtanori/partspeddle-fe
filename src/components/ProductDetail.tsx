'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Heart, ShieldCheck, AlertTriangle, RefreshCw, Lock } from 'lucide-react';
import { Part, Seller, Offer, PARTS_FALLBACK_IMAGE } from '../types';
import { NegotiationModal } from './catalog/detail/NegotiationModal';

interface ProductDetailProps {
  partId: string;
  initialPart: Part & { seller?: Seller | null };
  onBack: () => void;
  onAddToCart: (part: Part) => void;
  onSelectPart: (partId: string) => void;
}

export default function ProductDetail({ partId, initialPart, onBack, onAddToCart, onSelectPart }: ProductDetailProps) {
  const [part] = useState<Part>(initialPart);
  const [seller] = useState<Seller | null>(initialPart.seller || null);
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number>(initialPart?.price || 0);
  const [offerMessage, setOfferMessage] = useState("Hi builder! Submitting an offer for my vintage restorers stack.");
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [negotiationState, setNegotiationState] = useState<'idle' | 'sending' | 'replied'>('idle');

  const handlePrevPhoto = () => setActiveImageIdx((prev) => (prev - 1 + (detailPartImages[part?.id || '1100428']?.length || 4)) % (detailPartImages[part?.id || '1100428']?.length || 4));
  const handleNextPhoto = () => setActiveImageIdx((prev) => (prev + 1) % (detailPartImages[part?.id || '1100428']?.length || 4));
  const toggleFavorite = (id: string) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  const triggerSendOffer = async (e: React.FormEvent) => { e.preventDefault(); setNegotiationState('sending'); setTimeout(() => setNegotiationState('replied'), 1500); };
  
  const getConditionColor = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('new') || c.includes('original')) return 'bg-[#B87333] text-zinc-950 font-black border border-[#A25D1D]/20';
    if (c.includes('excellent')) return 'bg-[#7A8B6F] text-zinc-950 font-black';
    if (c.includes('good')) return 'bg-[#E9DEC1] text-zinc-950 font-bold';
    return 'bg-[#8B6239] text-[#FCFAF8] font-semibold';
  };

  const detailPartImages: Record<string, string[]> = {
    '1100428': ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1517524006129-4a3a3eac48cd?auto=format&fit=crop&q=80&w=800'],
  };
  const inlinePartImages = detailPartImages[part?.id || '1100428'] || detailPartImages['1100428'];

  if (!part) return <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0EB] text-zinc-500 space-y-4"><AlertTriangle className="w-12 h-12 text-[#B87333]" /><h2 className="text-xl font-display font-bold uppercase">Part Not Found</h2><button onClick={onBack} className="text-[#B87333] hover:underline uppercase text-sm font-bold">Back to Marketplace</button></div>;
  if (!seller) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans space-y-12" id="tour-part-view">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-xs font-display font-black uppercase tracking-wider text-zinc-650 hover:text-[#B87333] transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /><span>Back to Catalog</span></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <div className="relative rounded overflow-hidden aspect-video border border-zinc-200 bg-zinc-950 shadow flex items-center justify-center group">
            <img src={inlinePartImages[activeImageIdx]} alt={part.title} className="w-full h-full object-cover brightness-95" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PARTS_FALLBACK_IMAGE; }} />
            <button onClick={handlePrevPhoto} className="absolute left-3 p-2 bg-black/60 hover:bg-[#B87333] text-white rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={handleNextPhoto} className="absolute right-3 p-2 bg-black/60 hover:bg-[#B87333] text-white rounded-full transition-colors"><ChevronRight className="w-5 h-5" /></button>
            <button onClick={() => toggleFavorite(part.id)} className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white hover:text-red-500 transition-colors"><Heart className={`w-4 h-4 ${favorites.includes(part.id) ? 'fill-red-500 text-red-500' : ''}`} /></button>
            <span className={`absolute bottom-4 left-4 text-xs font-display font-medium uppercase tracking-wider py-1 px-3.5 rounded-sm shadow-md ${getConditionColor(part.condition)}`}>{part.condition}</span>
          </div>

          <div className="space-y-3 bg-white border border-zinc-250 p-6 rounded shadow-sm">
            <h3 className="font-display text-lg font-bold uppercase text-[#1E1E1E] tracking-tight border-b border-zinc-100 pb-2">Sourced Extraction History</h3>
            <p className="text-sm text-zinc-600 leading-relaxed font-sans">{part.description}</p>
            {part.notes && <p className="p-3 bg-[#F5F0EB]/60 rounded-sm italic text-xs text-zinc-500 border-l-2 border-[#B87333]">✏ Yard Note: {`"${part.notes}"`}</p>}
          </div>
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-zinc-250 rounded p-6 shadow-xl space-y-5" id="tour-cta">
             <div className="flex items-end justify-between border-b border-zinc-100 pb-4">
                <div><span className="text-[10px] text-zinc-400 font-sans uppercase tracking-widest block font-semibold">OEM Part Ask</span><span className="font-display font-black text-4xl text-[#1E1E1E]">${(part.price || 0).toFixed(2)}</span></div>
                <span className="text-xs font-mono bg-emerald-50 text-emerald-800 py-1 px-2.5 rounded-sm border border-emerald-150">🌿 Free Shipping</span>
             </div>
             <button onClick={() => onAddToCart(part)} className="w-full bg-[#B87333] hover:bg-[#8B6239] text-white font-display font-bold uppercase tracking-wider py-3.5 px-4 rounded-sm shadow-md">ADD TO CART</button>
             <button onClick={() => setIsOfferModalOpen(true)} className="w-full border-2 border-zinc-800 text-zinc-800 hover:bg-zinc-50 font-display font-bold uppercase tracking-wider py-3 px-4 rounded-sm transition-all text-center">MAKE OFFER</button>
          </div>
        </div>
      </div>

      <NegotiationModal
        isOpen={isOfferModalOpen}
        onClose={() => { setIsOfferModalOpen(false); setNegotiationState('idle'); setActiveOffer(null); }}
        part={part}
        activeOffer={activeOffer}
        offerPrice={offerPrice}
        setOfferPrice={setOfferPrice}
        offerMessage={offerMessage}
        setOfferMessage={setOfferMessage}
        onSubmitOffer={triggerSendOffer}
        onAcceptCounter={(price) => { onAddToCart({ ...part, price }); setIsOfferModalOpen(false); setNegotiationState('idle'); }}
        negotiationState={negotiationState}
        sellerName={seller.name}
      />
    </div>
  );
}
