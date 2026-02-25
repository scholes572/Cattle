-- Create pregnancy records table
CREATE TABLE IF NOT EXISTS pregnancy (
  id TEXT PRIMARY KEY,
  cattle_id TEXT NOT NULL,
  served_date DATE,
  served_breed TEXT,
  expected_birth_date DATE,
  dried_date DATE,
  actual_birth_date DATE,
  calf_gender TEXT,
  calf_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pregnancy ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON pregnancy
  FOR ALL USING (true) WITH CHECK (true);
