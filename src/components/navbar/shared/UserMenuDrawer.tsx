import React from 'react';
import { History, Heart, Package, Settings, LogOut, User } from 'lucide-react';

interface UserMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email: string; name?: string; avatarUrl?: string } | null;
  profile: { hasSellerSetup?: boolean } | null;
  onChangeView: (view: string) => void;
  onSetSellerTab?: (tab: 'listings' | 'create' | 'settings' | 'snap') => void;
  onLogout: () => void;
}

export const UserMenuDrawer: React.FC<UserMenuDrawerProps> = ({
  isOpen,
  onClose,
  user,
  profile,
  onChangeView,
  onSetSellerTab,
  onLogout
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-end justify-center bg-steel-black/80 backdrop-blur-xs">
      {/* Click-Out Backdrop Closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* The Control Panel Sheet */}
      <div className="relative w-full max-w-md bg-charcoal border-t-2 border-rust-copper rounded-t-2xl p-5 shadow-2xl z-10 pb-8 max-h-[90vh] overflow-y-auto animate-fade-in">
        
        {/* Alignment Notch */}
        <div className="w-12 h-1 bg-oil-dark rounded-full mx-auto -mt-2 mb-4" />

        {/* TIER 1: IDENTITY NODE */}
        <div className="bg-steel-black p-4 rounded-xl border border-oil-dark flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-lg bg-oil-dark border border-rust-copper/30 flex items-center justify-center text-rust-copper font-display font-black text-lg shrink-0 overflow-hidden">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-display text-sm font-black uppercase tracking-wide truncate text-base-cream">
              {user?.name || "Terminal Operator"}
            </h4>
            <p className="text-[10px] font-mono text-warm-gray truncate tracking-tight mt-0.5">
              {user?.email || "offline_session@partspeddle.db"}
            </p>
          </div>
        </div>

        {/* TIER 2: COHESIVE WORKSPACE MATRIX */}
        <div className="bg-steel-black/40 border border-oil-dark rounded-xl overflow-hidden divide-y divide-oil-dark/60">
          
          {/* Destination: Sourcing History */}
          <button
            onClick={() => {
              onChangeView('orders');
              onClose();
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-steel-black text-left text-xs font-sans font-semibold text-base-cream transition-colors group cursor-pointer"
          >
            <History className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            <span className="flex-1">My Purchases / Escrow Flows</span>
          </button>

          {/* Destination: Parts Inventory Vault */}
          <button
            onClick={() => {
              if (onSetSellerTab) onSetSellerTab('listings');
              onChangeView('listings');
              onClose();
            }}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-steel-black text-left text-xs font-sans font-semibold text-base-cream transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <Package className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
              <span>My Garage Inventory</span>
            </div>
            {!profile?.hasSellerSetup && (
              <span className="text-[8px] font-mono font-bold bg-rust-copper/10 text-rust-copper px-1.5 py-0.5 rounded border border-rust-copper/20 uppercase tracking-widest">
                Setup
              </span>
            )}
          </button>

          {/* Destination: Saved Components */}
          <button
            onClick={() => {
              onChangeView('favorites');
              onClose();
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-steel-black text-left text-xs font-sans font-semibold text-base-cream transition-colors group cursor-pointer"
          >
            <Heart className="w-4 h-4 text-warm-gray group-hover:text-rose-400 transition-colors" />
            <span className="flex-1">Saved Components Vault</span>
          </button>

          {/* Destination: System Calibration Parameters */}
          <button
            onClick={() => {
              onChangeView('settings');
              onClose();
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-steel-black text-left text-xs font-sans font-semibold text-base-cream transition-colors group cursor-pointer"
          >
            <Settings className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            <span className="flex-1">Account Terminal Parameters</span>
          </button>
          
        </div>

        {/* TIER 3: DESTRUCTIVE SYSTEM FOOTER */}
        <div className="pt-1">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 rounded-xl transition-all text-left cursor-pointer font-display"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Disconnect Session Terminal
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
