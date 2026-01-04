-- Add public sharing columns to tracked_websites
ALTER TABLE public.tracked_websites 
ADD COLUMN IF NOT EXISTS share_token text UNIQUE,
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Create index for share token lookups
CREATE INDEX IF NOT EXISTS idx_tracked_websites_share_token ON public.tracked_websites(share_token) WHERE share_token IS NOT NULL;

-- Allow public read access when share_token matches (for public dashboards)
CREATE POLICY "Allow public read by share_token" 
ON public.tracked_websites 
FOR SELECT 
USING (share_token IS NOT NULL AND is_public = true);

-- Allow public read of page_views for public websites
CREATE POLICY "Allow public read page_views for shared websites" 
ON public.page_views 
FOR SELECT 
USING (
  website_id IN (
    SELECT id FROM public.tracked_websites 
    WHERE is_public = true AND share_token IS NOT NULL
  )
);