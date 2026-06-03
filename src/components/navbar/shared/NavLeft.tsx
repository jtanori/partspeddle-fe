import React from 'react';
import { Logo } from './Logo';

interface NavLeftProps {
  onChangeView: (view: string) => void;
  currentView: string;
}

export const NavLeft: React.FC<NavLeftProps> = ({ onChangeView, currentView }) => (
  <div className="flex items-center gap-6 flex-shrink-0">
    <Logo onClick={() => onChangeView('home')} className="w-[140px]" id="id-nav-logo" />

    <button 
        onClick={() => onChangeView('listing')} 
        className={`transition-colors cursor-pointer py-1.5 px-1 flex items-center justify-center text-sm font-medium ${
            currentView === 'listing' ? 'text-rust-copper' : 'text-zinc-300 hover:text-rust-copper'
        }`}
    >
        BROWSE PARTS
    </button>
  </div>
);
