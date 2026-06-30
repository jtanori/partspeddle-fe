import React from 'react';
import { PricingViewModel } from '@/domain/types/pdp.types';

interface PriceBlockProps {
  pricing: PricingViewModel;
  onAddToCart: () => void;
}

import { Heart } from 'lucide-react';

export default function PriceBlock({ pricing, onAddToCart }: PriceBlockProps) {
  const isOutOfStock = !pricing.partPrice || pricing.partPrice <= 0;

  return (
    <div className="space-y-8 pt-8 border-t border-zinc-100">
      <div>
        <div className={`text-6xl font-black tracking-tighter ${isOutOfStock ? 'text-zinc-300' : 'text-pp-text'}`}>
          ${pricing.partPrice.toFixed(2)}
        </div>
        {!isOutOfStock && (
          <div className="mt-3 space-y-1.5">
             <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                + ${pricing.shippingEstimate.includes('Free') ? '0.00' : '15.99'} Shipping
             </p>
             <p className="text-[12px] font-black text-pp-success uppercase tracking-[0.25em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pp-success animate-pulse" />
                {pricing.shippingEstimate} to 12345
             </p>
          </div>
        )}
        {isOutOfStock && (
           <div className="mt-4 p-3 bg-zinc-50 rounded-pp-atom text-[10px] font-black uppercase text-zinc-400 tracking-[0.25em] text-center border border-zinc-100">
              Temporarily Out of Stock
           </div>
        )}
      </div>
      
      {pricing.coreCharge > 0 && !isOutOfStock && (
        <div className="p-5 bg-[#FFF3E0] border border-[#FFE0B2] rounded-pp-card space-y-1.5 shadow-sm">
          <p className="font-black text-[11px] text-[#E65100] uppercase tracking-[0.2em]">
             +${pricing.coreCharge.toFixed(2)} Core Charge
          </p>
          <p className="text-[12px] text-[#E65100]/80 font-bold italic tracking-tight leading-none">
             Refundable core charge upon return
          </p>
        </div>
      )}

      <div className="space-y-4 pt-2">
        {isOutOfStock ? (
          <button 
            className="w-full bg-pp-text text-white py-5 rounded-pp-atom font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-black transition-all active:scale-[0.98]"
          >
            Find Similar Parts
          </button>
        ) : (
          <>
            <button 
              onClick={onAddToCart}
              className="w-full bg-pp-primary text-white py-5 rounded-pp-atom font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-pp-primary/40 hover:bg-[#A6662E] active:scale-[0.98] transition-all"
            >
              ADD TO CART
            </button>
            
            <button 
              className="w-full bg-white text-pp-text py-5 rounded-pp-atom font-black uppercase tracking-[0.3em] text-[11px] border-2 border-zinc-200 hover:border-pp-text transition-all active:scale-[0.98]"
            >
              BUY NOW
            </button>
          </>
        )}

        {!isOutOfStock && (
          <button className="flex items-center justify-center gap-2.5 w-full text-zinc-400 hover:text-pp-primary transition-colors text-[10px] font-black uppercase tracking-[0.3em] pt-4 group">
            <Heart className="w-4 h-4 transition-transform group-hover:scale-110" /> 
            Add to Watchlist
          </button>
        )}
      </div>
    </div>
  );
}
