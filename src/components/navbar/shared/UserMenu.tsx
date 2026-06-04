import React from 'react';
import { UserSession } from '../../../types';
import { UserMenuContent } from './UserMenuContent';

interface UserMenuProps {
  user: UserSession | null;
  userRole: 'buyer' | 'seller';
  profile: Record<string, any> | null;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (isOpen: boolean) => void;
  onChangeView: (view: string) => void;
  onSetSellerTab?: (tab: 'listings' | 'settings' | 'snap') => void;
  onOpenSupport: () => void;
  onOpenTour: () => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user, userRole, profile, isUserMenuOpen, setIsUserMenuOpen,
  onChangeView, onSetSellerTab, onOpenSupport, onOpenTour, onLogout, showToast
}) => {
  if (!isUserMenuOpen || !user) return null;

  return (
    <div className="absolute right-0 top-16 w-80 bg-steel-black border border-oil-dark rounded-xl py-2 z-[9990] text-base-cream shadow-2xl hidden md:block">
      {/* Subtle rivet corner details */}
      <div className="rivet top-2 left-2" /><div className="rivet top-2 right-2" /><div className="rivet bottom-2 left-2" /><div className="rivet bottom-2 right-2" />
      
      <UserMenuContent 
        user={user}
        userRole={userRole}
        profile={profile}
        onChangeView={onChangeView}
        onSetSellerTab={onSetSellerTab}
        onOpenSupport={onOpenSupport}
        onOpenTour={onOpenTour}
        onLogout={onLogout}
        showToast={showToast}
        onClose={() => setIsUserMenuOpen(false)}
      />
    </div>
  );
};
