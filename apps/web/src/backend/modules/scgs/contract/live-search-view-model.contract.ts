import { z } from 'zod';

export const liveSearchIntentSchema = z.object({
  type: z.enum(['PART_NAME', 'VIN', 'OEM_PART_NUMBER', 'YMM']),
  raw: z.string(),
  entities: z.object({
    vin: z.string().optional(),
    oemPartNumber: z.string().optional(),
    vehicle: z
      .object({
        year: z.number().optional(),
        make: z.string().optional(),
        model: z.string().optional(),
      })
      .optional(),
    partName: z.string().optional(),
  }),
});

export const liveSearchSuggestionSchema = z.object({
  id: z.string(),
  type: z.enum(['product', 'vehicle', 'taxonomy', 'manufacturer', 'recent']),
  title: z.string(),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  href: z.string().optional(),
  meta: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export const liveSearchGroupSchema = z.object({
  key: z.string(),
  label: z.string(),
  suggestions: z.array(liveSearchSuggestionSchema),
});

export const liveSearchMetaSchema = z.object({
  query: z.string(),
  queryMs: z.number().optional(),
  compilerVersion: z.string().optional(),
  generatedAt: z.string().datetime().optional(),
});

export const liveSearchViewModelSchema = z.object({
  intent: liveSearchIntentSchema,
  groups: z.array(liveSearchGroupSchema),
  meta: liveSearchMetaSchema,
});

export type LiveSearchIntentModel = z.infer<typeof liveSearchIntentSchema>;
export type LiveSearchSuggestionModel = z.infer<typeof liveSearchSuggestionSchema>;
export type LiveSearchGroupModel = z.infer<typeof liveSearchGroupSchema>;
export type LiveSearchMetaModel = z.infer<typeof liveSearchMetaSchema>;
export type LiveSearchViewModel = z.infer<typeof liveSearchViewModelSchema>;
