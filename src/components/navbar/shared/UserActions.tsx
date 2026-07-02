import React from 'react';
import { ShoppingCart, MessageSquare } from 'lucide-react';
import { UserAvatarMenu } from './UserAvatarMenu';
import { CTAButton } from './CTAButton';
import { UserSession } from '../../../types';

interface UserActionsProps {
  user: UserSession | null;
  userRole: 'buyer' | 'seller';
  profile: Record<string, any> | null;
  cartCount: number;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (isOpen: boolean) => void;
  handleAvatarClick: () => void;
  onChangeView: (view: string) => void;
  onSetSellerTab?: (tab: 'listings' | 'settings' | 'snap') => void;
  onOpenCart: () => void;
  onOpenSupport: () => void;
  onOpenTour: () => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
  userMenuRef: React.RefObject<HTMLDivElement | null>;
}

export const UserActions: React.FC<UserActionsProps> = ({
  user, userRole, profile, cartCount, isUserMenuOpen, setIsUserMenuOpen,
  handleAvatarClick, onChangeView, onSetSellerTab, onOpenCart, onOpenSupport,
  onOpenTour, onLogout, showToast, userMenuRef
}) => (
  <div className="flex items-center gap-2 flex-shrink-0">
    {/* Messages Icon button (Authenticated only) */}
    {user && (
      <button 
        onClick={() => showToast('Direct Messages: No new salvage communications.')}
        className="bg-zinc-900 border border-white/10 rounded-sm w-[40px] h-[40px] text-zinc-400 hover:text-base-cream hover:bg-zinc-800 flex items-center justify-center cursor-pointer relative shadow-sm transition-all"
        title="Salvage Direct Messages"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rust-copper rounded-full ring-2 ring-zinc-950"></span>
      </button>
    )}

    {/* Cart Icon button */}
    <button 
      onClick={user ? onOpenCart : () => {
        onChangeView('auth');
        showToast('Please log in or register to utilize the parts cart.');
      }}
      className="bg-zinc-900 border border-white/10 rounded-sm w-[40px] h-[40px] text-zinc-400 hover:text-base-cream hover:bg-zinc-800 flex items-center justify-center cursor-pointer relative shadow-sm transition-all"
      id="nav-cart-trigger"
      title="Parts cart manager"
    >
      <ShoppingCart className="w-5 h-5" />
      {cartCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-rust-copper text-zinc-950 text-[10px] font-sans font-black rounded-full ring-2 ring-zinc-950 flex items-center justify-center px-1">
          {cartCount}
        </span>
      )}
    </button>

    {/* SELL PARTS (CTA Button) */}
    <CTAButton 
      user={user}
      userRole={userRole}
      profile={profile}
      onChangeView={onChangeView}
      onSetSellerTab={onSetSellerTab}
      showToast={showToast}
    />

    {/* User Avatar & Menu (Trigger or Login button) */}
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
      onOpenTour={onOpenTour}
      onLogout={onLogout}
      showToast={showToast}
      userMenuRef={userMenuRef}
    />
  </div>
);
