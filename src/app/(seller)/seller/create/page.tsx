'use client';

import React from 'react';
import { ListingWizard } from '@/components/seller-dashboard/ListingWizard';
import { PageHeader, Toolbar } from '@/components/workspace';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SellerCreateListingPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <PageHeader title="New Listing" subtitle="Create a new part listing." />
      <Toolbar>
        <Button variant="outline" size="sm" onClick={() => router.push('/seller/inventory')}>
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Inventory
        </Button>
      </Toolbar>
      <ListingWizard onClose={() => router.push('/seller/inventory')} />
    </div>
  );
}
