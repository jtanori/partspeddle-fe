import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompatibleVehicle {
  year: number;
  make: string;
  model: string;
  trim?: string;
  engine?: string;
}

interface VehicleLineageProps extends React.HTMLAttributes<HTMLDivElement> {
  vehicles: CompatibleVehicle[];
  totalCount?: number;
  onViewAll?: () => void;
}

/**
 * Fitment callout showing compatible vehicles.
 */
export function VehicleLineage({
  vehicles,
  totalCount,
  onViewAll,
  className,
  ...props
}: VehicleLineageProps) {
  const displayCount = totalCount ?? vehicles.length;

  return (
    <div className={cn('space-y-4', className)} {...props}>
      <div className="flex items-center gap-2 text-status-success">
        <Check className="h-5 w-5" />
        <span className="text-caption font-black uppercase tracking-tight">Fits your vehicle</span>
      </div>

      <ul className="space-y-2">
        {vehicles.slice(0, 5).map((vehicle, idx) => (
          <li key={idx} className="text-body text-foreground-secondary">
            {vehicle.year} {vehicle.make} {vehicle.model}
            {vehicle.trim && ` ${vehicle.trim}`}
            {vehicle.engine && ` · ${vehicle.engine}`}
          </li>
        ))}
      </ul>

      {displayCount > vehicles.length && onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-caption font-bold text-brand-primary hover:underline"
        >
          View all {displayCount} compatible vehicles
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
