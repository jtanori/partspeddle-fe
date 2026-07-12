import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/hooks';
import { useSellerInventory } from '@/hooks/useSellerInventory';
import { Package, TrendingUp, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';

interface InventoryTableProps {
  filter?: 'active' | 'sold' | 'archived';
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ filter }) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { parts, loading, error } = useSellerInventory({ userId: user?.id, filter });

  if (loading) {
    return (
      <div className="terminal-panel overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8 border-b border-border-default bg-shell-canvas/50">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-sm" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-shell-canvas/30 border-b border-border-subtle">
                {['PART DETAILS', 'LISTING PRICE', 'LISTING PERFORMANCE', 'ACTIONS'].map(
                  (header) => (
                    <th key={header} className="px-6 py-4">
                      <Skeleton className="h-3 w-24" />
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <Skeleton className="h-14 w-14 rounded-sm" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-6">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Skeleton className="ml-auto h-8 w-24" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-4 p-6 bg-shell-canvas/20">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="terminal-elevated p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-sm" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load inventory"
        description={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (parts.length === 0) {
    return (
      <EmptyState
        title="No inventory yet"
        description="Start building your catalog by creating a new listing."
        actionText="Create Listing"
        onAction={() => router.push('/seller/create')}
        icon={<Package className="h-12 w-12 text-brand-primary" />}
      />
    );
  }

  return (
    <div className="terminal-panel overflow-hidden">
      <div className="p-4 sm:p-6 md:p-8 border-b border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-shell-canvas/50">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-accent-amber/10 rounded-sm border border-accent-amber/20">
            <Package className="w-5 h-5 text-accent-amber" />
          </div>
          <div>
            <h3 className="font-heading font-black uppercase text-text-primary text-base tracking-wider">
              {filter ? `${filter.toUpperCase()} INVENTORY` : 'Active Inventory Registry'}
            </h3>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mt-0.5">
              Physical Asset Identification Database
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="block text-[10px] font-mono text-text-muted uppercase">
              Fleet Capacity
            </span>
            <span className="block text-xs font-black text-text-primary uppercase tracking-tight">
              {parts.length} Active Units
            </span>
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
              <th className="px-6 py-4 uppercase font-bold text-text-muted tracking-widest">
                PART DETAILS
              </th>
              <th className="px-6 py-4 uppercase font-bold text-text-muted tracking-widest">
                LISTING PRICE
              </th>
              <th className="px-6 py-4 uppercase font-bold text-text-muted tracking-widest">
                LISTING PERFORMANCE
              </th>
              <th className="px-6 py-4 uppercase font-bold text-text-muted tracking-widest text-right">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-accent-amber/[0.03] transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-shell-sidebar rounded-sm border border-border-strong overflow-hidden flex-shrink-0 shadow-inner group-hover:border-accent-amber/40 transition-colors">
                      <img
                        src={part.images?.[0] || ''}
                        className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="font-heading font-black text-text-primary block group-hover:text-accent-amber transition-colors uppercase tracking-tight text-sm">
                        {part.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-muted font-mono bg-shell-canvas/50 px-1.5 py-0.5 rounded-sm border border-border-subtle uppercase">
                          ID: {part.stock_number || 'UNTRACKED'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${part.status === 'active' ? 'text-success bg-success/10' : 'text-text-muted bg-shell-canvas'}`}
                        >
                          {part.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-text-muted uppercase font-bold">
                      List Price
                    </span>
                    <span className="font-mono font-black text-accent-amber tracking-tighter text-base block">
                      ${(part.price_mxn / 20 || 0).toFixed(2)}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-0.5">
                      <span className="block text-text-muted text-[9px] uppercase font-bold tracking-widest">
                        Views
                      </span>
                      <span className="font-mono font-black text-text-primary text-sm">
                        {part.views || 0}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-text-muted text-[9px] uppercase font-bold tracking-widest">
                        Pending
                      </span>
                      <span className="font-mono font-black text-success text-sm">0</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button
                    onClick={() => router.push(`/listing/${part.id}`)}
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
        {parts.map((part) => (
          <div key={part.id} className="terminal-elevated p-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-shell-sidebar rounded-sm border border-border-strong overflow-hidden flex-shrink-0 shadow-inner">
                <img
                  src={part.images?.[0]}
                  className="w-full h-full object-cover grayscale-[0.3]"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-black text-text-primary text-xs uppercase truncate tracking-tight">
                  {part.title}
                </h4>
                <p className="text-sm font-mono font-black text-accent-amber mt-1">
                  ${(part.price_mxn / 20 || 0).toFixed(2)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-text-muted font-mono uppercase truncate">
                    ID: {part.stock_number || '---'}
                  </span>
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
                onClick={() => router.push(`/listing/${part.id}`)}
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
