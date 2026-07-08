import React from 'react';
import { DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { DraftPricing as DraftPricingType, PartCondition } from '@/domain/types/listing-draft';

const CONDITIONS: { value: PartCondition; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'REMANUFACTURED', label: 'Remanufactured' },
  { value: 'USED_EXCELLENT', label: 'Used — Excellent' },
  { value: 'USED_GOOD', label: 'Used — Good' },
  { value: 'USED_FAIR', label: 'Used — Fair' },
  { value: 'FOR_PARTS', label: 'For Parts' },
];

interface DraftPricingProps {
  value: DraftPricingType;
  onChange: (value: Partial<DraftPricingType>) => void;
}

export function DraftPricing({ value, onChange }: DraftPricingProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-stroke-subtle pb-3">
        <DollarSign className="h-4 w-4 text-brand-primary" />
        <h2 className="font-display text-meta font-black uppercase tracking-[0.2em] text-foreground-primary">
          Pricing
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Price (MXN) *
          </Label>
          <Input
            id="price"
            type="number"
            min={0}
            value={value.priceMXN || ''}
            onChange={(e) => onChange({ priceMXN: parseInt(e.target.value, 10) || 0 })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Condition *
          </Label>
          <select
            id="condition"
            value={value.condition}
            onChange={(e) => onChange({ condition: e.target.value as PartCondition })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
