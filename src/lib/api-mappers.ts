import { Part, Seller, PartCondition } from "@/types";

export const mapPartToPart = (row: Record<string, unknown>): Part => ({
  id: (row.id || row.objectID) as string,
  trackingNumber: row.tracking_number as string | undefined,
  title: row.title as string,
  subtitle: row.subtitle as string | undefined,
  price: row.price_mxn
    ? (row.price_mxn as number) / 20
    : (row.price as number | undefined),
  condition: row.condition as PartCondition,
  system: (row.system || row.category_label || row.category) as string,
  category: (row.category_label || row.category) as string,
  partType: (row.part_type_label || row.part_type) as string,
  oemPartNumber: row.oem_part_number as string | undefined,
  interchangePartNumbers: row.interchange_part_numbers as string[] | undefined,
  weight: row.weight as number | undefined,
  images:
    (row.part_images as { url: string }[] | undefined)?.map((img) => img.url) ||
    (row.image_url ? [row.image_url as string] : []),
  fits: row.fits as string | undefined,
  description: row.description as string | undefined,
  sellerId: row.seller_id as string | undefined,
  compatibility: (row.compatibility as string[]) || [],
  mileage: (row.mileage as number) || 0,
  views: row.views as number | undefined,
  seller: row.seller_profiles
    ? mapSellerToSeller(row.seller_profiles as Record<string, unknown>)
    : row.seller_name
      ? ({
          name: row.seller_name as string,
          rating: ((row.seller_trust_score as number) || 0) / 20 || 5.0,
          reviewCount: 0,
          location: (row.location as string) || "N/A",
        } as Seller)
      : undefined,
});

export const mapSellerToSeller = (row: Record<string, unknown>): Seller => ({
  id: row.id as string,
  name: row.business_name as string,
  businessName: row.business_name as string,
  logoUrl: (row.users as { avatar_url?: string } | undefined)?.avatar_url,
  rating: row.rating ? parseFloat(String(row.rating)) : 5.0,
  reviewCount: (row.review_count as number) || 0,
  location: row.location as string,
  specialty: row.specialty as string,
  partCount: (row.part_count as number) || 0,
  feedbackPercentage: (row.feedback_percentage as number) || 100,
  shipsWithin: (row.ships_within as string) || "24h",
  returnPolicy: (row.return_policy as string) || "Standard",
});