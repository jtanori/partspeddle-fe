'use client';

import { PageHeader } from '@/components/workspace';

export default function SellerMessagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Messages" subtitle="Buyer inquiries, offers, and order updates." />
      <div className="rounded-xl border border-dashed border-stroke-subtle bg-surface-primary p-16 text-center">
        <p className="text-meta font-black uppercase tracking-widest text-foreground-muted">
          Messaging center coming soon.
        </p>
      </div>
    </div>
  );
}
