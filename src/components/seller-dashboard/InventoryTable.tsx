import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import { Part } from '../../types';
import { Edit3, Eye, Trash2, Package, AlertCircle } from 'lucide-react';

export const InventoryTable: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInventory = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('parts')
          .select('*, offers(count)')
          .eq('seller_id', user.id);
        
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

  return (
    <div className="bg-charcoal rounded-xl shadow-sm border border-oil-dark overflow-hidden">
      <div className="p-6 border-b border-oil-dark flex items-center justify-between bg-steel-black">
        <h3 className="font-display font-bold uppercase text-base-cream flex items-center gap-2">
          <Package className="w-5 h-5 text-rust-copper" />
          Active Inventory
        </h3>
        <span className="bg-rust-copper/10 text-rust-copper px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          {parts.length} Listings
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-steel-black border-b border-oil-dark">
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-warm-gray tracking-widest">Part</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-warm-gray tracking-widest">Price</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-warm-gray tracking-widest">Stats</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-warm-gray tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-oil-dark">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-steel-black/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={part.images?.[0] || ''} className="w-12 h-12 rounded-lg bg-steel-black border border-oil-dark object-cover" />
                    <div>
                      <span className="font-display font-bold text-base-cream">{part.title}</span>
                      <span className="block text-[10px] text-warm-gray font-mono">SKU: {part.stock_number || 'N/A'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-base-cream">${(part.price_mxn / 20 || 0).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-4 text-[10px] text-warm-gray font-bold uppercase">
                    <span>Views: {part.views || 0}</span>
                    <span>Offers: {part.offers?.[0]?.count || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/detail/${part.id}`)} className="p-2 text-warm-gray hover:text-base-cream"><Eye className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack */}
      <div className="md:hidden space-y-4 p-4">
        {parts.map(part => (
          <div key={part.id} className="bg-steel-black border border-oil-dark rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <img src={part.images?.[0]} className="w-12 h-12 rounded-lg bg-steel-black border border-oil-dark object-cover" />
                <div>
                    <h4 className="font-bold text-base-cream text-sm">{part.title}</h4>
                    <p className="text-[10px] text-warm-gray font-mono">${(part.price_mxn / 20 || 0).toFixed(2)}</p>
                </div>
            </div>
            <span className="text-[10px] font-bold text-rust-copper bg-rust-copper/10 px-2 py-1 rounded">Offers: {part.offers?.[0]?.count || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
