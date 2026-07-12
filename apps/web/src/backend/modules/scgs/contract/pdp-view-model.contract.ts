import { z } from 'zod';
import type { ReactNode } from 'react';

/**
 * SCGS PDP view-model contract.
 *
 * This is the canonical projection contract for the Product Detail Page.
 * Serializable data is validated by Zod; UI-specific fields (`tabs` with
 * ReactNode) are enforced by TypeScript only.
 */

export const pdpSpecificationItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  unit: z.string().optional(),
  displayOrder: z.number(),
});

export const pdpSpecificationGroupSchema = z.object({
  name: z.string(),
  displayOrder: z.number(),
  specifications: z.array(pdpSpecificationItemSchema),
});

export const pdpHeaderSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  rating: z.number(),
  ratingCount: z.number(),
  sku: z.string(),
});

export const pdpPricingSchema = z.object({
  partPrice: z.number(),
  coreCharge: z.number(),
  isCoreRefundable: z.boolean(),
  shippingEstimate: z.string(),
  totalEstimated: z.number(),
});

export const pdpInventorySchema = z.object({
  quantity: z.number(),
  status: z.string(),
  isInStock: z.boolean(),
});

export const pdpSellerSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  rating: z.number(),
  location: z.string(),
  responseTime: z.string(),
});

export const pdpFitmentVehicleSchema = z.object({
  year: z.number(),
  make: z.string(),
  model: z.string(),
  engine: z.string().optional(),
});

export const pdpFitmentSchema = z.object({
  confidence: z.string(),
  fitmentScore: z.number(),
  vehicles: z.array(pdpFitmentVehicleSchema),
});

export const pdpBadgeSchema = z.object({
  isOEM: z.boolean(),
  isTested: z.boolean(),
  warrantyIncluded: z.boolean(),
  isGoodFit: z.boolean(),
});

export const pdpShippingSchema = z.object({
  isFree: z.boolean(),
  eta: z.string(),
});

export const pdpPartSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
  imageUrl: z.string(),
});

export const pdpDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  price: z.number(),
  condition: z.string(),
  images: z.array(z.string()),
  description: z.string(),
  header: pdpHeaderSchema,
  specifications: z.array(pdpSpecificationGroupSchema),
  pricing: pdpPricingSchema,
  inventory: pdpInventorySchema,
  seller: pdpSellerSchema,
  fitment: pdpFitmentSchema,
  badges: pdpBadgeSchema,
  shipping: pdpShippingSchema,
  crossSell: z.array(pdpPartSummarySchema),
});

export type PDPSpecificationItemModel = z.infer<typeof pdpSpecificationItemSchema>;
export type PDPSpecificationGroupModel = z.infer<typeof pdpSpecificationGroupSchema>;
export type PDPHeaderModel = z.infer<typeof pdpHeaderSchema>;
export type PDPPricingModel = z.infer<typeof pdpPricingSchema>;
export type PDPInventoryModel = z.infer<typeof pdpInventorySchema>;
export type PDPSellerModel = z.infer<typeof pdpSellerSchema>;
export type PDPFitmentVehicleModel = z.infer<typeof pdpFitmentVehicleSchema>;
export type PDPFitmentModel = z.infer<typeof pdpFitmentSchema>;
export type PDPBadgeModel = z.infer<typeof pdpBadgeSchema>;
export type PDPShippingModel = z.infer<typeof pdpShippingSchema>;
export type PDPPartSummaryModel = z.infer<typeof pdpPartSummarySchema>;
export type PDPDataModel = z.infer<typeof pdpDataSchema>;

export interface TabViewModel {
  id: string;
  label: string;
  content: ReactNode;
}

export interface PDPViewModel extends PDPDataModel {
  tabs: TabViewModel[];
}
