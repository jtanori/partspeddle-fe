'use client';

import React from 'react';
import { ShieldCheck, Hammer, Percent, Calendar } from 'lucide-react';
import logoImg from '../../assets/images/logo_solid.png';
import hero1 from '../../assets/images/hero_1.png';

interface BrandStoryColumnProps {
  isSignUp: boolean;
  role: 'buyer' | 'seller';
  onCancel: () => void;
}

export const BrandStoryColumn: React.FC<BrandStoryColumnProps> = ({ isSignUp, role, onCancel }) => {
  return (
    <div 
      className="hidden md:flex md:w-[35%] lg:w-[40%] xl:w-1/2 bg-[#1E1E1E] relative flex-col justify-between p-8 lg:p-12 overflow-hidden text-white h-auto md:h-full flex-shrink-0" 
      id="id-brand-story-column"
    >
      {/* Vintage Workshop Background Image */}
      <div className="absolute inset-0 bg-cover bg-center animate-fade-in duration-700" style={{ backgroundImage: `url(${hero1.src})` }} />

      {/* Gradient Backdrop Layer - 80% opacity bottom to transition */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E]/85 via-[#1E1E1E]/60 to-transparent pointer-events-none" />

      {/* Brand Logo System - Genuine PartsPeddle Sign Logo */}
      <div 
        onClick={onCancel} 
        className="relative flex items-center select-none z-10 flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-[1.03] bg-transparent"
      >
        <img 
          src={logoImg.src} 
          alt="PartsPeddle Logo" 
          className="w-[185px] lg:w-[210px] h-auto object-contain bg-transparent" 
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Stripped Tagline Panel for Narrow Column Width */}
      <div className="relative mt-auto mb-6 lg:mb-8 z-10 max-w-xl py-4 flex-shrink-0">
        <p className="font-mono text-[9px] tracking-[0.3em] font-black text-[#B87333] uppercase">INTEGRITY FIRST</p>
        <h1 className="font-display text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white leading-tight uppercase tracking-tight mt-2 pb-1">
          REAL PARTS <br className="hidden md:block lg:hidden" />
          / REAL PEOPLE <br className="hidden md:block lg:hidden" />
          / REAL RELIABILITY.
        </h1>
        
        <p className="mt-4 text-xs lg:text-sm text-zinc-300 font-sans leading-relaxed max-w-md hidden lg:block">
          {isSignUp && role === 'seller' ? 
            'List your used inventory for free. Reach thousands of buyers. Zero listing fees, zero commission for 90 days.' :
            'PartsPeddle connects builders, restorers, and mechanics with hard-to-find OEM parts from real salvage yards and trusted backyard sellers.'
          }
        </p>
      </div>

      {/* Trust badge row */}
      <div className="relative border-t border-zinc-700/60 pt-4 z-10 w-full flex-shrink-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: ShieldCheck, title: 'Real OEM', desc: 'No Aftermarket' },
            { icon: Hammer, title: 'Yard Trusted', desc: 'Dismantler Registry' },
            { icon: Percent, title: 'Direct Prices', desc: 'Saves Up To 60%' },
            { icon: Calendar, title: 'Built To Last', desc: 'OEM Tolerances' }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <item.icon className="w-5 h-5 text-[#B87333] flex-shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-display font-semibold text-white leading-none">{item.title}</span>
                <span className="text-[8px] text-zinc-400 font-sans leading-none mt-1">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
