import { supabase } from "../lib/supabase";
import { Part, Seller, SearchFilters, Category, PartCondition } from "../types";

// Helper to map snake_case DB rows to camelCase TS interfaces
const mapPartToPart = (row: any): Part => ({
  id: row.id || row.objectID,
  trackingNumber: row.tracking_number,
  title: row.title,
  subtitle: row.subtitle,
  price: row.price_mxn ? row.price_mxn / 20 : row.price,
  condition: row.condition as PartCondition,
  system: row.system,
  category: row.category,
  partType: row.part_type,
  oemPartNumber: row.oem_part_number,
  interchangePartNumbers: row.interchange_part_numbers,
  weight: row.weight,
  images:
    row.part_images?.map((img: any) => img.url) ||
    (row.image_url ? [row.image_url] : []),
  fits: row.fits,
  description: row.description,
  sellerId: row.seller_id,
  compatibility: row.compatibility || [],
  mileage: row.mileage || 0,
  views: row.views,
  seller: row.seller_profiles
    ? mapSellerToSeller(row.seller_profiles)
    : row.seller_name
      ? ({
          name: row.seller_name,
          rating: row.seller_trust_score / 20 || 5.0,
          reviewCount: 0,
          location: row.location || "N/A",
        } as Seller)
      : undefined,
});

const mapSellerToSeller = (row: any): Seller => ({
  id: row.id,
  name: row.business_name,
  businessName: row.business_name,
  logoUrl: row.users?.avatar_url,
  rating: row.rating ? parseFloat(row.rating) : 5.0,
  reviewCount: row.review_count || 0,
  location: row.location,
  specialty: row.specialty,
  partCount: row.part_count || 0,
  feedbackPercentage: row.feedback_percentage || 100,
  shipsWithin: row.ships_within || "24h",
  returnPolicy: row.return_policy || "Standard",
});

export const supabaseDb = {
  // Fetch all categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  },

  // Fetch all part types for a category
  getPartTypes: async (categoryId: string) => {
    const { data, error } = await supabase
      .from("part_types")
      .select("*")
      .eq("category_id", categoryId)
      .order("name");
    if (error) throw error;
    return data;
  },

  // Centralized Search & Filter Logic
  searchParts: async (
    filters: SearchFilters,
    baseUrl: string = "",
  ): Promise<{
    hits: Part[];
    rawHits?: any[];
    facets: Record<string, any>;
    page: number;
    totalPages: number;
    totalHits: number;
  }> => {
    const response = await fetch(`${baseUrl}/api/search/parts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to search parts");
    }
    const data = await response.json();
    // Assuming API returns { hits: any[], facets: any, page: number, totalPages: number, totalHits: number }
    return {
      hits: (data.hits || []).map(mapPartToPart),
      rawHits: data.hits || [],
      facets: data.facets || {},
      page: data.page || 0,
      totalPages: data.totalPages || 1,
      totalHits: data.totalHits || 0,
    };
  },

  getFeaturedParts: async (
    limit: number = 4,
    baseUrl: string = "",
  ): Promise<Part[]> => {
    const response = await fetch(
      `${baseUrl}/api/parts/featured?limit=${limit}`,
    );
    if (!response.ok) throw new Error("Failed to fetch featured parts");
    const data = await response.json();
    return (data || []).map(mapPartToPart);
  },

  getTopSellers: async (limit: number = 4, baseUrl: string = "") => {
    const response = await fetch(`${baseUrl}/api/sellers/top?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch top sellers");
    const data = await response.json();
    return (data || []).map(mapSellerToSeller);
  },

  // Fetch single part by ID
  getPartById: async (id: string): Promise<Part | null> => {
    const { data, error } = await supabase
      .from("parts")
      .select(
        "id, title, price_mxn, part_images(url), description, created_at, status",
      )
      .eq("id", id)
      .single();

    if (error) return null;
    return mapPartToPart(data);
  },

  // Fetch seller profile
  getSellerById: async (id: string): Promise<Seller | null> => {
    const { data, error } = await supabase
      .from("seller_profiles")
      .select(
        "id, business_name, location, specialty, logo_url, verification_status",
      )
      .eq("id", id)
      .single();

    if (error) return null;
    return mapSellerToSeller(data);
  },
};
