'use client';

import React from 'react';
import Link from 'next/link';
import { PartViewModel } from '@/domain/types/pdp.types';
import ProductGallery from './ProductGallery';
import ProductHeader from './ProductHeader';
import PriceBlock from './PriceBlock';
import SellerSupportCard from './SellerSupportCard';
import TrustSummaryStrip from './TrustSummaryStrip';
import DescriptionFitmentPanel from './DescriptionFitmentPanel';
import TabSystem from './TabSystem';
import CompatibleParts from './CompatibleParts';
import RecentlyViewed from './RecentlyViewed';
import NeedHelp from './NeedHelp';
import TrustBar from './TrustBar';
import { Content, MainGrid } from '@/components/layout/design-system';
import { Card } from '@/components/ui/card';

import { useCartStore } from '@/store/hooks';

interface ProductDetailProps {
  viewModel: PartViewModel;
}

export default function PDPRoot({ viewModel }: ProductDetailProps) {
  const { addToCart } = useCartStore();

  const isOutOfStock = viewModel.pricing.partPrice <= 0 || !viewModel.inventory.isInStock;
  const isLimitedData =
    viewModel.fitment.confidence === 'low' || viewModel.fitment.confidence === 'medium';

  return (
    <div className="min-h-screen bg-surface-secondary font-sans text-foreground-primary">
      <Content className="py-4">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-meta text-foreground-muted">
          <Link href="/" className="hover:text-brand-primary">
            Home
          </Link>
          <span>&rsaquo;</span>
          <Link href="/search" className="hover:text-brand-primary">
            Search results
          </Link>
          <span>&rsaquo;</span>
          <Link
            href={`/search?category=${encodeURIComponent(viewModel.header.subtitle)}`}
            className="hover:text-brand-primary uppercase tracking-tighter"
          >
            {viewModel.header.subtitle}
          </Link>
          <span>&rsaquo;</span>
          <span className="truncate uppercase tracking-tighter">{viewModel.header.title}</span>
        </nav>

        {/* Banners (OOS / Limited Data) */}
        {isOutOfStock && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-status-danger/20 bg-status-danger-soft p-4 text-meta font-black uppercase tracking-widest text-status-danger">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-status-danger/10 text-xs">
              !
            </span>
            This part is currently out of stock.
          </div>
        )}

        {isLimitedData && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-status-warning/20 bg-status-warning-soft p-4 text-meta font-black uppercase tracking-widest text-status-warning">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-status-warning/10 text-xs">
              ?
            </span>
            Fitment not verified for this part. Please check specifications carefully.
          </div>
        )}

        <MainGrid className="items-start">
          {/* Main Content Column (L-01: span 8) */}
          <div className="space-y-8 lg:col-span-8">
            {/* L-03: Hero Section (Gallery + Info/Price) */}
            <Card className="p-4 sm:p-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12">
                <ProductGallery images={viewModel.images} />
                <div className="flex flex-col">
                  <ProductHeader header={viewModel.header} badges={viewModel.badges} />
                  <div className="mt-auto">
                    <PriceBlock
                      pricing={viewModel.pricing}
                      onAddToCart={() => addToCart(viewModel as any)}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* L-01: Trust Summary Strip (Corrected Position) */}
            <TrustSummaryStrip />

            {/* Detailed Info */}
            <div className="space-y-8">
              <DescriptionFitmentPanel
                partId={viewModel.id}
                description={viewModel.description}
                fitment={viewModel.fitment}
              />
              <TabSystem viewModel={viewModel} />
            </div>
          </div>

          {/* L-02: Sidebar Column (span 4 + Sticky) */}
          <aside className="h-full lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              <SellerSupportCard seller={viewModel.seller} />

              {/* C-04: Buyer Confidence (High-Fidelity) */}
              <Card>
                <h3 className="mb-6 font-display text-meta font-black uppercase tracking-[0.25em] text-foreground-muted">
                  Buyer Confidence
                </h3>
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-caption text-brand-primary">
                      🛡️
                    </span>
                    <div>
                      <p className="text-caption font-black uppercase tracking-tight text-foreground-primary">
                        90-Day Warranty Included
                      </p>
                      <p className="text-meta font-medium italic text-foreground-muted">
                        Covers all mechanical functionality
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-caption text-brand-primary">
                      ✓
                    </span>
                    <div>
                      <p className="text-caption font-black uppercase tracking-tight text-foreground-primary">
                        Quality Tested
                      </p>
                      <p className="text-meta font-medium italic text-foreground-muted">
                        Inspected by our specialist team
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-caption text-brand-primary">
                      🔒
                    </span>
                    <div>
                      <p className="text-caption font-black uppercase tracking-tight text-foreground-primary">
                        Secure Checkout
                      </p>
                      <p className="text-meta font-medium italic text-foreground-muted">
                        Your data is 100% protected
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-caption text-brand-primary">
                      🔄
                    </span>
                    <div>
                      <p className="text-caption font-black uppercase tracking-tight text-foreground-primary">
                        30-Day Returns
                      </p>
                      <p className="text-meta font-medium italic text-foreground-muted">
                        Easy returns, buyer pays shipping
                      </p>
                    </div>
                  </li>
                </ul>
              </Card>

              <CompatibleParts partId={viewModel.id} parts={viewModel.crossSell} />
              <RecentlyViewed parts={[]} />
              <NeedHelp />
            </div>
          </aside>
        </MainGrid>
      </Content>

      <div className="mt-16 border-t border-stroke-subtle bg-surface-primary">
        <TrustBar />
      </div>
    </div>
  );
}
