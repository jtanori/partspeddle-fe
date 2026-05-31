import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import { Eye, Package, TrendingUp, AlertCircle } from 'lucide-react';

interface InventoryTableProps {
  filter?: 'active' | 'sold' | 'archived';
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ filter }) => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInventory = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      try {
        let query = supabase
          .from('parts')
          .select('id, title, price_mxn, stock_number, images, status, offers(count)')
          .eq('seller_id', user.id);

        
        if (filter) {
            query = query.eq('status', filter);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        setParts(data || []);
      } catch (err: any) {
        console.error('Failed to load inventory:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadInventory();
  }, [user, filter]);

  if (loading) {
    return (
      <div className="terminal-panel p-24 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-accent-amber/20 border-t-accent-amber rounded-full animate-spin"></div>
          <Package className="absolute inset-0 m-auto w-5 h-5 text-accent-amber animate-pulse" />
        </div>
        <span className="text-xs font-heading font-bold text-text-muted uppercase tracking-[0.25em]">Synchronizing Yard Node...</span>
      </div>
    );
  }

  return (
    <div className="terminal-panel overflow-hidden">
      <div className="p-8 border-b border-border-default flex items-center justify-between bg-shell-canvas/50">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-accent-amber/10 rounded-sm border border-accent-amber/20">
            <Package className="w-5 h-5 text-accent-amber" />
          </div>
          <div>
            <h3 className="font-heading font-black uppercase text-text-primary text-base tracking-wider">
              {filter ? `${filter.toUpperCase()} INVENTORY` : 'Active Inventory Registry'}
            </h3>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mt-0.5">Physical Asset Identification Database</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="block text-[10px] font-mono text-text-muted uppercase">Fleet Capacity</span>
            <span className="block text-xs font-black text-text-primary uppercase tracking-tight">{parts.length} Active Units</span>
          </div>
          <div className="w-px h-8 bg-border-subtle mx-2" />
          <TrendingUp className="w-4 h-4 text-success opacity-50" />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-[11px]">
          <thead>
            <tr className="bg-shell-canvas/30 border-b border-border-subtle">
              <th className="px-8 py-5 uppercase font-bold text-text-muted tracking-widest">Part Identity</th>
              <th className="px-8 py-5 uppercase font-bold text-text-muted tracking-widest">Market Value</th>
              <th className="px-8 py-5 uppercase font-bold text-text-muted tracking-widest">Performance Telemetry</th>
              <th className="px-8 py-5 uppercase font-bold text-text-muted tracking-widest text-right">Operational Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-accent-amber/[0.03] transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-shell-sidebar rounded-sm border border-border-strong overflow-hidden flex-shrink-0 shadow-inner group-hover:border-accent-amber/40 transition-colors">
                        <img src={part.images?.[0] || ''} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-heading font-black text-text-primary block group-hover:text-accent-amber transition-colors uppercase tracking-tight text-sm">{part.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-muted font-mono bg-shell-canvas/50 px-1.5 py-0.5 rounded-sm border border-border-subtle uppercase">ID: {part.stock_number || 'UNTRACKED'}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${part.status === 'active' ? 'text-success bg-success/10' : 'text-text-muted bg-shell-canvas'}`}>{part.status}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-text-muted uppercase font-bold">List Price</span>
                    <span className="font-mono font-black text-accent-amber tracking-tighter text-base block">${(part.price_mxn / 20 || 0).toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-0.5">
                      <span className="block text-text-muted text-[9px] uppercase font-bold tracking-widest">Views</span>
                      <span className="font-mono font-black text-text-primary text-sm">{part.views || 0}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-text-muted text-[9px] uppercase font-bold tracking-widest">Pending</span>
                      <span className="font-mono font-black text-success text-sm">0</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                    <button 
                        onClick={() => navigate(`/detail/${part.id}`)} 
                        className="px-5 py-2.5 bg-shell-canvas border border-border-strong rounded-sm text-text-secondary hover:text-accent-amber hover:border-accent-amber transition-all uppercase font-black text-[10px] tracking-widest shadow-sm active:translate-y-0.5"
                    >
                        Access Node
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack */}
      <div className="md:hidden space-y-4 p-6 bg-shell-canvas/20">
        {parts.map(part => (
          <div key={part.id} className="terminal-elevated p-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-shell-sidebar rounded-sm border border-border-strong overflow-hidden flex-shrink-0 shadow-inner">
                    <img src={part.images?.[0]} className="w-full h-full object-cover grayscale-[0.3]" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-black text-text-primary text-xs uppercase truncate tracking-tight">{part.title}</h4>
                    <p className="text-sm font-mono font-black text-accent-amber mt-1">${(part.price_mxn / 20 || 0).toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-text-muted font-mono uppercase truncate">ID: {part.stock_number || '---'}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-text-muted uppercase">Views</span>
                        <span className="text-xs font-black text-text-secondary">{part.views || 0}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-text-muted uppercase">Offers</span>
                        <span className="text-xs font-black text-success">0</span>
                    </div>
                </div>
                <button 
                    onClick={() => navigate(`/detail/${part.id}`)}
                    className="px-4 py-2 bg-shell-canvas border border-border-strong rounded-sm text-[10px] font-black text-accent-amber uppercase tracking-widest"
                >
                    Access
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
