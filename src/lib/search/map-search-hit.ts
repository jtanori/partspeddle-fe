import { Part, PartCondition, Seller } from "@/types";

export interface MappedSearchHit extends Part {
  categorySlug?: string;
  partTypeSlug?: string;
}

export function mapAlgoliaHitToPart(hit: Record<string, unknown>): MappedSearchHit {
  const price =
    typeof hit.price === "number"
      ? hit.price
      : typeof hit.price_mxn === "number"
        ? hit.price_mxn / 20
        : 0;

  const categorySlug =
    typeof hit.category === "string" ? hit.category : undefined;
  const partTypeSlug =
    typeof hit.part_type === "string" ? hit.part_type : undefined;
  const categoryLabel =
    typeof hit.category_label === "string" ? hit.category_label : categorySlug;
  const partTypeLabel =
    typeof hit.part_type_label === "string" ? hit.part_type_label : partTypeSlug;

  const seller: Seller | undefined = hit.seller_name
    ? {
        name: String(hit.seller_name),
        businessName: String(hit.seller_name),
        rating:
          typeof hit.seller_trust_score === "number"
            ? hit.seller_trust_score / 20
            : 5,
        reviewCount: 0,
        location: typeof hit.location === "string" ? hit.location : "N/A",
      }
    : undefined;

  const fitmentSummary = [hit.year, hit.make, hit.model]
    .filter(Boolean)
    .join(" ");

  return {
    id: String(hit.objectID ?? hit.id ?? ""),
    trackingNumber:
      typeof hit.stock_number === "string"
        ? hit.stock_number
        : typeof hit.tracking_number === "string"
          ? hit.tracking_number
          : "",
    title: String(hit.title ?? ""),
    subtitle: String(hit.subtitle ?? fitmentSummary),
    price,
    condition: (hit.condition as PartCondition) ?? "USED_GOOD",
    system:
      typeof hit.system === "string"
        ? hit.system
        : categoryLabel || "General",
    category: categoryLabel || "General",
    partType: partTypeLabel || "General",
    categorySlug,
    partTypeSlug,
    oemPartNumber:
      typeof hit.oem_part_number === "string" ? hit.oem_part_number : "",
    interchangePartNumbers: Array.isArray(hit.interchange_part_numbers)
      ? hit.interchange_part_numbers.map(String)
      : [],
    images: hit.image_url ? [String(hit.image_url)] : [],
    fits: typeof hit.fits === "string" ? hit.fits : "",
    description: typeof hit.description === "string" ? hit.description : "",
    sellerId: typeof hit.seller_id === "string" ? hit.seller_id : "",
    compatibility: [],
    mileage: typeof hit.mileage === "number" ? hit.mileage : 0,
    seller,
  };
}