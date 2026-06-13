import React from 'react';
import { Lock, RefreshCw, ShieldCheck, Mail } from 'lucide-react';

export default function TrustBar() {
  return (
    <div className="w-full border-t border-zinc-200 py-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 gap-6 text-sm">
        <div className="flex items-center gap-3"><Lock className="w-5 h-5 text-[#B87333]" /> <span>Secure Checkout</span></div>
        <div className="flex items-center gap-3"><RefreshCw className="w-5 h-5 text-[#B87333]" /> <span>30-Day Returns</span></div>
        <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-[#B87333]" /> <span>Warranty Included</span></div>
        <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-[#B87333]" /> <span>Support</span></div>
      </div>
    </div>
  );
}
