import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Navbar from './components/navbar/Navbar';
import Footer from './components/Footer';
import Homepage from './components/Homepage';
import ProductListing from './components/ProductListing';
import ProductDetail from './components/ProductDetail';
import AuthPage from './components/AuthPage';
import ComponentLibrary from './components/ComponentLibrary';
import GuidedTour from './components/GuidedTour';
import SearchModal from './components/SearchModal';
import SellerDashboard from './components/SellerDashboard';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { X, CheckCircle2, ShoppingBag, Trash2, HelpCircle } from 'lucide-react';
import { useAppStore } from './store/useAppStore';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProductDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useAppStore();

  if (!id) return <Navigate to="/listing" replace />;

  return (
    <ProductDetail 
      partId={id} 
      onBack={() => navigate('/listing')} 
      onAddToCart={addToCart} 
      onSelectPart={(newId) => navigate(`/detail/${newId}`)} 
    />
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);
  
  const {
    user,
    userRole,
    setUser,
    setUserRole,
    logout,
    cart,
    isCartOpen,
    setIsCartOpen,
    checkoutSuccess,
    setCheckoutSuccess,
    clearCart,
    removeFromCart,
    isTourActive,
    setTourActive,
    highlightedElement,
    setHighlightedElement,
    infoModalType,
    setInfoModalType,
    isSearchModalOpen,
    setSearchModalOpen,
    searchQueryText,
    setSearchQueryText,
    searchCategory,
    setSearchCategory,
    activeSellerTab,
    setActiveSellerTab,
    pendingSnapImages,
    setPendingSnapImages,
    profile
  } = useAppStore();

  const isAuthPage = location.pathname === '/auth';
  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session) {
          setUser({
            id: session.user.id,
            email: session.user.email || null,
            jwt: session.access_token,
            aud: session.user.aud,
            role: session.user.user_metadata.role || 'buyer'
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth Terminal Synchronization Failure:", error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email || null,
        jwt: session.access_token,
        aud: session.user.aud,
        role: session.user.user_metadata.role || 'buyer'
      } : null);
      setIsInitializing(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setUser]);

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-shell-canvas flex flex-col items-center justify-center gap-4 z-50">
        <div className="w-10 h-10 border-4 border-accent-amber/20 border-t-accent-amber rounded-full animate-spin shadow-[0_0_15px_rgba(245,158,11,0.1)]" />
        <span className="font-mono text-[10px] text-text-muted uppercase tracking-[0.3em] animate-pulse">
          Synchronizing Core Session Terminal...
        </span>
      </div>
    );
  }

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      clearCart();
      setIsCartOpen(false);
      setCheckoutSuccess(false);
    }, 2500);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.part.price * item.quantity), 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans relative antialiased leading-relaxed ${isDashboard ? 'bg-shell-canvas text-text-primary' : 'bg-base-cream text-steel-black'} ${!isAuthPage && !isDashboard ? 'pb-16 md:pb-0' : ''}`}>
      <ScrollToTop />
      
      {!isAuthPage && !isDashboard && (
        <Navbar 
          currentView={location.pathname}
          onChangeView={(view) => {
            const path = view === 'home' ? '/' : `/${view}`;
            navigate(path);
            setIsCartOpen(false);
          }}
          onSearchSubmit={(text) => {
            setSearchQueryText(text);
            setSearchCategory('All Parts');
            navigate('/listing');
          }}
          cartCount={totalItemsCount}
          user={user}
          onLogout={async () => {
            await logout();
            navigate('/', { replace: true });
          }}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSearchModal={() => setSearchModalOpen(true)}
          searchTextValue={searchQueryText}
          onSelectPart={(id) => navigate(`/detail/${id}`)}
          userRole={userRole}
          onChangeUserRole={setUserRole}
          profile={profile}
          onOpenSupport={() => setInfoModalType('contact')}
          onOpenTour={() => setTourActive(true)}
          onSetSellerTab={setActiveSellerTab}
          onSnapImagesUploaded={(images) => {
            setPendingSnapImages(images);
            navigate('/dashboard/snap');
          }}
          activeSellerTab={activeSellerTab}
        />
      )}

      {isTourActive && (
        <GuidedTour 
          onClose={() => setTourActive(false)}
          onHighlightElement={setHighlightedElement}
        />
      )}

      {highlightedElement && (
        <div className="fixed inset-0 pointer-events-none border-4 border-accent-amber z-40 animate-pulse-slow shadow-[inset_0_0_50px_rgba(245,158,11,0.15)]" />
      )}

      <main className="flex-grow transition-opacity duration-300">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/listing" element={
            <ErrorBoundary>
              <ProductListing initialSearchText={searchQueryText} initialCategory={searchCategory} onSelectPart={(id) => navigate(`/detail/${id}`)} />
            </ErrorBoundary>
          } />
          <Route path="/detail/:id" element={<ProductDetailWrapper />} />
          <Route path="/auth" element={!user ? <AuthPage onSuccess={() => navigate('/dashboard', { replace: true })} onCancel={() => navigate('/', { replace: true })} /> : <Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/*" element={user ? <SellerDashboard /> : <Navigate to="/auth" replace />} />
          <Route path="/library" element={<ComponentLibrary />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && !isDashboard && (
        <Footer 
          onChangeView={(view) => {
             const path = view === 'home' ? '/' : `/${view}`;
             navigate(path);
          }} 
          onOpenModal={setInfoModalType} 
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between p-8 shadow-2xl relative animate-slide-in-right">
            <button onClick={() => setIsCartOpen(false)} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-8 flex-grow overflow-y-auto pr-2">
              <div className="border-b border-zinc-100 pb-6">
                <h3 className="font-heading text-2xl font-black uppercase text-neutral-900 flex items-center gap-3">
                  <ShoppingBag className="w-7 h-7 text-accent-amber" />
                  Checkout Cart
                </h3>
              </div>

              {checkoutSuccess ? (
                <div className="py-20 text-center space-y-5 animate-fade-in">
                  <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-success" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-heading text-xl font-black uppercase">Registry Locked</h4>
                    <p className="text-zinc-500 text-sm">Transfer protocols initialized successfully.</p>
                  </div>
                </div>
              ) : cart.length > 0 ? (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.part.id} className="flex gap-5 p-4 bg-zinc-50 border border-zinc-200 rounded-sm relative group hover:border-accent-amber/30 transition-colors">
                      <div className="w-16 h-16 rounded-sm overflow-hidden bg-zinc-200 shrink-0">
                        <img src={item.part.images?.[0]} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <h4 className="font-bold text-zinc-900 line-clamp-1 uppercase text-sm tracking-tight">{item.part.title}</h4>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-mono text-accent-amber font-black text-base">${(item.part.price * item.quantity).toFixed(2)}</span>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.part.id)} className="p-1 text-zinc-300 hover:text-danger shrink-0 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center text-zinc-400 space-y-4">
                  <ShoppingBag className="w-16 h-16 mx-auto opacity-20" />
                  <h4 className="font-heading font-black uppercase tracking-widest text-zinc-300">Cart Empty</h4>
                </div>
              )}
            </div>

            {!checkoutSuccess && cart.length > 0 && (
              <div className="border-t border-zinc-200 pt-6 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-zinc-500 font-bold uppercase text-xs">Subtotal:</span>
                  <span className="font-mono text-neutral-950 text-2xl font-black tracking-tighter">${cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={handleCheckout} className="w-full bg-neutral-950 hover:bg-black text-white font-heading font-black uppercase tracking-[0.2em] py-4 rounded-sm text-center shadow-panel transition-all active:translate-y-0.5">
                  Secure Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Modals */}
      {infoModalType && (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-sm shadow-elevated w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-neutral-950 text-white py-5 px-8 flex items-center justify-between border-b border-white/10">
              <h3 className="font-heading font-black text-xs uppercase tracking-[0.2em]">{infoModalType} Information</h3>
              <button onClick={() => setInfoModalType(null)} className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="p-10 flex-1 overflow-y-auto font-sans text-sm text-zinc-600 leading-relaxed">
              <p>Deployment of {infoModalType} protocol documents pending validation.</p>
            </div>
          </div>
        </div>
      )}

      {!isAuthPage && !isDashboard && (
        <div className="fixed bottom-20 sm:bottom-8 right-8 z-40">
          <button onClick={() => setTourActive(true)} className="w-14 h-14 bg-accent-amber hover:bg-accent-amber-hover text-neutral-950 rounded-full flex items-center justify-center shadow-elevated transition-all hover:scale-110 active:scale-95 group">
            <HelpCircle className="w-6 h-6 group-hover:animate-pulse" />
          </button>
        </div>
      )}

      <SearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectPart={(id) => {
          setSearchModalOpen(false);
          navigate(`/detail/${id}`);
        }}
        onSeeAllResults={(query, system) => {
          setSearchQueryText(query);
          setSearchCategory(system || 'All Parts');
          setSearchModalOpen(false);
          navigate('/listing');
        }}
        initialQuery={searchQueryText}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
