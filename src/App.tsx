import React, { useState, useEffect, useRef } from 'react';
import { supabaseMock, cartMock, MOCK_PARTS } from './services/db';
import { UserSession, CartItem, Part } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Homepage from './components/Homepage';
import ProductListing from './components/ProductListing';
import ProductDetail from './components/ProductDetail';
import AuthPage from './components/AuthPage';
import ComponentLibrary from './components/ComponentLibrary';
import GuidedTour from './components/GuidedTour';
import SearchModal from './components/SearchModal';
import SellerDashboard from './components/SellerDashboard';
import { X, CheckCircle2, ShoppingBag, Eye, FileText, ChevronRight, HelpCircle, Trash2, Sparkle, Mail, Info, FileCode2, ShieldCheck } from 'lucide-react';

export default function App() {
  // Master Routing: 'home' | 'listing' | 'detail' | 'auth' | 'component-library'
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedPartId, setSelectedPartId] = useState<string>('1100428');

  const isPopStateRef = useRef<boolean>(false);

  // Unified dynamic navigator supporting HTML5 history state tracking
  const navigateToView = (view: string, partId?: string) => {
    isPopStateRef.current = false;
    if (partId) {
      setSelectedPartId(partId);
    }
    setCurrentView(view);
    window.history.pushState({ view, partId: partId || selectedPartId }, '', '');
  };

  // Listen for browser back/forward and native swipe back gestures
  useEffect(() => {
    if (window.history && !window.history.state) {
      window.history.replaceState({ view: 'home', partId: selectedPartId }, '', '');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        isPopStateRef.current = true;
        setCurrentView(event.state.view);
        if (event.state.partId) {
          setSelectedPartId(event.state.partId);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedPartId]);

  // Scroll-to-top handler on standard/programmatic page navigations
  useEffect(() => {
    if (isPopStateRef.current) {
      // Avoid altering the scroll position on browser back button / swipe back gesture actions
      isPopStateRef.current = false;
    } else {
      // Programmatic navigation: scroll to top
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [currentView, selectedPartId]);

  // Algolia state syncing
  const [searchQueryText, setSearchQueryText] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('All Parts');

  // Supabase Authenticator state tracking
  const [user, setUser] = useState<UserSession | null>(null);

  // User mode ('buyer' | 'seller') - tracking profile type
  const [userRole, setUserRole] = useState<'buyer' | 'seller'>('buyer');
  
  // Custom navigation state for seller dashboard tabs
  const [activeSellerTab, setActiveSellerTab] = useState<'listings' | 'create' | 'settings' | 'snap'>('listings');
  const [pendingSnapImages, setPendingSnapImages] = useState<string[] | undefined>(undefined);

  // Track seller profile locally in parent App context
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('parts_peddle_seller_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      name: 'Unnamed Yard',
      email: '',
      location: '',
      whatsapp: '',
      logoUrl: '',
      verificationStatus: 'unverified'
    };
  });

  // Cart State tracking
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);

  // Guided Tour overlay state
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [highlightedElement, setHighlightedElement] = useState<string | undefined>(undefined);

  // Modal overlay states (About, Privacy, Terms, Contact)
  const [infoModalType, setInfoModalType] = useState<'about' | 'privacy' | 'terms' | 'contact' | null>(null);

  // Search modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Contact support form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactVin, setContactVin] = useState('');
  const [contactSubject, setContactSubject] = useState('Fitment Consultation');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setTimeout(() => {
      setContactLoading(false);
      setContactSubmitted(true);
    }, 1200);
  };

  // Recover active user & cart items on bootstrap
  useEffect(() => {
    const session = supabaseMock.getUser();
    if (session) {
      setUser(session);
      const savedRole = localStorage.getItem('parts_peddle_user_role') as 'buyer' | 'seller';
      if (savedRole === 'buyer' || savedRole === 'seller') {
        setUserRole(savedRole);
      }
    }

    const cartItems = cartMock.getCart();
    setCart(cartItems);

    // Tease the Guided Tour on first load for awesome assessment UX
    const tourDone = localStorage.getItem('parts_peddle_tour_done');
    if (!tourDone) {
      setIsTourActive(true);
    }
  }, []);

  // Sync user role back to local storage
  useEffect(() => {
    localStorage.setItem('parts_peddle_user_role', userRole);
  }, [userRole]);

  // Sync Supabase Auth state logins
  const handleAuthSuccess = (session: UserSession) => {
    setUser(session);
    
    // Resolve role from session or lookup cache
    const resolvedRole = (session.role === 'seller' || localStorage.getItem('parts_peddle_user_role') === 'seller') ? 'seller' : 'buyer';
    setUserRole(resolvedRole);
    localStorage.setItem('parts_peddle_user_role', resolvedRole);

    // Reload profile if seller signed in
    if (resolvedRole === 'seller') {
      const savedProfile = localStorage.getItem('parts_peddle_seller_profile');
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch (e) { /* ignore */ }
      }
      navigateToView('listings');
    } else {
      navigateToView('home');
    }
  };

  const handleLogout = () => {
    supabaseMock.signOut();
    setUser(null);
    setUserRole('buyer');
    localStorage.setItem('parts_peddle_user_role', 'buyer');
    navigateToView('home');
  };

  // Sync cart actions using reactive state callbacks
  const handleAddToCart = (part: Part) => {
    const updated = cartMock.addToCart(part);
    setCart([...updated]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (partId: string) => {
    const updated = cartMock.removeFromCart(partId);
    setCart([...updated]);
  };

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      cartMock.clearCart();
      setCart([]);
      setIsCartOpen(false);
      setCheckoutSuccess(false);
    }, 2500);
  };

  // Handle category triggers
  const handleCategorySelect = (catName: string) => {
    setSearchCategory(catName);
    setSearchQueryText('');
    navigateToView('listing');
  };

  const handleNavbarSearch = (text: string) => {
    setSearchQueryText(text);
    setSearchCategory('All Parts');
    navigateToView('listing');
  };

  const cartTotal = cart.reduce((total, item) => total + (item.part.price * item.quantity), 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={`min-h-screen bg-[#F5F0EB] text-[#1E1E1E] flex flex-col justify-between font-sans relative antialiased leading-relaxed ${currentView !== 'auth' ? 'pb-16 md:pb-0' : ''}`}>
      
      {/* Main navigation Header */}
      {currentView !== 'auth' && (
        <Navbar 
          currentView={currentView}
          onChangeView={(view) => {
            navigateToView(view);
            setIsCartOpen(false);
          }}
          onSearchSubmit={handleNavbarSearch}
          cartCount={totalItemsCount}
          user={user}
          onLogout={handleLogout}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSearchModal={(initialQuery) => {
            setIsSearchModalOpen(true);
          }}
          searchTextValue={searchQueryText}
          onSelectPart={(partId) => {
            navigateToView('detail', partId);
          }}
          userRole={userRole}
          onChangeUserRole={(role) => setUserRole(role)}
          profile={profile}
          onOpenSupport={() => setInfoModalType('contact')}
          onOpenTour={() => setIsTourActive(true)}
          onSetSellerTab={(tab) => setActiveSellerTab(tab)}
          onSnapImagesUploaded={(images) => {
            setPendingSnapImages(images);
            setActiveSellerTab('snap');
            navigateToView('listings');
          }}
          activeSellerTab={activeSellerTab}
        />
      )}

      {/* Interactive Tour Highlighter indicators */}
      {isTourActive && (
        <GuidedTour 
          onClose={() => {
            setIsTourActive(false);
            localStorage.setItem('parts_peddle_tour_done', 'true');
          }}
          onHighlightElement={(elId) => setHighlightedElement(elId)}
        />
      )}

      {/* Visual pulse indicator overlay to showcase Guided Tour focus pointers safely */}
      {highlightedElement && (
        <div className="fixed inset-0 pointer-events-none border-4 border-[#B87333] z-40 animate-pulse-slow"></div>
      )}

      {/* Primary Page Router Content */}
      <main className="flex-grow transition-opacity duration-300">
        {currentView === 'home' && (
          <Homepage 
            onSearch={({ query, category }) => {
              setSearchQueryText(query);
              setSearchCategory(category);
              navigateToView('listing');
            }}
            onSelectPart={(partId) => {
              navigateToView('detail', partId);
            }}
            onCategoryClick={handleCategorySelect}
            onOpenTour={() => setIsTourActive(true)}
            onViewSystems={() => {
              setSearchQueryText('');
              setSearchCategory('All Parts');
              navigateToView('listing');
            }}
            onOpenSearchModal={(initialQuery) => {
              setIsSearchModalOpen(true);
            }}
            user={user}
            userRole={userRole}
            onChangeUserRole={(role) => setUserRole(role)}
            onChangeView={(view) => {
              navigateToView(view);
              setIsCartOpen(false);
            }}
            onSetSellerTab={(tab) => setActiveSellerTab(tab)}
          />
        )}

        {currentView === 'listing' && (
          <ProductListing 
            initialSearchText={searchQueryText}
            initialCategory={searchCategory}
            onSelectPart={(partId) => {
              navigateToView('detail', partId);
            }}
          />
        )}

        {currentView === 'detail' && (
          <ProductDetail 
            partId={selectedPartId}
            onBack={() => navigateToView('listing')}
            onAddToCart={handleAddToCart}
            onSelectPart={(id) => {
              navigateToView('detail', id);
            }}
          />
        )}

        {currentView === 'auth' && (
          <AuthPage 
            onSuccess={handleAuthSuccess}
            onCancel={() => navigateToView('home')}
          />
        )}

        {currentView === 'listings' && (
          <SellerDashboard 
            userEmail={user ? user.email : null}
            onBackToMarketplace={() => navigateToView('home')}
            onSelectPart={(partId) => navigateToView('detail', partId)}
            initialTab={activeSellerTab}
            initialSnapImages={pendingSnapImages}
            onSetSellerTab={(tab) => {
              setActiveSellerTab(tab);
              if (tab !== 'snap') setPendingSnapImages(undefined);
            }}
            onProfileUpdate={(updatedProfile) => {
              setProfile(updatedProfile);
            }}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'component-library' && (
          <ComponentLibrary />
        )}
      </main>

      {/* Bottom info directories Footer */}
      {currentView !== 'auth' && currentView !== 'listings' && (
        <Footer 
          onChangeView={(view) => {
            navigateToView(view);
            setIsCartOpen(false);
          }} 
          onOpenModal={(type) => {
            setInfoModalType(type);
          }}
        />
      )}

      {/* High-fidelity Cart Drawer Slide-out Widget */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex justify-end" id="id-cart-drawer">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsCartOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 rounded"
              id="btn-close-cart"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6 flex-grow overflow-y-auto pr-2">
              <div className="border-b border-zinc-100 pb-4">
                <h3 className="font-display text-2xl font-bold uppercase text-[#1E1E1E] flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-[#B87333]" />
                  Checkout cart
                </h3>
                <span className="text-xs text-zinc-400 font-sans mt-0.5 block">
                  Hold period active — secured with regional escrow system
                </span>
              </div>

              {checkoutSuccess ? (
                <div className="py-16 text-center space-y-4 font-sans animate-fade-in" id="success-checkout-notification">
                  <CheckCircle2 className="w-16 h-16 text-[#7A8B6F] mx-auto animate-bounce" />
                  <div className="space-y-1">
                    <h4 className="font-display text-lg font-bold uppercase">Yard Registry Locked</h4>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                      Escrow code created. Carrier instructions sent to yard logistics desk. Track your shipment in Dashboard!
                    </p>
                  </div>
                </div>
              ) : cart.length > 0 ? (
                <div className="space-y-4 font-sans text-xs">
                  {cart.map((item) => (
                    <div key={item.part.id} className="flex gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded relative">
                      <div className="w-16 h-12 bg-zinc-850 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=150" 
                          alt={item.part.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold text-zinc-850 line-clamp-1 uppercase">{item.part.title}</h4>
                        <span className="block text-zinc-400 text-[10px] font-mono">Stock code: {item.part.trackingNumber}</span>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-mono text-[#B87333] font-bold text-sm">
                            ${(item.part.price * item.quantity).toFixed(2)}
                          </span>
                          <span className="text-zinc-500 font-semibold bg-zinc-200/60 px-2 py-0.5 rounded text-[10px]">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveFromCart(item.part.id)}
                        className="p-1 text-zinc-400 hover:text-red-500 shrink-0 absolute top-2 right-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-zinc-400 font-sans space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto text-zinc-300" />
                  <h4 className="font-display font-bold uppercase text-zinc-500">Cart Is Empty</h4>
                  <p className="text-xs max-w-xs mx-auto">
                    Browse our Chevy C10, transmissions, and suspension listings to add parts.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom summary and Action button */}
            {!checkoutSuccess && cart.length > 0 && (
              <div className="border-t border-zinc-200 pt-4 space-y-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-zinc-700">
                    <span>Subtotal:</span>
                    <span className="font-mono text-[#1E1E1E] text-base">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Logistics dispatch:</span>
                    <span className="font-sans text-[#7A8B6F] font-bold uppercase">Included</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-[#B87333] hover:bg-[#8B6239] hover:border-[#1E1E1E] text-white font-display font-bold uppercase tracking-wider py-3.5 rounded text-center cursor-pointer shadow-md"
                  id="btn-cart-checkout"
                >
                  Checkout Escrow — Buy outright
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Dynamic Info Modals Overlay (About, Privacy, Terms, Contact Custom Immersive Layouts) */}
      {infoModalType && (
        <div className="fixed inset-0 bg-[#0E0E0E]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white border border-zinc-200 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-[#1E1E1E] text-white py-4 px-6 flex items-center justify-between border-b border-[#3D3632]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#B87333] flex items-center justify-center rounded">
                  {infoModalType === 'about' && <Info className="w-4 h-4 text-white" />}
                  {infoModalType === 'privacy' && <ShieldCheck className="w-4 h-4 text-white" />}
                  {infoModalType === 'terms' && <FileCode2 className="w-4 h-4 text-white" />}
                  {infoModalType === 'contact' && <Mail className="w-4 h-4 text-white" />}
                </div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wider">
                  {infoModalType === 'about' && "About PartsPeddle network"}
                  {infoModalType === 'privacy' && "Privacy & Fair Trade Statement"}
                  {infoModalType === 'terms' && "Terms & Seller Warrant Index"}
                  {infoModalType === 'contact' && "Mechanical Support Dispatch"}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setInfoModalType(null);
                  setContactSubmitted(false);
                }} 
                className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto font-sans text-sm text-zinc-650 leading-relaxed space-y-4">
              
              {infoModalType === 'about' && (
                <div className="space-y-4">
                  <div className="border-l-4 border-[#B87333] pl-4 py-1 bg-[#F5F0EB]/40 rounded-r">
                    <p className="font-display font-semibold text-[#1E1E1E] text-sm uppercase tracking-wider">
                      Connecting Real Parts. Real People. Real Savings since '72.
                    </p>
                  </div>
                  <p>
                    PartsPeddle started as a single localized salvage parts desk and mechanic service index. Over decades, we grew to unify auto-restoration yards, regional truck salvage garages, and verified dismantlers across North America into a trusted digital inventory index.
                  </p>
                  <p>
                    We provide mechanics and auto-hobbyists instant access to hand-inspected, vetted OEM vehicle parts. Every individual listing on our system features authentic grading, actual mileage diagnostics, clean fitment specs, and pre-negotiated logistical dispatch inside our prototype environment.
                  </p>
                  <p className="font-semibold text-zinc-805 uppercase tracking-widest text-[10px] pt-2">Our National Quality Standards:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <li className="flex items-start gap-2">
                      <span className="text-[#7A8B6F] font-bold text-lg leading-none">✔</span>
                      <div>
                        <strong className="text-zinc-850 block text-xs uppercase font-display">24-Point Fitment Diagnostic</strong>
                        <span className="text-xs text-zinc-500">Every alternator, axle and structural panel is benchmark tested before listing.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#7A8B6F] font-bold text-lg leading-none">✔</span>
                      <div>
                        <strong className="text-zinc-850 block text-xs uppercase font-display">1-Day Logistics dispatch</strong>
                        <span className="text-xs text-zinc-500">Fast tracking coordinates through optimized LTL freight and parcel carriers.</span>
                      </div>
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-mono">Yard Registry Directory: ACTIVE (302 yards)</span>
                    <button 
                      onClick={() => setInfoModalType('contact')} 
                      className="text-xs font-display font-semibold uppercase tracking-wider text-[#B87333] hover:text-[#8B6239] transition-colors cursor-pointer"
                    >
                      Contact Registrar Office &rarr;
                    </button>
                  </div>
                </div>
              )}

              {infoModalType === 'privacy' && (
                <div className="space-y-4">
                  <p className="font-display font-semibold text-[#1E1E1E] text-base">
                    Transparency, Security, and Fair-Trade Escrow.
                  </p>
                  <p>
                    Your security is our absolute highest priority. All transaction payments inside PartsPeddle are securely processed through vetted escrow models, preventing seller billing fraud or dispatch default indexes. Your credit detail and identification are never sold or rented.
                  </p>
                  <p className="font-semibold text-zinc-850 uppercase tracking-widest text-[10px]">Buyer and Seller Security Protections:</p>
                  <ul className="space-y-3">
                    <li className="bg-[#F5F0EB]/40 p-3 rounded border border-zinc-200">
                      <h4 className="font-display font-bold text-xs uppercase text-zinc-800 mb-1">Escrow Safeguards</h4>
                      <p className="text-xs text-zinc-500">Funds remain secure during transit and are only released to the recycling yard after 3 days of part delivery receipt confirmation.</p>
                    </li>
                    <li className="bg-[#F5F0EB]/40 p-3 rounded border border-zinc-200">
                      <h4 className="font-display font-bold text-xs uppercase text-zinc-800 mb-1">Authenticated Account Verification</h4>
                      <p className="text-xs text-zinc-500">All member records and passwords are protected with industry-standard cryptographic hashes, powered by Supabase Authentication systems.</p>
                    </li>
                  </ul>
                  <p className="text-xs text-zinc-400 font-mono pt-2 border-t border-zinc-100">Cookies & Telemetry: We leverage local state memory variables solely to maintain custom configurations, cart entries, and your dashboard session index.</p>
                </div>
              )}

              {infoModalType === 'terms' && (
                <div className="space-y-4">
                  <p className="font-display font-semibold text-[#1E1E1E] text-base">
                    PartsPeddle Certified Vetted Seller Service Metrics.
                  </p>
                  <p>
                    By interacting within our sandbox catalog, all verified dismantlers, yard registers, and mechanics commit to strict operational protocols:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex gap-2.5 items-start">
                      <span className="text-[#B87333] font-bold font-mono">01.</span>
                      <div>
                        <strong className="text-zinc-850 text-xs uppercase font-display block">Warranty Protection</strong>
                        <span className="text-xs text-zinc-500">Every listed engine block, alternator, steering gear and transmission comes standard with a 30-day wear replacement or refund catalog credit guarantee.</span>
                      </div>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-[#B87333] font-bold font-mono">02.</span>
                      <div>
                        <strong className="text-zinc-850 text-xs uppercase font-display block">Logistics dispatch SLA</strong>
                        <span className="text-xs text-zinc-500">Sellers must dispatch purchases within 24 business hours of payment receipt with clear freight tracking IDs.</span>
                      </div>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-[#B87333] font-bold font-mono">03.</span>
                      <div>
                        <strong className="text-zinc-850 text-xs uppercase font-display block">Grading Accuracy</strong>
                        <span className="text-xs text-zinc-500">Discrepancies between listed fitment (Excellent, OEM Original, Good, Used OEM, For Parts) and actual item condition will trigger immediate platform remediation.</span>
                      </div>
                    </li>
                  </ul>
                  <p className="text-xs text-zinc-500 pt-3 border-t border-zinc-100">
                    Failure to satisfy the above SLAs is grounds for yard suspension. For remediation requests, please open a direct contact dispatch sheet below.
                  </p>
                </div>
              )}

              {infoModalType === 'contact' && (
                <div>
                  {contactSubmitted ? (
                    <div className="py-8 text-center space-y-4 animate-fade-in">
                      <CheckCircle2 className="w-16 h-16 mx-auto text-[#7A8B6F]" />
                      <h4 className="font-display font-black text-xl uppercase tracking-wider text-[#1E1E1E]">Mechanical Dispatch Recieved</h4>
                      <p className="text-zinc-500 max-w-sm mx-auto text-xs leading-relaxed">
                        Thank you, <strong className="text-zinc-850">{contactName}</strong>. Your support inquiry has been successfully dispatched to the assigned salvage yard registrar. Reference ticket ID: <span className="font-mono text-[#B87333] font-bold">PP-{Math.floor(100000 + Math.random() * 900000)}</span>.
                      </p>
                      <p className="text-[10px] text-zinc-400">Our support desk responds within 2 hours during normal wrenching schedules.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4 font-sans">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] uppercase font-display font-bold text-zinc-500 tracking-wider">Your Full Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Wrench Mechanic Bob"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full text-xs p-3 bg-zinc-50 border border-zinc-200 outline-none rounded focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333]/30 text-[#1E1E1E]"
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] uppercase font-display font-bold text-zinc-500 tracking-wider">Email Address</label>
                          <input 
                            type="email" 
                            required
                            placeholder="mechanic@garage.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full text-xs p-3 bg-zinc-50 border border-zinc-200 outline-none rounded focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333]/30 text-[#1E1E1E]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-display font-bold text-zinc-500 tracking-wider">Inquiry Subject</label>
                          <select 
                            value={contactSubject}
                            onChange={(e) => setContactSubject(e.target.value)}
                            className="w-full text-xs p-3 bg-zinc-50 border border-zinc-200 outline-none rounded focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333]/30 text-[#1E1E1E]"
                          >
                            <option value="Fitment Consultation">Fitment Consultation</option>
                            <option value="Order Tracking">Logistics Dispatch & Tracking</option>
                            <option value="Yard Onboarding">Dismantler Onboarding</option>
                            <option value="Payments & Escrow">Payments & Escrow Remittance</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-display font-bold text-zinc-500 tracking-wider">Fits VIN Number / Car Spec (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="1FTFW1EF5G..."
                            value={contactVin}
                            onChange={(e) => setContactVin(e.target.value)}
                            className="w-full text-xs p-3 bg-zinc-50 border border-zinc-200 tracking-widest uppercase font-mono outline-none rounded focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333]/30 text-[#1E1E1E]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] uppercase font-display font-bold text-zinc-500 tracking-wider font-semibold">Your Message</label>
                        <textarea 
                          rows={4}
                          required
                          placeholder="Please specify alternator fitment, Chevy C10 yard availability, or specific core grade questions..."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="w-full text-xs p-3 bg-zinc-50 border border-zinc-200 outline-none rounded focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333]/30 text-[#1E1E1E]"
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={contactLoading}
                        className="w-full bg-[#B87333] hover:bg-[#8B6239] disabled:opacity-50 text-white font-display font-bold uppercase tracking-wider text-xs py-3.5 rounded transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                      >
                        {contactLoading ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 text-white" />
                            <span>Dispatch Support Sheet</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Floating Tour Guide FAB in bottom-right corner */}
      {currentView !== 'auth' && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-40 group flex items-center justify-end">
          <span className="bg-zinc-900 border border-zinc-800 text-white text-xs px-2.5 py-1.5 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-2.5 pointer-events-none whitespace-nowrap font-sans font-semibold hidden md:inline">
            Take a tour
          </span>
          <button
            onClick={() => setIsTourActive(true)}
            className="w-12 h-12 bg-[#B87333] hover:bg-[#A35D1F] active:scale-95 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(184,115,51,0.35)] hover:shadow-[0_4px_25px_rgba(184,115,51,0.55)] transition-all cursor-pointer border border-[#B87333]/15"
            title="Take a Guided Tour"
            id="btn-footer-tour-trigger"
          >
            <HelpCircle className="w-5.5 h-5.5 animate-pulse" />
          </button>
        </div>
      )}

      {/* Global Search Sheet Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectPart={(partId) => {
          setSelectedPartId(partId);
          setCurrentView('detail');
        }}
        onSeeAllResults={(query, system) => {
          setSearchQueryText(query);
          setSearchCategory(system || 'All Parts');
          setCurrentView('listing');
        }}
        initialQuery={searchQueryText}
      />

    </div>
  );
}
