'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  Bell, 
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAppStore();

  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'My Profile', icon: User, href: '/dashboard/profile' },
    { name: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-steel-black text-base-cream hidden md:flex flex-col border-r border-oil-dark">
        <div className="p-6 border-b border-oil-dark">
          <Link href="/" className="font-display font-black text-xl tracking-tighter">
            VIN<span className="text-rust-copper">TRACK</span>
          </Link>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center justify-between p-3 rounded-lg transition-all group ${isActive ? 'bg-rust-copper text-white' : 'hover:bg-oil-dark text-warm-gray'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-rust-copper'}`} />
                  <span className="text-sm font-bold uppercase tracking-wider">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-oil-dark">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-warm-gray hover:bg-oil-dark hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5 text-rust-copper" />
            <span className="text-sm font-bold uppercase tracking-wider">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8">
          <h1 className="font-display font-black text-lg uppercase text-steel-black tracking-widest">
            {menuItems.find(m => m.href === pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-rust-copper transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rust-copper rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center font-display font-bold text-zinc-500">
              {user?.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
