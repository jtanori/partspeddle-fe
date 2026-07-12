'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Award } from 'lucide-react';
import { Seller } from '../../types';
import yardDefaultCardImg from '../../assets/images/yard_default_card.png';

interface SellerCardProps {
  seller: Seller;
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-sm overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-zinc-200 group flex flex-col">
      <div className="aspect-[4/3] relative flex items-center justify-center overflow-hidden bg-zinc-900">
        {(seller.logoUrl && !imageError) ? (
          <Image 
            src={seller.logoUrl} 
            alt={seller.businessName || seller.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
            onError={() => setImageError(true)}
          />
        ) : (
          <>
            <Image 
              src={yardDefaultCardImg.src} 
              alt={seller.businessName || seller.name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <MapPin className="w-10 h-10 text-white" />
              <span className="font-display text-white text-xs uppercase font-bold">YARD LOGO</span>
            </div>
          </>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-sm flex items-center gap-1 z-10">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold">{seller.rating?.toFixed(1) ?? 'New'}</span>
        </div>
      </div>
      <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-lg uppercase text-zinc-900 line-clamp-1">{seller.businessName || seller.name}</h3>
          <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>{seller.location ?? 'Location unavailable'}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="block text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Specialty</span>
            <span className="text-xs font-semibold text-zinc-700">{seller.specialty ?? 'Not specified'}</span>
          </div>
          <Award className="w-6 h-6 text-[#B87333]/20" />
        </div>

        <Link 
          href="/search"
          className="w-full py-2.5 rounded-sm border-2 border-zinc-900 text-zinc-900 text-center font-display font-bold uppercase text-xs hover:bg-zinc-900 hover:text-white transition-all duration-300"
        >
          View Inventory
        </Link>
      </div>
    </div>
  );
};
