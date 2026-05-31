import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import { Eye, Package } from 'lucide-react';

export const InventoryTable: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error('Failed to load inventory:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadInventory();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-zinc-950 rounded-sm border border-zinc-800 p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Synchronizing Yard Node...</span>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 rounded-sm border border-zinc-800 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
        <h3 className="font-sans font-black uppercase text-base-cream flex items-center gap-2 text-sm tracking-wider">
          <Package className="w-4 h-4 text-amber-500" />
          Active Inventory Registry
        </h3>
        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest font-mono">
          {parts.length} Active Units
        </span>
      </div>

      {/* Desktop Table - Sharp Utilitarian Grid */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-[11px]">
          <thead>
            <tr className="bg-zinc-900/50 border-b border-zinc-800">
              <th className="px-6 py-4 uppercase font-bold text-zinc-500 tracking-widest">Part Identity</th>
              <th className="px-6 py-4 uppercase font-bold text-zinc-500 tracking-widest">Market Value</th>
              <th className="px-6 py-4 uppercase font-bold text-zinc-500 tracking-widest">Telemetry</th>
              <th className="px-6 py-4 uppercase font-bold text-zinc-500 tracking-widest text-right">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-amber-500/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-900 rounded-sm border border-zinc-800 overflow-hidden flex-shrink-0 shadow-inner">
                        <img src={part.images?.[0] || ''} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                    </div>
                    <div>
                      <span className="font-sans font-bold text-neutral-200 block group-hover:text-amber-400 transition-colors uppercase tracking-tight">{part.title}</span>
                      <span className="block text-[9px] text-zinc-600 font-mono mt-0.5">ID: {part.stock_number || 'UNTRACKED'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-black text-amber-500/90 tracking-tighter text-sm">${(part.price_mxn / 20 || 0).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-4 text-[9px] text-zinc-500 font-bold uppercase tracking-wide">
                    <span className="flex items-center gap-1">Views: <span className="text-zinc-300">{part.views || 0}</span></span>
                    <span className="flex items-center gap-1">Offers: <span className="text-emerald-500">{part.offers?.[0]?.count || 0}</span></span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => navigate(`/detail/${part.id}`)} 
                        className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition-all uppercase font-bold"
                    >
                        View Node
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack */}
      <div className="md:hidden space-y-3 p-4 bg-zinc-900/10">
        {parts.map(part => (
          <div key={part.id} className="bg-zinc-950 border border-zinc-800 rounded-sm p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
                <img src={part.images?.[0]} className="w-12 h-12 rounded-sm bg-zinc-900 border border-zinc-800 object-cover" />
                <div>
                    <h4 className="font-sans font-bold text-neutral-200 text-xs uppercase">{part.title}</h4>
                    <p className="text-[10px] text-amber-500 font-black mt-0.5">${(part.price_mxn / 20 || 0).toFixed(2)}</p>
                </div>
            </div>
            <div className="text-right">
                <span className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Pending Offers</span>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-sm border border-emerald-500/20">{part.offers?.[0]?.count || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
