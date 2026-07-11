import React from 'react';
import { Tag, FileText, Box, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { DraftIdentification as DraftIdentificationType } from '@/domain/types/listing-draft';

interface DraftIdentificationProps {
  value: DraftIdentificationType;
  onChange: (value: Partial<DraftIdentificationType>) => void;
}

export function DraftIdentification({ value, onChange }: DraftIdentificationProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-stroke-subtle pb-3">
        <Tag className="h-4 w-4 text-brand-primary" />
        <h2 className="font-display text-meta font-black uppercase tracking-[0.2em] text-foreground-primary">
          Identification
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="title" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Part Title *
          </Label>
          <Input
            id="title"
            value={value.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g., Automatic Transmission Assembly 4R70W"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="system" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            System
          </Label>
          <Input
            id="system"
            value={value.system}
            onChange={(e) => onChange({ system: e.target.value })}
            placeholder="e.g., Powertrain"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Category *
          </Label>
          <Input
            id="category"
            value={value.category}
            onChange={(e) => onChange({ category: e.target.value })}
            placeholder="e.g., Transmission"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="partType" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Part Type
          </Label>
          <Input
            id="partType"
            value={value.partType}
            onChange={(e) => onChange({ partType: e.target.value })}
            placeholder="e.g., Component"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Brand / Make *
          </Label>
          <Input
            id="brand"
            value={value.brand}
            onChange={(e) => onChange({ brand: e.target.value })}
            placeholder="e.g., Ford"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Model
          </Label>
          <Input
            id="model"
            value={value.model}
            onChange={(e) => onChange({ model: e.target.value })}
            placeholder="e.g., F-150"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="oemPartNumber" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            OEM Part Number
          </Label>
          <Input
            id="oemPartNumber"
            value={value.oemPartNumber}
            onChange={(e) => onChange({ oemPartNumber: e.target.value })}
            placeholder="e.g., F4TP-7000-A"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stockNumber" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Yard Stock Number *
          </Label>
          <Input
            id="stockNumber"
            value={value.stockNumber}
            onChange={(e) => onChange({ stockNumber: e.target.value })}
            placeholder="e.g., STK-1994-F150-002"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Description
          </Label>
          <Textarea
            id="description"
            rows={4}
            value={value.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Salvage condition log, notes, or selling points..."
          />
        </div>
      </div>
    </div>
  );
}
