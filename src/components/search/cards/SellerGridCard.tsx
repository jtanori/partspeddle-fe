import React from 'react';
import { Star, MapPin, Award } from 'lucide-react';
import { Seller } from '@/types';
import defaultYardImg from '@/assets/images/yard_default_card.png';

interface SellerGridCardProps {
  seller: Seller;
  onViewInventory: (sellerId: string) => void;
}

export const SellerGridCard: React.FC<SellerGridCardProps> = ({ seller, onViewInventory }) => {
  const imageUrl = seller.logoUrl || defaultYardImg;

  return (
    <div className="bg-white rounded-sm overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-zinc-200 group">
      <div className="h-40 relative">
        <img 
          src={typeof imageUrl === 'string' ? imageUrl : imageUrl.src} 
          alt={seller.businessName} 
          className="w-full h-full object-cover group-hover:scale-105 transition-duration-500" 
          onError={(e) => {
            e.currentTarget.src = defaultYardImg.src;
          }}
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-sm flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold">{seller.rating || '5.0'}</span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-lg uppercase text-zinc-900 line-clamp-1">{seller.businessName || seller.name}</h3>
          <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>{seller.location || 'Local Yard'}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="block text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Specialty</span>
            <span className="text-xs font-semibold text-zinc-700">{seller.specialty || 'General Parts'}</span>
          </div>
          <Award className="w-6 h-6 text-[#B87333]/20" />
        </div>

        <button 
          onClick={() => onViewInventory(seller.id)}
          className="w-full py-2.5 rounded-sm border-2 border-zinc-900 text-zinc-900 font-display font-bold uppercase text-xs hover:bg-zinc-900 hover:text-white transition-all"
        >
          View Inventory
        </button>
      </div>
    </div>
  );
};
