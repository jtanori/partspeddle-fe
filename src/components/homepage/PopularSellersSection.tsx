import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { MOCK_SELLERS } from '../../services/db';

const sellerImages = [
  'https://images.unsplash.com/photo-1532585078488-03b0ff297fea?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1517524006129-4a3a3eac48cd?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=300'
];

const sellerListingsPreview = [
  ['Chevy C10 Alternator', 'GM V8 Starter', 'C1500 Grille Mold'],
  ['TH400 Transmission', 'Universal Torque Conv', 'Ford 31-S Axle'],
  ['F150 Door Shell', 'Bronco Body Panel', 'Scottsdale Fenders'],
  ['Holley 4160 Carb', 'Edelbrock Intake', 'Vintage Fuel Valve'],
  ['Ford 9" Rear End', 'Heavy Duty Leaf Springs', '4.1L Crankshaft']
];

export const PopularSellersSection: React.FC = () => {
  const navigate = useNavigate();

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
        {MOCK_SELLERS.slice(0, 5).map((seller, idx) => (
          <div key={seller.id} className="bg-white border border-zinc-200 rounded p-4 shadow-xs relative flex flex-col justify-between hover:shadow-lg transition-all">
            <div className="space-y-3">
              <div className="aspect-video relative rounded overflow-hidden bg-zinc-800">
                <img src={sellerImages[idx]} alt={seller.name} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 text-[9px] bg-black/60 text-white font-mono px-1.5 py-0.5 rounded">★ VETTED YARD ★</span>
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-[#1E1E1E] leading-tight line-clamp-1">{seller.name}</h3>
                <span className="block text-[10px] text-zinc-400 font-sans font-semibold uppercase">{seller.location}</span>
              </div>

              <div className="space-y-1 pt-1 border-t border-zinc-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Yard Rating:</span>
                  <div className="flex items-center gap-0.5 text-zinc-700">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="font-mono font-bold">{seller.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Active Parts:</span>
                  <span className="font-mono font-bold text-[#B87333]">{seller.partCount} listings</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                <span className="text-[9px] uppercase font-display font-black text-zinc-400 tracking-wider block">In-Stock Specials:</span>
                <div className="flex flex-col gap-1">
                  {(sellerListingsPreview[idx] || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10.5px] text-zinc-700 bg-[#F5F0EB]/40 border border-zinc-200/50 py-1 px-2 rounded-sm font-sans truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B87333] flex-shrink-0 animate-pulse"></span>
                      <span className="truncate font-medium">{item}</span>
                    </div>
                  ))}
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
