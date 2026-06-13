import React from 'react';
import { PricingViewModel } from '@/domain/types/pdp.types';

interface PriceBlockProps {
  pricing: PricingViewModel;
  onAddToCart: () => void;
}

export default function PriceBlock({ pricing, onAddToCart }: PriceBlockProps) {
  return (
    <div className="bg-white border border-zinc-250 rounded p-6 shadow-sm space-y-4">
      <div className="text-4xl font-black text-[#1E1E1E]">
        ${pricing.partPrice.toFixed(2)}
      </div>
      
      {pricing.coreCharge > 0 && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-900">
          <p className="font-bold">+${pricing.coreCharge.toFixed(2)} Core Charge</p>
          <p className="text-xs">Refundable core charge</p>
        </div>
      )}

      <button 
        onClick={onAddToCart}
        className="w-full bg-[#B87333] text-white py-3 rounded font-bold hover:bg-[#8B6239] transition-colors"
      >
        ADD TO CART
      </button>
    </div>
  );
}
