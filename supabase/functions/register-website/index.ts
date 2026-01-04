import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
};

// Input validation functions
function validateHostname(hostname: string): { valid: boolean; error?: string } {
  if (typeof hostname !== 'string') {
    return { valid: false, error: 'Hostname must be a string' };
  }
  
  const trimmed = hostname.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Hostname is required' };
  }
  
  if (trimmed.length > 253) {
    return { valid: false, error: 'Hostname must be less than 253 characters' };
  }
  
  // Basic hostname validation - allow IP addresses and domain names
  const hostnameRegex = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?|(?:\d{1,3}\.){3}\d{1,3})$/;
  
  if (!hostnameRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid hostname format' };
  }
  
  return { valid: true };
}

function validateUserId(userId: string): { valid: boolean; error?: string } {
  if (typeof userId !== 'string') {
    return { valid: false, error: 'User ID must be a string' };
  }
  
  const trimmed = userId.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'User ID is required' };
  }
  
  if (trimmed.length > 255) {
    return { valid: false, error: 'User ID must be less than 255 characters' };
  }
  
  // Clerk user IDs start with 'user_' followed by alphanumeric characters
  const clerkUserIdRegex = /^user_[a-zA-Z0-9]+$/;
  
  if (!clerkUserIdRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid user ID format' };
  }
  
  return { valid: true };
}

function generateRequestId(): string {
  return crypto.randomUUID().substring(0, 8);
}

serve(async (req) => {
  const requestId = generateRequestId();
  console.log(`[${requestId}] Incoming ${req.method} request to register-website`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      console.log(`[${requestId}] Method not allowed: ${req.method}`);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user ID from header (sent by client with Clerk auth)
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      console.log(`[${requestId}] Missing x-user-id header`);
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate user ID
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.valid) {
      console.log(`[${requestId}] Invalid user ID: ${userIdValidation.error}`);
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.log(`[${requestId}] Invalid JSON body`);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { hostname } = body;

    // Validate hostname
    const hostnameValidation = validateHostname(hostname);
    if (!hostnameValidation.valid) {
      console.log(`[${requestId}] Invalid hostname: ${hostnameValidation.error}`);
      return new Response(
        JSON.stringify({ error: hostnameValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanHostname = hostname.trim();

    // Create Supabase client with service role for secure insert
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this user already has this website
    const { data: existing, error: checkError } = await supabase
      .from('tracked_websites')
      .select('*')
      .eq('hostname', cleanHostname)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error(`[${requestId}] Error checking existing website:`, checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing website' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existing) {
      console.log(`[${requestId}] Website already exists for user`);
      return new Response(
        JSON.stringify({ data: existing, message: 'Website already tracked' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert new website with validated user_id
    const { data, error } = await supabase
      .from('tracked_websites')
      .insert({ 
        hostname: cleanHostname, 
        name: cleanHostname, 
        user_id: userId 
      })
      .select()
      .single();

    if (error) {
      console.error(`[${requestId}] Error inserting website:`, error);
      return new Response(
        JSON.stringify({ error: 'Failed to register website' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Successfully registered website: ${cleanHostname} for user: ${userId}`);
    return new Response(
      JSON.stringify({ data }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
