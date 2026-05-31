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
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 select-none text-base-cream isolated-dashboard-context font-mono text-xs">
      {/* Sidebar - Persistent technical panel */}
      <SellerSidebar />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950">
        {/* Persistent Telemetry Header */}
        <DashboardHeader />

        {/* Dynamic Context Workspace Panel - Route Driven */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-neutral-900/20">
          <div className="max-w-6xl mx-auto">
            {/* Header Area - Compressed & Route Aware */}
            <div className="mb-8">
              <h1 className="text-xl font-sans font-black uppercase text-base-cream tracking-tight border-l-2 border-amber-500 pl-4">
                {location.pathname === '/dashboard' && "Operational Overview"}
                {location.pathname === '/dashboard/inventory' && "Active Yard Inventory"}
                {location.pathname === '/dashboard/create' && "Manual Intake Terminal"}
                {location.pathname === '/dashboard/snap' && "AI Vision Intake"}
                {location.pathname === '/dashboard/settings' && "Registry Parameters"}
                {location.pathname === '/dashboard/orders' && "Active Orders"}
              </h1>
            </div>

            {/* Sub-Route Rendering */}
            <div className="animate-fade-in">
              <Routes>
                <Route index element={<div className="p-12 text-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest bg-zinc-900/30 border border-dashed border-zinc-800 rounded-sm shadow-inner">Yard Analytics Terminal Under Construction</div>} />
                <Route path="inventory" element={<InventoryTable />} />
                <Route path="inventory/active" element={<InventoryTable filter="active" />} />
                <Route path="inventory/sold" element={<InventoryTable filter="sold" />} />
                <Route path="inventory/archived" element={<InventoryTable filter="archived" />} />
                <Route path="create" element={<ListingWizard onClose={() => setActiveSellerTab('listings')} />} />
                <Route path="snap" element={<ListingWizard onClose={() => setActiveSellerTab('listings')} />} />
                <Route path="settings" element={<SettingsForm />} />
                <Route path="orders" element={<div className="p-12 text-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest bg-zinc-900/30 border border-dashed border-zinc-800 rounded-sm shadow-inner">Orders Pipeline Integration Pending</div>} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
