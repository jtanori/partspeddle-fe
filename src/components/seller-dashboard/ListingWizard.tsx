import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { useListingDraft } from '@/hooks/useListingDraft';
import { scoreCompletion } from '@/lib/listing-completion';
import { DraftIdentification } from './draft/DraftIdentification';
import { DraftMedia } from './draft/DraftMedia';
import { DraftFitment } from './draft/DraftFitment';
import { DraftPricing } from './draft/DraftPricing';
import { DraftShipping } from './draft/DraftShipping';
import { DraftSEO } from './draft/DraftSEO';
import { DraftInspector } from './draft/DraftInspector';
import type { DraftModule, DraftPayload } from '@/domain/types/listing-draft';

interface ListingWizardProps {
  onClose: () => void;
}

const MODULE_TABS: { value: DraftModule; label: string }[] = [
  { value: 'identification', label: 'Identification' },
  { value: 'media', label: 'Media' },
  { value: 'fitment', label: 'Fitment' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'seo', label: 'SEO' },
];

export function ListingWizard({ onClose }: ListingWizardProps) {
  const { draft, loading, saveStatus, updateModule, updateMarketSignals, publish } = useListingDraft();
  const [activeModule, setActiveModule] = useState<DraftModule>('identification');
  const [publishing, setPublishing] = useState(false);

  const payload: DraftPayload = draft?.payload ?? {
    identification: {
      title: '',
      description: '',
      system: '',
      category: '',
      partType: '',
      brand: '',
      model: '',
      oemPartNumber: '',
      stockNumber: '',
    },
    media: { images: [], mode: 'component', aiData: null },
    fitment: { vehicles: [] },
    pricing: { priceMXN: 0, condition: 'USED_GOOD' },
    shipping: { method: '', costEstimateMXN: null, notes: '' },
    seo: { searchableText: '', tags: [] },
    aiData: null,
  };

  const completion = scoreCompletion(payload);

  const handleAIResult = (result: Record<string, unknown>) => {
    updateModule('identification', {
      title: typeof result.title === 'string' ? result.title : payload.identification.title,
      description: typeof result.description === 'string' ? result.description : payload.identification.description,
      system: typeof result.system === 'string' ? result.system : payload.identification.system,
      category: typeof result.category === 'string' ? result.category : payload.identification.category,
      partType: typeof result.partType === 'string' ? result.partType : payload.identification.partType,
      brand: typeof result.brand === 'string' ? result.brand : payload.identification.brand,
      model: typeof result.model === 'string' ? result.model : payload.identification.model,
      oemPartNumber: typeof result.oemPartNumber === 'string' ? result.oemPartNumber : payload.identification.oemPartNumber,
    });

    updateModule('media', {
      aiData: result as Record<string, unknown>,
    });

    // Derive rough market signals from AI confidence if present.
    const confidence = (result.confidenceScores as Record<string, number> | undefined)?.partTypeAccuracy;
    if (typeof confidence === 'number') {
      const base = payload.pricing.priceMXN || 1000;
      updateMarketSignals({
        marketValueEstimate: Math.round(base * (1 + confidence)),
        suggestedPrice: Math.round(base * (1 + confidence * 0.9)),
      });
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publish();
      onClose();
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setPublishing(false);
    }
  };

  const saveLabel =
    saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'saved'
        ? 'Saved'
        : saveStatus === 'error'
          ? 'Save failed'
          : null;

  const inspector = draft ? (
    <DraftInspector
      draft={draft}
      completion={completion}
      onPublish={handlePublish}
      publishing={publishing}
    />
  ) : null;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <div className="sticky top-0 z-10 -mx-4 bg-surface-secondary px-4 py-3 sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={onClose}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Inventory
            </Button>
            {saveLabel && (
              <span
                className={`text-meta font-bold uppercase tracking-wider ${
                  saveStatus === 'error' ? 'text-destructive' : 'text-foreground-muted'
                }`}
              >
                {saveLabel}
              </span>
            )}
          </div>
        </div>

        <Tabs
          value={activeModule}
          onChange={(v) => setActiveModule(v as DraftModule)}
          tabs={MODULE_TABS.map((tab) => ({
            id: tab.value,
            label: tab.label,
            content: (
              <div className="rounded-xl border border-stroke-subtle bg-surface-primary p-5 sm:p-6">
                {tab.value === 'identification' && (
                  <DraftIdentification
                    value={payload.identification}
                    onChange={(partial) => updateModule('identification', partial)}
                  />
                )}
                {tab.value === 'media' && (
                  <DraftMedia
                    value={payload.media}
                    onChange={(partial) => updateModule('media', partial)}
                    onAIResult={handleAIResult}
                  />
                )}
                {tab.value === 'fitment' && (
                  <DraftFitment value={payload.fitment} onChange={(partial) => updateModule('fitment', partial)} />
                )}
                {tab.value === 'pricing' && (
                  <DraftPricing value={payload.pricing} onChange={(partial) => updateModule('pricing', partial)} />
                )}
                {tab.value === 'shipping' && (
                  <DraftShipping value={payload.shipping} onChange={(partial) => updateModule('shipping', partial)} />
                )}
                {tab.value === 'seo' && (
                  <DraftSEO value={payload.seo} onChange={(partial) => updateModule('seo', partial)} />
                )}
              </div>
            ),
          }))}
        />
      </div>

      <div className="hidden shrink-0 lg:block">
        {inspector}
      </div>
    </div>
  );
}
