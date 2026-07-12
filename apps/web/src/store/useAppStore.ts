import { create } from "zustand";
import { createAuthSlice, type AuthSlice } from "./slices/authSlice";
import { createSellerNavSlice, type SellerNavSlice } from "./slices/sellerNavSlice";
import { createSearchSlice, type SearchSlice } from "./slices/searchSlice";
import { createCartSlice, type CartSlice } from "./slices/cartSlice";
import { createUiSlice, type UiSlice } from "./slices/uiSlice";

export type AppState = AuthSlice &
  SellerNavSlice &
  SearchSlice &
  CartSlice &
  UiSlice;

export const useAppStore = create<AppState>()((...args) => ({
  ...createAuthSlice(...args),
  ...createSellerNavSlice(...args),
  ...createSearchSlice(...args),
  ...createCartSlice(...args),
  ...createUiSlice(...args),
}));