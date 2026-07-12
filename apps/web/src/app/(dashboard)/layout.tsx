'use client';

import React from 'react';
import { useAuthStore } from '@/store/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PublicShell } from '@/components/layout/PublicShell';
import { LayoutDashboard, User, Settings, Bell, LogOut, Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'My Profile', icon: User, href: '/dashboard/profile' },
    { name: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <PublicShell showFooter={false}>
      <div className="flex-1 flex overflow-hidden bg-shell-canvas text-text-primary dashboard-shell">
        {/* Sidebar */}
        <aside className="w-64 bg-shell-sidebar text-text-secondary hidden md:flex flex-col border-r border-border-default">
          <div className="p-6 border-b border-border-default bg-shell-sidebar/50">
            <Link
              href="/"
              className="font-display font-black text-xl tracking-tighter text-text-primary"
            >
              VIN<span className="text-accent-amber">TRACK</span>
            </Link>
          </div>
          <nav className="flex-grow p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between p-3 rounded-sm transition-all group ${isActive ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20' : 'hover:bg-shell-workspace text-text-muted hover:text-text-secondary'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`w-5 h-5 ${isActive ? 'text-accent-amber' : 'text-text-muted group-hover:text-accent-amber'} transition-colors`}
                    />
                    <span className="text-[11px] font-black uppercase tracking-[0.1em]">
                      {item.name}
                    </span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-amber shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border-default">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full p-3 rounded-sm text-text-muted hover:bg-danger/10 hover:text-danger transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:text-danger" />
              <span className="text-[11px] font-black uppercase tracking-[0.1em]">Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-shell-sidebar text-text-secondary flex flex-col border-r border-border-default md:hidden">
              <div className="p-6 border-b border-border-default bg-shell-sidebar/50 flex items-center justify-between">
                <Link
                  href="/"
                  className="font-display font-black text-xl tracking-tighter text-text-primary"
                >
                  VIN<span className="text-accent-amber">TRACK</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-text-muted hover:text-accent-amber"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-grow p-4 space-y-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-sm transition-all group ${isActive ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20' : 'hover:bg-shell-workspace text-text-muted hover:text-text-secondary'}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={`w-5 h-5 ${isActive ? 'text-accent-amber' : 'text-text-muted group-hover:text-accent-amber'} transition-colors`}
                        />
                        <span className="text-[11px] font-black uppercase tracking-[0.1em]">
                          {item.name}
                        </span>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-amber shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-border-default">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full p-3 rounded-sm text-text-muted hover:bg-danger/10 hover:text-danger transition-all group"
                >
                  <LogOut className="w-5 h-5 group-hover:text-danger" />
                  <span className="text-[11px] font-black uppercase tracking-[0.1em]">Logout</span>
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-8 h-16 md:hidden border-b border-border-default bg-shell-surface">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-text-muted hover:text-accent-amber"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display font-black text-sm uppercase text-text-primary tracking-widest">
              {menuItems.find((m) => m.href === pathname)?.name || 'Dashboard'}
            </h1>
            <div className="w-9" />
          </div>
          <main className="p-4 md:p-8 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </PublicShell>
  );
}
