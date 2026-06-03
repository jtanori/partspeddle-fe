import React from 'react';
import { UserSession } from '../../../types';

interface UserProfileHeaderProps {
  user: UserSession | null;
  userRole: 'buyer' | 'seller';
  profile: any;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ user, userRole, profile }) => {
  return (
    <div className="flex items-center justify-between border-b border-oil-dark pb-4 mb-4">
      {user ? (
        <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-charcoal border-2 border-rust-copper overflow-hidden flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120" alt={user.email || 'avatar'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-bold text-base-cream truncate font-sans">
                {userRole === 'seller' ? (profile?.name && profile?.name !== 'Unnamed Yard' ? profile.name : 'Acme Salvage Yard') : 'John Doe'}
                </p>
                <p className="text-[11px] text-warm-gray truncate font-mono mt-0.5">
                {user.email || 'john@email.com'}
                </p>
                <p className="inline-block mt-1 text-[10px] text-rust-copper font-bold uppercase tracking-wider font-display bg-rust-copper/10 px-1.5 py-0.5 rounded border border-rust-copper/20">
                Context: {userRole === 'seller' ? 'Seller View' : 'Buyer View'}
                </p>
            </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-charcoal border border-oil-dark flex items-center justify-center text-rust-copper font-bold font-display">PP</div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-base-cream truncate">PartsPeddle</p>
              <p className="text-[11px] text-warm-gray truncate font-mono mt-0.5">Offline Mode</p>
            </div>
        </div>
      )}
    </div>
  );
};
