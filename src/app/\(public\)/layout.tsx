'use client';

import React from 'react';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/Footer';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { 
    user, 
    userRole, 
    logout, 
    cart, 
    setIsCartOpen, 
    searchQueryText,
    setUserRole,
    profile,
    setInfoModalType,
    setTourActive,
    setActiveSellerTab
  } = useAppStore();

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-base-cream text-steel-black">
      <Navbar 
        cartCount={totalItemsCount}
        user={user}
        onLogout={async () => {
          await logout();
          router.push('/');
        }}
        onOpenCart={() => setIsCartOpen(true)}
        searchTextValue={searchQueryText}
        userRole={userRole}
        onChangeUserRole={setUserRole}
        profile={profile}
        onOpenSupport={() => setInfoModalType('contact')}
        onOpenTour={() => setTourActive(true)}
        onSetSellerTab={setActiveSellerTab}
        activeSellerTab={activeSellerTab}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer 
        onChangeView={(view) => {
          const path = view === 'home' ? '/' : `/${view}`;
          router.push(path);
        }} 
        onOpenModal={setInfoModalType} 
      />
    </div>
  );
}
