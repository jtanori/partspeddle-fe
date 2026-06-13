'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import { useAppStore } from '@/store/useAppStore';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useAppStore();
  
  const id = params.id as string;

  if (!id) return null;

  return (
    <div className="bg-base-cream min-h-screen">
      <ProductDetail 
        partId={id} 
        onBack={() => router.back()} 
        onAddToCart={addToCart}
        onSelectPart={(partId) => router.push(`/listing/${partId}`)}
      />
    </div>
  );
}
