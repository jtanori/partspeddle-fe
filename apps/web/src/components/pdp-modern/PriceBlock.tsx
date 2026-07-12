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
    <div className="space-y-8 pt-8 border-t border-stroke-subtle">
      <div>
        <div className={`text-6xl font-black tracking-tighter ${isOutOfStock ? 'text-foreground-muted' : 'text-foreground-primary'}`}>
          ${pricing.partPrice.toFixed(2)}
        </div>
        {!isOutOfStock && (
          <div className="mt-3 space-y-1.5">
             <p className="text-[12px] font-bold text-foreground-muted uppercase tracking-[0.2em]">
                + ${pricing.shippingEstimate.includes('Free') ? '0.00' : '15.99'} Shipping
             </p>
             <p className="text-[12px] font-black text-status-success uppercase tracking-[0.25em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                {pricing.shippingEstimate} to 12345
             </p>
          </div>
        )}
        {isOutOfStock && (
           <div className="mt-4 p-3 bg-surface-muted rounded-md text-[10px] font-black uppercase text-foreground-muted tracking-[0.25em] text-center border border-stroke-subtle">
              Temporarily Out of Stock
           </div>
        )}
      </div>
      
      {pricing.coreCharge > 0 && !isOutOfStock && (
        <div className="p-5 bg-status-warning-soft border border-status-warning rounded-xl space-y-1.5 shadow-card">
          <p className="font-black text-[11px] text-status-warning uppercase tracking-[0.2em]">
             +${pricing.coreCharge.toFixed(2)} Core Charge
          </p>
          <p className="text-[12px] text-status-warning/80 font-bold italic tracking-tight leading-none">
             Refundable core charge upon return
          </p>
        </div>
      )}

      <div className="space-y-4 pt-2">
        {isOutOfStock ? (
          <button 
            className="w-full bg-foreground-primary text-foreground-inverse py-5 rounded-md font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-brand-black transition-all active:scale-[0.98]"
          >
            Find Similar Parts
          </button>
        ) : (
          <>
            <button 
              onClick={onAddToCart}
              className="w-full bg-brand-primary text-foreground-inverse py-5 rounded-md font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-brand-primary/40 hover:bg-brand-primary-hover active:scale-[0.98] transition-all"
            >
              ADD TO CART
            </button>
            
            <button 
              className="w-full bg-surface-primary text-foreground-primary py-5 rounded-md font-black uppercase tracking-[0.3em] text-[11px] border-2 border-stroke-subtle hover:border-foreground-primary transition-all active:scale-[0.98]"
            >
              BUY NOW
            </button>
          </>
        )}

        {!isOutOfStock && (
          <button className="flex items-center justify-center gap-2.5 w-full text-foreground-muted hover:text-brand-primary transition-colors text-[10px] font-black uppercase tracking-[0.3em] pt-4 group">
            <Heart className="w-4 h-4 transition-transform group-hover:scale-110" /> 
            Add to Watchlist
          </button>
        )}
      </div>
    </div>
  );
}
