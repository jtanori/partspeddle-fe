import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  LogIn, 
  LogOut, 
  User, 
  List, 
  ArrowRight, 
  BookOpen, 
  Menu, 
  ChevronDown, 
  X,
  History,
  Heart,
  MessageSquare,
  Settings,
  HelpCircle as SupportIcon
} from 'lucide-react';
import { UserSession } from '../../types';
import { NavbarSearch } from './NavbarSearch';
import { UserRolePanel } from './shared/UserRolePanel';
import { UserMenuDrawer } from './shared/UserMenuDrawer';
import LiveSearchDropdown from './LiveSearchDropdown';
import BottomTabBar from './BottomTabBar';
// @ts-ignore
import logoImg from '../../assets/images/logo_rusty.png';
// @ts-ignore
import iconRustyImg from '../../assets/images/icon_rusty.png';

interface NavbarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onSearchSubmit: (text: string) => void;
  cartCount: number;
  user: UserSession | null;
  onLogout: () => void;
  onOpenCart: () => void;
  onOpenSearchModal?: (initialQuery?: string) => void;
  searchTextValue?: string;
  onSelectPart?: (partId: string) => void;
  userRole: 'buyer' | 'seller';
  onChangeUserRole: (role: 'buyer' | 'seller') => void;
  profile: any;
  onOpenSupport: () => void;
  onOpenTour: () => void;
  onSetSellerTab?: (tab: 'listings' | 'settings' | 'snap') => void;
  onSnapImagesUploaded?: (images: string[]) => void;
  activeSellerTab?: 'listings' | 'settings' | 'snap';
}

