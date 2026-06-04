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
  userMenuRef: React.RefObject<HTMLDivElement>;
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
        className="bg-charcoal border border-oil-dark rounded-lg w-10 h-10 text-base-cream hover:bg-oil-dark hover:text-rust-copper flex items-center justify-center cursor-pointer relative shadow-sm"
        title="Salvage Direct Messages"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rust-copper rounded-full ring-2 ring-steel-black"></span>
      </button>
    )}

    {/* Cart Icon button */}
    <button 
      onClick={user ? onOpenCart : () => {
        onChangeView('auth');
        showToast('Please log in or register to utilize the parts cart.');
      }}
      className="bg-charcoal border border-oil-dark rounded-lg w-10 h-10 text-base-cream hover:bg-oil-dark hover:text-rust-copper flex items-center justify-center cursor-pointer relative shadow-sm"
      id="nav-cart-trigger"
      title="Parts cart manager"
    >
      <ShoppingCart className="w-5 h-5" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rust-copper text-steel-black text-[10px] font-sans font-bold rounded-full ring-2 ring-steel-black flex items-center justify-center">
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
