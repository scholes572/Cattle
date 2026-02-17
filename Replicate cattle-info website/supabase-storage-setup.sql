-- Create storage bucket for cattle images
INSERT INTO storage.buckets (id, name, public)
VALUES ('cattle-images', 'cattle-images', true);

-- Set up storage policies
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING ( bucket_id = 'cattle-images' );

CREATE POLICY "Authenticated Upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK ( bucket_id = 'cattle-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated Update" 
ON storage.objects 
FOR UPDATE 
USING ( bucket_id = 'cattle-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated Delete" 
ON storage.objects 
FOR DELETE 
USING ( bucket_id = 'cattle-images' AND auth.role() = 'authenticated' );
