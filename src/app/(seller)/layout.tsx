'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  ArrowLeftRight,
  LogOut,
  Wrench,
  Upload,
  Download,
  Tag,
  User,
  DollarSign,
} from 'lucide-react';
import { useAuthStore } from '@/store/hooks';
import { useSellerProfile } from '@/hooks/useSellerProfile';
import { InventoryWizardProvider } from '@/context/InventoryWizardContext';
import { YardControlCore } from '@/components/drawers/YardControlCore';
import {
  WorkspaceLayout,
  Sidebar,
  TopNavigation,
  type SidebarSection,
} from '@/components/workspace';
import { SearchCommandPalette } from '@/components/search/SearchCommandPalette';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import logoImg from '@/assets/images/logo_solid.png';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, setProfile, logout } = useAuthStore();
  const [isYardControlOpen, setIsYardControlOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { profile, loading: isLoading } = useSellerProfile({ userId: user?.id });
  const { open: commandPaletteOpen, setOpen: setCommandPaletteOpen } = useCommandPalette();

  useEffect(() => {
    if (profile) {
      setProfile(profile);
    }
  }, [profile, setProfile]);

  const sidebarSections: SidebarSection[] = [
    {
      items: [
        { id: 'overview', href: '/seller', label: 'Overview', icon: LayoutDashboard },
        { id: 'inventory', href: '/seller/inventory', label: 'Inventory', icon: Package },
        { id: 'listings', href: '/seller/listings', label: 'Listings', icon: Tag },
        { id: 'orders', href: '/seller/orders', label: 'Orders', icon: ShoppingBag },
        { id: 'customers', href: '/seller/customers', label: 'Customers', icon: User },
        { id: 'messages', href: '/seller/messages', label: 'Messages', icon: MessageSquare },
        { id: 'analytics', href: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Tools',
      items: [
        { id: 'imports', href: '#', label: 'Imports', icon: Upload },
        { id: 'exports', href: '#', label: 'Exports', icon: Download },
        { id: 'pricing', href: '#', label: 'Pricing', icon: Tag },
        { id: 'financial', href: '/seller/financial', label: 'Financial', icon: DollarSign },
        {
          id: 'yard',
          label: 'Yard Control',
          icon: Wrench,
          onClick: () => setIsYardControlOpen(true),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: 'settings', href: '/seller/settings', label: 'Settings', icon: Settings },
        { id: 'help', href: '#', label: 'Help', icon: HelpCircle },
      ],
    },
  ];

  const sidebar = (
    <Sidebar
      logo={
        <Link href="/seller" className="flex items-center gap-2">
          <Image src={logoImg} alt="PartsPeddle" className="h-8 w-auto object-contain" />
          <span className="font-display text-lg font-black uppercase tracking-tight text-foreground-primary">
            PartsPeddle
          </span>
        </Link>
      }
      sections={sidebarSections}
      mobileOpen={isMobileSidebarOpen}
      onMobileClose={() => setIsMobileSidebarOpen(false)}
      footer={
        <div className="space-y-1">
          <Link
            href="/search"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-caption font-bold uppercase tracking-wider text-foreground-secondary transition-colors hover:bg-surface-secondary hover:text-foreground-primary"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Marketplace
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-caption font-bold uppercase tracking-wider text-status-danger transition-colors hover:bg-status-danger-soft"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      }
    />
  );

  const topNav = (
    <TopNavigation
      onMenuToggle={() => setIsMobileSidebarOpen(true)}
      onSearch={(value) => console.log('Workspace search:', value)}
      onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      notifications={2}
      messages={1}
      tasks={0}
      profile={{
        name: String(profile?.name ?? user?.email ?? 'Seller'),
      }}
    />
  );

  return (
    <InventoryWizardProvider>
      <WorkspaceLayout sidebar={sidebar} topNav={topNav} loading={isLoading} density="compact">
        {children}
      </WorkspaceLayout>

      <SearchCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

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
    </InventoryWizardProvider>
  );
}
