import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { LayoutDashboard, Package, ShoppingBag, LogOut, ArrowLeftRight, ChevronDown, ChevronRight, Plus, GitBranch } from 'lucide-react';
import { SidebarLink } from '../layout/SidebarLink';
import Link from 'next/link';
// @ts-ignore
import logoSolidImg from '../../assets/images/logo_solid.png';

export const SellerSidebar: React.FC = () => {
  const { logout, setActiveSellerTab } = useAppStore();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['/seller/inventory']);

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]);
  };

  const navItems = [
    { href: '/seller', label: 'OVERVIEW', icon: LayoutDashboard },
    { href: '/seller/create', label: 'Parts Intake', icon: Plus },
    { 
      href: '/seller/inventory', 
      label: 'Inventory', 
      icon: Package,
      children: [
        { href: '/seller/inventory/active', label: 'ACTIVE LISTINGS' },
        { href: '/seller/inventory/sold', label: 'SOLD' },
        { href: '/seller/inventory/archived', label: 'ARCHIVED' }
      ]
    },
    { href: '/seller/orders', label: 'ORDERS DESK', icon: ShoppingBag },
  ];

  return (
    <aside className="w-[260px] h-screen flex flex-col justify-between border-r border-border-default p-4 shrink-0 bg-shell-sidebar font-mono text-xs select-none shadow-panel relative z-20">
      <div className="space-y-6">
        {/* Brand Anchor: Official Logo */}
        <div className="px-2 py-4 border-b border-dashed border-zinc-800 pb-6">
          <img src={logoSolidImg} alt="PartsPeddle" className="w-full h-auto object-contain" />
        </div>

        {/* Primary CTA Block */}
        <SidebarLink to="/dashboard/snap" label="CREATE NEW LISTING" icon={Plus} />

        {/* Operational Context Tabs */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isExpanded = expandedItems.includes(tab.href);
            const hasChildren = !!tab.children;

            return (
              <div key={tab.href}>
                <div className="flex items-center">
                  <div className="flex-1">
                    <SidebarLink to={tab.href} label={tab.label} icon={Icon} />
                  </div>
                  {hasChildren && (
                    <button 
                      onClick={(e) => { e.preventDefault(); toggleExpand(tab.href); }}
                      className="p-2 text-text-muted hover:text-accent-amber transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                
                {hasChildren && isExpanded && (
                  <div className="pl-10 pr-2 space-y-1 mt-1 border-l border-border-subtle ml-5">
                    {tab.children.map(child => (
                      <SidebarLink key={child.href} to={child.href} label={child.label} icon={GitBranch} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Utility Links */}
      <div className="border-t border-dashed border-zinc-800 pt-6 space-y-2">
        <Link
          href="/search"
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-text-muted hover:text-accent-amber transition-all"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="tracking-wide uppercase font-heading">Public Marketplace</span>
        </Link>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-danger/80 hover:text-danger hover:bg-danger/10 transition-all text-left font-mono rounded-sm"
        >
          <LogOut className="w-4 h-4 text-danger/60" />
          <span className="uppercase">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
