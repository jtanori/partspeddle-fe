import { useState, useEffect } from 'react';

export const useCatalogView = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    if (typeof window === 'undefined') return 'list';
    const saved = localStorage.getItem('parts_peddle_catalog_view_mode');
    return (saved === 'grid') ? 'grid' : 'list';
  });

  useEffect(() => {
    localStorage.setItem('parts_peddle_catalog_view_mode', viewMode);
  }, [viewMode]);

  return { viewMode, setViewMode };
};
