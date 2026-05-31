import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Star } from 'lucide-react';

export const PopularSellersSection: React.FC = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<any[]>([]);

  useEffect(() => {
    const fetchSellers = async () => {
        const { data } = await supabase
            .from('seller_profiles')
            .select('*')
            .order('rating', { ascending: false })
            .limit(5);
        
        if (data) setSellers(data);
    };
    fetchSellers();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4" id="id-popular-sellers">
      <div className="space-y-1 mb-6">
        <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#1E1E1E]">
          Popular Vetted Sellers
        </h2>
        <p className="text-xs text-zinc-500 font-sans">
          Regional yards committing to 1-day freight dispatch and 30-day warrant indexes
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {sellers.map((seller) => (
          <div key={seller.id} className="bg-white border border-zinc-200 rounded p-4 shadow-xs relative flex flex-col justify-between hover:shadow-lg transition-all">
            <div className="space-y-3">
              <div className="aspect-video relative rounded overflow-hidden bg-zinc-800">
                <img src={seller.logo_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=300'} alt={seller.business_name} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 text-[9px] bg-black/60 text-white font-mono px-1.5 py-0.5 rounded">★ VETTED YARD ★</span>
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-[#1E1E1E] leading-tight line-clamp-1">{seller.business_name}</h3>
                <span className="block text-[10px] text-zinc-400 font-sans font-semibold uppercase">{seller.location || 'Local Yard'}</span>
              </div>

              <div className="space-y-1 pt-1 border-t border-zinc-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Yard Rating:</span>
                  <div className="flex items-center gap-0.5 text-zinc-700">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="font-mono font-bold">{seller.rating || '5.0'}</span>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => navigate('/listing')} className="mt-4 w-full text-center text-[10px] font-display font-medium border border-zinc-200 hover:border-[#B87333] hover:text-[#B87333] py-2 rounded-sm transition-all">
              BROWSE YARD INVENTORY
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
