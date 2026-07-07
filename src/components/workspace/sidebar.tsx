'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  children?: SidebarItem[];
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  logo: React.ReactNode;
  sections: SidebarSection[];
  footer?: React.ReactNode;
  collapsed?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

/**
 * Task-oriented workspace sidebar with grouped navigation and nested children.
 */
export function Sidebar({
  logo,
  sections,
  footer,
  collapsed = false,
  mobileOpen = false,
  onMobileClose,
  className,
  ...props
}: SidebarProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderItem = (item: SidebarItem, depth = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded.has(item.id);
    const baseClasses = cn(
      'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-caption font-bold uppercase tracking-wider outline-none transition-colors',
      'text-foreground-secondary hover:bg-surface-secondary hover:text-foreground-primary',
      'focus-visible:ring-2 focus-visible:ring-brand-primary',
      depth > 0 && 'pl-9 text-meta',
    );

    return (
      <li key={item.id}>
        {hasChildren ? (
          <>
            <button type="button" onClick={() => toggle(item.id)} className={baseClasses}>
              {Icon && <Icon className="h-4 w-4" />}
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </>
              )}
            </button>
            {!collapsed && isExpanded && (
              <ul className="mt-1 space-y-1">
                {item.children!.map((child) => renderItem(child, depth + 1))}
              </ul>
            )}
          </>
        ) : item.href ? (
          <Link href={item.href} className={baseClasses} onClick={onMobileClose}>
            {Icon && <Icon className="h-4 w-4" />}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ) : item.onClick ? (
          <button type="button" onClick={item.onClick} className={baseClasses}>
            {Icon && <Icon className="h-4 w-4" />}
            {!collapsed && <span>{item.label}</span>}
          </button>
        ) : (
          <span className={baseClasses}>
            {Icon && <Icon className="h-4 w-4" />}
            {!collapsed && <span>{item.label}</span>}
          </span>
        )}
      </li>
    );
  };

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-stroke-subtle px-4">
        <div className="flex items-center gap-2 overflow-hidden">{logo}</div>
        {mobileOpen && onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close navigation"
            className="rounded p-1 text-foreground-muted outline-none transition-colors hover:text-foreground-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-5">
          {sections.map((section, idx) => (
            <li key={idx}>
              {section.title && !collapsed && (
                <span className="mb-2 block px-3 text-meta font-black uppercase tracking-[0.2em] text-foreground-muted">
                  {section.title}
                </span>
              )}
              <ul className="space-y-1">{section.items.map((item) => renderItem(item))}</ul>
            </li>
          ))}
        </ul>
      </nav>

      {footer && <div className="border-t border-stroke-subtle p-3">{footer}</div>}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden h-screen shrink-0 flex-col border-r border-stroke-subtle bg-surface-primary md:flex',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          className,
        )}
        {...props}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground-primary/50 backdrop-blur-xs md:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-stroke-subtle bg-surface-primary md:hidden',
              className,
            )}
            {...props}
          >
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
