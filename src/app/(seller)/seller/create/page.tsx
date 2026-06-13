'use client';

import React from 'react';
import { ListingWizard } from '@/components/seller-dashboard/ListingWizard';
import { useRouter } from 'next/navigation';

export default function SellerCreateListingPage() {
  const router = useRouter();
  return <ListingWizard onClose={() => router.push('/seller/inventory')} />;
}
