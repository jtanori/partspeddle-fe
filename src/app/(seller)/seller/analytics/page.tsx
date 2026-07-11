'use client';

import { PageHeader } from '@/components/workspace';

export default function SellerAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Yard performance, views, conversions, and revenue trends."
      />
      <div className="rounded-xl border border-dashed border-stroke-subtle bg-surface-primary p-16 text-center">
        <p className="text-meta font-black uppercase tracking-widest text-foreground-muted">
          Analytics dashboard coming soon.
        </p>
      </div>
    </div>
  );
}
