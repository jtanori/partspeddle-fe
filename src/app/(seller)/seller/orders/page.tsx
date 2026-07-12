'use client';

import { PageHeader } from '@/components/workspace';

export default function SellerOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Track shipments, manage returns, and communicate with buyers."
      />
      <div className="rounded-xl border border-dashed border-stroke-subtle bg-surface-primary p-16 text-center">
        <p className="text-meta font-black uppercase tracking-widest text-foreground-muted">
          Orders pipeline integration pending.
        </p>
      </div>
    </div>
  );
}
