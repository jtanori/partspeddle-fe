import React from 'react';
import { Logo } from './Logo';

interface NavLeftProps {
  onChangeView: (view: string) => void;
  currentView: string;
}

export const NavLeft: React.FC<NavLeftProps> = ({ onChangeView, currentView }) => (
  <div className="flex items-center gap-8 flex-shrink-0">
    <Logo onClick={() => onChangeView('home')} className="w-[155px]" id="id-nav-logo" />
  </div>
);
