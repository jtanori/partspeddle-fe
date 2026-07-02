import type { StateCreator } from "zustand";

export type SellerTab =
  | "listings"
  | "inventory"
  | "orders"
  | "settings"
  | "snap"
  | "create";

export interface SellerNavSlice {
  activeSellerTab: SellerTab;
  pendingSnapImages: string[] | undefined;
  setActiveSellerTab: (tab: SellerTab) => void;
  setPendingSnapImages: (images: string[] | undefined) => void;
}

export const createSellerNavSlice: StateCreator<SellerNavSlice> = (set) => ({
  activeSellerTab: "listings",
  pendingSnapImages: undefined,
  setActiveSellerTab: (tab) => set({ activeSellerTab: tab }),
  setPendingSnapImages: (images) => set({ pendingSnapImages: images }),
});