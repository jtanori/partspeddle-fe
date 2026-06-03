import React from 'react';
import { ShoppingCart, MessageSquare } from 'lucide-react';
import { UserAvatarMenu } from './UserAvatarMenu';
import { UserSession } from '../../../types';

interface UserActionsProps {
  user: UserSession | null;
  userRole: 'buyer' | 'seller';
  profile: Record<string, any> | null;
  cartCount: number;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (isOpen: boolean) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (isOpen: boolean) => void;
  handleAvatarClick: () => void;
  onChangeView: (view: string) => void;
  onSetSellerTab?: (tab: 'listings' | 'settings' | 'snap') => void;
  onOpenCart: () => void;
  onOpenSupport: () => void;
  onOpenTour: () => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
  userMenuRef: React.RefObject<HTMLDivElement>;
}

export const UserActions: React.FC<UserActionsProps> = ({
  user, userRole, profile, cartCount, isUserMenuOpen, setIsUserMenuOpen,
  isMobileDrawerOpen, setIsMobileDrawerOpen,
  handleAvatarClick, onChangeView, onSetSellerTab, onOpenCart, onOpenSupport,
  onOpenTour, onLogout, showToast, userMenuRef
}) => (
  <div className="flex items-center gap-4 flex-shrink-0">
    {/* Cart Icon button */}
    <button 
      onClick={user ? onOpenCart : () => {
        onChangeView('auth');
        showToast('Please log in or register to utilize the parts cart.');
      }}
      className="bg-[#262626] border border-stone-800/10 rounded-lg w-10 h-10 text-zinc-300 hover:bg-zinc-800 hover:text-rust-copper flex items-center justify-center cursor-pointer relative shadow-sm"
      id="nav-cart-trigger"
      title="Parts cart manager"
    >
      <ShoppingCart className="w-5 h-5" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rust-copper text-steel-black text-[10px] font-sans font-bold rounded-full ring-2 ring-[#1A1A1A] flex items-center justify-center">
          {cartCount}
        </span>
      )}
    </button>

    {/* Messages Icon button */}
    {user && (
      <button 
        onClick={() => showToast('Direct Messages: No new salvage communications.')}
        className="bg-[#262626] border border-stone-800/10 rounded-lg w-10 h-10 text-zinc-300 hover:bg-zinc-800 hover:text-rust-copper flex items-center justify-center cursor-pointer relative shadow-sm"
        title="Salvage Direct Messages"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rust-copper rounded-full ring-2 ring-[#1A1A1A]"></span>
      </button>
    )}

    {/* User Avatar & Menu */}
    <UserAvatarMenu 
      user={user}
      userRole={userRole}
      profile={profile}
      isUserMenuOpen={isUserMenuOpen}
      setIsUserMenuOpen={setIsUserMenuOpen}
      handleAvatarClick={handleAvatarClick}
      onChangeView={onChangeView}
      onSetSellerTab={onSetSellerTab}
      onOpenSupport={onOpenSupport}
      onLogout={onLogout}
      showToast={showToast}
      userMenuRef={userMenuRef}
    />
  </div>
);
