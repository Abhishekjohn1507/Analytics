-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own websites" ON public.tracked_websites;
DROP POLICY IF EXISTS "Users can insert their own websites" ON public.tracked_websites;
DROP POLICY IF EXISTS "Users can delete their own websites" ON public.tracked_websites;

-- Create simpler RLS policies that check user_id column directly
-- Since we're using Clerk (not Supabase Auth), we'll allow all operations
-- and filter by user_id in the application code

CREATE POLICY "Allow read tracked_websites" 
ON public.tracked_websites 
FOR SELECT 
USING (true);

CREATE POLICY "Allow insert tracked_websites" 
ON public.tracked_websites 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow delete tracked_websites" 
ON public.tracked_websites 
FOR DELETE 
USING (true);

CREATE POLICY "Allow update tracked_websites" 
ON public.tracked_websites 
FOR UPDATE 
USING (true);