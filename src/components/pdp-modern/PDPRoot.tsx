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

import { useCartStore } from '@/store/hooks';

interface ProductDetailProps {
  viewModel: PartViewModel;
}

export default function PDPRoot({ viewModel }: ProductDetailProps) {
  const { addToCart } = useCartStore();

  const isOutOfStock = viewModel.pricing.partPrice <= 0 || !viewModel.inventory.isInStock;
  const isLimitedData = viewModel.fitment.confidence === 'low' || viewModel.fitment.confidence === 'medium';

  return (
    <div className="bg-[#F5F0EB] min-h-screen font-sans text-[#1E1E1E]">
      <div className="max-w-[1280px] mx-auto px-6 py-4">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mb-6">
          <a href="/" className="hover:text-pp-primary">Home</a>
          <span>&rsaquo;</span>
          <a href="/search" className="hover:text-pp-primary">Search results</a>
          <span>&rsaquo;</span>
          <a href="#" className="hover:text-pp-primary uppercase tracking-tighter">{viewModel.header.subtitle}</a>
          <span>&rsaquo;</span>
          <span className="text-zinc-400 truncate uppercase tracking-tighter">{viewModel.header.title}</span>
        </nav>

        {/* Banners (OOS / Limited Data) */}
        {isOutOfStock && (
           <div className="mb-6 bg-[#FEF2F2] border border-[#FECACA] p-4 rounded-pp-card flex items-center gap-3 text-[#B91C1C] text-[11px] font-black uppercase tracking-widest">
              <span className="w-6 h-6 flex items-center justify-center bg-[#FEE2E2] rounded-full text-xs">!</span>
              This part is currently out of stock.
           </div>
        )}

        {isLimitedData && (
           <div className="mb-6 bg-[#FFFBEB] border border-[#FEF3C7] p-4 rounded-pp-card flex items-center gap-3 text-[#92400E] text-[11px] font-black uppercase tracking-widest">
              <span className="w-6 h-6 flex items-center justify-center bg-[#FEF3C7] rounded-full text-xs">?</span>
              Fitment not verified for this part. Please check specifications carefully.
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column (L-01: span 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* L-03: Hero Section (Gallery + Info/Price) */}
            <div className="bg-white rounded-pp-card p-4 sm:p-8 shadow-sm border border-zinc-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                <ProductGallery images={viewModel.images} />
                <div className="flex flex-col">
                  <ProductHeader header={viewModel.header} badges={viewModel.badges} />
                  <div className="mt-auto">
                    <PriceBlock pricing={viewModel.pricing} onAddToCart={() => addToCart(viewModel as any)} />
                  </div>
                </div>
              </div>
            </div>

            {/* L-01: Trust Summary Strip (Corrected Position) */}
            <TrustSummaryStrip />

            {/* Detailed Info */}
            <div className="space-y-8">
               <DescriptionFitmentPanel description={viewModel.description} fitment={viewModel.fitment} />
               <TabSystem viewModel={viewModel} />
            </div>
          </div>

          {/* L-02: Sidebar Column (span 4 + Sticky) */}
          <aside className="lg:col-span-4 h-full">
            <div className="sticky top-6 space-y-6">
              <SellerSupportCard seller={viewModel.seller} />
              
              {/* C-04: Buyer Confidence (High-Fidelity) */}
              <div className="bg-white border border-zinc-200 rounded-pp-card p-8 shadow-sm">
                <h3 className="font-display font-black uppercase text-[10px] tracking-[0.25em] text-zinc-400 mb-6">Buyer Confidence</h3>
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <span className="w-6 h-6 flex items-center justify-center bg-zinc-50 rounded-full text-[12px] text-pp-primary shrink-0">🛡️</span>
                    <div>
                      <p className="text-[13px] font-black text-pp-text uppercase tracking-tight">90-Day Warranty Included</p>
                      <p className="text-[11px] text-zinc-400 font-medium italic">Covers all mechanical functionality</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-6 h-6 flex items-center justify-center bg-zinc-50 rounded-full text-[12px] text-pp-primary shrink-0">✓</span>
                    <div>
                      <p className="text-[13px] font-black text-pp-text uppercase tracking-tight">Quality Tested</p>
                      <p className="text-[11px] text-zinc-400 font-medium italic">Inspected by our specialist team</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-6 h-6 flex items-center justify-center bg-zinc-50 rounded-full text-[12px] text-pp-primary shrink-0">🔒</span>
                    <div>
                      <p className="text-[13px] font-black text-pp-text uppercase tracking-tight">Secure Checkout</p>
                      <p className="text-[11px] text-zinc-400 font-medium italic">Your data is 100% protected</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-6 h-6 flex items-center justify-center bg-zinc-50 rounded-full text-[12px] text-pp-primary shrink-0">🔄</span>
                    <div>
                      <p className="text-[13px] font-black text-pp-text uppercase tracking-tight">30-Day Returns</p>
                      <p className="text-[11px] text-zinc-400 font-medium italic">Easy returns, buyer pays shipping</p>
                    </div>
                  </li>
                </ul>
              </div>

              <CompatibleParts parts={viewModel.crossSell} />
              <RecentlyViewed parts={[]} />
              <NeedHelp />
            </div>
          </aside>
        </div>
      </div>
      
      <div className="mt-16 bg-white border-t border-zinc-200">
        <TrustBar />
      </div>
    </div>
  );
}
