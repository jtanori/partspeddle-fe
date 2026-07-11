'use client';

import { Menu, Bell, Mail, CheckSquare, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';

interface TopNavigationProps extends React.HTMLAttributes<HTMLElement> {
  onMenuToggle?: () => void;
  onSearch?: (value: string) => void;
  onOpenCommandPalette?: () => void;
  notifications?: number;
  messages?: number;
  tasks?: number;
  profile?: {
    name?: string;
    avatar?: string;
  };
}

/**
 * Global workspace top navigation with search and global actions.
 */
export function TopNavigation({
  onMenuToggle,
  onSearch,
  onOpenCommandPalette,
  notifications,
  messages,
  tasks,
  profile,
  className,
  ...props
}: TopNavigationProps) {
  return (
    <header
      className={cn(
        'flex h-16 shrink-0 items-center justify-between gap-4 border-b border-stroke-subtle bg-surface-primary px-4',
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-3">
        {onMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            aria-label="Open navigation menu"
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="hidden max-w-md flex-1 sm:block">
          <SearchInput onSubmit={onSearch} placeholder="Search inventory, listings, orders..." />
        </div>
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden items-center gap-2 rounded-md border border-stroke-subtle bg-surface-secondary px-2.5 py-1.5 text-meta text-foreground-muted transition-colors hover:text-foreground-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:flex"
            aria-label="Open command palette"
          >
            <Search className="h-3.5 w-3.5" />
            <span>⌘K</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <NavIcon icon={Bell} count={notifications} label="Notifications" />
        <NavIcon icon={Mail} count={messages} label="Messages" />
        <NavIcon icon={CheckSquare} count={tasks} label="Tasks" />

        <button
          type="button"
          aria-label="Profile"
          className="ml-2 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surface-secondary text-foreground-secondary outline-none ring-2 ring-transparent transition-all hover:ring-brand-primary/30 focus-visible:ring-brand-primary"
        >
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name ?? 'Profile'}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
}

function NavIcon({
  icon: Icon,
  count,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative rounded-md p-2 text-foreground-muted outline-none transition-colors hover:bg-surface-secondary hover:text-foreground-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
    >
      <Icon className="h-5 w-5" />
      {count !== undefined && count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-danger px-1 text-[10px] font-bold text-foreground-inverse">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
