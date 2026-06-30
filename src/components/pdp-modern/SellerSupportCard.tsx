import React from 'react';
import { SellerViewModel } from '@/domain/types/pdp.types';

interface SellerSupportCardProps {
  seller: SellerViewModel;
}

import { MapPin, Truck, RefreshCw, ShieldCheck } from 'lucide-react';

export default function SellerSupportCard({ seller }: SellerSupportCardProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-pp-card p-6 shadow-sm space-y-8">
      <h3 className="font-display font-black uppercase text-[11px] tracking-widest text-zinc-500">Seller & Support</h3>

      <div className="flex items-start gap-4 pb-8 border-b border-zinc-50">
        <div className="w-16 h-16 rounded-full bg-pp-text flex items-center justify-center text-white font-black text-2xl border-4 border-zinc-50 shadow-inner">
          {seller.displayName.charAt(0)}
        </div>
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2">
            <p className="font-black text-sm uppercase tracking-tight text-pp-text">{seller.displayName}</p>
            <span className="px-1.5 py-0.5 bg-[#FFF9C4] text-[#FBC02D] text-[9px] font-black rounded-pp-atom border border-[#FFF176] uppercase tracking-tighter">Gold Seller</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
             <div className="flex text-pp-primary">{"★".repeat(5)}</div>
             <span className="font-bold text-zinc-300 tracking-tighter">(4,268)</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-4 group">
          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:text-pp-primary transition-colors">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="pt-0.5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Ships from</p>
            <p className="text-[12px] font-black text-pp-text uppercase tracking-tight">{seller.location}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 group">
          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:text-pp-primary transition-colors">
            <Truck className="w-4 h-4" />
          </div>
          <div className="pt-0.5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Est. delivery</p>
            <p className="text-[12px] font-black text-pp-text uppercase tracking-tight">Thu, Jun 5 – Mon, Jun 9</p>
          </div>
        </div>

        <div className="flex items-start gap-4 group">
          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:text-pp-primary transition-colors">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div className="pt-0.5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">30-Day Returns</p>
            <p className="text-[12px] font-black text-pp-text uppercase tracking-tight">Buyer pays return shipping</p>
          </div>
        </div>
      </div>
    </div>
  );
}
