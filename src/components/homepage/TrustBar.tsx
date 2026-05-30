import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Zap } from 'lucide-react';

export const TrustBar: React.FC = () => {
  return (
    <div className="bg-[#1E1E1E] py-8 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#B87333]/20 transition-colors">
            <ShieldCheck className="w-6 h-6 text-[#B87333]" />
          </div>
          <div className="space-y-0.5">
            <span className="block text-white font-display font-bold uppercase text-sm tracking-wide">Vetted Yards</span>
            <span className="block text-zinc-500 text-xs">Certified Dismantlers</span>
          </div>
        </div>
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#B87333]/20 transition-colors">
            <Zap className="w-6 h-6 text-[#B87333]" />
          </div>
          <div className="space-y-0.5">
            <span className="block text-white font-display font-bold uppercase text-sm tracking-wide">Fast Fitment</span>
            <span className="block text-zinc-500 text-xs">AI-Powered Diagnostics</span>
          </div>
        </div>
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#B87333]/20 transition-colors">
            <Truck className="w-6 h-6 text-[#B87333]" />
          </div>
          <div className="space-y-0.5">
            <span className="block text-white font-display font-bold uppercase text-sm tracking-wide">Logistics</span>
            <span className="block text-zinc-500 text-xs">Regional LTL Dispatch</span>
          </div>
        </div>
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#B87333]/20 transition-colors">
            <RefreshCw className="w-6 h-6 text-[#B87333]" />
          </div>
          <div className="space-y-0.5">
            <span className="block text-white font-display font-bold uppercase text-sm tracking-wide">Escrow Safety</span>
            <span className="block text-zinc-500 text-xs">Secure Fund Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
};
