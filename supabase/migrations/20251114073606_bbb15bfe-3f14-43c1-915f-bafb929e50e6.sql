-- Create storage bucket for wallpapers
INSERT INTO storage.buckets (id, name, public)
VALUES ('wallpapers', 'wallpapers', true);

-- Storage policies for wallpapers bucket
CREATE POLICY "Public can view wallpapers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wallpapers');

CREATE POLICY "Admins can upload wallpapers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wallpapers' 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update wallpapers"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'wallpapers'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete wallpapers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'wallpapers'
    AND public.has_role(auth.uid(), 'admin')
  );