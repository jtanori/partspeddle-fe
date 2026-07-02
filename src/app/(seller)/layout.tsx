'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/hooks';
import { SellerSidebar } from '@/components/seller-dashboard/Sidebar';
import { DashboardHeader } from '@/components/seller-dashboard/DashboardHeader';
import { YardControlCore } from '@/components/drawers/YardControlCore';
import { InventoryWizardProvider } from '@/context/InventoryWizardContext';
import { useSellerProfile } from '@/hooks/useSellerProfile';
import '@/styles/dashboard.css';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setProfile } = useAuthStore();
  const [isYardControlOpen, setIsYardControlOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { profile, loading: isLoading } = useSellerProfile({ userId: user?.id });

  useEffect(() => {
    if (profile) {
      setProfile(profile);
    }
  }, [profile, setProfile]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  if (isLoading) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-shell-canvas text-text-primary text-steel-black">
            <div className="w-10 h-10 border-4 border-rust-copper/20 border-t-rust-copper rounded-full animate-spin"></div>
        </div>
    );
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <InventoryWizardProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-shell-canvas text-text-primary dashboard-shell font-sans">
        <SellerSidebar className="hidden md:flex" />

        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
            <SellerSidebar
              className="fixed inset-y-0 left-0 z-50 md:hidden"
              onNavigate={closeMobileMenu}
              showCloseButton
              onClose={closeMobileMenu}
            />
          </>
        )}

        <div className="flex-1 flex flex-col h-full overflow-hidden bg-shell-canvas min-w-0">
          <DashboardHeader
            onToggleYardControl={() => setIsYardControlOpen(!isYardControlOpen)}
            onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-shell-workspace custom-scrollbar scroll-smooth text-steel-black">
            <div className="max-w-7xl mx-auto w-full min-w-0">
              {children}
            </div>
          </main>
        </div>
        
        {isYardControlOpen && (
          <YardControlCore 
            onClose={() => setIsYardControlOpen(false)}
            initialData={{ max_row_slots: 120, max_rack_tiers: 4 }}
            onSave={(data) => {
              console.log('Saving yard profile:', data);
              setIsYardControlOpen(false);
            }}
          />
        )}
      </div>
    </InventoryWizardProvider>
  );
}