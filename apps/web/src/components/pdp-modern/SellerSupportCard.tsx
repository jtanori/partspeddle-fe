'use client';

import React from 'react';
import Link from 'next/link';
import { SellerViewModel } from '@/domain/types/pdp.types';

interface SellerSupportCardProps {
  seller: SellerViewModel;
}

import { MapPin, Truck, RefreshCw } from 'lucide-react';

export default function SellerSupportCard({ seller }: SellerSupportCardProps) {
  return (
    <div className="bg-surface-primary border border-stroke-subtle rounded-xl p-6 shadow-card space-y-8">
      <h3 className="font-display font-black uppercase text-[11px] tracking-widest text-foreground-muted">
        Seller & Support
      </h3>

      <Link
        href={`/seller/${seller.id}`}
        className="flex items-start gap-4 pb-8 border-b border-stroke-subtle group"
      >
        <div className="w-16 h-16 rounded-full bg-foreground-primary flex items-center justify-center text-foreground-inverse font-black text-2xl border-4 border-stroke-subtle shadow-inner">
          {seller.displayName.charAt(0)}
        </div>
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2">
            <p className="font-black text-sm uppercase tracking-tight text-foreground-primary group-hover:text-brand-primary transition-colors">
              {seller.displayName}
            </p>
            <span className="px-1.5 py-0.5 bg-status-warning-soft text-status-warning text-[9px] font-black rounded-md border border-status-warning uppercase tracking-tighter">
              Gold Seller
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex text-brand-primary">{'★'.repeat(5)}</div>
            <span className="font-bold text-foreground-muted tracking-tighter">(4,268)</span>
          </div>
        </div>
      </Link>

      <div className="space-y-6">
        <div className="flex items-start gap-4 group">
          <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-foreground-muted group-hover:text-brand-primary transition-colors">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="pt-0.5">
            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-0.5">
              Ships from
            </p>
            <p className="text-[12px] font-black text-foreground-primary uppercase tracking-tight">
              {seller.location}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 group">
          <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-foreground-muted group-hover:text-brand-primary transition-colors">
            <Truck className="w-4 h-4" />
          </div>
          <div className="pt-0.5">
            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-0.5">
              Est. delivery
            </p>
            <p className="text-[12px] font-black text-foreground-primary uppercase tracking-tight">
              Thu, Jun 5 – Mon, Jun 9
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 group">
          <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-foreground-muted group-hover:text-brand-primary transition-colors">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div className="pt-0.5">
            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-0.5">
              30-Day Returns
            </p>
            <p className="text-[12px] font-black text-foreground-primary uppercase tracking-tight">
              Buyer pays return shipping
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
