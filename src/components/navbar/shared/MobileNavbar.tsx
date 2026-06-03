import React, { useState } from 'react';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { UserSession } from '../../../types';
import { Logo } from './Logo';
import { MobileNavDrawer } from './MobileNavDrawer';
import { BottomSheet } from '../../common/BottomSheet';
import { UserMenuContent } from './UserMenuContent';
import { MobileSearchSheet } from './MobileSearchSheet';

interface MobileNavbarProps {
  onChangeView: (view: string) => void;
  onSearchSubmit: (text: string) => void;
  onSelectPart?: (partId: string) => void;
  cartCount: number;
  user: UserSession | null;
  userRole: 'buyer' | 'seller';
  profile: Record<string, any> | null;
  onOpenCart: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
  onSetSellerTab?: (tab: 'listings' | 'settings' | 'snap') => void;
  onOpenTour: () => void;
  searchTextValue?: string;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (isOpen: boolean) => void;
  isUserMenuDrawerOpen: boolean;
  setIsUserMenuDrawerOpen: (isOpen: boolean) => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({
  onChangeView, onSearchSubmit, onSelectPart, cartCount, user, userRole, profile,
  onOpenCart, onOpenSupport, onLogout, showToast, onSetSellerTab, onOpenTour,
  searchTextValue = '', isMobileDrawerOpen, setIsMobileDrawerOpen,
  isUserMenuDrawerOpen, setIsUserMenuDrawerOpen
}) => {
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [localSearchText, setLocalSearchText] = useState(searchTextValue);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="flex md:hidden px-4 h-full items-center justify-between w-full bg-[#1A1A1A] gap-2 select-none" id="id-mobile-top-bar">
      {/* Left: Logo */}
      <Logo onClick={() => onChangeView('home')} className="w-10 h-12" id="id-mobile-nav-logo" />

      <div className="flex-1"></div>

      {/* Right Section Active Actions */}
      <div className="flex items-center gap-2 font-sans">
        {/* Search Icon button */}
        <button 
          onClick={() => setIsSearchSheetOpen(true)}
          className="bg-[#262626] border border-stone-800/10 rounded-lg w-10 h-10 text-zinc-300 hover:bg-zinc-800 hover:text-rust-copper flex items-center justify-center cursor-pointer transition-colors duration-150"
          title="Global search overlay"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Cart Icon button */}
        <button 
          onClick={user ? onOpenCart : () => {
            onChangeView('auth');
            showToast('Please log in or register to utilize the parts cart.');
          }}
          className="bg-[#262626] border border-stone-800/10 rounded-lg w-10 h-10 text-zinc-300 hover:bg-zinc-800 hover:text-rust-copper flex items-center justify-center cursor-pointer relative transition-colors duration-150"
          title="Parts cart manager"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rust-copper text-steel-black text-[10px] font-sans font-bold rounded-full ring-2 ring-steel-black flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>

        {/* Authenticated user Avatar triggers bottom sheet */}
        {user ? (
          <button 
            onClick={() => setIsUserMenuDrawerOpen(true)}
            className="relative cursor-pointer"
            title="Account Menu"
          >
            <div className="w-10 h-10 rounded-lg border border-stone-800/10 overflow-hidden bg-[#262626] relative">
              <img 
                src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120"
                alt={user.email || 'User avatar'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </button>
        ) : (
            <button 
            onClick={() => setIsMobileDrawerOpen(true)}
            className="bg-[#262626] border border-stone-800/10 rounded-lg w-10 h-10 text-zinc-300 hover:bg-zinc-800 hover:text-rust-copper flex items-center justify-center cursor-pointer transition-colors duration-150"
            title="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        {/* User Menu Drawer for Mobile/Tablet */}
        <BottomSheet 
          isOpen={isUserMenuDrawerOpen}
          onClose={() => setIsUserMenuDrawerOpen(false)}
        >
          <UserMenuContent
              user={user}
              userRole={userRole}
              profile={profile}
              onChangeView={onChangeView}
              onSetSellerTab={onSetSellerTab}
              onOpenSupport={onOpenSupport}
              onLogout={onLogout}
              showToast={showToast}
              onClose={() => setIsUserMenuDrawerOpen(false)}
          />
        </BottomSheet>
      </div>

      {/* Mobile Search Sheet */}
      <MobileSearchSheet
        isOpen={isSearchSheetOpen}
        onClose={() => setIsSearchSheetOpen(false)}
        searchText={localSearchText}
        setSearchText={setLocalSearchText}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        onSearchSubmit={onSearchSubmit}
        onChangeView={onChangeView}
        onSelectPart={onSelectPart}
      />

      {/* Mobile Navigation Drawer Component */}
      <MobileNavDrawer
        isOpen={isMobileDrawerOpen && !user}
        onClose={() => setIsMobileDrawerOpen(false)}
        onChangeView={onChangeView}
        onOpenTour={onOpenTour}
        onOpenSupport={onOpenSupport}
        showToast={showToast}
      />
    </div>
  );
};
