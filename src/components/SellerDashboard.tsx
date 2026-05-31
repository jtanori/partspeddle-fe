import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { InventoryTable } from './seller-dashboard/InventoryTable';
import { ListingWizard } from './seller-dashboard/ListingWizard';
import { SettingsForm } from './seller-dashboard/SettingsForm';
import { SellerSidebar } from './seller-dashboard/Sidebar';
import { DashboardHeader } from './seller-dashboard/DashboardHeader';

export default function SellerDashboard() {
  const { setActiveSellerTab } = useAppStore();
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-shell-canvas text-text-primary dashboard-shell font-sans">
      {/* Sidebar - Viewport Locked */}
      <SellerSidebar />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-shell-canvas">
        {/* Persistent Telemetry Header */}
        <DashboardHeader />

        {/* Dynamic Context Workspace Panel - Route Driven */}
        <main className="flex-1 overflow-y-auto p-6 bg-shell-workspace custom-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {/* Header Area - Compressed & Route Aware */}
            <div className="mb-6">
              <h1 className="text-3xl font-heading font-black uppercase text-text-primary tracking-tight border-l-4 border-accent-amber pl-6">
                {location.pathname === '/dashboard' && "OPERATIONAL OVERVIEW"}
                {location.pathname === '/dashboard/inventory' && "ACTIVE YARD INVENTORY"}
                {location.pathname === '/dashboard/inventory/active' && "ACTIVE LISTINGS REGISTRY"}
                {location.pathname === '/dashboard/inventory/sold' && "SOLD PARTS ARCHIVE"}
                {location.pathname === '/dashboard/inventory/archived' && "ARCHIVED PARTS BIN"}
                {location.pathname === '/dashboard/create' && "MANUAL INTAKE TERMINAL"}
                {location.pathname === '/dashboard/snap' && "AI VISION INTAKE"}
                {location.pathname === '/dashboard/settings' && "REGISTRY PARAMETERS"}
                {location.pathname === '/dashboard/orders' && "ACTIVE BIDS & ORDERS"}
              </h1>
            </div>


            {/* Sub-Route Rendering */}
            <div className="animate-fade-in">
              <Routes>
                <Route index element={
                  <div className="p-16 text-center text-text-muted font-mono text-xs uppercase tracking-widest bg-shell-surface border border-dashed border-border-default rounded-sm shadow-panel">
                    Yard Analytics Terminal Under Construction
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
                    Orders Pipeline Integration Pending
                  </div>
                } />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
