import React from 'react';
import { Heart, Disc, Zap, Star } from 'lucide-react';
import { Part } from '../../types';
import { getSystemIcon } from '../../lib/utils/taxonomy';

interface ProductCardProps {
  part: Part;
  viewMode: 'list' | 'grid';
  onSelect: (partId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ part, viewMode, onSelect }) => {
  const IconComp = getSystemIcon(part.system);

  if (viewMode === 'grid') {
    return (
      <div
        onClick={() => onSelect(part.id)}
        className="bg-white border border-rust-copper/15 rounded-[8px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-[2px] transition-all duration-200 cursor-pointer group flex flex-col h-full"
      >
        <div className="h-[200px] w-full relative overflow-hidden bg-[#2D2D2D] shrink-0 flex items-center justify-center">
            <span className="font-display uppercase tracking-widest text-[1rem] text-white/5 opacity-60">PARTSPEDDLE</span>
            {part.images && part.images.length > 0 ? (
                <img src={part.images[0]} alt={part.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 relative z-10" />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 opacity-50">
                    <Disc className="w-10 h-10 text-white" />
                    <span className="font-display text-white text-xs uppercase font-bold">PICTURES COMING SOON</span>
                </div>
            )}
        </div>
        <div className="p-4 flex flex-col flex-grow bg-white">
          <div className="flex items-center gap-[6px] mb-[6px]">
            <IconComp className="w-[16px] h-[16px] text-rust-copper" />
            <span className="text-[0.8rem] text-rust-copper font-semibold uppercase tracking-[0.05em]">{part.system}</span>
          </div>
          <h2 className="font-display font-bold text-[1.25rem] text-[#1E1E1E] leading-[1.2] mb-[6px] line-clamp-2 h-12">{part.title}</h2>
          <p className="text-[14px] text-[#8A8A8A] font-sans mb-[12px] line-clamp-1">{part.subtitle}</p>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-[1.5rem] font-display font-bold text-[#1E1E1E] leading-none">${part.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(part.id)}
      className="bg-white border border-rust-copper/15 rounded-[8px] p-4 flex flex-row gap-6 items-center cursor-pointer hover:border-rust-copper transition-all duration-200 animate-fade-in shadow-[0_2px_8px_rgba(0,0,0,0.08)] w-full group"
    >
      <div className="w-48 aspect-video relative overflow-hidden bg-[#2D2D2D] rounded-lg shrink-0 flex items-center justify-center">
        {part.images && part.images.length > 0 ? (
            <img src={part.images[0]} alt={part.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
            <div className="flex flex-col items-center gap-2 opacity-50">
                <Disc className="w-10 h-10 text-white" />
                <span className="font-display text-white text-xs uppercase font-bold">PICTURES COMING SOON</span>
            </div>
        )}
      </div>
      <div className="flex-grow space-y-1.5 py-1">
        <div className="flex items-center gap-1 text-[0.75rem] text-rust-copper font-semibold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          <span>{part.system}</span>
        </div>
        <h2 className="font-display font-bold text-xl text-[#1E1E1E] leading-tight">{part.title}</h2>
        <p className="text-sm text-[#8A8A8A] font-medium">{part.subtitle}</p>
      </div>
      <div className="border-l border-zinc-200 pl-6 flex flex-col gap-2 items-end justify-between">
        <span className="text-2xl font-display font-bold text-[#1E1E1E]">${part.price.toFixed(2)}</span>
        <button className="text-rust-copper text-[10px] font-black uppercase tracking-wider bg-rust-copper/5 px-4 py-2 rounded-md border border-rust-copper/20 hover:bg-rust-copper hover:text-white transition-all cursor-pointer">VIEW DETAILS</button>
      </div>
    </div>
  );
};
