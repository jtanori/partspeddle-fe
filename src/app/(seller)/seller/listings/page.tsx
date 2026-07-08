'use client';

import { useRouter } from 'next/navigation';
import { Tag } from 'lucide-react';
import { PageHeader } from '@/components/workspace';
import { EmptyState } from '@/components/common/EmptyState';

export default function SellerListingsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings"
        subtitle="Manage published drafts and active part listings."
        primaryAction={{ label: 'New Listing', href: '/seller/create' }}
        secondaryAction={{ label: 'Import', href: '#' }}
      />
      <EmptyState
        title="No listings yet"
        description="Published drafts and active listings will appear here. Create your first listing to get started."
        actionText="Create Listing"
        onAction={() => router.push('/seller/create')}
        icon={<Tag className="h-12 w-12 text-brand-primary" />}
      />
    </div>
  );
}
