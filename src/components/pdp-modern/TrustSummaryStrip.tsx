import React from 'react';
import { Star, Truck, Calendar, RefreshCw } from 'lucide-react';

export default function TrustSummaryStrip() {
  return (
    <div className="bg-white border border-zinc-200 rounded-pp-card py-6 px-10 shadow-sm">
      <div className="grid grid-cols-4 gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
        <div className="flex flex-col items-center gap-2 border-r border-zinc-50 last:border-0">
          <Star className="w-5 h-5 text-pp-primary mb-1" /> 
          <span className="text-zinc-600">Seller Rating</span>
        </div>
        <div className="flex flex-col items-center gap-2 border-r border-zinc-50 last:border-0">
          <Truck className="w-5 h-5 text-pp-primary mb-1" /> 
          <span className="text-zinc-600">Ships From NC, USA</span>
        </div>
        <div className="flex flex-col items-center gap-2 border-r border-zinc-50 last:border-0">
          <Calendar className="w-5 h-5 text-pp-primary mb-1" /> 
          <span className="text-zinc-600">Est. Delivery Jun 5-9</span>
        </div>
        <div className="flex flex-col items-center gap-2 border-r border-zinc-50 last:border-0">
          <RefreshCw className="w-5 h-5 text-pp-primary mb-1" /> 
          <span className="text-zinc-600">30-Day Returns</span>
        </div>
      </div>
    </div>
  );
}
