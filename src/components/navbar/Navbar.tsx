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
  onSetSellerTab?: (tab: 'listings' | 'inventory' | 'orders' | 'settings' | 'snap') => void;
  onSnapImagesUploaded?: (images: string[]) => void;
  activeSellerTab?: 'listings' | 'inventory' | 'orders' | 'settings' | 'snap';
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

  useEffect(() => {
    const pendingToast = localStorage.getItem('active_welcome_toast_message');
    if (pendingToast) {
      showToast(pendingToast);
      localStorage.removeItem('active_welcome_toast_message');
    }
  }, [user]);

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

  useEffect(() => {
    setNavSearchText(searchTextValue);
  }, [searchTextValue]);

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

  const isProfileComplete = profile && profile.name && profile.name.trim() !== 'Unnamed Yard' && profile.location && profile.location.trim() !== '';

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
          onChangeView('dashboard/snap');
          showToast('Salvage Yard Onboarding: Initializing Snap-to-List.');
        }
      };
    }
    if (!isProfileComplete) {
      return {
        label: 'COMPLETE PROFILE',
        onClick: () => {
          onChangeView('dashboard/settings');
          showToast('Redirecting to registry settings terminal.');
        }
      };
    }
    return {
      label: 'ADD LISTING',
      onClick: () => {
        onChangeView('dashboard/create');
        showToast('Specify core part details to post new salvage matching listing.');
      }
    };
  };

  const cta = getCTAConfig();

  return (
    <>
      <header 
        className="bg-shell-canvas text-text-primary sticky top-0 z-40 border-b border-border-default h-16 shadow-panel" 
        id="id-navbar-header"
      >
        <div className="hidden md:flex max-w-7xl mx-auto px-4 h-full items-center justify-between gap-5">
          <div className="flex items-center gap-8 flex-shrink-0">
            <div 
              onClick={() => onChangeView('home')} 
              className="flex items-center cursor-pointer group select-none flex-shrink-0 transition-transform duration-200 hover:scale-[1.02] bg-transparent min-h-[44px]"
              id="id-nav-logo"
            >
              <img 
                src={logoImg} 
                alt="PartsPeddle Logo" 
                className="hidden md:block md:w-[130px] lg:w-[155px] h-auto object-contain bg-transparent brightness-110" 
                referrerPolicy="no-referrer"
              />
            </div>

            <nav className="flex items-center gap-6 font-heading">
                <button 
                    onClick={() => onChangeView('listing')} 
                    className={`transition-all cursor-pointer border-b-2 py-1.5 px-1 min-h-[44px] flex items-center justify-center text-sm font-black tracking-widest ${
                        currentView === 'listing' ? 'text-accent-amber border-accent-amber' : 'text-text-secondary hover:text-accent-amber border-transparent'
                    }`}
                >
                    BROWSE PARTS
                </button>
            </nav>
          </div>

          <div className="flex items-center gap-5 flex-1 justify-end">
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

            <div className="flex items-center gap-2 flex-shrink-0">
          
          <button
            onClick={() => onOpenSearchModal && onOpenSearchModal(searchTextValue)}
            className="bg-shell-surface border border-border-strong rounded-sm w-10 h-10 text-text-primary transition-all duration-150 hover:border-accent-amber hover:text-accent-amber flex items-center justify-center cursor-pointer min-[860px]:hidden portrait:flex shadow-sm"
            title="Global omni search"
          >
            <Search className="w-5 h-5" />
          </button>

          {userRole === 'buyer' && (
            <button 
              onClick={user ? onOpenCart : () => {
                onChangeView('auth');
                showToast('Please log in or register to utilize the parts cart.');
              }}
              className="bg-shell-surface border border-border-strong rounded-sm w-10 h-10 text-text-primary transition-all duration-150 hover:border-accent-amber hover:text-accent-amber flex items-center justify-center cursor-pointer relative shadow-sm"
              id="nav-cart-trigger"
              title="Parts cart manager"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-amber text-neutral-950 text-[10px] font-mono font-black rounded-full ring-2 ring-shell-canvas flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {user && (
            <button 
              onClick={() => showToast('Direct Messages: No new salvage communications.')}
              className="bg-shell-surface border border-border-strong rounded-sm w-10 h-10 text-text-primary transition-all duration-150 hover:border-accent-amber hover:text-accent-amber flex items-center justify-center cursor-pointer relative shadow-sm"
              title="Salvage Direct Messages"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent-amber rounded-full ring-2 ring-shell-canvas shadow-[0_0_8px_var(--color-accent-amber)]"></span>
            </button>
          )}

          <button 
            onClick={cta.onClick}
            className={cta.label === 'COMPLETE PROFILE' 
              ? "h-[40px] flex items-center justify-center border border-accent-amber/40 text-accent-amber hover:bg-accent-amber/10 rounded-sm px-4 text-[10px] font-black font-heading tracking-[0.2em] active:translate-y-[0.5px] cursor-pointer transition-all duration-150 whitespace-nowrap"
              : "h-[40px] flex items-center justify-center bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 rounded-sm px-5 text-[11px] font-black font-heading tracking-[0.15em] active:translate-y-[0.5px] cursor-pointer select-none whitespace-nowrap shadow-panel transition-all duration-150 relative overflow-hidden"
            }
          >
            <span className="relative z-10">{cta.label}</span>
          </button>

          {!user && (
            <>
              <div className="hidden lg:flex items-center gap-4 text-[11px] font-black uppercase tracking-widest mr-2 font-heading">
                <button
                  onClick={() => {
                    onChangeView('auth');
                    showToast('Please sign in or register to your PartsPeddle account.');
                  }}
                  className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer px-3 py-1.5 hover:bg-shell-surface/50 rounded-sm min-h-[40px] flex items-center"
                >
                  LOG IN
                </button>
                <button
                  onClick={() => {
                    onChangeView('auth');
                    window.location.href = '/auth?role=seller&mode=signup';
                  }}
                  className="text-text-secondary hover:text-accent-amber transition-colors cursor-pointer px-3 py-1.5 border border-border-strong rounded-sm min-h-[40px] flex items-center bg-shell-surface/30 hover:bg-shell-surface"
                >
                  SIGN UP
                </button>
              </div>

              <button 
                onClick={() => setIsMobileDrawerOpen(true)}
                className="bg-shell-surface border border-border-strong rounded-sm w-10 h-10 text-text-primary transition-all duration-150 hover:bg-shell-sidebar hover:text-accent-amber flex items-center justify-center cursor-pointer lg:hidden"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </>
          )}

          {user && (
            <div className="relative flex items-center" ref={userMenuRef}>
              <button 
                onClick={handleAvatarClick}
                className="flex items-center gap-2.5 p-1 transition-all focus:outline-none cursor-pointer font-sans"
                id="btn-nav-user-menu"
                title="Account menu"
              >
                <div className="relative w-10 h-10 rounded-sm border border-border-strong overflow-hidden flex-shrink-0 bg-shell-sidebar shadow-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120"
                    alt={user.email || 'User avatar'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-shell-canvas"></div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden xl:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-12 w-64 bg-shell-sidebar border border-border-default rounded-sm py-2 z-[9990] text-text-primary shadow-elevated animate-in fade-in zoom-in-95 duration-150 font-mono hidden lg:block">
                  <div className="px-4 py-3 border-b border-border-subtle bg-shell-canvas/50">
                    <p className="text-[9px] text-text-muted uppercase tracking-widest font-black">Logged In Account</p>
                    <p className="text-xs text-text-primary font-bold truncate mt-1 animate-pulse">{user.email}</p>
                    <p className="text-[10px] text-accent-amber font-black uppercase mt-1.5 tracking-tight">Portal: {userRole === 'seller' ? 'Yard Operator' : 'Buyer View'}</p>
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

                    <div className="border-t border-border-subtle my-1"></div>
                    {userRole === 'buyer' ? (
                      <>
                        <button 
                          onClick={() => { onChangeView('settings'); setIsUserMenuOpen(false); }} 
                          className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-shell-surface hover:text-text-primary transition-all flex items-center gap-3 cursor-pointer"
                        >
                          <User className="w-4 h-4 text-accent-amber" />
                          <span className="font-heading font-bold uppercase tracking-wider">My Profile</span>
                        </button>
                        <button 
                          onClick={() => { showToast('Watchlist functionality.'); setIsUserMenuOpen(false); }} 
                          className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-shell-surface hover:text-text-primary transition-all flex items-center gap-3 cursor-pointer"
                        >
                          <Heart className="w-4 h-4 text-danger opacity-70" />
                          <span className="font-heading font-bold uppercase tracking-wider">Watchlist</span>
                        </button>
                        <button 
                          onClick={() => { onChangeView('orders'); setIsUserMenuOpen(false); }} 
                          className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-shell-surface hover:text-text-primary transition-all flex items-center gap-3 cursor-pointer"
                        >
                          <History className="w-4 h-4 text-accent-amber" />
                          <span className="font-heading font-bold uppercase tracking-wider">My Orders</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => { onChangeView('dashboard/inventory'); setIsUserMenuOpen(false); }} 
                          className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-shell-surface hover:text-text-primary transition-all flex items-center gap-3 cursor-pointer"
                        >
                          <List className="w-4 h-4 text-text-muted" />
                          <span className="font-heading font-bold uppercase tracking-wider">Dashboard/Listings</span>
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => { onOpenSupport(); setIsUserMenuOpen(false); }} 
                      className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-shell-surface hover:text-text-primary transition-all flex items-center gap-3 cursor-pointer"
                    >
                      <SupportIcon className="w-4 h-4 text-text-muted" />
                      <span className="font-heading font-bold uppercase tracking-wider">Support Center</span>
                    </button>
                    
                    <div className="border-t border-border-subtle my-1"></div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-all flex items-center gap-3 cursor-pointer font-black tracking-widest"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>LOG OUT</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="flex md:hidden px-4 h-full items-center justify-between w-full bg-shell-canvas gap-2 select-none shadow-panel" id="id-mobile-top-bar">
        <div 
          onClick={() => onChangeView('home')} 
          className="flex items-center cursor-pointer min-w-[48px] h-12 justify-start"
          id="id-mobile-nav-logo"
        >
          <img 
            src={iconRustyImg} 
            alt="PartsPeddle Icon" 
            className="w-8 h-8 object-contain brightness-110" 
            referrerPolicy="no-referrer"
          />
        </div>

        <button 
            onClick={() => onChangeView('listing')} 
            className={`transition-all cursor-pointer py-1.5 px-2 text-xs font-black uppercase tracking-widest ${
                currentView === 'listing' ? 'text-accent-amber' : 'text-text-secondary'
            }`}
        >
            BROWSE
        </button>

        <div className="flex-1"></div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onOpenSearchModal && onOpenSearchModal(searchTextValue)}
            className="bg-shell-surface border border-border-strong rounded-sm w-9 h-9 text-text-primary flex items-center justify-center cursor-pointer shadow-sm"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          <button 
            onClick={user ? onOpenCart : () => {
              onChangeView('auth');
              showToast('Log in to access your inventory cart.');
            }}
            className="bg-shell-surface border border-border-strong rounded-sm w-9 h-9 text-text-primary flex items-center justify-center cursor-pointer relative shadow-sm"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent-amber text-neutral-950 text-[8px] font-mono font-black rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {user && (
            <button 
              onClick={() => setIsUserMenuDrawerOpen(true)}
              className="relative"
            >
              <div className="w-9 h-9 rounded-sm border border-border-strong overflow-hidden bg-shell-sidebar relative shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120"
                  alt={user.email || 'User'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </button>
          )}
          
          {!user && (
            <button 
              onClick={() => setIsMobileDrawerOpen(true)}
              className="bg-shell-surface border border-border-strong rounded-sm w-9 h-9 text-text-primary flex items-center justify-center cursor-pointer shadow-sm"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          )}

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
      </div>
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-[9999] bg-shell-surface border border-accent-amber/30 text-xs px-5 py-3 rounded-sm shadow-elevated text-text-primary animate-slide-right flex items-center gap-3 max-w-sm select-none border-l-4 border-l-accent-amber font-heading">
          <span className="w-2 h-2 rounded-full bg-accent-amber animate-ping"></span>
          <span className="font-bold uppercase tracking-wider">{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-text-muted hover:text-text-primary ml-2"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </header>
    
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
