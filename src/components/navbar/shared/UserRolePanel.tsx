import React from 'react';
import { User, ArrowRight } from 'lucide-react';

interface UserRolePanelProps {
  userRole: 'buyer' | 'seller';
  profile: any;
  onChangeUserRole: (role: 'buyer' | 'seller') => void;
  onChangeView: (view: string) => void;
  onSetSellerTab?: (tab: 'listings' | 'create' | 'settings' | 'snap') => void;
  onClose?: () => void;
  showToast?: (msg: string) => void;
}

export const UserRolePanel: React.FC<UserRolePanelProps> = ({
  userRole,
  profile,
  onChangeUserRole,
  onChangeView,
  onSetSellerTab,
  onClose,
  showToast
}) => {
  return (
    <div className="px-4 py-2.5 border-b border-oil-dark">
      <p className="font-display text-[10px] text-warm-gray uppercase tracking-wider font-bold">Context</p>
      <p className="text-[10px] text-rust-copper font-bold uppercase mt-1 font-display">
        Portal: {userRole === 'seller' ? 'Yard Operator' : 'Buyer View'}
      </p>
      
      {/* Switch role button */}
      <button
        onClick={() => {
          const nextRole = userRole === 'buyer' ? 'seller' : 'buyer';
          onChangeUserRole(nextRole);
          if (onSetSellerTab) onSetSellerTab('listings');
          onChangeView('listings');
          if (onClose) onClose();
          if (showToast) showToast(`Switched account profile context to ${nextRole === 'seller' ? 'Salvage Operator' : 'Buyer'}.`);
        }}
        className="w-full mt-3 text-left px-3 py-2 bg-gradient-to-r from-rust-copper/25 to-bronze/5 border border-rust-copper rounded-lg transition-all hover:bg-rust-copper/35 flex items-center justify-between cursor-pointer group"
      >
        <span className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-rust-copper group-hover:translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-wider text-rust-copper font-display">
            Switch to {userRole === 'buyer' ? 'Seller' : 'Buyer'} View
          </span>
        </span>
      </button>
    </div>
  );
};
