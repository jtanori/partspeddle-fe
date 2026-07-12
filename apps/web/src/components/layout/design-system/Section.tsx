import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

const spacingMap = {
  sm: 'py-4',
  md: 'py-6',
  lg: 'py-8',
  xl: 'py-9',
};

/**
 * Vertical page section with consistent top/bottom padding.
 */
export function Section({ children, className, spacing = 'md', ...props }: SectionProps) {
  return (
    <section className={cn(spacingMap[spacing], className)} {...props}>
      {children}
    </section>
  );
}
