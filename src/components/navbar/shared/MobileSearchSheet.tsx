import React from 'react';
import { Search } from 'lucide-react';
import { BottomSheet } from '../../common/BottomSheet';
import { NavbarSearch } from '../NavbarSearch';

interface MobileSearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  searchText: string;
  setSearchText: (text: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
  onSearchSubmit: (text: string) => void;
  onChangeView: (view: string) => void;
  onSelectPart?: (partId: string) => void;
}

export const MobileSearchSheet: React.FC<MobileSearchSheetProps> = ({
  isOpen, onClose, searchText, setSearchText, isDropdownOpen, setIsDropdownOpen,
  onSearchSubmit, onChangeView, onSelectPart
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h2 className="font-display font-black text-xs uppercase tracking-wider text-warm-gray mb-4">Search Inventory</h2>
        <NavbarSearch
          navSearchText={searchText}
          setNavSearchText={setSearchText}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          placeholderText="Search parts, make, model or VIN..."
          onSearchSubmit={onSearchSubmit}
          onChangeView={onChangeView}
          onSelectPart={onSelectPart}
        />
      </div>
    </BottomSheet>
  );
};
