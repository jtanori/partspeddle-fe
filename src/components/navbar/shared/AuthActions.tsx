import React from 'react';
import { LogIn, User } from 'lucide-react';

interface AuthActionsProps {
  onChangeView: (view: string) => void;
  onClose?: () => void;
  variant?: 'button' | 'list';
  showToast?: (msg: string) => void;
}

export const AuthActions: React.FC<AuthActionsProps> = ({ 
  onChangeView, onClose, variant = 'button', showToast 
}) => {
  const handleAuth = (mode: 'login' | 'signup') => {
    onChangeView('auth');
    if (onClose) onClose();
    if (mode === 'signup') {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth?role=seller&mode=signup';
      }
    } else if (showToast) {
      showToast('Please sign in or register to your PartsPeddle account.');
    }
  };

  if (variant === 'list') {
    return (
      <div className="flex flex-col gap-1.5 font-sans">
        <button
          onClick={() => handleAuth('login')}
          className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-oil-dark transition-colors flex items-center gap-2.5 text-base-cream min-h-[44px]"
        >
          <LogIn className="w-4 h-4 text-warm-gray" />
          <span>Log In</span>
        </button>
        <button
          onClick={() => handleAuth('signup')}
          className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-oil-dark transition-colors flex items-center gap-2.5 text-base-cream min-h-[44px]"
        >
          <User className="w-4 h-4 text-warm-gray" />
          <span>Sign Up</span>
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => onChangeView('auth')}
      className="bg-[#B87333] hover:bg-[#9c5f2b] text-white rounded-lg px-5 py-2 text-sm font-bold uppercase tracking-wide transition-all"
    >
      SELL PARTS
    </button>
  );
};
