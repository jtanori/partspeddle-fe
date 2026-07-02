import type { StateCreator } from "zustand";

export interface SearchSlice {
  searchQueryText: string;
  searchCategory: string;
  setSearchQueryText: (text: string) => void;
  setSearchCategory: (category: string) => void;
}

export const createSearchSlice: StateCreator<SearchSlice> = (set) => ({
  searchQueryText: "",
  searchCategory: "All Parts",
  setSearchQueryText: (searchQueryText) => set({ searchQueryText }),
  setSearchCategory: (searchCategory) => set({ searchCategory }),
});