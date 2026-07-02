import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { InventoryTable } from "./seller-dashboard/InventoryTable";
import { ListingWizard } from "./seller-dashboard/ListingWizard";
import { SettingsForm } from "./seller-dashboard/SettingsForm";
import { SellerSidebar } from "./seller-dashboard/Sidebar";
import { DashboardHeader } from "./seller-dashboard/DashboardHeader";
import { YardControlCore } from "./drawers/YardControlCore";
import { InventoryWizardProvider } from "../context/InventoryWizardContext";
import { useSellerProfile } from "@/hooks/useSellerProfile";
import "../styles/dashboard.css";

export default function SellerDashboard() {
  const { setActiveSellerTab, user, setProfile, activeSellerTab } =
    useAppStore();
  const [isYardControlOpen, setIsYardControlOpen] = useState(false);
  const { profile, loading: isLoading } = useSellerProfile({ userId: user?.id });

  React.useEffect(() => {
    if (profile) {
      setProfile(profile);
    }
  }, [profile, setProfile]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-shell-canvas text-text-primary">
        <div className="w-10 h-10 border-4 border-accent-amber/20 border-t-accent-amber rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSellerTab) {
      case "inventory":
        return <InventoryTable />;
      case "create":
        return (
          <ListingWizard onClose={() => setActiveSellerTab("inventory")} />
        );
      case "settings":
        return <SettingsForm />;
      default:
        return (
          <div className="p-16 text-center text-text-muted font-mono text-xs uppercase tracking-widest bg-shell-surface border border-dashed border-border-default rounded-sm shadow-panel">
            Yard performance analytics coming soon.
          </div>
        );
    }
  };

  return (
    <InventoryWizardProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-shell-canvas text-text-primary dashboard-shell font-sans">
        {/* Sidebar - Persistent technical panel */}
        <SellerSidebar />

        {/* Main Viewport Container */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-shell-canvas">
          {/* Persistent Telemetry Header */}
          <DashboardHeader
            onToggleYardControl={() => setIsYardControlOpen(!isYardControlOpen)}
          />

          {/* Dynamic Context Workspace Panel */}
          <main className="flex-1 overflow-y-auto p-6 bg-shell-workspace custom-scrollbar scroll-smooth">
            <div className="max-w-7xl mx-auto">
              <div className="animate-fade-in">{renderContent()}</div>
            </div>
          </main>
        </div>

        {isYardControlOpen && (
          <YardControlCore
            onClose={() => setIsYardControlOpen(false)}
            initialData={{ max_row_slots: 120, max_rack_tiers: 4 }}
            onSave={(data) => {
              console.log("Saving yard profile:", data);
              setIsYardControlOpen(false);
            }}
          />
        )}
      </div>
    </InventoryWizardProvider>
  );
}