import { supabase } from '../lib/supabase';
import { Part, Seller, SearchFilters, Category } from '../types';

// Helper to map snake_case DB rows to camelCase TS interfaces
const mapListingToPart = (row: any): Part => ({
  id: row.id,
  trackingNumber: row.tracking_number,
  title: row.title,
  subtitle: row.subtitle,
  system: row.system_name,
  category: row.category_name,
  partType: row.part_type_name,
  oemPartNumber: row.oem_part_number,
  interchangePartNumbers: row.interchange_part_numbers || [],
  price: parseFloat(row.price),
  originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
  condition: row.condition,
  mileage: row.mileage ?? 'Unknown',
  fits: row.fits,
  description: row.description,
  notes: row.notes,
  images: row.images || [],
  sellerId: row.seller_id,
  compatibility: row.compatibility || [],
  stockNumber: row.stock_number,
  dateRemoved: row.date_removed,
  vinRemovedFrom: row.vin_removed_from,
  views: row.views,
  featured: row.featured,
});

const mapSellerToSeller = (row: any): Seller => ({
  id: row.id,
  name: row.name,
  rating: parseFloat(row.rating),
  reviewCount: row.review_count,
  location: row.location,
  specialty: row.specialty,
  partCount: row.part_count,
  feedbackPercentage: row.feedback_percentage,
  shipsWithin: row.ships_within,
  returnPolicy: row.return_policy,
});

export const supabaseDb = {
  // Fetch all categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  // Fetch all part types for a category
  getPartTypes: async (categoryId: string) => {
    const { data, error } = await supabase
      .from('part_types')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');
    if (error) throw error;
    return data;
  },

  // Centralized Search & Filter Logic (Replacing algoliaMock)
  searchListings: async (filters: SearchFilters): Promise<Part[]> => {
    let query = supabase
      .from('listings')
      .select('*');

    // Text Search
    if (filters.query.trim()) {
      // Using the GIN index for full text search if possible, 
      // or simple ilike for basic title/description matching
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,oem_part_number.ilike.%${filters.query}%`);
    }

    // System/Category Filter
    if (filters.system && !['All Parts', 'All Systems'].includes(filters.system)) {
      query = query.eq('system_name', filters.system);
    }
    if (filters.category && !['All Parts', 'All Categories'].includes(filters.category)) {
      query = query.eq('category_name', filters.category);
    }

    // Part Types Filter
    if (filters.partTypes.length > 0) {
      query = query.in('part_type_name', filters.partTypes);
    }

    // Price Range
    query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);

    // Conditions
    if (filters.conditions.length > 0) {
      query = query.in('condition', filters.conditions);
    }

    // Featured
    if (filters.featured) {
      query = query.eq('featured', true);
    }

    // Trusted Sellers
    if (filters.sellerType === 'trusted') {
      const trustedIds = ['seller_ras', 'seller_mas', 'seller_bpc'];
      query = query.in('seller_id', trustedIds);
    }

    // Fitment Filters (Make, Model, Year, Engine)
    // Since compatibility is JSONB, we can use JSON path queries
    if (filters.fitmentMake && filters.fitmentMake !== 'All Makes') {
      query = query.contains('compatibility', [{ make: filters.fitmentMake }]);
    }
    if (filters.fitmentModel && filters.fitmentModel !== 'All Models') {
      query = query.contains('compatibility', [{ model: filters.fitmentModel }]);
    }
    // Note: Year and Engine filtering on JSONB arrays can be complex in PostgREST 
    // without custom RPCs or complex filters. For a prototype, we'll focus on Make/Model.

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return (data || []).map(mapListingToPart);
  },

  // Fetch single part by ID
  getPartById: async (id: string): Promise<Part | null> => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return mapListingToPart(data);
  },

  // Fetch seller profile
  getSellerById: async (id: string): Promise<Seller | null> => {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return mapSellerToSeller(data);
  }
};
