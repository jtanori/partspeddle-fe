'use client';

import { PageHeader } from '@/components/workspace';

export default function SellerFinancialPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Financial" subtitle="Payouts, transactions, and tax documents." />
      <div className="rounded-xl border border-dashed border-stroke-subtle bg-surface-primary p-16 text-center">
        <p className="text-meta font-black uppercase tracking-widest text-foreground-muted">
          Financial dashboard coming soon.
        </p>
      </div>
    </div>
  );
}
