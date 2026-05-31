import React from 'react';
import { Search } from 'lucide-react';
import LiveSearchDropdown from './LiveSearchDropdown';

interface NavbarSearchProps {
  navSearchText: string;
  setNavSearchText: (text: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
  placeholderText: string;
  onSearchSubmit: (text: string) => void;
  onChangeView: (view: string) => void;
  onSelectPart?: (partId: string) => void;
}

export const NavbarSearch: React.FC<NavbarSearchProps> = ({
  navSearchText,
  setNavSearchText,
  isDropdownOpen,
  setIsDropdownOpen,
  placeholderText,
  onSearchSubmit,
  onChangeView,
  onSelectPart,
}) => {
  const handleSearchSubmitLocal = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(navSearchText);
    onChangeView('listing');
    setIsDropdownOpen(false);
  };

  return (
    <div 
      className="relative w-80 lg:w-96 hidden min-[860px]:block portrait:!hidden"
      id="tour-search"
    >
      <form onSubmit={handleSearchSubmitLocal} className="relative">
        <input
          type="text"
          placeholder={placeholderText}
          value={navSearchText}
          onChange={(e) => {
            setNavSearchText(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full bg-charcoal border border-oil-dark rounded-sm px-3 py-2 text-sm text-base-cream placeholder-warm-gray focus:outline-none focus:border-rust-copper focus:ring-1 focus:ring-rust-copper/50 transition-all font-sans font-medium h-[40px]"
          id="input-nav-search"
        />
        <button 
          type="submit"
          className="absolute right-3 top-2.5 text-warm-gray hover:text-rust-copper cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      {isDropdownOpen && (
        <LiveSearchDropdown 
          query={navSearchText}
          onSelectPart={(partId) => {
            if (onSelectPart) onSelectPart(partId);
            setIsDropdownOpen(false);
          }}
          onSeeAll={(q) => {
            onSearchSubmit(q);
            onChangeView('listing');
            setIsDropdownOpen(false);
          }}
          onClose={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};
