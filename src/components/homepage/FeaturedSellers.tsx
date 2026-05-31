import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Star, MapPin, Award } from 'lucide-react';
import { Seller } from '../../types';

export const FeaturedSellers: React.FC = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<any[]>([]);

  useEffect(() => {
    const fetchSellers = async () => {
        const { data } = await supabase
            .from('seller_profiles')
            .select('*')
            .order('rating', { ascending: false })
            .limit(4);
        
        if (data) setSellers(data);
    };
    fetchSellers();
  }, []);

  return (
    <section className="bg-zinc-100 py-20 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-2 border-l-4 border-[#B87333] pl-6">
          <span className="text-[#B87333] font-display font-bold uppercase tracking-widest text-sm">Verified Network</span>
          <h2 className="text-4xl font-display font-black uppercase text-zinc-900">Featured Recycling Yards</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sellers.map((seller) => (
            <div key={seller.id} className="bg-white rounded-sm overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-zinc-200 group">
              <div className="h-40 relative">
                <img src={seller.logo_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=300'} alt={seller.business_name} className="w-full h-full object-cover group-hover:scale-105 transition-duration-500" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-sm flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold">{seller.rating || '5.0'}</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg uppercase text-zinc-900 line-clamp-1">{seller.business_name}</h3>
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
                  onClick={() => navigate('/listing')}
                  className="w-full py-2.5 rounded-sm border-2 border-zinc-900 text-zinc-900 font-display font-bold uppercase text-xs hover:bg-zinc-900 hover:text-white transition-all"
                >
                  View Inventory
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
