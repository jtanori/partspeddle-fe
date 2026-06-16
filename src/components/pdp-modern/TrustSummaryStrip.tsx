import React from 'react';
import { Star, Truck, Calendar, RefreshCw } from 'lucide-react';

export default function TrustSummaryStrip() {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 border-y border-zinc-200 text-xs text-zinc-600">
      <div className="flex items-center gap-2"><Star className="w-4 h-4" /> <span>Seller Rating</span></div>
      <div className="flex items-center gap-2"><Truck className="w-4 h-4" /> <span>Ships From</span></div>
      <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> <span>Delivery ETA</span></div>
      <div className="flex items-center gap-2"><RefreshCw className="w-4 h-4" /> <span>Returns</span></div>
    </div>
  );
}
