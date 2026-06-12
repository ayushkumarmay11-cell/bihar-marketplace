-- ============================================================
-- BIHAR MARKETPLACE — SUPABASE SQL SCHEMA
-- Run this in the Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE
-- Extends Supabase's built-in auth.users table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  district    TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read profiles (needed to show seller info)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- ============================================================
-- 2. ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  price       NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  category    TEXT NOT NULL CHECK (category IN (
    'Electronics', 'Furniture', 'Vehicles', 'Books',
    'Clothes', 'Agricultural Tools', 'Other'
  )),
  condition   TEXT NOT NULL CHECK (condition IN (
    'Like New', 'Good', 'Fair', 'Old'
  )),
  images      TEXT[] DEFAULT '{}',
  location    TEXT NOT NULL,
  seller_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_sold     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Anyone can view items
CREATE POLICY "Items are viewable by everyone"
  ON public.items FOR SELECT USING (true);

-- Only logged-in users can insert items
CREATE POLICY "Authenticated users can insert items"
  ON public.items FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Only the owner can update or delete their items
CREATE POLICY "Owners can update their items"
  ON public.items FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Owners can delete their items"
  ON public.items FOR DELETE
  USING (auth.uid() = seller_id);

-- Auto-update the updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 3. INDEXES (for query performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_location ON public.items(location);
CREATE INDEX IF NOT EXISTS idx_items_seller_id ON public.items(seller_id);
CREATE INDEX IF NOT EXISTS idx_items_is_sold ON public.items(is_sold);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC);


-- ============================================================
-- 4. SUPABASE STORAGE BUCKET
-- Run this separately or create manually in the dashboard:
-- Storage > New Bucket > Name: "item-images" > Public: ON
-- ============================================================

-- Create the storage bucket (if using SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'item-images' AND auth.role() = 'authenticated');

-- Allow anyone to view images
CREATE POLICY "Anyone can view item images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-images');

-- Allow owners to delete their own images
CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ============================================================
-- 5. SAMPLE DATA (optional — for testing)
-- ============================================================
-- Uncomment below to insert sample data after creating a test user

/*
INSERT INTO public.items (title, description, price, category, condition, location, seller_id)
VALUES (
  'Samsung Galaxy A12 - Good Condition',
  'Used for 1 year. Screen crack-free, battery health 85%. Comes with original charger and box.',
  5500,
  'Electronics',
  'Good',
  'Patna',
  '<YOUR-TEST-USER-UUID>'
);
*/