export default function Navbar({
  currentView,
  onChangeView,
  onSearchSubmit,
  cartCount,
  user,
  onLogout,
  onOpenCart,
  onOpenSearchModal,
  searchTextValue = '',
  onSelectPart,
  userRole,
  onChangeUserRole,
  profile,
  onOpenSupport,
  onOpenTour,
  onSetSellerTab,
  onSnapImagesUploaded,
  activeSellerTab = 'listings'
}: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isUserMenuDrawerOpen, setIsUserMenuDrawerOpen] = useState(false);
  const [navSearchText, setNavSearchText] = useState(searchTextValue);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [placeholderText, setPlaceholderText] = useState("Search parts, VIN...");

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Ephemeral toast notification system
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => curr === msg ? null : curr);
    }, 4500);
  };

  // Load any pending dynamic welcome toasts on active login state change
  useEffect(() => {
    const pendingToast = localStorage.getItem('active_welcome_toast_message');
    if (pendingToast) {
      showToast(pendingToast);
      localStorage.removeItem('active_welcome_toast_message');
    }
  }, [user]);

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
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Sync nav search local input when query text changes from other modals
  useEffect(() => {
    setNavSearchText(searchTextValue);
  }, [searchTextValue]);

  // Click outside user menu watcher (Desktop dropdown only)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAvatarClick = () => {
    const isMobileOrTablet = window.innerWidth < 1024;
    if (isMobileOrTablet) {
      setIsUserMenuDrawerOpen(true);
    } else {
      setIsUserMenuOpen(!isUserMenuOpen);
    }
  };

  // Profile completeness helper
  const isProfileComplete = profile && profile.name && profile.name.trim() !== 'Unnamed Yard' && profile.location && profile.location.trim() !== '';

  // Context-Aware CTA Configuration matching spec
  const getCTAConfig = () => {
    if (!user) {
      return {
        label: 'SELL PARTS',
        onClick: () => {
          onChangeView('auth');
          showToast('Sign up with your yard specs to list mechanical units instantly.');
        }
      };
    }
    if (userRole === 'buyer') {
      return {
        label: 'SELL PARTS',
        onClick: () => {
          onChangeUserRole('seller');
          if (onSetSellerTab) onSetSellerTab('snap');
          onChangeView('listings');
          showToast('Salvage Yard Onboarding: Initializing Snap-to-List.');
        }
      };
    }
    // Authenticated seller mode
    if (!isProfileComplete) {
      return {
        label: 'COMPLETE PROFILE',
        onClick: () => {
          if (onSetSellerTab) onSetSellerTab('settings');
          onChangeView('listings');
          showToast('Redirecting to registry settings terminal.');
        }
      };
    }
    return {
      label: 'ADD LISTING',
      onClick: () => {
        if (onSetSellerTab) onSetSellerTab('snap');
        onChangeView('listings');
        showToast('Specify core part details to post new salvage matching listing.');
      }
    };
  };

  const cta = getCTAConfig();

  return (
    <>
      <header 
        className="bg-steel-black text-base-cream sticky top-0 z-40 border-b border-oil-dark h-16" 
        id="id-navbar-header"
      >
        {/* Primary Navigation Container (Tablet & Desktop >= 768px) */}
        <div className="hidden md:flex max-w-7xl mx-auto px-4 h-full items-center justify-between gap-3 md:gap-5">
        
          {/* Left section containing Logo and Navigation aligned to the left */}
          <div className="flex items-center gap-6 lg:gap-8 flex-shrink-0">
            {/* Brand Logo System - Links to "home" with no visual home text */}
            <div 
              onClick={() => onChangeView('home')} 
              className="flex items-center cursor-pointer group select-none flex-shrink-0 transition-transform duration-200 hover:scale-[1.02] bg-transparent min-h-[44px]"
              id="id-nav-logo"
            >
              {/* Mobile phone logo icon only */}
              <img 
                src={iconRustyImg} 
                alt="PartsPeddle Icon" 
                className="block md:hidden w-8 h-8 object-contain bg-transparent mr-1" 
                referrerPolicy="no-referrer"
              />
              {/* Tablet & Desktop logo branding */}
              <img 
                src={logoImg} 
                alt="PartsPeddle Logo" 
                className="hidden md:block md:w-[130px] lg:w-[155px] h-auto object-contain bg-transparent" 
                referrerPolicy="no-referrer"
              />
            </div>

            {/* 14px Links Navigation Section - Only Browse Catalog */}
            <nav className="flex items-center gap-5 font-sans">
                <button 
                    onClick={() => onChangeView('listing')} 
                    className={`transition-colors cursor-pointer border-b-2 py-1.5 px-1 min-h-[44px] flex items-center justify-center text-sm font-medium ${
                        currentView === 'listing' ? 'text-rust-copper border-rust-copper' : 'text-base-cream hover:text-rust-copper border-transparent'
                    }`}
                >
                    Browse Parts
                </button>
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-5 flex-1 justify-end">
            <NavbarSearch
              navSearchText={navSearchText}
              setNavSearchText={setNavSearchText}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              placeholderText={placeholderText}
              onSearchSubmit={onSearchSubmit}
              onChangeView={onChangeView}
              onSelectPart={onSelectPart}
            />

            {/* Right Section Active Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* Collapsing search icon button for Tablet screens under 860px or in portrait orientation */}
          <button
            onClick={() => onOpenSearchModal && onOpenSearchModal(searchTextValue)}
            className="bg-charcoal metal-border rounded-lg w-10 h-10 text-base-cream transition-colors duration-150 hover:bg-oil-dark hover:text-rust-copper flex items-center justify-center cursor-pointer min-[860px]:hidden portrait:flex"
            title="Global omni search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart Icon & Badge - Visible only for Buyer */}
          {userRole === 'buyer' && (
            <button 
              onClick={user ? onOpenCart : () => {
                onChangeView('auth');
                showToast('Please log in or register to utilize the parts cart.');
              }}
              className="bg-charcoal metal-border rounded-lg w-10 h-10 text-base-cream transition-colors duration-150 hover:bg-oil-dark hover:text-rust-copper flex items-center justify-center cursor-pointer relative"
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
          )}

          {/* Messages icon + badge - Rendered inline for Authenticated buyers & sellers */}
          {user && (
            <button 
              onClick={() => showToast('Direct Messages: No new salvage communications.')}
              className="bg-charcoal metal-border rounded-lg w-10 h-10 text-base-cream transition-colors duration-150 hover:bg-oil-dark hover:text-rust-copper flex items-center justify-center cursor-pointer relative"
              title="Salvage Direct Messages"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rust-copper rounded-full ring-2 ring-steel-black"></span>
            </button>
          )}

          {/* Primary context-aware Amber CTA */}
          <button 
            onClick={cta.onClick}
            className={cta.label === 'COMPLETE PROFILE' 
              ? "h-[40px] flex items-center justify-center border border-rust-copper/40 text-rust-copper hover:bg-rust-copper/10 rounded-md px-4 text-xs font-bold font-sans tracking-wide active:translate-y-[0.5px] cursor-pointer transition-all duration-150 whitespace-nowrap"
              : "h-[40px] flex items-center justify-center border border-[#4d3119] border-t-[#8e6e4f] border-b-[#24170d] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_3px_rgba(0,0,0,0.65),0_1px_2px_rgba(0,0,0,0.35)] text-base-cream/90 hover:text-base-cream rounded-md px-4 text-xs font-bold font-sans tracking-wide active:translate-y-[0.5px] cursor-pointer select-none whitespace-nowrap outline-none transition-all duration-150 relative overflow-hidden"
            }
            style={cta.label === 'COMPLETE PROFILE' ? {} : {
              backgroundImage: `linear-gradient(to bottom, rgba(139, 98, 57, 0.95), rgba(92, 62, 33, 0.98)), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='brushed'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.12 0.03' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0 0 0 0'/%3E%3C/filter%3E%3Cfilter id='rust'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.4 0 0 0 0 0.2 0 0 0 0 0.1 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23brushed)' opacity='0.45'/%3E%3Crect width='100%25' height='100%25' filter='url(%23rust)' opacity='0.35' mix-blend-mode='color-burn'/%3E%3C/svg%3E")`,
              backgroundBlendMode: 'overlay',
            }}
          >
            <span className="relative z-10">{cta.label}</span>
          </button>

          {/* Tablet & Mobile Menu trigger - Custom ☰ replaces Auth links for non-auth */}
          {!user && (
            <>
              <div className="hidden lg:flex items-center gap-3.5 text-xs font-bold uppercase tracking-wider mr-2 font-sans">
                <button
                  onClick={() => {
                    onChangeView('auth');
                    showToast('Please sign in or register to your PartsPeddle account.');
                  }}
                  className="text-warm-gray hover:text-base-cream transition-colors cursor-pointer px-2.5 py-1.5 hover:bg-white/5 rounded min-h-[40px] flex items-center font-sans font-semibold"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    onChangeView('auth');
                    window.location.href = '/auth?role=seller&mode=signup';
                  }}
                  className="text-warm-gray hover:text-base-cream transition-colors cursor-pointer px-2.5 py-1.5 hover:bg-white/5 rounded min-h-[40px] flex items-center font-sans font-semibold"
                >
                  Sign Up
                </button>
              </div>

              <button 
                onClick={() => setIsMobileDrawerOpen(true)}
                className="bg-charcoal metal-border rounded-lg w-10 h-10 text-base-cream transition-colors duration-150 hover:bg-oil-dark hover:text-rust-copper flex items-center justify-center cursor-pointer lg:hidden"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Authenticated user Avatar and layout controls */}
          {user && (
            <div className="relative flex items-center" ref={userMenuRef}>
              <button 
                onClick={handleAvatarClick}
                className="flex items-center gap-2 p-1 transition-all focus:outline-none cursor-pointer font-sans"
                id="btn-nav-user-menu"
                title="Account menu"
              >
                <div className="relative w-10 h-10 rounded-lg border-2 border-oil-dark overflow-hidden flex-shrink-0 bg-charcoal">
                  <img 
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120"
                    alt={user.email || 'User avatar'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-sage-green rounded-full ring-2 ring-steel-black"></div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-warm-gray hidden xl:block" />
              </button>

              {/* Desktop Dropdown - Visible on screen >= 1024px */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-12 w-56 bg-steel-black border border-oil-dark rounded-xl py-1.5 z-[9990] text-base-cream shadow-2xl shadow-black/80 animate-in fade-in duration-100 font-sans hidden lg:block">
                  {/* Subtle rivet corner details */}
                  <div className="rivet top-1.5 left-1.5" />
                  <div className="rivet top-1.5 right-1.5" />
                  <div className="rivet bottom-1.5 left-1.5" />
                  <div className="rivet bottom-1.5 right-1.5" />

                  <div className="px-4 py-2.5 border-b border-oil-dark">
                    <p className="font-display text-[10px] text-warm-gray uppercase tracking-wider font-bold">Logged In Account</p>
                    <p className="text-xs text-base-cream font-medium truncate mt-0.5 font-sans animate-pulse">{user.email}</p>
                    <p className="text-[10px] text-rust-copper font-bold uppercase mt-1 font-display">Portal: {userRole === 'seller' ? 'Yard Operator' : 'Buyer View'}</p>
                  </div>

                  <div className="py-1">
                    <UserRolePanel
                      userRole={userRole}
                      profile={profile}
                      onChangeUserRole={onChangeUserRole}
                      onChangeView={onChangeView}
                      onSetSellerTab={onSetSellerTab}
                      onClose={() => setIsUserMenuOpen(false)}
                      showToast={showToast}
                    />

                    {/* Restored Menu Items */}
                    <div className="border-t border-oil-dark my-1"></div>
                    {userRole === 'buyer' ? (
                      <>
                        <button 
                          onClick={() => { onChangeView('settings'); setIsUserMenuOpen(false); }} 
                          className="w-full text-left px-4 py-1.5 font-sans text-sm text-base-cream hover:bg-oil-dark/50 hover:text-rust-copper transition-colors duration-150 flex items-center gap-2.5 cursor-pointer"
                        >
                          <User className="w-4 h-4 text-rust-copper" />
                          <span>My Profile</span>
                        </button>
                        <button 
                          onClick={() => { showToast('Watchlist functionality.'); setIsUserMenuOpen(false); }} 
                          className="w-full text-left px-4 py-1.5 font-sans text-sm text-base-cream hover:bg-oil-dark/50 hover:text-rust-copper transition-colors duration-150 flex items-center gap-2.5 cursor-pointer"
                        >
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span>Watchlist</span>
                        </button>
                        <button 
                          onClick={() => { onChangeView('orders'); setIsUserMenuOpen(false); }} 
                          className="w-full text-left px-4 py-1.5 font-sans text-sm text-base-cream hover:bg-oil-dark/50 hover:text-rust-copper transition-colors duration-150 flex items-center gap-2.5 cursor-pointer"
                        >
                          <History className="w-4 h-4 text-rust-copper" />
                          <span>My Orders</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => { if (onSetSellerTab) onSetSellerTab('listings'); onChangeView('listings'); setIsUserMenuOpen(false); }} 
                          className="w-full text-left px-4 py-1.5 font-sans text-sm text-base-cream hover:bg-oil-dark/50 hover:text-rust-copper transition-colors duration-150 flex items-center gap-2.5 cursor-pointer"
                        >
                          <List className="w-4 h-4 text-warm-gray" />
                          <span>Dashboard/Listings</span>
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => { onOpenSupport(); setIsUserMenuOpen(false); }} 
                      className="w-full text-left px-4 py-1.5 font-sans text-sm text-base-cream hover:bg-oil-dark/50 hover:text-rust-copper transition-colors duration-150 flex items-center gap-2.5 cursor-pointer"
                    >
                      <SupportIcon className="w-4 h-4 text-warm-gray" />
                      <span>Support Center</span>
                    </button>
                    
                    <div className="border-t border-oil-dark my-1"></div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-1.5 font-sans text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors duration-150 flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
        </div>
      </div>

      {/* Mobile Top Bar Navigation Container (Viewport < 768px) */}
      <div className="flex md:hidden px-4 h-full items-center justify-between w-full bg-steel-black gap-2 select-none" id="id-mobile-top-bar">
        {/* Left: Logo mark */}
        <div 
          onClick={() => onChangeView('home')} 
          className="flex items-center cursor-pointer min-w-[48px] h-12 justify-start font-sans"
          id="id-mobile-nav-logo"
          title="Navigate Home"
        >
          <img 
            src={iconRustyImg} 
            alt="PartsPeddle Icon" 
            className="w-8 h-8 object-contain bg-transparent" 
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Center: Browse Parts */}
        <button 
            onClick={() => onChangeView('listing')} 
            className={`transition-colors cursor-pointer py-1.5 px-2 text-xs font-medium flex items-center justify-center ${
                currentView === 'listing' ? 'text-rust-copper' : 'text-base-cream hover:text-rust-copper'
            }`}
        >
            Browse
        </button>

        <div className="flex-1"></div>

        {/* Right Section Active Actions */}
        <div className="flex items-center gap-2 font-sans">
          {/* Search Icon button */}
          <button 
            onClick={() => onOpenSearchModal && onOpenSearchModal(searchTextValue)}
            className="bg-charcoal metal-border rounded-lg w-10 h-10 text-base-cream hover:bg-oil-dark hover:text-rust-copper flex items-center justify-center cursor-pointer transition-colors duration-150"
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
            className="bg-charcoal metal-border rounded-lg w-10 h-10 text-base-cream hover:bg-oil-dark hover:text-rust-copper flex items-center justify-center cursor-pointer relative transition-colors duration-150"
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
          {user && (
            <button 
              onClick={() => setIsUserMenuDrawerOpen(true)}
              className="relative cursor-pointer"
              title="Account Menu"
            >
              <div className="w-10 h-10 rounded-lg border-2 border-oil-dark overflow-hidden bg-charcoal relative">
                <img 
                  src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120"
                  alt={user.email || 'User avatar'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </button>
          )}
          
          {/* Mobile hamburger for browse only - guests only */}
          {!user && (
            <button 
              onClick={() => setIsMobileDrawerOpen(true)}
              className="bg-charcoal metal-border rounded-lg w-10 h-10 text-base-cream hover:bg-oil-dark hover:text-rust-copper flex items-center justify-center cursor-pointer transition-colors duration-150"
              title="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* User Menu Drawer for Mobile/Tablet */}
          <UserMenuDrawer 
            isOpen={isUserMenuDrawerOpen}
            onClose={() => setIsUserMenuDrawerOpen(false)}
            user={{ email: user?.email || '', name: profile?.name }}
            profile={profile}
            onChangeView={onChangeView}
            onSetSellerTab={onSetSellerTab}
            onLogout={onLogout}
          />

        </div>
      </div>      {/* Slide-In Mobile Navigation Drawer (Right Side Drawer) - For Non-Auth Users */}
      {isMobileDrawerOpen && !user && (
        <div className="fixed inset-0 z-[9990] flex justify-end animate-fade-in" id="mobile-nav-drawer-backdrop">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer z-10" 
            onClick={() => setIsMobileDrawerOpen(false)} 
          />
          <div className="w-[280px] bg-steel-black border-l border-oil-dark z-20 h-full flex flex-col justify-between relative p-5 text-base-cream animate-slide-in-right font-sans">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-oil-dark pb-3">
                <div className="flex items-center gap-2 font-display">
                  <span className="w-2 h-2 rounded-full bg-rust-copper animate-pulse"></span>
                  <p className="text-xs font-bold text-base-cream uppercase tracking-wider">PartsPeddle</p>
                </div>
                <button 
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 hover:bg-oil-dark rounded text-warm-gray hover:text-base-cream cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center font-sans"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Drawer Navigation List */}
              <nav className="py-4 space-y-4 font-sans">
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      onChangeView('auth');
                      setIsMobileDrawerOpen(false);
                      showToast('Please sign in or register to your PartsPeddle account.');
                    }}
                    className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-oil-dark transition-colors flex items-center gap-2.5 text-base-cream min-h-[44px]"
                  >
                    <LogIn className="w-4 h-4 text-warm-gray" />
                    <span>Log In</span>
                  </button>
                  <button
                    onClick={() => {
                      onChangeView('auth');
                      setIsMobileDrawerOpen(false);
                      window.location.href = '/auth?role=seller&mode=signup';
                    }}
                    className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-oil-dark transition-colors flex items-center gap-2.5 text-base-cream min-h-[44px]"
                  >
                    <User className="w-4 h-4 text-warm-gray" />
                    <span>Sign Up</span>
                  </button>
                </div>

                <div className="h-px bg-oil-dark my-2" />

                <div className="flex flex-col gap-1.5 font-sans">
                  <button
                    onClick={() => {
                      onOpenTour();
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-oil-dark transition-colors flex items-center gap-2.5 text-base-cream min-h-[44px]"
                  >
                    <BookOpen className="w-4 h-4 text-rust-copper" />
                    <span>How It Works</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenSupport();
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-oil-dark transition-colors flex items-center gap-2.5 text-base-cream min-h-[44px]"
                  >
                    <HelpCircle className="w-4 h-4 text-warm-gray" />
                    <span>Support</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenTour();
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-oil-dark transition-colors flex items-center gap-2.5 text-base-cream min-h-[44px]"
                  >
                    <SupportIcon className="w-4 h-4 text-rust-copper" />
                    <span>Tour Guide</span>
                  </button>
                </div>
              </nav>
            </div>

            <div className="border-t border-oil-dark pt-3 text-center">
              <span className="text-[10px] font-mono tracking-widest text-warm-gray uppercase">PartsPeddle Mobile v1.4</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating toast notification bar banner system */}
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
    </header>

    {/* Interactive Responsive Bottom Sheet fly-out - Tablet & Mobile Specifics for logged-in Users */}
    {isUserMenuDrawerOpen && (
      <div className="fixed inset-0 z-[100000] flex items-end justify-center animate-fade-in font-sans" id="mobile-bottom-sheet-overlay">
        {/* Backdrop screen mask */}
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-xs cursor-pointer" 
          onClick={() => setIsUserMenuDrawerOpen(false)} 
        />
        
        {/* Bottom sheet content area - maxWidth: 640px, rounded corners */}
        <div className="w-full max-w-[640px] bg-steel-black border-t border-oil-dark rounded-t-2xl z-10 p-6 font-sans text-base-cream select-none shadow-2xl relative max-h-[85vh] flex flex-col overflow-y-auto">
          
          {/* 36px wide Drag Handle Bar */}
          <div 
            className="w-12 h-1 bg-oil-dark hover:bg-charcoal rounded-full mx-auto mb-4 cursor-pointer flex-shrink-0" 
            onClick={() => setIsUserMenuDrawerOpen(false)}
          />
          
          {/* Profile Row */}
          <div className="flex items-center justify-between border-b border-oil-dark pb-4 mb-4">
            {user ? (
              <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-charcoal border-2 border-rust-copper overflow-hidden flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120" alt={user.email || 'avatar'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-base-cream truncate font-sans">
                      {userRole === 'seller' ? (profile?.name && profile?.name !== 'Unnamed Yard' ? profile.name : 'Acme Salvage Yard') : 'John Doe'}
                    </p>
                    <p className="text-[11px] text-warm-gray truncate font-mono mt-0.5">
                      {user.email || 'john@email.com'}
                    </p>
                    <p className="inline-block mt-1 text-[10px] text-rust-copper font-bold uppercase tracking-wider font-display bg-rust-copper/10 px-1.5 py-0.5 rounded border border-rust-copper/20">
                      Context: {userRole === 'seller' ? 'Seller View' : 'Buyer View'}
                    </p>
                  </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-charcoal border border-oil-dark flex items-center justify-center text-rust-copper font-bold font-display">PP</div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-base-cream truncate">PartsPeddle</p>
                    <p className="text-[11px] text-warm-gray truncate font-mono mt-0.5">Offline Mode</p>
                  </div>
              </div>
            )}
            
            <button 
              onClick={() => setIsUserMenuDrawerOpen(false)}
              className="bg-oil-dark hover:bg-charcoal p-2 rounded-full text-warm-gray hover:text-base-cream transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Navigation Body */}
          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {!user ? (
              /* GUEST BOTTOM SHEET DETAILS */
              <div className="p-4 bg-oil-dark/40 rounded-xl border border-oil-dark text-center space-y-3 font-sans">
                <p className="text-xs text-warm-gray">Access specialized supplier operations, escrow protections, and real-time teardowns.</p>
                <button 
                  onClick={() => {
                    setIsUserMenuDrawerOpen(false);
                    onChangeView('auth');
                  }}
                  className="w-full bg-rust-copper hover:bg-bronze text-steel-black font-display font-bold text-xs uppercase py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Authenticate
                </button>
              </div>
            ) : userRole === 'buyer' ? (
              /* AUTHENTICATED BUYER BOTTOM SHEET DETAILS */
              <>
                <button
                  onClick={() => {
                    onChangeView('settings');
                    setIsUserMenuDrawerOpen(false);
                  }}
                  className="w-full text-left px-4 hover:bg-oil-dark active:bg-oil-dark rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-3 min-h-[44px] text-warm-gray hover:text-base-cream font-display"
                >
                  <User className="w-4 h-4 text-rust-copper" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuDrawerOpen(false);
                    showToast('Watchlist functionality.');
                  }}
                  className="w-full text-left px-4 hover:bg-oil-dark active:bg-oil-dark rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-3 min-h-[44px] text-warm-gray hover:text-base-cream font-display"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Watchlist</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuDrawerOpen(false);
                    onChangeView('orders');
                  }}
                  className="w-full text-left px-4 hover:bg-oil-dark active:bg-oil-dark rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-3 min-h-[44px] text-warm-gray hover:text-base-cream font-display"
                >
                  <History className="w-4 h-4 text-rust-copper" />
                  <span>My Orders</span>
                </button>

                <div className="h-px bg-oil-dark my-2" />

                <button
                  onClick={() => {
                    setIsUserMenuDrawerOpen(false);
                    onOpenSupport();
                  }}
                  className="w-full text-left px-4 hover:bg-oil-dark active:bg-oil-dark rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-3 min-h-[44px] text-warm-gray hover:text-base-cream font-display"
                >
                  <SupportIcon className="w-4 h-4 text-warm-gray" />
                  <span>Support Center</span>
                </button>

                <div className="h-px bg-oil-dark my-2" />

                {/* Visually emphasized "Switch to Seller View" row */}
                <div className="my-1">
                  <button
                    onClick={() => {
                      onChangeUserRole('seller');
                      onChangeView('listings');
                      setIsUserMenuDrawerOpen(false);
                      showToast('Switched account profile context to Salvage Operator.');
                    }}
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-rust-copper/25 to-bronze/5 border-2 border-rust-copper rounded-xl transition-all hover:bg-rust-copper/35 flex items-center justify-between min-h-[48px] cursor-pointer group"
                  >
                    <span className="flex items-center gap-3">
                      <ArrowRight className="w-5 h-5 text-rust-copper group-hover:translate-x-1 transition-transform animate-pulse" />
                      <span className="text-sm font-bold uppercase tracking-wider text-rust-copper font-display">Switch to Seller View</span>
                    </span>
                    <span className="text-[9px] font-mono py-0.5 px-2 bg-rust-copper text-steel-black rounded uppercase font-bold tracking-widest">YARD OP</span>
                  </button>
                </div>

                <div className="h-px bg-oil-dark my-2" />

                <button
                  onClick={() => {
                    setIsUserMenuDrawerOpen(false);
                    onLogout();
                    showToast('Log out successful.');
                  }}
                  className="w-full text-left px-4 hover:bg-rose-500/10 text text-rose-400 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-3 min-h-[44px] font-display"
                >
                  <LogOut className="w-4 h-4 text-[#F43F5E]" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              /* AUTHENTICATED SELLER BOTTOM SHEET DETAILS */
              <>
                <button
                  onClick={() => {
                    onChangeView('settings');
                    setIsUserMenuDrawerOpen(false);
                  }}
                  className="w-full text-left px-4 hover:bg-oil-dark active:bg-oil-dark rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-3 min-h-[44px] text-warm-gray hover:text-base-cream font-display"
                >
                  <User className="w-4 h-4 text-rust-copper" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    if (onSetSellerTab) onSetSellerTab('listings');
                    onChangeView('listings');
                    setIsUserMenuDrawerOpen(false);
                    showToast('Seller Dashboard accessed.');
                  }}
                  className="w-full text-left px-4 hover:bg-oil-dark active:bg-oil-dark rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-3 min-h-[44px] text-warm-gray hover:text-base-cream font-display"
                >
                  <List className="w-4 h-4 text-warm-gray" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    if (onSetSellerTab) onSetSellerTab('listings');
                    onChangeView('listings');
                    setIsUserMenuDrawerOpen(false);
                    showToast('Active dismantling inventory loaded.');
                  }}
                  className="w-full text-left px-4 hover:bg-oil-dark active:bg-oil-dark rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-3 min-h-[44px] text-warm-gray hover:text-base-cream font-display"
                >
                  <List className="w-4 h-4 text-warm-gray" />
                  <span>Inventory</span>
                </button>

                <button
                  onClick={() => {
                    if (onSetSellerTab) onSetSellerTab('listings');
                    onChangeView('listings');
                    setIsUserMenuDrawerOpen(false);
                  }}
                  className="w-full text-left px-4 hover:bg-oil-dark active:bg-oil-dark rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-3 min-h-[44px] text-warm-gray hover:text-base-cream font-display"
                >
                  <ShoppingCart className="w-4 h-4 text-warm-gray" />
                  <span>Orders</span>
                </button>

                <button
                  onClick={() => {
                    if (onSetSellerTab) onSetSellerTab('listings');
                    onChangeView('listings');
                    setIsUserMenuDrawerOpen(false);
                  }}
                  className="w-full text-left px-4 hover:bg-oil-dark active:bg-oil-dark rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-3 min-h-[44px] text-warm-gray hover:text-base-cream font-display"
                >
                  <List className="w-4 h-4 text-warm-gray" />
                  <span>Listings</span>
                </button>

                <div className="h-px bg-oil-dark my-2" />

                <button
                  onClick={() => {
                    setIsUserMenuDrawerOpen(false);
                    onOpenSupport();
                  }}
                  className="w-full text-left px-4 hover:bg-oil-dark active:bg-oil-dark rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-3 min-h-[44px] text-warm-gray hover:text-base-cream font-display"
                >
                  <SupportIcon className="w-4 h-4 text-warm-gray" />
                  <span>Support Center</span>
                </button>

                <div className="h-px bg-oil-dark my-2" />

                {/* Visually emphasized "Switch to Buyer View" row */}
                <div className="my-1">
                  <button
                    onClick={() => {
                      onChangeUserRole('buyer');
                      onChangeView('home');
                      setIsUserMenuDrawerOpen(false);
                      showToast('Switched account profile context to Buyer.');
                    }}
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-rust-copper/25 to-bronze/5 border-2 border-rust-copper rounded-xl transition-all hover:bg-rust-copper/35 flex items-center justify-between min-h-[48px] cursor-pointer group"
                  >
                    <span className="flex items-center gap-3">
                      <ArrowRight className="w-5 h-5 text-rust-copper group-hover:translate-x-1 transition-transform animate-pulse" />
                      <span className="text-sm font-bold uppercase tracking-wider text-rust-copper font-display">Switch to Buyer View</span>
                    </span>
                    <span className="text-[9px] font-mono py-0.5 px-2 bg-rust-copper text-steel-black rounded uppercase font-bold tracking-widest">BUYER</span>
                  </button>
                </div>

                <div className="h-px bg-oil-dark my-2" />

                <button
                  onClick={() => {
                    setIsUserMenuDrawerOpen(false);
                    onLogout();
                    showToast('Log out successful.');
                  }}
                  className="w-full text-left px-4 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-3 min-h-[44px] font-display"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Responsive Bottom Tab Bar navigation */}
    <BottomTabBar
      currentView={currentView}
      onChangeView={onChangeView}
      user={user}
      userRole={userRole}
      onChangeUserRole={onChangeUserRole}
      onSetSellerTab={onSetSellerTab}
      onOpenCart={onOpenCart}
      onOpenDrawer={() => setIsMobileDrawerOpen(true)}
      onOpenBottomSheet={() => setIsUserMenuDrawerOpen(true)}
      ctaAction={cta.onClick}
      profile={profile}
      showToast={showToast}
      onSnapImagesUploaded={onSnapImagesUploaded}
    />
  </>
  );
}
