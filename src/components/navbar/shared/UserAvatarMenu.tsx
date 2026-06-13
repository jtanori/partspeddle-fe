import React from 'react';
import { UserSession } from '../../../types';
import { UserMenu } from './UserMenu';
import { AuthActions } from './AuthActions';
import userAvatarImg from '../../../assets/images/user_avatar.png';
import userSellerAvatarImg from '../../../assets/images/user_seller_avatar.png';

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
  onOpenTour: () => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
  userMenuRef: React.RefObject<HTMLDivElement>;
}

export const UserAvatarMenu: React.FC<UserAvatarMenuProps> = ({
  user, userRole, profile, isUserMenuOpen, setIsUserMenuOpen,
  handleAvatarClick, onChangeView, onSetSellerTab, onOpenSupport,
  onOpenTour, onLogout, showToast, userMenuRef
}) => {
  return (
    <div className="relative" ref={userMenuRef}>
      {user ? (
        <button 
          onClick={handleAvatarClick}
          className="flex items-center transition-all focus:outline-none cursor-pointer rounded-sm overflow-hidden border border-white/10 hover:border-rust-copper/50"
          id="btn-nav-user-menu"
          title="Account menu"
        >
          <div className="relative w-[40px] h-[40px] bg-zinc-900">
            <img 
              src={profile?.avatar_url || profile?.logo_url || profile?.logoUrl || (userRole === 'seller' ? userSellerAvatarImg.src : userAvatarImg.src)}
              alt={user.email || 'User avatar'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = userRole === 'seller' ? userSellerAvatarImg.src : userAvatarImg.src; }}
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
        onOpenTour={onOpenTour}
        onLogout={onLogout}
        showToast={showToast}
      />
    </div>
  );
};
