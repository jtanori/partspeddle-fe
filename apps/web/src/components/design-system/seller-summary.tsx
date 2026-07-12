'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Rating } from './rating';

interface SellerSummaryProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  rating: number;
  reviewCount?: number;
  location?: string;
  logoUrl?: string;
  badge?: string;
  href?: string;
  variant?: 'compact' | 'rich';
}

/**
 * Canonical seller summary. Compact for inline rows; rich for sidebars.
 */
export function SellerSummary({
  name,
  rating,
  reviewCount,
  location,
  logoUrl,
  badge,
  href,
  variant = 'compact',
  className,
  ...props
}: SellerSummaryProps) {
  const isRich = variant === 'rich';

  const content = (
    <>
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-full bg-foreground-primary text-foreground-inverse',
          isRich ? 'h-16 w-16 border-4 border-surface-primary text-2xl' : 'h-10 w-10 text-sm',
        )}
      >
        {logoUrl ? (
          <Image src={logoUrl} alt={name} fill className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-black uppercase">
            {name.charAt(0)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'truncate font-black uppercase tracking-tight text-foreground-primary',
              isRich ? 'text-sm' : 'text-caption',
            )}
          >
            {name}
          </span>
          {badge && (
            <span className="rounded-md bg-status-warning-soft px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter text-status-warning">
              {badge}
            </span>
          )}
        </div>
        <Rating value={rating} count={reviewCount} size={isRich ? 'sm' : 'xs'} />
        {location && (
          <div className="mt-1 flex items-center gap-1 text-meta text-foreground-muted">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{location}</span>
          </div>
        )}
      </div>
    </>
  );

  const wrapperClasses = cn(
    'flex items-center gap-3',
    isRich && 'items-start gap-4 pb-6 border-b border-stroke-subtle',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cn(wrapperClasses, 'group')} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <div className={wrapperClasses} {...props}>
      {content}
    </div>
  );
}
