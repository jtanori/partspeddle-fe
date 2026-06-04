import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="bg-steel-black border-oil-dark p-0 h-[85vh] flex flex-col">
        <SheetHeader className="p-4 border-b border-oil-dark">
          <SheetTitle className="text-base-cream uppercase font-black tracking-widest text-xs">Search Inventory</SheetTitle>
        </SheetHeader>
        <div className="p-4 flex-1">
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
      </SheetContent>
    </Sheet>
  );
};
