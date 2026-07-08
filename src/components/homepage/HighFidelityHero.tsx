'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Check } from 'lucide-react';
import { useAuthStore, useSellerNavStore } from '@/store/hooks';
import Image from 'next/image';
import heroImage from '../../assets/images/heor_1_b.png';
import { Button } from '@/components/ui/button';

export const HighFidelityHero: React.FC = () => {
  const router = useRouter();
  const { user, setUserRole } = useAuthStore();
  const { setActiveSellerTab } = useSellerNavStore();

  return (
    <section
      className="relative -mt-16 overflow-hidden bg-foreground-primary pb-6 pt-24 text-foreground-inverse md:pb-8 md:pt-32"
      id="hero-banner"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Industrial equipment repair shop"
          fill
          priority
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-foreground-primary via-foreground-primary/60 via-[35%] to-transparent" />
      </div>

      <div className="relative z-20 mx-auto w-full max-w-[var(--content-max)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-6">
          <div className="space-y-4">
            <h1 className="text-left font-display text-3xl font-black uppercase leading-none tracking-tight text-foreground-inverse sm:text-4xl lg:text-5xl">
              KEEP EQUIPMENT WORKING.
              <br />
              <span className="text-brand-primary">BUY. SELL. TRADE PARTS LOCALLY.</span>
            </h1>
            <p className="max-w-xl text-left font-sans text-sm leading-relaxed text-foreground-muted sm:text-base">
              The marketplace for auto and farm parts — built for mechanics, enthusiasts, farmers,
              salvage yards, and independent sellers.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <Button
              onClick={() => router.push('/search')}
              className="flex h-11 items-center gap-2 px-5 font-display text-sm font-black uppercase tracking-wider"
              aria-label="Search parts inventory"
            >
              <Search className="h-4 w-4" />
              <span>SEARCH INVENTORY</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (user) {
                  setUserRole('seller');
                  setActiveSellerTab('listings');
                  router.push('/dashboard');
                } else {
                  router.push('/register?role=seller');
                }
              }}
              className="flex h-11 items-center gap-2 border-foreground-inverse bg-transparent px-5 font-display text-sm font-black uppercase tracking-wider text-foreground-inverse hover:bg-foreground-inverse hover:text-foreground-primary"
              aria-label="Start selling parts"
            >
              <span>SELL PARTS</span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            {['Verified Sellers', 'Buyer Protection', 'Nationwide Shipping'].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-foreground-muted">
                <Check className="h-3 w-3 text-brand-primary" />
                <span className="text-[9px] font-bold uppercase tracking-widest">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
