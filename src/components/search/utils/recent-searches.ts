import { SearchSuggestion } from "../types/search-types";

const STORAGE_KEY = "partspeddle_recent_searches";
const MAX_RECENT = 10;

export const getRecentSearches = (): SearchSuggestion[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => {
      const query = typeof item === "string" ? item : item.query;
      return {
        id: `recent-${query}`,
        type: "part_number" as const,
        label: query,
      };
    });
  } catch {
    return [];
  }
};

export const saveRecentSearch = (query: string) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  let recent: { query: string; timestamp: number }[] = [];
  try {
    recent = stored ? JSON.parse(stored) : [];
  } catch (e) {
    // Silently ignore parsing errors
  }

  // Remove if exists to re-add to top
  recent = recent.filter((item) => item.query !== query);
  recent.unshift({ query, timestamp: Date.now() });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT)),
  );
};

export const clearRecentSearches = () => {
  localStorage.removeItem(STORAGE_KEY);
};
