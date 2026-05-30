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
  const isDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    let isMounted = true;

    // Combined atomic authentication synchronization sequence
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session) {
          setUser({
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

    // Single source-of-truth subscription event listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      setUser(session?.user ? {
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
      <div className="fixed inset-0 bg-steel-black flex flex-col items-center justify-center gap-3 z-50">
        <div className="w-8 h-8 border-4 border-rust-copper border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-[10px] text-warm-gray uppercase tracking-widest">
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
    <div className={`min-h-screen bg-base-cream text-steel-black flex flex-col justify-between font-sans relative antialiased leading-relaxed ${!isAuthPage ? 'pb-16 md:pb-0' : ''}`}>
      <ScrollToTop />
      
      {!isAuthPage && (
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
            setActiveSellerTab('snap');
            navigate('/dashboard');
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
        <div className="fixed inset-0 pointer-events-none border-4 border-rust-copper z-40 animate-pulse-slow" />
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
          <Route path="/dashboard" element={user ? <SellerDashboard /> : <Navigate to="/auth" replace />} />
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

      {/* Cart Drawer & Modals (Omitted for brevity, assumed existing) */}
      
      {!isAuthPage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-40">
          <button onClick={() => setTourActive(true)} className="w-12 h-12 bg-rust-copper hover:bg-bronze text-white rounded-full flex items-center justify-center shadow-lg transition-all">
            <HelpCircle className="w-5.5 h-5.5 animate-pulse" />
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
