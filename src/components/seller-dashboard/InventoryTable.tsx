import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import { Part } from '../../types';
import { Edit3, Eye, Trash2, Package, AlertCircle } from 'lucide-react';

export const InventoryTable: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInventory = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('parts')
          .select('*')
          .eq('seller_id', user.id); // Secure Row-Level Scoping
        
        if (error) throw error;
        setParts(data || []);
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
      <div className="bg-charcoal rounded-xl shadow-sm border border-oil-dark p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-rust-copper border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-warm-gray uppercase tracking-widest">Loading Yard Inventory...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-charcoal rounded-xl shadow-sm border border-rose-500/20 p-20 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <span className="text-sm font-bold text-rose-400 uppercase tracking-widest">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-charcoal rounded-xl shadow-sm border border-oil-dark overflow-hidden">
      <div className="p-6 border-b border-oil-dark flex items-center justify-between bg-steel-black">
        <h3 className="font-display font-bold uppercase text-base-cream flex items-center gap-2">
          <Package className="w-5 h-5 text-rust-copper" />
          Active Inventory
        </h3>
        <div className="flex items-center gap-2">
          <span className="bg-rust-copper/10 text-rust-copper px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {parts.length} Listings
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-steel-black border-b border-oil-dark">
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-warm-gray tracking-widest">Part Detail</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-warm-gray tracking-widest">Pricing</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-warm-gray tracking-widest">Condition</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-warm-gray tracking-widest">Performance</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-warm-gray tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-oil-dark">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-steel-black/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-steel-black rounded-lg overflow-hidden flex-shrink-0 border border-oil-dark">
                      <img src={part.images?.[0] || 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=150'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-display font-bold text-base-cream block group-hover:text-rust-copper transition-colors">{part.title}</span>
                      <span className="text-[10px] text-warm-gray font-mono uppercase tracking-tighter">SKU: {part.stockNumber || 'N/A'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-base-cream block">${(part.price || 0).toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                    part.condition === 'Excellent' ? 'bg-sage-green/10 text-sage-green border-sage-green/20' : 'bg-oil-dark text-warm-gray border-oil-dark'
                  }`}>
                    {part.condition}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="space-y-0.5">
                      <span className="block text-warm-gray text-[9px] uppercase font-bold">Views</span>
                      <span className="font-bold text-base-cream">{part.views || 0}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/detail/${part.id}`)} className="p-2 text-warm-gray hover:text-base-cream hover:bg-oil-dark rounded-lg transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-warm-gray hover:text-rust-copper hover:bg-oil-dark rounded-lg transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-warm-gray hover:text-rose-500 hover:bg-oil-dark rounded-lg transition-all">
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
