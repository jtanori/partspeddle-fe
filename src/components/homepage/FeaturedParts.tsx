import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Cog, Compass, Disc, Zap, Car, Armchair } from 'lucide-react';
import { PARTS_FALLBACK_IMAGE } from '../../types';
import { supabaseDb } from '../../services/supabase-db';
import { Part } from '../../types';

// ... (getSystemIcon stays)

export const FeaturedParts: React.FC = () => {
  const navigate = useNavigate();
  const [parts, setParts] = useState<Part[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
      const data = await supabaseDb.getFeaturedParts(8);
      setParts(data || []);
      } catch (err) {
        console.error('Error fetching featured parts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

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
    <section className="max-w-7xl mx-auto px-4" id="id-home-featured">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#1E1E1E]">
            Featured Parts Index
          </h2>
          <p className="text-xs text-zinc-500 font-sans">
            Inspected listings from our highest rated sellers
          </p>
        </div>
        <button onClick={() => navigate('/listing')} className="text-sm uppercase tracking-wider font-display font-bold text-[#B87333] hover:text-[#C4A882] transition-colors flex items-center gap-1">
          View All Parts
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 scrollbar-none sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
        {parts.map((part) => {
          const IconComp = getSystemIcon(part.system || 'Powertrain');
          return (
            <div
              key={part.id}
              onClick={() => navigate(`/detail/${part.id}`)}
              className="w-[82%] sm:w-full flex-shrink-0 sm:flex-shrink snap-start bg-white border border-stone-800/10 rounded shadow-sm hover:shadow-xl hover:border-[#B87333] transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div className="aspect-video relative overflow-hidden bg-zinc-900 rounded-t">
                <img src={part.images?.[0] || PARTS_FALLBACK_IMAGE} alt={part.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-95" />
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
