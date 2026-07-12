import { cn } from '@/lib/utils';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  as?: React.ElementType;
}

/**
 * Vertical flex stack with a gap from the design-system spacing scale.
 */
export function Stack({
  children,
  className,
  gap = '4',
  as: Component = 'div',
  ...props
}: StackProps) {
  return (
    <Component className={cn('flex flex-col', `gap-${gap}`, className)} {...props}>
      {children}
    </Component>
  );
}
