import React from 'react';
import { Truck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { DraftShipping as DraftShippingType } from '@/domain/types/listing-draft';

interface DraftShippingProps {
  value: DraftShippingType;
  onChange: (value: Partial<DraftShippingType>) => void;
}

export function DraftShipping({ value, onChange }: DraftShippingProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-stroke-subtle pb-3">
        <Truck className="h-4 w-4 text-brand-primary" />
        <h2 className="font-display text-meta font-black uppercase tracking-[0.2em] text-foreground-primary">
          Shipping
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="shippingMethod" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Shipping Method
          </Label>
          <Input
            id="shippingMethod"
            value={value.method}
            onChange={(e) => onChange({ method: e.target.value })}
            placeholder="e.g., Freight, Local pickup"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shippingCost" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Cost Estimate (MXN)
          </Label>
          <Input
            id="shippingCost"
            type="number"
            min={0}
            value={value.costEstimateMXN ?? ''}
            onChange={(e) =>
              onChange({
                costEstimateMXN: e.target.value === '' ? null : parseInt(e.target.value, 10),
              })
            }
            placeholder="Optional"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="shippingNotes" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Notes
          </Label>
          <Textarea
            id="shippingNotes"
            rows={3}
            value={value.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Dimensions, weight, handling instructions..."
          />
        </div>
      </div>
    </div>
  );
}
