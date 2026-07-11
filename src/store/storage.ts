const isClient = typeof window !== "undefined";

export const safeGetItem = (key: string): string | null => {
  if (!isClient) return null;
  return localStorage.getItem(key);
};

export const safeSetItem = (key: string, value: string) => {
  if (isClient) {
    localStorage.setItem(key, value);
  }
};

export const safeRemoveItem = (key: string) => {
  if (isClient) {
    localStorage.removeItem(key);
  }
};