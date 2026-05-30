import React from 'react';
import { 
  User, Settings, History, Heart, Search, 
  HelpCircle, LogOut, ArrowRightLeft 
} from 'lucide-react';

interface UserMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email: string; name?: string; avatarUrl?: string } | null;
  userRole: 'buyer' | 'seller';
  onChangeUserRole: (role: 'buyer' | 'seller') => void;
  onChangeView: (view: string) => void;
  onLogout: () => void;
}

export const UserMenuDrawer: React.FC<UserMenuDrawerProps> = ({
  isOpen,
  onClose,
  user,
  userRole,
  onChangeUserRole,
  onChangeView,
  onLogout
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-end justify-center bg-steel-black/80 backdrop-blur-xs">
      {/* Tap Backdrop Closer */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Industrial Sheet Container */}
      <div className="relative w-full max-w-md bg-charcoal border-t-2 border-rust-copper rounded-t-2xl p-5 shadow-2xl space-y-5 text-base-cream z-10 max-h-[90vh] overflow-y-auto">
        
        {/* Drag Decal Bar */}
        <div className="w-12 h-1 bg-oil-dark rounded-full mx-auto -mt-2 mb-2" />

        {/* SECTION 1: COMMAND PROFILE BLOCK */}
        <div className="bg-steel-black p-4 rounded-xl border border-oil-dark flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-oil-dark border border-rust-copper/40 flex items-center justify-center text-rust-copper shrink-0 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-display text-sm font-black uppercase tracking-wide truncate text-base-cream">
                {user?.name || "Anonymous Mechanic"}
              </h4>
              <p className="text-[11px] font-mono text-warm-gray truncate">{user?.email}</p>
            </div>
          </div>

          {/* Active Context Identity Stamp */}
          <span className={`text-[9px] font-mono font-black tracking-widest px-2.5 py-1 rounded border ${
            userRole === 'seller' 
              ? 'bg-rust-copper/10 text-rust-copper border-rust-copper/30' 
              : 'bg-sage-green/10 text-sage-green border-sage-green/30'
          }`}>
            {userRole.toUpperCase()}
          </span>
        </div>

        {/* SECTION 2: CONTEXT ROLE ROTATION PIPELINE */}
        <button
          onClick={() => {
            onChangeUserRole(userRole === 'buyer' ? 'seller' : 'buyer');
            onChangeView(userRole === 'buyer' ? 'listings' : 'home');
            onClose();
          }}
          className="w-full bg-oil-dark/40 hover:bg-oil-dark border border-oil-dark p-3.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <ArrowRightLeft className="w-4 h-4 text-rust-copper group-hover:rotate-180 transition-transform duration-300" />
            <div className="text-left">
              <span className="block font-display text-xs font-bold uppercase tracking-wider text-base-cream">
                Switch Operating Protocol
              </span>
              <span className="block text-[10px] font-sans text-warm-gray mt-0.5">
                Swap matrix workspace parameters
              </span>
            </div>
          </div>
        </button>

        {/* SECTION 3: TRANSACTION & ACTIVITY MATRIX */}
        <div className="space-y-1">
          <span className="block text-[9px] font-mono font-bold tracking-widest text-warm-gray uppercase px-1 mb-1">
            Activity Registers
          </span>
          
          <button 
            onClick={() => { onChangeView(userRole === 'seller' ? 'listings' : 'orders'); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-steel-black rounded-lg transition-colors group text-left cursor-pointer min-h-[46px]"
          >
            <History className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            <span className="font-sans font-semibold text-xs text-base-cream">
              {userRole === 'seller' ? 'Manage Inventory Ledger' : 'Order Sourcing Records'}
            </span>
          </button>

          <button 
            onClick={() => { onChangeView('favorites'); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-steel-black rounded-lg transition-colors group text-left cursor-pointer min-h-[46px]"
          >
            <Heart className="w-4 h-4 text-warm-gray group-hover:text-rose-400 transition-colors" />
            <span className="font-sans font-semibold text-xs text-base-cream">Saved Components Vault</span>
          </button>
        </div>

        {/* SECTION 4: SYSTEM CALIBRATION UTILITIES */}
        <div className="space-y-1">
          <span className="block text-[9px] font-mono font-bold tracking-widest text-warm-gray uppercase px-1 mb-1">
            System Config
          </span>

          <button 
            onClick={() => { onChangeView('settings'); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-steel-black rounded-lg transition-colors group text-left cursor-pointer min-h-[46px]"
          >
            <Settings className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            <span className="font-sans font-semibold text-xs text-base-cream">Account Terminal Parameters</span>
          </button>

          <button 
            onClick={() => { onChangeView('support'); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-steel-black rounded-lg transition-colors group text-left cursor-pointer min-h-[46px]"
          >
            <HelpCircle className="w-4 h-4 text-warm-gray group-hover:text-rust-copper transition-colors" />
            <span className="font-sans font-semibold text-xs text-base-cream">Radio Support / Diagnostics</span>
          </button>
        </div>

        {/* SECTION 5: DESTRUCTIVE BOUNDARY MARGIN */}
        <div className="border-t border-oil-dark pt-3">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/30 rounded-xl transition-all text-left cursor-pointer min-h-[46px]"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span className="font-display font-bold text-xs uppercase tracking-wider text-rose-400">
              Disconnect Terminal Session
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
