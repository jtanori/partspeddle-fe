'use client';

import { SettingsForm } from '@/components/seller-dashboard/SettingsForm';
import { PageHeader } from '@/components/workspace';

export default function SellerSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your yard profile, notifications, and preferences."
      />
      <SettingsForm />
    </div>
  );
}
