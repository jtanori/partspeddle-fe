'use client';

import { PageHeader } from '@/components/workspace';

export default function SellerListingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings"
        subtitle="Manage published drafts and active part listings."
        primaryAction={{ label: 'New Listing', href: '/seller/create' }}
        secondaryAction={{ label: 'Import', href: '#' }}
      />
      <div className="rounded-xl border border-dashed border-stroke-subtle bg-surface-primary p-16 text-center">
        <p className="text-meta font-black uppercase tracking-widest text-foreground-muted">
          Listing management dashboard coming soon.
        </p>
      </div>
    </div>
  );
}
