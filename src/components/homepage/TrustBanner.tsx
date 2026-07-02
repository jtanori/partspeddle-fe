import React from 'react';
import { useUiStore } from '@/store/hooks';

export const TrustBanner: React.FC = () => {
  const { setTourActive } = useUiStore();

  return (
    <section className="bg-gradient-to-r from-[#1E1E1E] via-[#2D2D2D] to-[#3D3632] text-white p-8 rounded border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto select-none mb-12" id="tour-cta">
      <div className="space-y-1 text-center md:text-left">
        <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-widest text-[#C4A882]">
          Vetted Builder Guarantee index
        </h3>
        <p className="font-sans text-sm text-zinc-350 max-w-xl">
          We hold payments for 30 days. If the part doesn't fit standard vehicle parameters indicated inside our fitment catalog, get a full refund including shipping.
        </p>
      </div>
      <button 
        onClick={() => setTourActive(true)}
        className="bg-white/10 hover:bg-white/20 text-[#C4A882] hover:text-white font-display text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-sm border border-[#C4A882]/40 hover:border-white transition-all whitespace-nowrap"
      >
        See How It Works
      </button>
    </section>
  );
};
