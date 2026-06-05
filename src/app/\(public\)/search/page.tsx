'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductListing from '@/components/ProductListing';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'All Parts';

  return (
    <div className="bg-base-cream min-h-screen">
      <ProductListing 
        initialSearchText={q} 
        initialCategory={category}
        onSelectPart={(id) => router.push(`/listing/${id}`)}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-base-cream">
        <div className="w-10 h-10 border-4 border-rust-copper/20 border-t-rust-copper rounded-full animate-spin" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
