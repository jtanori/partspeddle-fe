'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Cog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Price } from './price';
import { Rating } from './rating';
import { InventoryCount } from './inventory-count';
import { Skeleton } from '@/components/ui/skeleton';

export interface PartCardPart {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  condition?: string;
  system?: string;
  quantity?: number;
  isAvailable?: boolean;
  sellerName?: string;
  sellerRating?: number;
  sellerReviewCount?: number;
}

interface PartCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'part'> {
  part: PartCardPart;
  variant?: 'grid' | 'list';
  href?: string;
  isFavorite?: boolean;
  onFavorite?: (id: string) => void;
  currency?: string;
}

/**
 * Canonical part card for grid and list views.
 */
export function PartCard({
  part,
  variant = 'grid',
  href = `/listing/${part.id}`,
  isFavorite = false,
  onFavorite,
  currency = 'USD',
  className,
  ...props
}: PartCardProps) {
  const [imageError, setImageError] = useState(false);
  const isList = variant === 'list';

  const content = (
    <>
      {/* Image */}
      <div
        className={cn(
          'relative shrink-0 overflow-hidden bg-surface-secondary',
          isList ? 'h-24 w-24 rounded-md' : 'aspect-[4/3] w-full',
        )}
      >
        {part.imageUrl && !imageError ? (
          <Image
            src={part.imageUrl}
            alt={part.title}
            fill
            sizes={isList ? '96px' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <Cog className="h-8 w-8 text-foreground-muted" />
            <span className="text-meta font-black uppercase text-foreground-muted">
              Pictures soon
            </span>
          </div>
        )}

        {!isList && onFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onFavorite(part.id);
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className="absolute right-2 top-2 rounded-full border border-stroke-subtle bg-surface-primary/85 p-1.5 text-foreground-muted shadow-sm backdrop-blur-xs transition-colors hover:text-status-danger"
          >
            <Heart
              className={cn('h-3.5 w-3.5', isFavorite && 'fill-status-danger text-status-danger')}
            />
          </button>
        )}

        {!isList && part.condition && (
          <span className="absolute bottom-2 left-2 rounded-sm bg-surface-primary/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-foreground-primary backdrop-blur-xs">
            {part.condition}
          </span>
        )}
      </div>

      {/* Info */}
      <div className={cn('flex flex-col', isList ? 'flex-1 justify-center' : 'flex-1 p-4')}>
        {!isList && part.system && (
          <div className="mb-1 flex items-center gap-1 text-meta font-black uppercase tracking-wider text-brand-primary">
            <Cog className="h-3 w-3" />
            <span>{part.system}</span>
          </div>
        )}

        <h3
          className={cn(
            'font-display font-bold tracking-tight text-foreground-primary group-hover:text-brand-primary transition-colors',
            isList ? 'text-caption line-clamp-1' : 'text-body line-clamp-2',
          )}
        >
          {part.title}
        </h3>

        {!isList && part.subtitle && (
          <p className="mt-1 line-clamp-2 text-caption text-foreground-secondary">
            {part.subtitle}
          </p>
        )}

        <div
          className={cn(
            'mt-auto flex items-center',
            isList ? 'mt-2 gap-4' : 'justify-between border-t border-stroke-subtle pt-3',
          )}
        >
          <Price
            amount={part.price}
            currency={currency}
            compareAtAmount={part.compareAtPrice}
            size="card-title"
          />

          {part.sellerName && !isList && (
            <div className="text-right">
              <span className="block text-meta font-bold text-foreground-secondary">
                {part.sellerName}
              </span>
              <Rating value={part.sellerRating ?? 0} count={part.sellerReviewCount} size="xs" />
            </div>
          )}
        </div>

        {isList && part.sellerName && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-meta font-bold text-foreground-secondary">{part.sellerName}</span>
            <Rating value={part.sellerRating ?? 0} count={part.sellerReviewCount} size="xs" />
          </div>
        )}

        {!isList && (
          <div className="mt-2">
            <InventoryCount quantity={part.quantity} isAvailable={part.isAvailable} />
          </div>
        )}
      </div>
    </>
  );

  const cardClasses = cn(
    'group overflow-hidden rounded-xl border border-stroke-subtle bg-surface-primary p-0 shadow-card transition-shadow hover:shadow-card-hover',
    isList ? 'flex flex-row items-center gap-4 p-3' : 'flex flex-col',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cardClasses} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {content}
    </div>
  );
}

PartCard.Skeleton = Skeleton.PartCard;
