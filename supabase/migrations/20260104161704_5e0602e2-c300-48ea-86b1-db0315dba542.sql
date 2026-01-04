-- Create table to track milestones and prevent duplicate notifications
CREATE TABLE public.milestone_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID NOT NULL REFERENCES public.tracked_websites(id) ON DELETE CASCADE,
  milestone INTEGER NOT NULL,
  notified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(website_id, milestone)
);

-- Enable RLS
ALTER TABLE public.milestone_notifications ENABLE ROW LEVEL SECURITY;

-- Allow read/insert for authenticated operations via edge function
CREATE POLICY "Allow insert milestone_notifications" 
ON public.milestone_notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow read milestone_notifications" 
ON public.milestone_notifications 
FOR SELECT 
USING (true);

-- Add notification_email column to tracked_websites for milestone alerts
ALTER TABLE public.tracked_websites 
ADD COLUMN notification_email TEXT;