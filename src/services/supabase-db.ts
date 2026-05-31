import { supabase } from '../lib/supabase';
import { Part, Seller, SearchFilters, Category } from '../types';

// Helper to map snake_case DB rows to camelCase TS interfaces
const mapPartToPart = (row: any): Part => ({
  id: row.id,
  title: row.title,
  subtitle: `${row.brand || ''} ${row.model || ''} ${row.year || ''}`,
  price: row.price_mxn / 20,
  condition: row.status === 'draft' ? 'Used' : 'Excellent', // Placeholder
  system: 'Powertrain', // Placeholder based on new schema
  sellerId: row.seller_id,
  compatibility: row.compatibility || [],
  images: [], // Needs mapping from part_images table in a real query
  fits: row.compatibility ? JSON.stringify(row.compatibility) : '', // Mapping compatibility to fits for UI compatibility
  description: row.description,
  brand: row.brand,
  model: row.model,
  year: row.year,
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
  searchParts: async (filters: SearchFilters): Promise<Part[]> => {
    let query = supabase
      .from('parts')
      .select('*');

    // Text Search
    if (filters.query.trim()) {
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }

    // Part Types Filter
    if (filters.partTypes.length > 0) {
      query = query.in('title', filters.partTypes); // Simplified mapping
    }

    // Price Range
    query = query.gte('price_mxn', filters.priceRange[0]).lte('price_mxn', filters.priceRange[1]);

    // Fitment Filters
    if (filters.fitmentMake && filters.fitmentMake !== 'All Makes') {
      query = query.contains('compatibility', [{ make: filters.fitmentMake }]);
    }
    if (filters.fitmentModel && filters.fitmentModel !== 'All Models') {
      query = query.contains('compatibility', [{ model: filters.fitmentModel }]);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return (data || []).map(mapPartToPart);
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
