import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { InventoryTable } from './seller-dashboard/InventoryTable';
import { ListingWizard } from './seller-dashboard/ListingWizard';
import { SettingsForm } from './seller-dashboard/SettingsForm';
import { SellerSidebar } from './seller-dashboard/Sidebar';
import { DashboardHeader } from './seller-dashboard/DashboardHeader';

export default function SellerDashboard() {
  const { 
    activeSellerTab, 
    setActiveSellerTab
  } = useAppStore();
  
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 select-none text-base-cream isolated-dashboard-context font-mono text-xs">
      {/* Sidebar - Viewport Locked */}
      <SellerSidebar />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950">
        {/* Top Header Navigation Panel - Compact */}
        <DashboardHeader />

        {/* Dynamic Content Body Area - Scroll Contained */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-neutral-900/20">
          <div className="max-w-6xl mx-auto">
            {/* Header Area - Compressed */}
            <div className="mb-8">
              <h1 className="text-xl font-sans font-black uppercase text-base-cream tracking-tight border-l-2 border-amber-500 pl-4">
                {activeSellerTab === 'listings' && "Operational Overview"}
                {activeSellerTab === 'inventory' && "Active Yard Inventory"}
                {activeSellerTab === 'create' && "Manual Intake Terminal"}
                {activeSellerTab === 'snap' && "AI Vision Intake"}
                {activeSellerTab === 'settings' && "Registry Parameters"}
                {activeSellerTab === 'orders' && "Active Orders"}
              </h1>
            </div>

            {/* Dynamic Views */}
            <div className="animate-fade-in">
              {(activeSellerTab === 'listings' || activeSellerTab === 'inventory') && <InventoryTable />}
              {(activeSellerTab === 'create' || activeSellerTab === 'snap') && <ListingWizard onClose={() => setActiveSellerTab('listings')} />}
              {activeSellerTab === 'settings' && <SettingsForm />}
              {activeSellerTab === 'orders' && <div className="p-12 text-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest bg-zinc-900/30 border border-dashed border-zinc-800 rounded-sm">Orders Pipeline Integration Pending</div>}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
