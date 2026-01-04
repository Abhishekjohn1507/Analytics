-- Add user_id column to tracked_websites table
ALTER TABLE public.tracked_websites 
ADD COLUMN user_id text NOT NULL DEFAULT '';

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Allow public delete on tracked_websites" ON public.tracked_websites;
DROP POLICY IF EXISTS "Allow public insert on tracked_websites" ON public.tracked_websites;
DROP POLICY IF EXISTS "Allow public read on tracked_websites" ON public.tracked_websites;

-- Create new RLS policies that restrict access based on user_id
CREATE POLICY "Users can view their own websites" 
ON public.tracked_websites 
FOR SELECT 
USING (user_id = current_setting('request.headers', true)::json->>'x-user-id' OR user_id = '');

CREATE POLICY "Users can insert their own websites" 
ON public.tracked_websites 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can delete their own websites" 
ON public.tracked_websites 
FOR DELETE 
USING (user_id = current_setting('request.headers', true)::json->>'x-user-id' OR user_id = '');