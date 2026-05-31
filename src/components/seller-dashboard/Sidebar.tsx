import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { LayoutDashboard, Package, PlusSquare, ShoppingBag, Settings, LogOut, ArrowLeftRight, ChevronDown, ChevronRight } from 'lucide-react';
// @ts-ignore
import logoSolidImg from '../../assets/images/logo_solid.png';

export const SellerSidebar: React.FC = () => {
  const { logout } = useAppStore();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['/dashboard/inventory']);

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]);
  };

  const navItems = [
    { href: '/dashboard', label: 'OVERVIEW', icon: LayoutDashboard, exact: true },
    { 
      href: '/dashboard/inventory', 
      label: 'INVENTORY', 
      icon: Package,
      children: [
        { href: '/dashboard/inventory/active', label: 'ACTIVE LISTINGS' },
        { href: '/dashboard/inventory/sold', label: 'SOLD' },
        { href: '/dashboard/inventory/archived', label: 'ARCHIVED' }
      ]
    },
    { href: '/dashboard/create', label: 'CREATE LISTING', icon: PlusSquare },
    { href: '/dashboard/orders', label: 'ORDERS', icon: ShoppingBag },
    { href: '/dashboard/settings', label: 'YARD SETTINGS', icon: Settings },
  ];

  return (
    <aside className="w-72 h-full flex flex-col justify-between border-r border-amber-500/10 p-4 shrink-0 bg-neutral-950 font-mono text-xs select-none shadow-panel relative z-20">
      <div className="space-y-8">
        {/* Brand Anchor: Official Solid Logo */}
        <Link to="/" className="flex items-center px-2 py-4 group border-b border-dashed border-zinc-800 pb-6">
          <img src={logoSolidImg} alt="PartsPeddle" className="w-full h-auto object-contain" />
        </Link>

        {/* Operational Context Tabs - Route Driven */}
        <nav className="space-y-1.5">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isExpanded = expandedItems.includes(tab.href);
            const hasChildren = !!tab.children;
            const isActive = tab.exact 
              ? location.pathname === tab.href 
              : location.pathname.startsWith(tab.href);

            return (
              <div key={tab.href}>
                <div className="flex items-center">
                  <Link
                    to={tab.href}
                    className={`flex-1 flex items-center gap-3 px-3 py-2.5 transition-all duration-150 border-l-2 rounded-sm ${
                      isActive
                        ? 'border-amber-500 text-amber-400 bg-amber-500/5 font-bold'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span className="font-heading">{tab.label}</span>
                  </Link>
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
                    {tab.children.map(child => {
                      const isChildActive = location.pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={`block py-1.5 px-2 text-[10px] transition-colors font-mono ${
                            isChildActive 
                              ? 'text-accent-amber font-bold' 
                              : 'text-text-muted hover:text-text-secondary'
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* High-Visibility Exit / Portal Controls */}
      <div className="border-t border-dashed border-zinc-800 pt-6 space-y-1">
        <Link
          to="/listing"
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm border border-amber-500/20 bg-amber-500/5 text-amber-400 font-bold hover:bg-amber-500/10 transition-all shadow-[0_0_8px_rgba(245,158,11,0.05)]"
        >
          <ArrowLeftRight className="w-4 h-4 text-amber-400" />
          <span className="tracking-wide uppercase font-heading">PUBLIC MARKETPLACE</span>
        </Link>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400/80 hover:text-red-400 hover:bg-red-950/20 transition-all text-left font-mono rounded-sm"
        >
          <LogOut className="w-4 h-4 text-red-500/60" />
          <span className="uppercase">SIGN OUT TERMINAL</span>
        </button>
      </div>
    </aside>
  );
};
