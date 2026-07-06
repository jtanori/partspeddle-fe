-- Initial schema for PartsPeddle Marketplace

-- 1. Sellers (Yard Registry)
CREATE TABLE sellers (
    id TEXT PRIMARY KEY, -- Using TEXT to accommodate mock IDs like 'seller_ras'
    name VARCHAR(255) NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    location VARCHAR(255),
    specialty VARCHAR(255),
    part_count INT DEFAULT 0,
    feedback_percentage INT DEFAULT 100,
    ships_within VARCHAR(100),
    return_policy VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2. Categories (High-level Systems)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(50), -- Lucide icon string
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. Part Types (Subcategories)
CREATE TABLE part_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, name)
);
-- 4. Listings
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id TEXT REFERENCES sellers(id) ON DELETE CASCADE,
    part_type_id UUID REFERENCES part_types(id) ON DELETE SET NULL,
    
    -- Basic Info
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    tracking_number VARCHAR(100) UNIQUE,
    
    -- Taxonomy (denormalized for faster search/filtering)
    system_name VARCHAR(100),
    category_name VARCHAR(100),
    part_type_name VARCHAR(100),
    
    -- Specs
    oem_part_number VARCHAR(100),
    interchange_part_numbers TEXT[] DEFAULT '{}',
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    condition VARCHAR(50) NOT NULL, -- 'Excellent', 'OEM Original', 'Good', 'Used OEM', 'For Parts'
    mileage INT, -- Store as INT, handle "Unknown" as NULL
    fits TEXT,
    description TEXT,
    notes TEXT,
    images TEXT[] DEFAULT '{}',
    
    -- Fitment & Data
    compatibility JSONB DEFAULT '[]',
    stock_number VARCHAR(100),
    date_removed DATE,
    vin_removed_from VARCHAR(17),
    views INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'sold', 'draft'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Indexes for performance (Best Practices)
CREATE INDEX idx_listings_part_type_id ON listings(part_type_id);
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_condition ON listings(condition);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_featured ON listings(featured) WHERE featured = TRUE;
CREATE INDEX idx_part_types_category_id ON part_types(category_id);
-- Full Text Search Index
-- Using a GIN index on a tsvector of title and description
CREATE INDEX idx_listings_search ON listings USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));
-- Row Level Security (RLS)
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
-- Public read access policies
CREATE POLICY "Allow public read access for sellers" ON sellers FOR SELECT USING (true);
CREATE POLICY "Allow public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access for part_types" ON part_types FOR SELECT USING (true);
CREATE POLICY "Allow public read access for listings" ON listings FOR SELECT USING (true);
