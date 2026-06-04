import React from 'react';
import { Logo } from './Logo';

interface NavLeftProps {
  onChangeView: (view: string) => void;
  currentView: string;
}

export const NavLeft: React.FC<NavLeftProps> = ({ onChangeView, currentView }) => (
  <div className="flex items-center gap-8 flex-shrink-0">
    <Logo onClick={() => onChangeView('home')} className="w-[155px]" id="id-nav-logo" />

    <nav className="flex items-center gap-6 font-heading">
        <button 
            onClick={() => onChangeView('listing')} 
            className={`transition-colors cursor-pointer border-b-2 py-1.5 px-1 min-h-[44px] flex items-center justify-center text-sm font-medium ${
                currentView === 'listing' ? 'text-rust-copper border-rust-copper' : 'text-warm-gray hover:text-rust-copper border-transparent'
            }`}
        >
            BROWSE PARTS
        </button>
    </nav>
  </div>
);
