-- Add views column to parts table
ALTER TABLE parts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
