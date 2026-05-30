import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { MOCK_SELLERS } from '../../services/db';
import { Star, MapPin, Award } from 'lucide-react';

const SELLER_IMAGES = [
  'https://images.unsplash.com/photo-1532585078488-03b0ff297fea?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1517524006129-4a3a3eac48cd?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=300'
];

export const FeaturedSellers: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-zinc-100 py-20 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-2 border-l-4 border-[#B87333] pl-6">
          <span className="text-[#B87333] font-display font-bold uppercase tracking-widest text-sm">Verified Network</span>
          <h2 className="text-4xl font-display font-black uppercase text-zinc-900">Featured Recycling Yards</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_SELLERS.slice(0, 4).map((seller, idx) => (
            <div key={seller.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-zinc-200 group">
              <div className="h-40 relative">
                <img src={SELLER_IMAGES[idx]} alt={seller.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold">{seller.rating}</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg uppercase text-zinc-900 line-clamp-1">{seller.name}</h3>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{seller.location}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Specialty</span>
                    <span className="text-xs font-semibold text-zinc-700">{seller.specialty}</span>
                  </div>
                  <Award className="w-6 h-6 text-[#B87333]/20" />
                </div>

                <button 
                  onClick={() => navigate('/listing')}
                  className="w-full py-2.5 rounded-lg border-2 border-zinc-900 text-zinc-900 font-display font-bold uppercase text-xs hover:bg-zinc-900 hover:text-white transition-all"
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
