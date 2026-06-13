"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserSession } from "../../types";
import { NavbarSearch } from "./NavbarSearch";
import { NavLeft, UserActions, MobileNavbar } from "./shared";
import BottomTabBar from "./BottomTabBar";

interface NavbarProps {
  currentView: string;
  cartCount: number;
  user: UserSession | null;
  onLogout: () => void;
  onOpenCart: () => void;
  onChangeView: (view: string) => void;
  onSearchSubmit: (text: string) => void;
  onOpenSearchModal?: (initialQuery?: string) => void;
  searchTextValue?: string;
  onSelectPart?: (partId: string) => void;
  onSnapImagesUploaded?: (images: string[]) => void;
  userRole: "buyer" | "seller";
  onChangeUserRole: (role: "buyer" | "seller") => void;
  profile: any;
  onOpenSupport: () => void;
  onOpenTour: () => void;
  onSetSellerTab?: (
    tab: "listings" | "settings" | "snap" | "orders" | "inventory" | "create",
  ) => void;
  activeSellerTab?:
    | "listings"
    | "settings"
    | "snap"
    | "orders"
    | "inventory"
    | "create";
}

export default function Navbar({
  currentView,
  onChangeView,
  onSearchSubmit,
  onOpenSearchModal,
  onSelectPart,
  onSnapImagesUploaded,
  cartCount,
  user,
  onLogout,
  onOpenCart,
  searchTextValue = "",
  userRole,
  onChangeUserRole,
  profile,
  onOpenSupport,
  onOpenTour,
  onSetSellerTab,
  activeSellerTab = "listings",
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isUserMenuDrawerOpen, setIsUserMenuDrawerOpen] = useState(false);
  const [navSearchText, setNavSearchText] = useState(searchTextValue);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [placeholderText, setPlaceholderText] = useState(
    "Search parts, VIN...",
  );

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Ephemeral toast notification system
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  // Sync nav search local input when query text changes from other modals
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNavSearchText(searchTextValue);
  }, [searchTextValue]);

  // Click outside user menu watcher (Desktop dropdown only)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Responsive placeholder handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setPlaceholderText("Search part, make, model or VIN...");
      } else {
        setPlaceholderText("Search parts, VIN...");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header
        className="bg-zinc-950/80 backdrop-blur-md text-base-cream sticky top-0 z-50 border-b border-white/5 h-16 shadow-lg shadow-black/20"
        id="id-navbar-header"
      >
        {/* Desktop & Tablet Navigation (>= 768px) */}
        <div className="hidden md:flex max-w-7xl mx-auto px-4 h-full items-center justify-between gap-5">
          <NavLeft onChangeView={onChangeView} currentView={pathname} />

          <div className="flex items-center gap-5 flex-1 justify-end">
            <NavbarSearch placeholderText={placeholderText} />

            <UserActions
              user={user}
              userRole={userRole}
              profile={profile}
              cartCount={cartCount}
              isUserMenuOpen={isUserMenuOpen}
              setIsUserMenuOpen={setIsUserMenuOpen}
              handleAvatarClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              onChangeView={onChangeView}
              onSetSellerTab={onSetSellerTab}
              onOpenCart={onOpenCart}
              onOpenSupport={onOpenSupport}
              onOpenTour={onOpenTour}
              onLogout={onLogout}
              showToast={showToast}
              userMenuRef={userMenuRef}
            />
          </div>
        </div>

        {/* Mobile Navigation (< 768px) */}
        <MobileNavbar
          currentView={currentView}
          onChangeView={onChangeView}
          onSelectPart={onSelectPart}
          cartCount={cartCount}
          user={user}
          userRole={userRole}
          profile={profile}
          onOpenCart={onOpenCart}
          onOpenSupport={onOpenSupport}
          onLogout={onLogout}
          showToast={showToast}
          onSetSellerTab={onSetSellerTab}
          onOpenTour={onOpenTour}
          isMobileDrawerOpen={isMobileDrawerOpen}
          setIsMobileDrawerOpen={setIsMobileDrawerOpen}
          isUserMenuDrawerOpen={isUserMenuDrawerOpen}
          setIsUserMenuDrawerOpen={setIsUserMenuDrawerOpen}
        />
      </header>

      <BottomTabBar
        currentView={pathname}
        onChangeView={onChangeView}
        user={user}
        showToast={showToast}
        onSetSellerTab={onSetSellerTab}
      />

      {/* Floating toast notification bar */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-[9999] bg-charcoal border border-rust-copper/30 text-xs px-4 py-3 rounded-md shadow-xl text-base-cream animate-slide-in-right flex items-center gap-2 max-w-sm select-none font-sans">
          <span className="w-2 h-2 rounded-full bg-rust-copper animate-ping"></span>
          <span>{toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="text-warm-gray hover:text-base-cream font-bold ml-2 text-[11px] min-w-[24px] h-6 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
