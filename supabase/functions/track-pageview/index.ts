import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Rate limiting using in-memory store (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 30; // 30 requests per minute
const RATE_LIMIT_WINDOW = 60000; // 60 seconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// Input validation
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateTrackingData(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    errors.push('Invalid request body');
    return { valid: false, errors };
  }

  const data = body as Record<string, unknown>;

  // Required field validation
  if (!data.hostname || typeof data.hostname !== 'string') {
    errors.push('hostname required');
  }

  // Length limits
  if (typeof data.hostname === 'string' && data.hostname.length > 253) {
    errors.push('hostname too long (max 253)');
  }
  if (typeof data.path === 'string' && data.path.length > 2048) {
    errors.push('path too long (max 2048)');
  }
  if (typeof data.pageTitle === 'string' && data.pageTitle.length > 500) {
    errors.push('pageTitle too long (max 500)');
  }
  if (typeof data.referrer === 'string' && data.referrer.length > 2048) {
    errors.push('referrer too long (max 2048)');
  }

  // UUID format validation (allow null/undefined)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (data.visitorId && typeof data.visitorId === 'string' && !uuidRegex.test(data.visitorId)) {
    errors.push('invalid visitorId format');
  }
  if (data.sessionId && typeof data.sessionId === 'string' && !uuidRegex.test(data.sessionId)) {
    errors.push('invalid sessionId format');
  }

  // Hostname format validation
  const hostnameRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
  if (typeof data.hostname === 'string' && data.hostname.length > 0 && !hostnameRegex.test(data.hostname)) {
    // Allow IP addresses too
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(data.hostname)) {
      errors.push('invalid hostname format');
    }
  }

  return { valid: errors.length === 0, errors };
}

// Generic error handler - logs details server-side, returns generic message to client
function handleError(error: unknown, context: string): Response {
  const requestId = crypto.randomUUID();
  
  console.error(`[${context}] Request ID: ${requestId}`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });

  return new Response(
    JSON.stringify({ 
      error: 'An error occurred processing your request',
      requestId 
    }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';

    if (!checkRateLimit(ip)) {
      console.log('Rate limit exceeded for IP:', ip);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const validation = validateTrackingData(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.errors.join(', ') }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = body as Record<string, string>;
    const { hostname, path, pageTitle, referrer, sessionId, visitorId } = data;

    console.log('Tracking page view:', { hostname, path: path?.substring(0, 50) });

    // Parse user agent for device and browser info
    const userAgent = req.headers.get('user-agent') || '';
    let deviceType = 'Desktop';
    let browser = 'Other';

    // Bot detection (log but allow)
    const botPatterns = ['bot', 'crawler', 'spider', 'scraper'];
    if (botPatterns.some(pattern => userAgent.toLowerCase().includes(pattern))) {
      console.log('Bot detected:', userAgent.substring(0, 100));
    }

    if (/mobile/i.test(userAgent)) {
      deviceType = 'Mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'Tablet';
    }

    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) {
      browser = 'Chrome';
    } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
      browser = 'Safari';
    } else if (/firefox/i.test(userAgent)) {
      browser = 'Firefox';
    } else if (/edge/i.test(userAgent)) {
      browser = 'Edge';
    }

    // Get or create the website
    let { data: website } = await supabase
      .from('tracked_websites')
      .select('id')
      .eq('hostname', hostname)
      .maybeSingle();

    if (!website) {
      const { data: newWebsite, error: insertError } = await supabase
        .from('tracked_websites')
        .insert({ hostname, name: hostname })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating website:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to register website' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      website = newWebsite;
    }

    // Insert page view with sanitized data
    const { error: pageViewError } = await supabase
      .from('page_views')
      .insert({
        website_id: website.id,
        hostname: hostname.substring(0, 253),
        path: (path || '/').substring(0, 2048),
        page_title: pageTitle?.substring(0, 500),
        referrer: referrer?.substring(0, 2048),
        user_agent: userAgent.substring(0, 500),
        device_type: deviceType,
        browser,
        session_id: sessionId || null,
        visitor_id: visitorId || null,
      });

    if (pageViewError) {
      console.error('Error inserting page view:', pageViewError);
      return new Response(
        JSON.stringify({ error: 'Failed to track page view' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Page view tracked successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return handleError(error, 'track-pageview');
  }
});
