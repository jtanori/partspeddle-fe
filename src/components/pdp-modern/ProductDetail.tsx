'use client';

import React from 'react';
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

import { useAppStore } from '@/store/useAppStore';

interface ProductDetailProps {
  viewModel: PartViewModel;
}

export default function ProductDetail({ viewModel }: ProductDetailProps) {
  const { addToCart } = useAppStore();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* Trust Strip */}
      <TrustSummaryStrip />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <ProductGallery images={viewModel.images} />
          <ProductHeader header={viewModel.header} badges={viewModel.badges} />
          <DescriptionFitmentPanel description={viewModel.description} fitment={viewModel.fitment} />
          <TabSystem viewModel={viewModel} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <PriceBlock pricing={viewModel.pricing} onAddToCart={() => addToCart(viewModel as any)} />
          <SellerSupportCard seller={viewModel.seller} />
          <CompatibleParts parts={viewModel.crossSell} />
          <RecentlyViewed parts={[]} />
          <NeedHelp />
        </div>
      </div>
      
      <TrustBar />
    </div>
  );
}
