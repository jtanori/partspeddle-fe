import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "./useAppStore";

export const useAuthStore = () =>
  useAppStore(
    useShallow((state) => ({
      user: state.user,
      userRole: state.userRole,
      profile: state.profile,
      setUser: state.setUser,
      setUserRole: state.setUserRole,
      setProfile: state.setProfile,
      logout: state.logout,
    })),
  );

export const useSellerNavStore = () =>
  useAppStore(
    useShallow((state) => ({
      activeSellerTab: state.activeSellerTab,
      pendingSnapImages: state.pendingSnapImages,
      setActiveSellerTab: state.setActiveSellerTab,
      setPendingSnapImages: state.setPendingSnapImages,
    })),
  );

export const useSearchStore = () =>
  useAppStore(
    useShallow((state) => ({
      searchQueryText: state.searchQueryText,
      searchCategory: state.searchCategory,
      setSearchQueryText: state.setSearchQueryText,
      setSearchCategory: state.setSearchCategory,
    })),
  );

export const useCartStore = () =>
  useAppStore(
    useShallow((state) => ({
      cart: state.cart,
      isCartOpen: state.isCartOpen,
      checkoutSuccess: state.checkoutSuccess,
      setCart: state.setCart,
      setIsCartOpen: state.setIsCartOpen,
      setCheckoutSuccess: state.setCheckoutSuccess,
      addToCart: state.addToCart,
      removeFromCart: state.removeFromCart,
      clearCart: state.clearCart,
    })),
  );

export const useUiStore = () =>
  useAppStore(
    useShallow((state) => ({
      isTourActive: state.isTourActive,
      highlightedElement: state.highlightedElement,
      infoModalType: state.infoModalType,
      isSearchModalOpen: state.isSearchModalOpen,
      setTourActive: state.setTourActive,
      setHighlightedElement: state.setHighlightedElement,
      setInfoModalType: state.setInfoModalType,
      setSearchModalOpen: state.setSearchModalOpen,
    })),
  );