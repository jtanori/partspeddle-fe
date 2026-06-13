import { create } from "zustand";
import { Part, Seller, CartItem, UserSession, SearchFilters } from "../types";
import { supabase } from "../lib/supabase";

// Safe localStorage access for SSR
const isClient = typeof window !== "undefined";

const safeGetItem = (key: string): string | null => {
  if (!isClient) return null;
  return localStorage.getItem(key);
};

const safeSetItem = (key: string, value: string) => {
  if (isClient) {
    localStorage.setItem(key, value);
  }
};

const safeRemoveItem = (key: string) => {
  if (isClient) {
    localStorage.removeItem(key);
  }
};

// Helper for live local cart persistence
const getStoredCart = (): CartItem[] => {
  try {
    const saved = safeGetItem("parts_peddle_cart");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

interface AppState {
  // Auth & User System
  user: UserSession | null;
  userRole: "buyer" | "seller";
  profile: any | null; // Starts clean, hydrated securely from database
  setUser: (user: UserSession | null) => void;
  setUserRole: (role: "buyer" | "seller") => void;
  setProfile: (profile: any) => void;
  logout: () => Promise<void>;

  // Consolidated Navigation Structure
  activeSellerTab:
    | "listings"
    | "inventory"
    | "orders"
    | "settings"
    | "snap"
    | "create";
  pendingSnapImages: string[] | undefined;
  setActiveSellerTab: (
    tab: "listings" | "inventory" | "orders" | "settings" | "snap" | "create",
  ) => void;
  setPendingSnapImages: (images: string[] | undefined) => void;

  // Search Framework
  searchQueryText: string;
  searchCategory: string;
  setSearchQueryText: (text: string) => void;
  setSearchCategory: (category: string) => void;

  // Shopping Cart Engine
  cart: CartItem[];
  isCartOpen: boolean;
  checkoutSuccess: boolean;
  setCart: (cart: CartItem[]) => void;
  setIsCartOpen: (isOpen: boolean) => void;
  setCheckoutSuccess: (success: boolean) => void;
  addToCart: (part: Part) => void;
  removeFromCart: (partId: string) => void;
  clearCart: () => void;

  // Global UX Context Overlays
  isTourActive: boolean;
  highlightedElement: string | undefined;
  infoModalType: "about" | "privacy" | "terms" | "contact" | null;
  isSearchModalOpen: boolean;
  setTourActive: (active: boolean) => void;
  setHighlightedElement: (elId: string | undefined) => void;
  setInfoModalType: (
    type: "about" | "privacy" | "terms" | "contact" | null,
  ) => void;
  setSearchModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth & User Lifecycle Initializers
  user: null,
  userRole:
    (safeGetItem("parts_peddle_user_role") as "buyer" | "seller") || "buyer",
  profile: null, // Zero client-side placeholders. Await Supabase hook hydration.

  setUser: (user) => set({ user }),
  setUserRole: (role) => {
    safeSetItem("parts_peddle_user_role", role);
    set({ userRole: role });
  },
  setProfile: (profile) => set({ profile }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, userRole: "buyer", profile: null });
    safeSetItem("parts_peddle_user_role", "buyer");
  },

  // Navigation Initialization
  activeSellerTab: "listings",
  pendingSnapImages: undefined,
  setActiveSellerTab: (tab) => set({ activeSellerTab: tab }),
  setPendingSnapImages: (images) => set({ pendingSnapImages: images }),

  // Catalog Discovery Sync
  searchQueryText: "",
  searchCategory: "All Parts",
  setSearchQueryText: (searchQueryText) => set({ searchQueryText }),
  setSearchCategory: (searchCategory) => set({ searchCategory }),

  // Cart Management - Evicted cartMock dependency completely
  cart: getStoredCart(), // Direct local state hydration fix
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
    safeSetItem("parts_peddle_cart", JSON.stringify(cart));
    set({ cart: [...cart], isCartOpen: true });
  },
  removeFromCart: (partId: string) => {
    const cart = getStoredCart().filter((item) => item.part.id !== partId);
    safeSetItem("parts_peddle_cart", JSON.stringify(cart));
    set({ cart: [...cart] });
  },
  clearCart: () => {
    safeRemoveItem("parts_peddle_cart");
    set({ cart: [] });
  },

  // UI Flow Control Tokens
  isTourActive: !safeGetItem("parts_peddle_tour_done"),
  highlightedElement: undefined,
  infoModalType: null,
  isSearchModalOpen: false,
  setTourActive: (isTourActive) => {
    if (!isTourActive) safeSetItem("parts_peddle_tour_done", "true");
    set({ isTourActive });
  },
  setHighlightedElement: (highlightedElement) => set({ highlightedElement }),
  setInfoModalType: (infoModalType) => set({ infoModalType }),
  setSearchModalOpen: (isSearchModalOpen) => set({ isSearchModalOpen }),
}));
