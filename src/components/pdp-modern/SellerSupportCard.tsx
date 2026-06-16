import React from 'react';
import { SellerViewModel } from '@/domain/types/pdp.types';

interface SellerSupportCardProps {
  seller: SellerViewModel;
}

export default function SellerSupportCard({ seller }: SellerSupportCardProps) {
  return (
    <div className="bg-white border border-zinc-250 rounded p-6 shadow-sm space-y-4">
      <h3 className="font-display font-bold uppercase text-sm">Seller & Support</h3>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded bg-zinc-200" />
        <div>
          <p className="font-bold">{seller.displayName}</p>
          <p className="text-sm text-zinc-500">Rating: {seller.rating}</p>
        </div>
      </div>
      <div className="text-sm text-zinc-600">
        <p>Ships from: {seller.location}</p>
      </div>
    </div>
  );
}
