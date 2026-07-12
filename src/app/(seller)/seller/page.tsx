'use client';

import { PageHeader } from '@/components/workspace';

export default function SellerOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="Yard performance, recent activity, and quick actions."
        primaryAction={{ label: 'New Listing', href: '/seller/create' }}
        secondaryAction={{ label: 'Import Inventory', href: '#' }}
      />
      <div className="rounded-xl border border-dashed border-stroke-subtle bg-surface-primary p-16 text-center">
        <p className="text-meta font-black uppercase tracking-widest text-foreground-muted">
          Yard performance analytics coming soon.
        </p>
      </div>
    </div>
  );
}
