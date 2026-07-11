'use client';

import React from 'react';
import { useIsClient } from '@/hooks/useIsClient';
import { X, CheckCircle2, ShoppingBag, Trash2, HelpCircle } from 'lucide-react';
import { useCartStore, useSearchStore, useUiStore } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import GuidedTour from './GuidedTour';
import SearchModal from './SearchModal';

export function UIOverlays() {
  const router = useRouter();
  const isMounted = useIsClient();

  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    checkoutSuccess,
    setCheckoutSuccess,
    clearCart,
    removeFromCart,
  } = useCartStore();
  const {
    isTourActive,
    setTourActive,
    setHighlightedElement,
    infoModalType,
    setInfoModalType,
    isSearchModalOpen,
    setSearchModalOpen,
  } = useUiStore();
  const { searchQueryText, setSearchQueryText, setSearchCategory } =
    useSearchStore();

  if (!isMounted) return null;

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      clearCart();
      setIsCartOpen(false);
      setCheckoutSuccess(false);
    }, 2500);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.part.price * item.quantity), 0);

  return (
    <>
      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9990] flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between p-8 shadow-2xl relative animate-slide-in-right">
            <button onClick={() => setIsCartOpen(false)} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-8 flex-grow overflow-y-auto pr-2">
              <div className="border-b border-zinc-100 pb-6">
                <h3 className="font-heading text-2xl font-black uppercase text-neutral-900 flex items-center gap-3">
                  <ShoppingBag className="w-7 h-7 text-rust-copper" />
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
                    <div key={item.part.id} className="flex gap-5 p-4 bg-zinc-50 border border-zinc-200 rounded-sm relative group hover:border-rust-copper/30 transition-colors">
                      <div className="w-16 h-16 rounded-sm overflow-hidden bg-zinc-200 shrink-0">
                        <img src={item.part.images?.[0]} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <h4 className="font-bold text-zinc-900 line-clamp-1 uppercase text-sm tracking-tight">{item.part.title}</h4>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-mono text-rust-copper font-black text-base">${(item.part.price * item.quantity).toFixed(2)}</span>
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
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-sm shadow-elevated w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-neutral-950 text-white py-5 px-8 flex items-center justify-between border-b border-white/10">
              <h3 className="font-heading font-black text-xs uppercase tracking-[0.2em]">{infoModalType} Information</h3>
              <button onClick={() => setInfoModalType(null)} className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="p-10 flex-1 overflow-y-auto font-sans text-sm text-zinc-600 leading-relaxed text-left">
              <p>Deployment of {infoModalType} protocol documents pending validation.</p>
            </div>
          </div>
        </div>
      )}

      {/* Guided Tour */}
      {isTourActive && (
        <GuidedTour 
          onClose={() => setTourActive(false)}
          onHighlightElement={setHighlightedElement}
        />
      )}

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectPart={(id) => {
          setSearchModalOpen(false);
          router.push(`/listing/${id}`);
        }}
        onSeeAllResults={(query, system) => {
          setSearchQueryText(query);
          setSearchCategory(system || 'All Parts');
          setSearchModalOpen(false);
          router.push('/search');
        }}
        initialQuery={searchQueryText}
      />

      {/* Global Help Button - hidden while tour is active and raised above mobile bottom tab */}
      {!isTourActive && (
        <div className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 z-[39]">
          <button
            onClick={() => setTourActive(true)}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-rust-copper hover:bg-rust-copper/90 text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group"
            title="Operator Support & Tour"
          >
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse" />
          </button>
        </div>
      )}
    </>
  );
}
