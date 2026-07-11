'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Part } from '../../types';
import { Section } from '../layout/design-system/Section';
import { Content } from '../layout/design-system/Content';
import { SectionHeader } from '../common/SectionHeader';
import { PartCard, PartCardPart } from '../design-system/part-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '../common/EmptyState';
import { ViewAllButton } from '../common/ViewAllButton';

function toPartCardPart(part: Part): PartCardPart {
  return {
    id: part.id,
    title: part.title,
    subtitle: part.subtitle,
    price: part.price,
    compareAtPrice: part.originalPrice,
    imageUrl: part.images?.[0],
    condition: part.condition,
    system: part.system,
    quantity: undefined,
    isAvailable: part.status !== 'sold' && part.status !== 'removed',
    sellerName: part.seller?.businessName || part.seller?.name,
    sellerRating: part.seller?.rating,
    sellerReviewCount: part.seller?.reviewCount,
  };
}

interface ListingsGridProps {
  title: string;
  subtitle: string;
  parts: Part[];
  loading?: boolean;
  skeletonCount?: number;
  viewAllHref?: string;
  emptyActionHref?: string;
  emptyState?: {
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
  };
}

export const ListingsGrid: React.FC<ListingsGridProps> = ({
  title,
  subtitle,
  parts,
  loading = false,
  skeletonCount = 4,
  viewAllHref = '/search',
  emptyActionHref = '/search',
  emptyState,
}) => {
  const router = useRouter();
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleViewAll = () => router.push(viewAllHref);

  const toggleFavorite = (partId: string) => {
    setFavorites((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId],
    );
  };

  return (
    <Section className="bg-surface-primary">
      <Content>
        <SectionHeader
          title={title}
          subtitle={subtitle}
          actions={<ViewAllButton onClick={handleViewAll} />}
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <Skeleton.PartCard key={`listing-skeleton-${i}`} />
            ))}
          </div>
        ) : parts && parts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {parts.map((part) => (
              <PartCard
                key={part.id}
                part={toPartCardPart(part)}
                isFavorite={favorites.includes(part.id)}
                onFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={emptyState?.title || 'No Matching Inventory Found'}
            description={
              emptyState?.description ||
              "We couldn't find any OEM parts matching this specific criteria in our active network. Try adjusting your search or check back later."
            }
            actionText={emptyState?.actionText || 'Search All Inventory'}
            onAction={emptyState?.onAction || (() => router.push(emptyActionHref))}
          />
        )}
      </Content>
    </Section>
  );
};
