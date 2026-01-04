-- Create tracked websites table
CREATE TABLE public.tracked_websites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hostname TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page views table for analytics events
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID REFERENCES public.tracked_websites(id) ON DELETE CASCADE,
  hostname TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '/',
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  device_type TEXT,
  browser TEXT,
  session_id TEXT,
  visitor_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_page_views_website_id ON public.page_views(website_id);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_hostname ON public.page_views(hostname);
CREATE INDEX idx_page_views_path ON public.page_views(path);

-- Enable Row Level Security
ALTER TABLE public.tracked_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- For this analytics tool, we allow public read for dashboard
-- and public insert for the tracking script
CREATE POLICY "Allow public read on tracked_websites" 
ON public.tracked_websites 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on tracked_websites" 
ON public.tracked_websites 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public delete on tracked_websites" 
ON public.tracked_websites 
FOR DELETE 
USING (true);

CREATE POLICY "Allow public read on page_views" 
ON public.page_views 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on page_views" 
ON public.page_views 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for live visitors feature
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_views;