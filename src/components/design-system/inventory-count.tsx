import Badge from '@/components/ui/badge';

interface InventoryCountProps extends React.HTMLAttributes<HTMLSpanElement> {
  quantity?: number;
  isAvailable?: boolean;
  lowStockThreshold?: number;
}

/**
 * Stock status indicator rendered as a Badge.
 */
export function InventoryCount({
  quantity,
  isAvailable = true,
  lowStockThreshold = 5,
  ...props
}: InventoryCountProps) {
  if (!isAvailable || quantity === 0) {
    return (
      <Badge variant="danger" {...props}>
        Out of stock
      </Badge>
    );
  }

  if (quantity !== undefined && quantity <= lowStockThreshold) {
    return (
      <Badge variant="warning" {...props}>
        Only {quantity} left
      </Badge>
    );
  }

  return (
    <Badge variant="success" {...props}>
      In stock
    </Badge>
  );
}
