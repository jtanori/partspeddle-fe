import { create } from 'zustand';
import { Part, Seller, CartItem, UserSession, SearchFilters } from '../types';
import { supabase } from '../lib/supabase';

// Helper for local cart persistence
const getStoredCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem('parts_peddle_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

interface AppState {
  // Auth & User
  user: UserSession | null;
  userRole: 'buyer' | 'seller';
  profile: any;
  setUser: (user: UserSession | null) => void;
  setUserRole: (role: 'buyer' | 'seller') => void;
  setProfile: (profile: any) => void;
  logout: () => Promise<void>;

  // Navigation
  activeSellerTab: 'listings' | 'create' | 'settings' | 'snap';
  pendingSnapImages: string[] | undefined;
  setActiveSellerTab: (tab: 'listings' | 'create' | 'settings' | 'snap') => void;
  setPendingSnapImages: (images: string[] | undefined) => void;

  // Search & Catalog
  searchQueryText: string;
  searchCategory: string;
  setSearchQueryText: (text: string) => void;
  setSearchCategory: (category: string) => void;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  checkoutSuccess: boolean;
  setCart: (cart: CartItem[]) => void;
  setIsCartOpen: (isOpen: boolean) => void;
  setCheckoutSuccess: (success: boolean) => void;
  addToCart: (part: Part) => void;
  removeFromCart: (partId: string) => void;
  clearCart: () => void;

  // UI Overlays
  isTourActive: boolean;
  highlightedElement: string | undefined;
  infoModalType: 'about' | 'privacy' | 'terms' | 'contact' | null;
  isSearchModalOpen: boolean;
  setTourActive: (active: boolean) => void;
  setHighlightedElement: (elId: string | undefined) => void;
  setInfoModalType: (type: 'about' | 'privacy' | 'terms' | 'contact' | null) => void;
  setSearchModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth & User
  user: null,
  userRole: (localStorage.getItem('parts_peddle_user_role') as 'buyer' | 'seller') || 'buyer',
  profile: (() => {
    const saved = localStorage.getItem('parts_peddle_seller_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return { name: 'Unnamed Yard', email: '', location: '', whatsapp: '', logoUrl: '', verificationStatus: 'unverified' };
  })(),
  setUser: (user) => set({ user }),
  setUserRole: (role) => {
    localStorage.setItem('parts_peddle_user_role', role);
    set({ userRole: role });
  },
  setProfile: (profile) => {
    localStorage.setItem('parts_peddle_seller_profile', JSON.stringify(profile));
    set({ profile });
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, userRole: 'buyer' });
    localStorage.setItem('parts_peddle_user_role', 'buyer');
  },

  // Navigation
  activeSellerTab: 'listings',
  pendingSnapImages: undefined,
  setActiveSellerTab: (tab) => set({ activeSellerTab: tab }),
  setPendingSnapImages: (images) => set({ pendingSnapImages: images }),

  // Search
  searchQueryText: '',
  searchCategory: 'All Parts',
  setSearchQueryText: (searchQueryText) => set({ searchQueryText }),
  setSearchCategory: (searchCategory) => set({ searchCategory }),

  // Cart
  cart: cartMock.getCart(),
  isCartOpen: false,
  checkoutSuccess: false,
  setCart: (cart) => set({ cart }),
  setIsCartOpen: (isCartOpen) => set({ isCartOpen }),
  setCheckoutSuccess: (checkoutSuccess) => set({ checkoutSuccess }),
  addToCart: (part: Part) => {
    const cart = getStoredCart();
    const existingIndex = cart.findIndex((item) => item.part.id === part.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ part, quantity: 1 });
    }
    localStorage.setItem('parts_peddle_cart', JSON.stringify(cart));
    set({ cart: [...cart], isCartOpen: true });
  },
  removeFromCart: (partId: string) => {
    const cart = getStoredCart().filter((item) => item.part.id !== partId);
    localStorage.setItem('parts_peddle_cart', JSON.stringify(cart));
    set({ cart: [...cart] });
  },
  clearCart: () => {
    localStorage.removeItem('parts_peddle_cart');
    set({ cart: [] });
  },


  // UI Overlays
  isTourActive: !localStorage.getItem('parts_peddle_tour_done'),
  highlightedElement: undefined,
  infoModalType: null,
  isSearchModalOpen: false,
  setTourActive: (isTourActive) => {
    if (!isTourActive) localStorage.setItem('parts_peddle_tour_done', 'true');
    set({ isTourActive });
  },
  setHighlightedElement: (highlightedElement) => set({ highlightedElement }),
  setInfoModalType: (infoModalType) => set({ infoModalType }),
  setSearchModalOpen: (isSearchModalOpen) => set({ isSearchModalOpen }),
}));
