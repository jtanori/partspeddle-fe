import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Cog, Compass, Disc, Zap, Car, Armchair } from 'lucide-react';
import { MOCK_PARTS } from '../../services/db';
import { PARTS_FALLBACK_IMAGE } from '../../types';
import { Part } from '../../types';

const getSystemIcon = (sysName: string) => {
  switch (sysName) {
    case 'Powertrain': return Cog;
    case 'Suspension & Steering': return Compass;
    case 'Brake System': return Disc;
    case 'Electrical System': return Zap;
    case 'Body & Exterior': return Car;
    case 'Interior': return Armchair;
    default: return Cog;
  }
};

const partThumbnails: Record<string, string> = {
  '1100428': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=300',
  '1100429': 'https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?auto=format&fit=crop&q=80&w=300',
  '1100430': 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=300',
  '1100431': 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=300',
  '1100432': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=300'
};

interface ListingsGridProps {
  title: string;
  subtitle: string;
  parts: Part[];
}

export const ListingsGrid: React.FC<ListingsGridProps> = ({ title, subtitle, parts }) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (partId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(partId) ? prev.filter(id => id !== partId) : [...prev, partId]);
  };

  const getConditionColor = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('new') || c.includes('original')) return 'bg-[#B87333] text-white font-bold';
    if (c.includes('excellent')) return 'bg-[#7A8B6F] text-white font-bold';
    if (c.includes('good')) return 'bg-[#C4A882] text-zinc-900 font-bold';
    return 'bg-[#8B6239] text-white font-semibold';
  };

  return (
    <section className="max-w-7xl mx-auto px-4 mb-16 pt-16">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#1E1E1E]">
            {title}
          </h2>
          <p className="text-xs text-zinc-500 font-sans">
            {subtitle}
          </p>
        </div>
        <button onClick={() => navigate('/listing')} className="text-sm uppercase tracking-wider font-display font-bold text-[#B87333] hover:text-[#C4A882] transition-colors flex items-center gap-1">
          View All
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {parts.map((part) => {
          const IconComp = getSystemIcon(part.system || 'Powertrain');
          const hasImage = part.images && part.images.length > 0;
          return (
            <div
              key={part.id}
              onClick={() => navigate(`/detail/${part.id}`)}
              className="bg-white border border-stone-800/10 rounded shadow-sm hover:shadow-xl hover:border-[#B87333] transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div className="aspect-video relative overflow-hidden bg-zinc-900 rounded-t flex items-center justify-center">
                {hasImage ? (
                    <img src={partThumbnails[part.id] || part.images[0]} alt={part.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-95" />
                ) : (
                    <div className="flex flex-col items-center gap-2 opacity-50">
                        <Cog className="w-12 h-12 text-white" />
                        <span className="font-display text-white text-xs uppercase font-bold">PICTURES COMING SOON</span>
                    </div>
                )}
                <button onClick={(e) => toggleFavorite(part.id, e)} className="absolute top-2 right-2 p-1.5 bg-[#FCFAF7]/85 backdrop-blur-xs rounded-full border border-stone-800/5 hover:text-red-500 transition-colors shadow">
                  <Heart className={`w-3.5 h-3.5 ${favorites.includes(part.id) ? 'fill-red-500 text-red-500' : 'text-zinc-500'}`} />
                </button>
                <span className={`absolute bottom-2 left-2 text-[10px] font-display font-bold uppercase tracking-wider py-0.5 px-2 rounded-sm ${getConditionColor(part.condition)}`}>
                  {part.condition}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-[#B87333] font-display font-semibold uppercase tracking-wider mb-1">
                    <IconComp className="w-3 h-3 stroke-[2.5]" />
                    <span>{part.system}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#1E1E1E] tracking-tight group-hover:text-[#B87333] transition-colors line-clamp-1">{part.title}</h3>
                  <p className="text-sm text-stone-500 font-sans leading-relaxed line-clamp-1">{part.subtitle}</p>
                </div>

                <div className="border-t border-[#1A1A1A]/10 pt-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-xl text-[#1E1E1E] leading-none">${part.price.toFixed(2)}</span>
                    <span className="font-sans text-[11px] text-zinc-700 font-bold tracking-tight">Verified Yard ★ 4.8</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
