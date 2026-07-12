import { useState } from 'react';

export const useFilterSections = () => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    search: true,
    category: true,
    partType: true,
    fitment: true,
    price: true,
    condition: true,
    seller: true,
    sort: true,
  });

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllPartTypes, setShowAllPartTypes] = useState(false);

  const toggleSection = (sec: string) => {
    setCollapsedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  return { 
    collapsedSections, 
    toggleSection, 
    showAllCategories, 
    setShowAllCategories, 
    showAllPartTypes, 
    setShowAllPartTypes 
  };
};
