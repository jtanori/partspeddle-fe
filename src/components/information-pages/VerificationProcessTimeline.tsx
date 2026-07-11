import * as React from 'react';
import { cn } from '@/lib/utils';

interface TimelineStep {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

interface VerificationProcessTimelineProps {
  steps: TimelineStep[];
  heading?: string;
  description?: string;
  className?: string;
}

/**
 * Step-by-step verification workflow.
 * Horizontal on desktop, vertical on mobile.
 */
export function VerificationProcessTimeline({
  steps,
  heading,
  description,
  className,
}: VerificationProcessTimelineProps) {
  return (
    <div className={cn('py-8', className)}>
      {heading && (
        <h2 className="font-display text-section font-bold uppercase tracking-tight text-foreground-primary">
          {heading}
        </h2>
      )}
      {description && (
        <p className="mt-3 max-w-3xl font-sans text-body leading-relaxed text-foreground-secondary">
          {description}
        </p>
      )}

      <div className="relative mt-8">
        {/* Desktop connecting line */}
        <div className="absolute left-0 right-0 top-5 hidden h-0.5 bg-stroke-default md:block" />

        <ol className="relative flex flex-col gap-8 md:flex-row md:gap-6">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex flex-1 md:flex-col md:items-center">
              {/* Mobile connecting line */}
              <div
                className="absolute left-5 top-10 h-full w-0.5 bg-stroke-default last:hidden md:hidden"
                aria-hidden="true"
              />

              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-brand-primary bg-surface-primary text-brand-primary md:mx-auto">
                {step.icon ?? (
                  <span className="font-display text-body font-bold">{index + 1}</span>
                )}
              </div>

              <div className="ml-4 md:ml-0 md:mt-4 md:text-center">
                <h3 className="font-display text-card-title font-bold uppercase tracking-tight text-foreground-primary">
                  {step.title}
                </h3>
                <p className="mt-1 font-sans text-caption leading-relaxed text-foreground-secondary">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
