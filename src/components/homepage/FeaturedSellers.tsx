'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Seller } from '../../types';
import { Section } from '../layout/design-system/Section';
import { Content } from '../layout/design-system/Content';
import { SectionHeader } from '../common/SectionHeader';
import { SellerCard, SellerCardSeller } from '../design-system/seller-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '../common/EmptyState';
import { ViewAllButton } from '../common/ViewAllButton';
import { useTopSellers } from '@/hooks/useTopSellers';

function toSellerCardSeller(seller: Seller): SellerCardSeller {
  return {
    id: seller.id,
    name: seller.name,
    businessName: seller.businessName,
    rating: seller.rating,
    reviewCount: seller.reviewCount,
    location: seller.location,
    specialty: seller.specialty,
    logoUrl: seller.logoUrl,
  };
}

interface FeaturedSellersProps {
  sellers?: Seller[];
  loading?: boolean;
  onViewAll?: () => void;
}

export const FeaturedSellers: React.FC<FeaturedSellersProps> = ({
  sellers: propsSellers,
  loading = false,
  onViewAll,
}) => {
  const router = useRouter();
  const { sellers: fetchedSellers, loading: sellersLoading } = useTopSellers({
    limit: 4,
    enabled: !propsSellers,
  });
  const sellers = propsSellers ?? fetchedSellers;
  const showLoading = loading || sellersLoading;

  return (
    <Section className="bg-surface-secondary">
      <Content>
        <SectionHeader
          title="Featured Recycling Yards"
          subtitle="Verified Network • Inspected and certified salvage facilities"
          actions={<ViewAllButton onClick={onViewAll || (() => router.push('/search'))} />}
        />

        {showLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton.SellerCard key={`seller-skeleton-${i}`} />
            ))}
          </div>
        ) : sellers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {sellers.map((seller) => (
              <SellerCard
                key={seller.id}
                seller={toSellerCardSeller(seller)}
                onViewInventory={() => router.push('/search')}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Verified Yards Currently Active"
            description="Be the first to bring your inventory to the PartsPeddle network. Start listing your salvage units today."
            actionText="Start Selling Now"
            onAction={() => router.push('/register?role=seller')}
          />
        )}
      </Content>
    </Section>
  );
};
