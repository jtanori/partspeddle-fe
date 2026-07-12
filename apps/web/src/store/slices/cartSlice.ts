import type { StateCreator } from "zustand";
import type { CartItem, Part } from "@/types";
import { safeGetItem, safeRemoveItem, safeSetItem } from "../storage";

const CART_STORAGE_KEY = "parts_peddle_cart";

const getStoredCart = (): CartItem[] => {
  try {
    const saved = safeGetItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export interface CartSlice {
  cart: CartItem[];
  isCartOpen: boolean;
  checkoutSuccess: boolean;
  setCart: (cart: CartItem[]) => void;
  setIsCartOpen: (isOpen: boolean) => void;
  setCheckoutSuccess: (success: boolean) => void;
  addToCart: (part: Part) => void;
  removeFromCart: (partId: string) => void;
  clearCart: () => void;
}

export const createCartSlice: StateCreator<CartSlice> = (set) => ({
  cart: getStoredCart(),
  isCartOpen: false,
  checkoutSuccess: false,

  setCart: (cart) => set({ cart }),
  setIsCartOpen: (isCartOpen) => set({ isCartOpen }),
  setCheckoutSuccess: (checkoutSuccess) => set({ checkoutSuccess }),

  addToCart: (part) => {
    const cart = getStoredCart();
    const existingIndex = cart.findIndex((item) => item.part.id === part.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ part, quantity: 1 });
    }
    safeSetItem(CART_STORAGE_KEY, JSON.stringify(cart));
    set({ cart: [...cart], isCartOpen: true });
  },

  removeFromCart: (partId) => {
    const cart = getStoredCart().filter((item) => item.part.id !== partId);
    safeSetItem(CART_STORAGE_KEY, JSON.stringify(cart));
    set({ cart: [...cart] });
  },

  clearCart: () => {
    safeRemoveItem(CART_STORAGE_KEY);
    set({ cart: [] });
  },
});