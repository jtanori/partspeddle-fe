import defaultListingImg from "@/assets/images/default_listing.png";

export const DEFAULT_PART_IMAGE = defaultListingImg.src;

export function resolvePartImageUrl(
  imageUrl?: string | null,
): string {
  return imageUrl?.trim() ? imageUrl : DEFAULT_PART_IMAGE;
}