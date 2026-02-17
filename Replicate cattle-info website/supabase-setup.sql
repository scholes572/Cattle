-- Create cattle table
CREATE TABLE IF NOT EXISTS cattle (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tag_number TEXT NOT NULL,
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

-- Allow all operations (for this app)
CREATE POLICY "Allow all" ON cattle FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON milk FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON activity FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);
