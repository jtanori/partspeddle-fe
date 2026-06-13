import React, { useState } from "react";
import { Search } from "lucide-react";
import { UserSession } from "../../../types";
import { Logo } from "./Logo";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { BottomSheet } from "../../common/BottomSheet";
import { UserMenuContent } from "./UserMenuContent";
import { MobileSearchSheet } from "./MobileSearchSheet";
import { UserActions } from "./UserActions";

interface MobileNavbarProps {
  onChangeView: (view: string) => void;
  onSelectPart?: (partId: string) => void;
  cartCount: number;
  user: UserSession | null;
  userRole: "buyer" | "seller";
  profile: Record<string, any> | null;
  onOpenCart: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
  onSetSellerTab?: (tab: "listings" | "settings" | "snap") => void;
  onOpenTour: () => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (isOpen: boolean) => void;
  isUserMenuDrawerOpen: boolean;
  setIsUserMenuDrawerOpen: (isOpen: boolean) => void;
  currentView: string;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({
  onChangeView,
  onSelectPart,
  cartCount,
  user,
  userRole,
  profile,
  onOpenCart,
  onOpenSupport,
  onLogout,
  showToast,
  onSetSellerTab,
  onOpenTour,
  isMobileDrawerOpen,
  setIsMobileDrawerOpen,
  isUserMenuDrawerOpen,
  setIsUserMenuDrawerOpen,
  currentView,
}) => {
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      className="flex md:hidden px-4 h-full items-center justify-between w-full bg-steel-black gap-2 select-none"
      id="id-mobile-top-bar"
    >
      {/* Left: Logo & Browse */}
      <div className="flex items-center gap-3">
        <Logo
          onClick={() => onChangeView("home")}
          className="w-10 h-12"
          id="id-mobile-nav-logo"
        />
        <button
          onClick={() => onChangeView("listing")}
          className={`transition-colors cursor-pointer py-1.5 px-1 flex items-center justify-center text-xs font-bold uppercase tracking-widest ${
            currentView === "listing"
              ? "text-rust-copper"
              : "text-warm-gray hover:text-rust-copper"
          }`}
        >
          Browse
        </button>
      </div>

      <div className="flex-1"></div>

      {/* Right Section Active Actions */}
      <div className="flex items-center gap-2 font-sans">
        {/* Search Icon button */}
        <button
          onClick={() => setIsSearchSheetOpen(true)}
          className="bg-charcoal border border-oil-dark rounded-lg w-10 h-10 text-base-cream hover:bg-oil-dark hover:text-rust-copper flex items-center justify-center cursor-pointer transition-colors duration-150"
          title="Global search overlay"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Auth-Aware User Actions (Cart, Messages, CTA, Menu) */}
        <UserActions
          user={user}
          userRole={userRole}
          profile={profile}
          cartCount={cartCount}
          isUserMenuOpen={isUserMenuDrawerOpen}
          setIsUserMenuOpen={setIsUserMenuDrawerOpen}
          handleAvatarClick={() => setIsUserMenuDrawerOpen(true)}
          onChangeView={onChangeView}
          onSetSellerTab={onSetSellerTab}
          onOpenCart={onOpenCart}
          onOpenSupport={onOpenSupport}
          onOpenTour={onOpenTour}
          onLogout={onLogout}
          showToast={showToast}
          userMenuRef={userMenuRef}
        />

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
            onOpenTour={onOpenTour}
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
