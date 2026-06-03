import React from 'react';
import { UserSession } from '../../../types';
import { UserMenu } from './UserMenu';
import { AuthActions } from './AuthActions';

interface UserAvatarMenuProps {
  user: UserSession | null;
  userRole: 'buyer' | 'seller';
  profile: Record<string, any> | null;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (isOpen: boolean) => void;
  handleAvatarClick: () => void;
  onChangeView: (view: string) => void;
  onSetSellerTab?: (tab: 'listings' | 'settings' | 'snap') => void;
  onOpenSupport: () => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
  userMenuRef: React.RefObject<HTMLDivElement>;
}

export const UserAvatarMenu: React.FC<UserAvatarMenuProps> = ({
  user, userRole, profile, isUserMenuOpen, setIsUserMenuOpen,
  handleAvatarClick, onChangeView, onSetSellerTab, onOpenSupport,
  onLogout, showToast, userMenuRef
}) => {
  return (
    <div className="relative" ref={userMenuRef}>
      {user ? (
        <button 
          onClick={handleAvatarClick}
          className="flex items-center transition-all focus:outline-none cursor-pointer"
          id="btn-nav-user-menu"
          title="Account menu"
        >
          <div className="relative w-10 h-10 rounded-lg border border-stone-800/10 overflow-hidden bg-[#262626]">
            <img 
              src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120"
              alt={user.email || 'User avatar'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </button>
      ) : (
        <AuthActions onChangeView={onChangeView} variant="button" showToast={showToast} />
      )}

      <UserMenu 
        user={user}
        userRole={userRole}
        profile={profile}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        onChangeView={onChangeView}
        onSetSellerTab={onSetSellerTab}
        onOpenSupport={onOpenSupport}
        onLogout={onLogout}
        showToast={showToast}
      />
    </div>
  );
};
