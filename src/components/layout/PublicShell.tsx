'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  useAuthStore,
  useCartStore,
  useSearchStore,
  useSellerNavStore,
  useUiStore,
} from '@/store/hooks';
import Navbar from '../navbar/Navbar';
import Footer from '../Footer';

interface PublicShellProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export const PublicShell = ({ children, showFooter = true }: PublicShellProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const { user, userRole, setUserRole, logout, profile } = useAuthStore();
  const { cart, setIsCartOpen } = useCartStore();
  const { searchQueryText, setSearchQueryText, setSearchCategory } = useSearchStore();
  const { activeSellerTab, setActiveSellerTab, setPendingSnapImages } = useSellerNavStore();
  const { setSearchModalOpen, setInfoModalType, setTourActive } = useUiStore();

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans relative antialiased leading-relaxed bg-surface-secondary text-foreground-primary">
      <Navbar
        currentView={pathname}
        onSearchSubmit={(text) => {
          setSearchQueryText(text);
          setSearchCategory('All Parts');
          router.push('/search');
        }}
        onOpenSearchModal={() => setSearchModalOpen(true)}
        cartCount={totalItemsCount}
        user={user}
        onLogout={async () => {
          await logout();
          router.push('/');
        }}
        onOpenCart={() => setIsCartOpen(true)}
        searchTextValue={searchQueryText}
        onSelectPart={(id) => router.push(`/listing/${id}`)}
        userRole={userRole}
        onChangeUserRole={setUserRole}
        profile={profile}
        onOpenSupport={() => setInfoModalType('contact')}
        onOpenTour={() => setTourActive(true)}
        onSetSellerTab={setActiveSellerTab}
        onSnapImagesUploaded={(images) => {
          setPendingSnapImages(images);
          router.push('/dashboard/snap');
        }}
        activeSellerTab={activeSellerTab}
      />

      <div className="flex-grow transition-opacity duration-300 pb-16 md:pb-0">{children}</div>

      {showFooter && <Footer />}
    </div>
  );
};
