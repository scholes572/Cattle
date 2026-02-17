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
