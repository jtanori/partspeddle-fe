import React from 'react';
import { CheckCircle2, Circle, Loader2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InspectorPanel } from '@/components/workspace';
import type { DraftCompletion, ListingDraft } from '@/domain/types/listing-draft';

interface DraftInspectorProps {
  draft: ListingDraft | null;
  completion: DraftCompletion;
  onPublish: () => void;
  publishing?: boolean;
}

const MODULE_LABELS: Record<keyof DraftCompletion, string> = {
  identification: 'Identification',
  media: 'Media',
  fitment: 'Fitment',
  pricing: 'Pricing',
  shipping: 'Shipping',
  seo: 'SEO',
  total: 'Total Completion',
};

export function DraftInspector({ draft, completion, onPublish, publishing }: DraftInspectorProps) {
  const moduleOrder: Array<keyof Omit<DraftCompletion, 'total'>> = [
    'identification',
    'media',
    'fitment',
    'pricing',
    'shipping',
    'seo',
  ];

  return (
    <InspectorPanel title="Listing Intelligence">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-meta font-black uppercase tracking-wider text-foreground-muted">
              {MODULE_LABELS.total}
            </span>
            <span className="font-display text-section font-black text-brand-primary">
              {completion.total}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-secondary">
            <div
              className="h-full rounded-full bg-brand-primary transition-all"
              style={{ width: `${completion.total}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {moduleOrder.map((module) => {
            const complete = completion[module] >= 100;
            return (
              <div key={module} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  {complete ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 text-foreground-muted" />
                  )}
                  <span className="text-caption font-medium text-foreground-secondary">
                    {MODULE_LABELS[module]}
                  </span>
                </div>
                <span className="text-meta font-bold text-foreground-primary">
                  {completion[module]}%
                </span>
              </div>
            );
          })}
        </div>

        {(draft?.marketValueEstimate || draft?.suggestedPrice) && (
          <div className="space-y-3 rounded-lg border border-stroke-subtle bg-surface-secondary p-4">
            {draft.marketValueEstimate && (
              <div className="flex items-center justify-between">
                <span className="text-meta text-foreground-secondary">Market Value</span>
                <span className="text-sm font-bold text-foreground-primary">
                  ${draft.marketValueEstimate.toLocaleString()} MXN
                </span>
              </div>
            )}
            {draft.suggestedPrice && (
              <div className="flex items-center justify-between">
                <span className="text-meta text-foreground-secondary">Suggested Price</span>
                <span className="text-sm font-bold text-brand-primary">
                  ${draft.suggestedPrice.toLocaleString()} MXN
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-meta text-foreground-secondary">
            <span>Publishing Status</span>
            <span className="font-bold uppercase tracking-wider text-foreground-primary">
              {draft?.status ?? 'draft'}
            </span>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={onPublish}
          disabled={publishing || completion.total < 50}
        >
          {publishing ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="mr-1.5 h-4 w-4" />
          )}
          Publish Listing
        </Button>

        {completion.total < 50 && (
          <p className="text-meta text-destructive">
            Complete at least 50% of the draft before publishing.
          </p>
        )}
      </div>
    </InspectorPanel>
  );
}
