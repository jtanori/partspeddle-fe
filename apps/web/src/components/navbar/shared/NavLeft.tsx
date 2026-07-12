import React from 'react';
import { Logo } from './Logo';

interface NavLeftProps {
  currentView: string;
}

export const NavLeft: React.FC<NavLeftProps> = ({ currentView }) => (
  <div className="flex items-center gap-8 flex-shrink-0">
    <Logo href="/" className="w-[155px]" id="id-nav-logo" />
  </div>
);
