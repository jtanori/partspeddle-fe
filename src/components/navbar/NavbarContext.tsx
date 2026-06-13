import React, { createContext, useContext, ReactNode } from 'react';
import { UserSession } from '../../types';

interface NavbarContextType {
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

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const NavbarProvider = ({ children, value }: { children: ReactNode, value: NavbarContextType }) => {
  return <NavbarContext.Provider value={value}>{children}</NavbarContext.Provider>;
};

export const useNavbarContext = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbarContext must be used within a NavbarProvider');
  }
  return context;
};
