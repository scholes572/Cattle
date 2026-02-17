-- Create cattle table
CREATE TABLE IF NOT EXISTS cattle (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tag_number TEXT,
  name TEXT,
  breed TEXT,
  gender TEXT,
  date_of_birth TEXT,
  weight REAL,
  color TEXT,
  status TEXT DEFAULT 'active',
  sire TEXT,
  dam TEXT,
  notes TEXT,
  image_url TEXT,
  image_path TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create milk table
CREATE TABLE IF NOT EXISTS milk (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  cattle_id TEXT NOT NULL,
  cattle_name TEXT,
  cattle_tag_number TEXT,
  date TEXT NOT NULL,
  morning_liters REAL DEFAULT 0,
  evening_liters REAL DEFAULT 0,
  total_liters REAL DEFAULT 0,
  notes TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity table
CREATE TABLE IF NOT EXISTS activity (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  username TEXT,
  action TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default users
INSERT INTO users (username, password, role) VALUES 
  ('lovega', 'lovega123', 'admin'),
  ('lazarus', 'lazarus123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Enable RLS
ALTER TABLE cattle ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow all users to see and edit all data (for shared access)
DROP POLICY IF EXISTS "Allow all" ON cattle;
DROP POLICY IF EXISTS "Allow all" ON milk;
DROP POLICY IF EXISTS "Allow all" ON activity;

CREATE POLICY "Allow all for cattle" ON cattle FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for milk" ON milk FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for activity" ON activity FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for cattle images (ignore if exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cattle-images', 'cattle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING ( bucket_id = 'cattle-images' );

-- Allow any user to upload images
DROP POLICY IF EXISTS "Allow All Uploads" ON storage.objects;
CREATE POLICY "Allow All Uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK ( bucket_id = 'cattle-images' );

-- Allow any user to update images
DROP POLICY IF EXISTS "Allow All Updates" ON storage.objects;
CREATE POLICY "Allow All Updates" 
ON storage.objects 
FOR UPDATE 
USING ( bucket_id = 'cattle-images' );

-- Allow any user to delete images
DROP POLICY IF EXISTS "Allow All Deletes" ON storage.objects;
CREATE POLICY "Allow All Deletes" 
ON storage.objects 
FOR DELETE 
USING ( bucket_id = 'cattle-images' );
