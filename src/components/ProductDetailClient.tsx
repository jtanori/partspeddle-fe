'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Part } from '../types';
import ProductDetail from './ProductDetail';

export default function ProductDetailClient({ initialPart }: { initialPart: Part }) {
  const router = useRouter();
  const { addToCart } = useAppStore();
  
  return (
    <ProductDetail 
      partId={initialPart.id} 
      initialPart={initialPart}
      onBack={() => router.back()} 
      onAddToCart={addToCart} 
      onSelectPart={(partId) => router.push(`/listing/${partId}`)} 
    />
  );
}
