'use client';

import { PageHeader } from '@/components/workspace';

export default function SellerCustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="View buyer history, messages, and repeat customers."
      />
      <div className="rounded-xl border border-dashed border-stroke-subtle bg-surface-primary p-16 text-center">
        <p className="text-meta font-black uppercase tracking-widest text-foreground-muted">
          Customer management coming soon.
        </p>
      </div>
    </div>
  );
}
