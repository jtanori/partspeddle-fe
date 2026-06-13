'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import Image from 'next/image';
import heroImage from '../../assets/images/heor_1_b.png';

export const HighFidelityHero: React.FC = () => {
  const router = useRouter();
  const { user, setUserRole, setActiveSellerTab } = useAppStore();

  return (
    <section className="relative bg-[#0E0E0E] text-white -mt-16 pt-24 pb-6 md:pt-32 md:pb-8 overflow-hidden" id="hero-banner">
      
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Industrial equipment repair shop"
          fill
          priority
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 via-[35%] to-transparent z-10" />
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <div className="max-w-2xl space-y-6">
          <div className="space-y-4">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-none text-left">
              KEEP EQUIPMENT WORKING.<br />
              <span className="text-[#C4A882]">BUY. SELL. TRADE PARTS LOCALLY.</span>
            </h1>
            <p className="font-sans text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed text-left">
              The marketplace for auto and farm parts — built for mechanics, enthusiasts, farmers, salvage yards, and independent sellers.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <button 
              onClick={() => router.push('/search')} 
              className="bg-[#B87333] hover:bg-[#A66222] text-white px-5 py-2.5 rounded font-bold font-sans text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              aria-label="Search parts inventory"
            >
              <Search className="w-4 h-4" />
              <span>SEARCH INVENTORY</span>
            </button>

            <button
              onClick={() => {
                if (user) {
                  setUserRole('seller');
                  setActiveSellerTab('listings');
                  router.push('/dashboard');
                } else {
                  router.push('/register?role=seller');
                }
              }}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white px-5 py-2.5 rounded font-bold font-sans text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              aria-label="Start selling parts"
            >
              <span>SELL PARTS</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <span className="text-[#B87333] opacity-80">✓</span>
              <span className="text-[9px] font-bold uppercase tracking-widest">Verified Sellers</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <span className="text-[#B87333] opacity-80">✓</span>
              <span className="text-[9px] font-bold uppercase tracking-widest">Buyer Protection</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <span className="text-[#B87333] opacity-80">✓</span>
              <span className="text-[9px] font-bold uppercase tracking-widest">Nationwide Shipping</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
