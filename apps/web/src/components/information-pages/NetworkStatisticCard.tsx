import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface NetworkStatisticCardProps {
  metric: string;
  description: string;
  className?: string;
}

/**
 * Large metric highlight for network and trust pages.
 */
export function NetworkStatisticCard({ metric, description, className }: NetworkStatisticCardProps) {
  return (
    <Card className={cn('p-5 text-center', className)}>
      <p className="font-display text-4xl font-black uppercase tracking-tight text-brand-primary">
        {metric}
      </p>
      <p className="mt-2 font-sans text-caption text-foreground-secondary">{description}</p>
    </Card>
  );
}
