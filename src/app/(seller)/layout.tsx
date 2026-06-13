'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { SellerSidebar } from '@/components/seller-dashboard/Sidebar';
import { DashboardHeader } from '@/components/seller-dashboard/DashboardHeader';
import { YardControlCore } from '@/components/drawers/YardControlCore';
import { InventoryWizardProvider } from '@/context/InventoryWizardContext';
import { supabase } from '@/lib/supabase';
import '@/styles/dashboard.css';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setProfile } = useAppStore();
  const [isYardControlOpen, setIsYardControlOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('seller_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('Failed to hydrate profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user, setProfile]);

  if (isLoading) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-shell-canvas text-text-primary text-steel-black">
            <div className="w-10 h-10 border-4 border-rust-copper/20 border-t-rust-copper rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <InventoryWizardProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-shell-canvas text-text-primary dashboard-shell font-sans">
        {/* Sidebar - Persistent technical panel */}
        <SellerSidebar />

        {/* Main Viewport Container */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-shell-canvas">
          {/* Persistent Telemetry Header */}
          <DashboardHeader onToggleYardControl={() => setIsYardControlOpen(!isYardControlOpen)} />

          {/* Dynamic Context Workspace Panel - Route Driven */}
          <main className="flex-1 overflow-y-auto p-6 bg-shell-workspace custom-scrollbar scroll-smooth text-steel-black">
            <div className="max-w-7xl mx-auto">
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
