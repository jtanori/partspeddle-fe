'use client';

import React from 'react';
import { ListingWizard } from '@/components/seller-dashboard/ListingWizard';
import { PageHeader } from '@/components/workspace';
import { useRouter } from 'next/navigation';

export default function SellerCreateListingPage() {
  const router = useRouter();
  return (
    <div className="flex h-full flex-col space-y-6">
      <PageHeader title="New Listing" subtitle="Create a new part listing. The draft autosaves as you edit." />
      <div className="min-h-0 flex-1">
        <ListingWizard onClose={() => router.push('/seller/inventory')} />
      </div>
    </div>
  );
}
