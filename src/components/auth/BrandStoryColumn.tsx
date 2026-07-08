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
      className="relative hidden h-auto flex-shrink-0 flex-col justify-between overflow-hidden bg-foreground-primary p-8 text-foreground-inverse md:flex md:h-full md:w-[35%] lg:w-[40%] lg:p-12 xl:w-1/2"
      id="id-brand-story-column"
    >
      {/* Vintage Workshop Background Image */}
      <div
        className="animate-fade-in absolute inset-0 bg-cover bg-center duration-700"
        style={{ backgroundImage: `url(${hero1.src})` }}
      />

      {/* Gradient Backdrop Layer */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground-primary/85 via-foreground-primary/60 to-transparent" />

      {/* Brand Logo System */}
      <div
        onClick={onCancel}
        className="relative z-10 flex shrink-0 cursor-pointer select-none items-center bg-transparent transition-transform duration-300 hover:scale-[1.03]"
      >
        <img
          src={logoImg.src}
          alt="PartsPeddle Logo"
          className="h-auto w-[185px] bg-transparent object-contain lg:w-[210px]"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Stripped Tagline Panel for Narrow Column Width */}
      <div className="relative z-10 mb-6 mt-auto flex max-w-xl shrink-0 flex-col py-4 lg:mb-8">
        <p className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-brand-primary">
          INTEGRITY FIRST
        </p>
        <h1 className="mt-2 pb-1 font-display text-xl font-extrabold uppercase leading-tight tracking-tight text-foreground-inverse sm:text-2xl lg:text-3xl xl:text-4xl">
          REAL PARTS <br className="hidden md:block lg:hidden" />
          / REAL PEOPLE <br className="hidden md:block lg:hidden" />/ REAL RELIABILITY.
        </h1>

        <p className="mt-4 hidden max-w-md font-sans text-xs leading-relaxed text-foreground-muted lg:block">
          {isSignUp && role === 'seller'
            ? 'List your used inventory for free. Reach thousands of buyers. Zero listing fees, zero commission for 90 days.'
            : 'PartsPeddle connects builders, restorers, and mechanics with hard-to-find OEM parts from real salvage yards and trusted backyard sellers.'}
        </p>
      </div>

      {/* Trust badge row */}
      <div className="relative z-10 w-full shrink-0 border-t border-stroke-default pt-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: 'Real OEM', desc: 'No Aftermarket' },
            { icon: Hammer, title: 'Yard Trusted', desc: 'Dismantler Registry' },
            { icon: Percent, title: 'Direct Prices', desc: 'Saves Up To 60%' },
            { icon: Calendar, title: 'Built To Last', desc: 'OEM Tolerances' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
              <div className="flex flex-col">
                <span className="font-display text-[10px] font-semibold uppercase leading-none text-foreground-inverse">
                  {item.title}
                </span>
                <span className="mt-1 font-sans text-[8px] leading-none text-foreground-muted">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
