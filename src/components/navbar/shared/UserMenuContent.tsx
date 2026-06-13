import React from 'react';
import { User, Heart, History, HelpCircle, LayoutDashboard, Package, Tag, Settings, LogOut, BookOpen } from 'lucide-react';
import { UserSession } from '../../../types';
import userAvatarImg from '../../../assets/images/user_avatar.png';
import userSellerAvatarImg from '../../../assets/images/user_seller_avatar.png';

interface UserMenuContentProps {
  user: UserSession | null;
  userRole: 'buyer' | 'seller';
  profile: Record<string, any> | null;
  onChangeView: (view: string) => void;
  onSetSellerTab?: (tab: 'listings' | 'settings' | 'snap') => void;
  onOpenSupport: () => void;
  onOpenTour: () => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
  onClose: () => void;
}

export const UserMenuContent: React.FC<UserMenuContentProps> = ({
  user, userRole, profile, onChangeView, onSetSellerTab, onOpenSupport, onOpenTour,
  onLogout, showToast, onClose
}) => {
  if (!user) {
    return (
      <div className="p-4 bg-oil-dark/40 rounded-xl border border-oil-dark text-center space-y-3 font-sans">
        <p className="text-xs text-warm-gray">Access specialized supplier operations, escrow protections, and real-time teardowns.</p>
        <button 
          onClick={() => {
            onClose();
            onChangeView('auth');
          }}
          className="w-full bg-rust-copper hover:bg-bronze text-steel-black font-display font-bold text-xs uppercase py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          Authenticate
        </button>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="px-5 py-3 border-b border-stone-800 flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-charcoal border-2 border-rust-copper overflow-hidden flex-shrink-0">
          <img 
            src={profile?.avatar_url || profile?.logo_url || profile?.logoUrl || (userRole === 'seller' ? userSellerAvatarImg.src : userAvatarImg.src)} 
            alt={user.email || 'avatar'} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = userRole === 'seller' ? userSellerAvatarImg.src : userAvatarImg.src; }}
          />
        </div>
        <div className="min-w-0">
          <p className="font-display text-[10px] text-warm-gray uppercase tracking-wider font-bold">LOGGED IN ACCOUNT</p>
          <p className="text-sm text-white font-medium truncate mt-1">{user.email}</p>
          <p className="inline-block mt-1 text-[10px] text-rust-copper font-bold uppercase tracking-wider font-display bg-rust-copper/10 px-1.5 py-0.5 rounded border border-rust-copper/20">
             Context: {userRole === 'seller' ? 'Seller View' : 'Buyer View'}
          </p>
        </div>
      </div>

      <p className="px-5 font-display text-[10px] text-warm-gray uppercase tracking-wider font-bold mb-1 mt-3">USER</p>
      <button 
        onClick={() => { onChangeView('settings'); onClose(); }} 
        className="w-full text-left px-5 py-2.5 hover:bg-stone-800/50 transition-colors flex items-center gap-3"
      >
        <User className="w-4 h-4 text-[#B87333]" />
        <span className="text-sm">My Profile</span>
      </button>
      {userRole === 'buyer' && (
        <>
          <button 
            onClick={() => { showToast('Watchlist functionality.'); onClose(); }} 
            className="w-full text-left px-5 py-2.5 hover:bg-stone-800/50 transition-colors flex items-center gap-3"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-sm">Watchlist</span>
          </button>
          <button 
            onClick={() => { onChangeView('orders'); onClose(); }} 
            className="w-full text-left px-5 py-2.5 hover:bg-stone-800/50 transition-colors flex items-center gap-3"
          >
            <History className="w-4 h-4 text-[#B87333]" />
            <span className="text-sm">My Orders</span>
          </button>
        </>
      )}
      <button 
        onClick={() => { onOpenSupport(); onClose(); }} 
        className="w-full text-left px-5 py-2.5 hover:bg-stone-800/50 transition-colors flex items-center gap-3"
      >
        <HelpCircle className="w-4 h-4 text-warm-gray" />
        <span className="text-sm">Support Center</span>
      </button>

      <button 
        onClick={() => { onOpenTour(); onClose(); }} 
        className="w-full text-left px-5 py-2.5 hover:bg-stone-800/50 transition-colors flex items-center gap-3"
      >
        <BookOpen className="w-4 h-4 text-rust-copper" />
        <span className="text-sm">How It Works / Tour</span>
      </button>
      
      {userRole === 'seller' && (
        <>
          <div className="border-t border-stone-800 my-2"></div>
          <p className="px-5 font-display text-[10px] text-warm-gray uppercase tracking-wider font-bold mb-1">SELLER TOOLS</p>
          <button 
            onClick={() => { if (onSetSellerTab) onSetSellerTab('listings'); onChangeView('listings'); onClose(); }} 
            className="w-full text-left px-5 py-2.5 hover:bg-stone-800/50 transition-colors flex items-center gap-3"
          >
            <LayoutDashboard className="w-4 h-4 text-warm-gray" />
            <span className="text-sm">Dashboard</span>
          </button>
          <button 
            onClick={() => { if (onSetSellerTab) onSetSellerTab('listings'); onChangeView('listings'); onClose(); }} 
            className="w-full text-left px-5 py-2.5 hover:bg-stone-800/50 transition-colors flex items-center gap-3"
          >
            <Package className="w-4 h-4 text-warm-gray" />
            <span className="text-sm">Manage Listings</span>
          </button>
          <button 
            onClick={() => { if (onSetSellerTab) onSetSellerTab('listings'); onChangeView('listings'); onClose(); }} 
            className="w-full text-left px-5 py-2.5 hover:bg-stone-800/50 transition-colors flex items-center gap-3"
          >
            <Tag className="w-4 h-4 text-warm-gray" />
            <span className="text-sm">Manage Offers</span>
          </button>
          <button 
            onClick={() => { onChangeView('settings'); onClose(); }} 
            className="w-full text-left px-5 py-2.5 hover:bg-stone-800/50 transition-colors flex items-center gap-3"
          >
            <Settings className="w-4 h-4 text-[#B87333]" />
            <span className="text-sm">Seller Settings</span>
          </button>
        </>
      )}
      
      <div className="border-t border-stone-800 my-1"></div>

      <button
        onClick={() => {
          onClose();
          onLogout();
        }}
        className="w-full text-left px-5 py-2.5 hover:bg-rose-900/20 text-rose-400 transition-colors flex items-center gap-3"
      >
        <LogOut className="w-4 h-4 text-rose-500" />
        <span className="text-sm">Log Out</span>
      </button>
    </div>
  );
};
