'use client';

import { Plus, Filter, ArrowUpDown, Download } from 'lucide-react';
import { InventoryTable } from '@/components/seller-dashboard/InventoryTable';
import { PageHeader, Toolbar } from '@/components/workspace';
import { Button } from '@/components/ui/button';

export default function SellerInventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Manage parts, track performance, and publish listings."
        primaryAction={{ label: 'Add Part', href: '/seller/create' }}
        secondaryAction={{ label: 'Export', href: '#' }}
      />

      <Toolbar>
        <Button variant="outline" size="sm">
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
          Sort
        </Button>
        <div className="flex-1" />
        <Button variant="default" size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New Listing
        </Button>
      </Toolbar>

      <InventoryTable />
    </div>
  );
}
