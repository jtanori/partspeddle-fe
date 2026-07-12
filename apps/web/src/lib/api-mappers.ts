import { Part, Seller, PartCondition } from "@/types";

function toCompatibility(
  value: unknown,
): Part["compatibility"] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Part["compatibility"][number] =>
      typeof item === "object" &&
      item !== null &&
      "make" in item &&
      "model" in item &&
      "years" in item &&
      "engine" in item,
  );
}

export const mapPartToPart = (row: Record<string, unknown>): Part => ({
  id: String(row.id || row.objectID || ""),
  trackingNumber:
    typeof row.tracking_number === "string" ? row.tracking_number : "",
  title: String(row.title ?? ""),
  subtitle: String(row.subtitle ?? row.title ?? ""),
  price:
    typeof row.price_mxn === "number"
      ? row.price_mxn / 20
      : typeof row.price === "number"
        ? row.price
        : 0,
  condition: (row.condition as PartCondition) ?? "USED_GOOD",
  system: String(row.system || row.category_label || row.category || "General"),
  category: String(row.category_label || row.category || "General"),
  partType: String(row.part_type_label || row.part_type || "General"),
  oemPartNumber:
    typeof row.oem_part_number === "string" ? row.oem_part_number : "",
  interchangePartNumbers: Array.isArray(row.interchange_part_numbers)
    ? row.interchange_part_numbers.map(String)
    : [],
  weight: row.weight != null ? String(row.weight) : undefined,
  images:
    (row.part_images as { url: string }[] | undefined)?.map((img) => img.url) ||
    (row.image_url ? [String(row.image_url)] : []),
  fits: typeof row.fits === "string" ? row.fits : "",
  description: typeof row.description === "string" ? row.description : "",
  sellerId: typeof row.seller_id === "string" ? row.seller_id : "",
  compatibility: toCompatibility(row.compatibility),
  mileage:
    typeof row.mileage === "number" || typeof row.mileage === "string"
      ? row.mileage
      : 0,
  views: typeof row.views === "number" ? row.views : undefined,
  seller: row.seller_profiles
    ? mapSellerToSeller(row.seller_profiles as Record<string, unknown>)
    : row.seller_name
      ? {
          name: String(row.seller_name),
          rating: ((row.seller_trust_score as number) || 0) / 20 || 5.0,
          reviewCount: 0,
          location: typeof row.location === "string" ? row.location : "N/A",
        }
      : undefined,
});

export const mapSellerToSeller = (row: Record<string, unknown>): Seller => ({
  id: String(row.id ?? ""),
  name: String(row.business_name ?? ""),
  businessName: String(row.business_name ?? ""),
  logoUrl: (row.users as { avatar_url?: string } | undefined)?.avatar_url,
  rating: row.rating ? parseFloat(String(row.rating)) : 5.0,
  reviewCount: (row.review_count as number) || 0,
  location: String(row.location ?? ""),
  specialty: typeof row.specialty === "string" ? row.specialty : undefined,
  partCount: (row.part_count as number) || 0,
  feedbackPercentage: (row.feedback_percentage as number) || 100,
  shipsWithin: (row.ships_within as string) || "24h",
  returnPolicy: (row.return_policy as string) || "Standard",
});