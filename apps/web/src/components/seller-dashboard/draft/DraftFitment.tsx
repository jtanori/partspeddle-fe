import React, { useState } from 'react';
import { Car, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DraftFitment as DraftFitmentType, DraftFitmentVehicle } from '@/domain/types/listing-draft';

interface DraftFitmentProps {
  value: DraftFitmentType;
  onChange: (value: Partial<DraftFitmentType>) => void;
}

export function DraftFitment({ value, onChange }: DraftFitmentProps) {
  const [vehicleVariantId, setVehicleVariantId] = useState('');
  const [notes, setNotes] = useState('');

  const addVehicle = () => {
    if (!vehicleVariantId.trim()) return;
    const vehicle: DraftFitmentVehicle = {
      vehicleVariantId: vehicleVariantId.trim(),
      notes: notes.trim(),
    };
    onChange({ vehicles: [...value.vehicles, vehicle] });
    setVehicleVariantId('');
    setNotes('');
  };

  const removeVehicle = (index: number) => {
    const next = [...value.vehicles];
    next.splice(index, 1);
    onChange({ vehicles: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-stroke-subtle pb-3">
        <Car className="h-4 w-4 text-brand-primary" />
        <h2 className="font-display text-meta font-black uppercase tracking-[0.2em] text-foreground-primary">
          Fitment
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vehicleVariantId" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Vehicle Variant ID
          </Label>
          <Input
            id="vehicleVariantId"
            value={vehicleVariantId}
            onChange={(e) => setVehicleVariantId(e.target.value)}
            placeholder="e.g., uuid of make/model/year variant"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fitmentNotes" className="text-caption font-bold uppercase tracking-wider text-foreground-secondary">
            Notes
          </Label>
          <Input
            id="fitmentNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Requires adapter"
          />
        </div>
      </div>

      <Button type="button" size="sm" onClick={addVehicle} disabled={!vehicleVariantId.trim()}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add Fitment
      </Button>

      {value.vehicles.length > 0 && (
        <div className="space-y-2">
          {value.vehicles.map((vehicle, index) => (
            <div
              key={`${vehicle.vehicleVariantId}-${index}`}
              className="flex items-center justify-between rounded-lg border border-stroke-subtle bg-surface-secondary p-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground-primary">{vehicle.vehicleVariantId}</p>
                {vehicle.notes && <p className="text-meta text-foreground-secondary">{vehicle.notes}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeVehicle(index)}
                className="rounded p-1 text-foreground-secondary hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
