-- Drop the existing unique constraint on hostname alone
ALTER TABLE public.tracked_websites DROP CONSTRAINT IF EXISTS tracked_websites_hostname_key;

-- Create a new unique constraint on hostname + user_id combination
-- This allows different users to track the same website
ALTER TABLE public.tracked_websites ADD CONSTRAINT tracked_websites_hostname_user_id_key UNIQUE (hostname, user_id);