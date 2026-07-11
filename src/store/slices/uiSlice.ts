import type { StateCreator } from "zustand";
import { safeGetItem, safeSetItem } from "../storage";

export type InfoModalType = "about" | "privacy" | "terms" | "contact" | null;

export interface UiSlice {
  isTourActive: boolean;
  highlightedElement: string | undefined;
  infoModalType: InfoModalType;
  isSearchModalOpen: boolean;
  setTourActive: (active: boolean) => void;
  setHighlightedElement: (elId: string | undefined) => void;
  setInfoModalType: (type: InfoModalType) => void;
  setSearchModalOpen: (open: boolean) => void;
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
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
});