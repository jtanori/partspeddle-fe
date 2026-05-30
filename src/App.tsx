import React, { useEffect } from 'react';
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
import { X, CheckCircle2, ShoppingBag, Trash2, HelpCircle, Mail, Info, FileCode2, ShieldCheck } from 'lucide-react';
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

  if (!id) return <Navigate to="/listing" />;

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
    addToCart,
    removeFromCart,
    clearCart,
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
    profile,
    setProfile
  } = useAppStore();

  const isAuthPage = location.pathname === '/auth';
  const isDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
    });

    return () => subscription.unsubscribe();
  }, []);

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
    <div className={`min-h-screen bg-[#F5F0EB] text-[#1E1E1E] flex flex-col justify-between font-sans relative antialiased leading-relaxed ${!isAuthPage ? 'pb-16 md:pb-0' : ''}`}>
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
            navigate('/');
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
        <div className="fixed inset-0 pointer-events-none border-4 border-[#B87333] z-40 animate-pulse-slow"></div>
      )}

      <main className="flex-grow transition-opacity duration-300">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/listing" element={<ProductListing initialSearchText={searchQueryText} initialCategory={searchCategory} onSelectPart={(id) => navigate(`/detail/${id}`)} />} />
          <Route path="/detail/:id" element={<ProductDetailWrapper />} />
          <Route path="/auth" element={<AuthPage onSuccess={() => navigate('/')} onCancel={() => navigate('/')} />} />
          <Route path="/dashboard" element={user ? <SellerDashboard /> : <Navigate to="/auth" />} />
          <Route path="/library" element={<ComponentLibrary />} />
          <Route path="*" element={<Navigate to="/" />} />
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
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl relative">
            <button onClick={() => setIsCartOpen(false)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 rounded">
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6 flex-grow overflow-y-auto pr-2">
              <div className="border-b border-zinc-100 pb-4">
                <h3 className="font-display text-2xl font-bold uppercase text-[#1E1E1E] flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-[#B87333]" />
                  Checkout cart
                </h3>
              </div>

              {checkoutSuccess ? (
                <div className="py-16 text-center space-y-4 font-sans animate-fade-in">
                  <CheckCircle2 className="w-16 h-16 text-[#7A8B6F] mx-auto animate-bounce" />
                  <div className="space-y-1">
                    <h4 className="font-display text-lg font-bold uppercase">Yard Registry Locked</h4>
                  </div>
                </div>
              ) : cart.length > 0 ? (
                <div className="space-y-4 font-sans text-xs">
                  {cart.map((item) => (
                    <div key={item.part.id} className="flex gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded relative">
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold text-zinc-850 line-clamp-1 uppercase">{item.part.title}</h4>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-mono text-[#B87333] font-bold text-sm">${(item.part.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.part.id)} className="p-1 text-zinc-400 hover:text-red-500 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-zinc-400 font-sans space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto text-zinc-300" />
                  <h4 className="font-display font-bold uppercase text-zinc-500">Cart Is Empty</h4>
                </div>
              )}
            </div>

            {!checkoutSuccess && cart.length > 0 && (
              <div className="border-t border-zinc-200 pt-4 space-y-4 font-sans text-xs">
                <div className="flex justify-between font-bold text-zinc-700">
                  <span>Subtotal:</span>
                  <span className="font-mono text-[#1E1E1E] text-base">${cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={handleCheckout} className="w-full bg-[#B87333] hover:bg-[#8B6239] text-white font-display font-bold uppercase tracking-wider py-3.5 rounded text-center shadow-md">
                  Checkout Escrow
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Modals */}
      {infoModalType && (
        <div className="fixed inset-0 bg-[#0E0E0E]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white border border-zinc-200 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#1E1E1E] text-white py-4 px-6 flex items-center justify-between border-b border-[#3D3632]">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider">{infoModalType} Information</h3>
              <button onClick={() => setInfoModalType(null)} className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="p-6 md:p-8 flex-1 overflow-y-auto font-sans text-sm text-zinc-650 leading-relaxed">
              <p>Details for {infoModalType} here...</p>
            </div>
          </div>
        </div>
      )}

      {!isAuthPage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-40">
          <button onClick={() => setTourActive(true)} className="w-12 h-12 bg-[#B87333] hover:bg-[#A35D1F] text-white rounded-full flex items-center justify-center shadow-lg transition-all">
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
