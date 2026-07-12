import { useState } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const toggleFavorite = (partId: string) => {
    setFavorites(prev => prev.includes(partId) ? prev.filter(id => id !== partId) : [...prev, partId]);
  };

  return { favorites, toggleFavorite };
};
