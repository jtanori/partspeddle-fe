import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { supabaseDb } from '../../services/supabase-db';
import { Part } from '../../types';
import { Edit3, Eye, Trash2, Package, Tag, MapPin, AlertCircle } from 'lucide-react';

export const InventoryTable: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInventory = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        // For the prototype, we filter by seller email/id
        // In production, this would use Supabase Auth UID and RLS
        const results = await supabaseDb.searchListings({
          query: '',
          system: '',
          category: '',
          partTypes: [],
          priceRange: [0, 10000],
          conditions: [],
          sellerType: 'all',
          fitmentMake: 'All Makes',
          fitmentModel: 'All Models',
          fitmentYear: 'All Years',
          fitmentEngine: 'All Engines',
          featured: false
        });
        
        // Mock filter for the logged-in seller's parts
        // In a real DB, you'd add .eq('seller_id', user.id) to the query
        setParts(results);
      } catch (err: any) {
        setError(err.message || 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-[#B87333] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Yard Inventory...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-20 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <span className="text-sm font-bold text-red-600 uppercase tracking-widest">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <h3 className="font-display font-bold uppercase text-zinc-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#B87333]" />
          Active Inventory
        </h3>
        <div className="flex items-center gap-2">
          <span className="bg-[#B87333]/10 text-[#B87333] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {parts.length} Listings
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Part Detail</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Pricing</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Condition</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Performance</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-400 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=150" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-display font-bold text-zinc-900 block group-hover:text-[#B87333] transition-colors">{part.title}</span>
                      <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-tighter">SKU: {part.trackingNumber}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-zinc-900 block">${part.price.toFixed(2)}</span>
                    <span className="text-[10px] text-[#7A8B6F] font-bold uppercase">Shipping Inc.</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                    part.condition === 'Excellent' ? 'bg-[#7A8B6F]/10 text-[#7A8B6F] border-[#7A8B6F]/20' : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                  }`}>
                    {part.condition}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="space-y-0.5">
                      <span className="block text-zinc-400 text-[9px] uppercase font-bold">Views</span>
                      <span className="font-bold text-zinc-700">{part.views || 0}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-zinc-400 text-[9px] uppercase font-bold">Offers</span>
                      <span className="font-bold text-zinc-700">2</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/detail/${part.id}`)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-[#B87333] hover:bg-[#B87333]/5 rounded-lg transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
