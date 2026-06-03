import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { InventoryTable } from './seller-dashboard/InventoryTable';
import { ListingWizard } from './seller-dashboard/ListingWizard';
import { SettingsForm } from './seller-dashboard/SettingsForm';
import { SellerSidebar } from './seller-dashboard/Sidebar';
import { DashboardHeader } from './seller-dashboard/DashboardHeader';
import { YardControlCore } from './drawers/YardControlCore';
import { InventoryWizardProvider } from '../context/InventoryWizardContext';
import { supabase } from '../lib/supabase';
import '../styles/dashboard.css';

export default function SellerDashboard() {
  const { setActiveSellerTab, user, setProfile } = useAppStore();
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
        <div className="flex h-screen w-screen items-center justify-center bg-shell-canvas text-text-primary">
            <div className="w-10 h-10 border-4 border-accent-amber/20 border-t-accent-amber rounded-full animate-spin"></div>
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
          <main className="flex-1 overflow-y-auto p-6 bg-shell-workspace custom-scrollbar scroll-smooth">
            <div className="max-w-7xl mx-auto">
              {/* Sub-Route Rendering */}
              <div className="animate-fade-in">
                <Routes>
                  <Route index element={
                    <div className="p-16 text-center text-text-muted font-mono text-xs uppercase tracking-widest bg-shell-surface border border-dashed border-border-default rounded-sm shadow-panel">
                      Yard performance analytics coming soon.
                    </div>
                  } />
                  <Route path="inventory" element={<InventoryTable />} />
                  <Route path="inventory/active" element={<InventoryTable filter="active" />} />
                  <Route path="inventory/sold" element={<InventoryTable filter="sold" />} />
                  <Route path="inventory/archived" element={<InventoryTable filter="archived" />} />
                  <Route path="create" element={<ListingWizard onClose={() => setActiveSellerTab('listings')} />} />
                  <Route path="snap" element={<ListingWizard onClose={() => setActiveSellerTab('listings')} />} />
                  <Route path="settings" element={<SettingsForm />} />
                  <Route path="orders" element={
                    <div className="p-16 text-center text-text-muted font-mono text-xs uppercase tracking-widest bg-shell-surface border border-dashed border-border-default rounded-sm shadow-panel">
                      Orders pipeline integration pending.
                    </div>
                  } />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
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
