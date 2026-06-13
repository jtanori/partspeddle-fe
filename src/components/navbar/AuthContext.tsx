import React, { createContext, useContext, ReactNode } from 'react';
import { UserSession } from '../../types';

interface AuthContextType {
  user: UserSession | null;
  userRole: 'buyer' | 'seller';
  profile: any;
  cartCount: number;
  onLogout: () => void;
  onOpenCart: () => void;
  onChangeView: (view: string) => void;
  onOpenSupport: () => void;
  onOpenTour: () => void;
  onSetSellerTab?: (tab: 'listings' | 'settings' | 'snap' | 'orders' | 'inventory' | 'create') => void;
  showToast: (msg: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, value }: { children: ReactNode, value: AuthContextType }) => {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
