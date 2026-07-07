'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rating } from './rating';
import { Skeleton } from '@/components/ui/skeleton';

export interface SellerCardSeller {
  id?: string;
  name: string;
  businessName?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  specialty?: string;
  logoUrl?: string;
  badge?: string;
}

interface SellerCardProps extends React.HTMLAttributes<HTMLElement> {
  seller: SellerCardSeller;
  variant?: 'grid' | 'compact';
  onViewInventory?: (sellerId: string) => void;
}

/**
 * Canonical seller card for grids and compact inline usage.
 */
export function SellerCard({
  seller,
  variant = 'grid',
  onViewInventory,
  className,
  ...props
}: SellerCardProps) {
  const [imageError, setImageError] = useState(false);
  const displayName = seller.businessName || seller.name;
  const isCompact = variant === 'compact';

  const content = (
    <>
      <div
        className={cn(
          'relative overflow-hidden bg-surface-secondary',
          isCompact ? 'h-16 w-16 shrink-0 rounded-md' : 'h-40 w-full',
        )}
      >
        {seller.logoUrl && !imageError ? (
          <Image
            src={seller.logoUrl}
            alt={displayName}
            fill
            sizes={isCompact ? '64px' : '(max-width: 768px) 100vw, 25vw'}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-foreground-inverse">
            <div className="absolute inset-0 bg-foreground-primary/80" />
            <MapPin className="relative z-10 h-8 w-8" />
            <span className="relative z-10 text-meta font-black uppercase">Yard Logo</span>
          </div>
        )}

        {!isCompact && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-sm bg-surface-primary/90 px-2 py-1 backdrop-blur-xs">
            <Rating value={seller.rating ?? 0} size="sm" showValue />
          </div>
        )}
      </div>

      <div className={cn('flex flex-col', isCompact ? 'flex-1' : 'space-y-4 p-5')}>
        <div className={cn('space-y-1', isCompact && 'space-y-0')}>
          <h3
            className={cn(
              'font-display font-bold uppercase text-foreground-primary line-clamp-1',
              isCompact ? 'text-caption' : 'text-body',
            )}
          >
            {displayName}
          </h3>
          {seller.location && (
            <div className="flex items-center gap-1 text-caption text-foreground-secondary">
              <MapPin className="h-3.5 w-3.5" />
              <span>{seller.location}</span>
            </div>
          )}
          {isCompact && seller.rating !== undefined && (
            <Rating value={seller.rating} count={seller.reviewCount} size="xs" />
          )}
        </div>

        {!isCompact && (
          <div className="flex items-center justify-between border-t border-stroke-subtle pt-4">
            <div className="space-y-0.5">
              <span className="block text-meta font-bold uppercase tracking-widest text-foreground-muted">
                Specialty
              </span>
              <span className="text-caption font-semibold text-foreground-secondary">
                {seller.specialty || 'General Parts'}
              </span>
            </div>
            <Award className="h-6 w-6 text-brand-primary/20" />
          </div>
        )}

        {onViewInventory && seller.id && (
          <Button variant="outline" className="w-full" onClick={() => onViewInventory(seller.id!)}>
            View Inventory
          </Button>
        )}
      </div>
    </>
  );

  return (
    <Card
      className={cn(
        'group overflow-hidden p-0 transition-shadow hover:shadow-card-hover',
        isCompact ? 'flex flex-row items-center gap-3 p-3' : 'flex flex-col',
        className,
      )}
      {...props}
    >
      {content}
    </Card>
  );
}

SellerCard.Skeleton = Skeleton.SellerCard;
