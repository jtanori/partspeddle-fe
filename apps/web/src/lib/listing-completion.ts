import type { DraftPayload, DraftCompletion, DraftModule } from '@/domain/types/listing-draft';

const REQUIRED_IDENTIFICATION_FIELDS: Array<keyof DraftPayload['identification']> = [
  'title',
  'category',
  'partType',
  'brand',
  'stockNumber',
];

export function scoreModule(module: DraftModule, payload: DraftPayload): number {
  switch (module) {
    case 'identification': {
      const values = REQUIRED_IDENTIFICATION_FIELDS.map((key) => payload.identification[key]);
      const filled = values.filter((v) => typeof v === 'string' && v.trim().length > 0).length;
      return Math.round((filled / REQUIRED_IDENTIFICATION_FIELDS.length) * 100);
    }

    case 'media': {
      return payload.media.images.length > 0 ? 100 : 0;
    }

    case 'fitment': {
      return payload.fitment.vehicles.length > 0 ? 100 : 0;
    }

    case 'pricing': {
      return payload.pricing.priceMXN > 0 ? 100 : 0;
    }

    case 'shipping': {
      return payload.shipping.method.trim().length > 0 ? 100 : 0;
    }

    case 'seo': {
      return payload.seo.searchableText.trim().length > 0 ? 100 : 0;
    }

    default:
      return 0;
  }
}

export function scoreCompletion(payload: DraftPayload): DraftCompletion {
  const modules: DraftModule[] = ['identification', 'media', 'fitment', 'pricing', 'shipping', 'seo'];
  const scores = modules.reduce(
    (acc, module) => {
      acc[module] = scoreModule(module, payload);
      return acc;
    },
    {} as Record<DraftModule, number>,
  );

  const total = Math.round(modules.reduce((sum, module) => sum + scores[module], 0) / modules.length);

  return {
    identification: scores.identification,
    media: scores.media,
    fitment: scores.fitment,
    pricing: scores.pricing,
    shipping: scores.shipping,
    seo: scores.seo,
    total,
  };
}
