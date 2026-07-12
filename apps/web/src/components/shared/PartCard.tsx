'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Cog } from 'lucide-react';
import { Part } from '../../types';
import { DEFAULT_PART_IMAGE } from '@/lib/part-images';
import { getConditionColor, getConditionLabel } from '../search/utils/condition-utils';

interface PartCardProps {
  part: Part;
}

export const PartCard: React.FC<PartCardProps> = ({ part }) => {
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!part) return null;

  const primaryImage = part.images?.find(Boolean) ?? null;
  const hasImage = !!primaryImage && !imageError;

  return (
    <Link
      href={`/listing/${part.id}`}
      className="bg-white border border-stone-800/10 rounded shadow-sm hover:shadow-xl hover:border-[#B87333] transition-all cursor-pointer group overflow-hidden flex flex-col"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-zinc-900 rounded-t flex items-center justify-center">
        {hasImage ? (
          <Image 
            src={primaryImage} 
            alt={part.title} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300 brightness-95 will-change-transform" 
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center gap-2">
            <Image 
              src={DEFAULT_PART_IMAGE} 
              alt={part.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <Cog className="relative z-10 w-12 h-12 text-white" />
            <span className="relative z-10 font-display text-white text-xs uppercase font-bold">PICTURES COMING SOON</span>
          </div>
        )}
        <button 
          onClick={(e) => { e.preventDefault(); setIsFavorite(!isFavorite); }} 
          className="absolute top-2 right-2 p-1.5 bg-[#FCFAF7]/85 backdrop-blur-xs rounded-full border border-stone-800/5 hover:text-red-500 transition-colors shadow z-10"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-zinc-500'}`} />
        </button>
        <span className={`absolute bottom-2 left-2 text-[10px] font-display font-bold uppercase tracking-wider py-0.5 px-2 rounded-sm ${getConditionColor(part.condition)} z-10`}>
          {getConditionLabel(part.condition)}
        </span>
      </div>

      <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-[#B87333] font-display font-semibold uppercase tracking-wider mb-1">
            <Cog className="w-3 h-3 stroke-[2.5]" />
            <span>{part.system || 'General'}</span>
          </div>
          <h3 className="font-display font-bold text-lg text-[#1E1E1E] tracking-tight group-hover:text-[#B87333] transition-colors line-clamp-2 min-h-[56px]">{part.title}</h3>
          <p className="text-sm text-stone-500 font-sans leading-relaxed line-clamp-2 min-h-[40px]">{part.subtitle}</p>
        </div>

        <div className="border-t border-zinc-200 pt-3 flex items-center justify-between">
          <span className="font-display font-black text-xl text-[#1E1E1E] leading-none">${(part.price || 0).toFixed(2)}</span>
          <span className="font-sans text-[11px] text-zinc-700 font-bold tracking-tight">
            {part.seller?.businessName || part.seller?.name || 'Seller'} ★ {(part.seller?.rating ?? 0).toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
};
