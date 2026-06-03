import React from 'react';
import { UserSession } from '../../../types';

interface CTAButtonProps {
  user: UserSession | null;
  userRole: 'buyer' | 'seller';
  profile: Record<string, any> | null;
  onChangeView: (view: string) => void;
  onSetSellerTab?: (tab: 'listings' | 'settings' | 'snap') => void;
  showToast: (msg: string) => void;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  user, userRole, profile, onChangeView, onSetSellerTab, showToast
}) => {
  const isProfileComplete = profile && profile.name && profile.name.trim() !== 'Unnamed Yard' && profile.location && profile.location.trim() !== '';

  const getCTAConfig = () => {
    if (!user) {
      return {
        label: 'SELL PARTS',
        onClick: () => {
          onChangeView('auth');
          showToast('Sign up with your yard specs to list mechanical units instantly.');
        }
      };
    }
    if (userRole === 'buyer') {
      return {
        label: 'SELL PARTS',
        onClick: () => {
          if (onSetSellerTab) onSetSellerTab('snap');
          onChangeView('listings');
          showToast('Salvage Yard Onboarding: Initializing Snap-to-List.');
        }
      };
    }
    // Authenticated seller mode
    if (!isProfileComplete) {
      return {
        label: 'COMPLETE PROFILE',
        onClick: () => {
          if (onSetSellerTab) onSetSellerTab('settings');
          onChangeView('listings');
          showToast('Redirecting to registry settings terminal.');
        }
      };
    }
    return {
      label: 'ADD LISTING',
      onClick: () => {
        if (onSetSellerTab) onSetSellerTab('snap');
        onChangeView('listings');
        showToast('Specify core part details to post new salvage matching listing.');
      }
    };
  };

  const cta = getCTAConfig();

  return (
    <button 
      onClick={cta.onClick}
      className="bg-[#B87333] hover:bg-[#9c5f2b] text-white rounded-lg px-5 py-2 text-sm font-bold uppercase tracking-wide transition-all"
    >
      {cta.label}
    </button>
  );
};
