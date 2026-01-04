import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 60; // 60 requests per minute
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const shareToken = url.searchParams.get('token') || req.headers.get('x-api-key');
    const hostname = url.searchParams.get('hostname');
    const days = parseInt(url.searchParams.get('days') || '7', 10);

    // Validate required params
    if (!shareToken) {
      return new Response(
        JSON.stringify({ error: 'API token required. Pass as ?token= or x-api-key header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find website by share token
    let query = supabase
      .from('tracked_websites')
      .select('id, hostname, is_public, share_token')
      .eq('share_token', shareToken);

    if (hostname) {
      query = query.eq('hostname', hostname);
    }

    const { data: website, error: websiteError } = await query.maybeSingle();

    if (websiteError || !website) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or website not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if sharing is enabled
    if (!website.is_public) {
      return new Response(
        JSON.stringify({ error: 'Analytics sharing is not enabled for this website' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch page views
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.min(days, 30)); // Max 30 days

    const { data: pageViews, error: pvError } = await supabase
      .from('page_views')
      .select('*')
      .eq('website_id', website.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (pvError) {
      console.error('Error fetching page views:', pvError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch analytics' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate analytics
    const analytics = calculateAnalytics(pageViews || [], website.hostname);

    return new Response(
      JSON.stringify({
        success: true,
        hostname: website.hostname,
        period: { days, startDate: startDate.toISOString(), endDate: new Date().toISOString() },
        data: analytics,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Analytics API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateAnalytics(pageViews: any[], hostname: string) {
  if (pageViews.length === 0) {
    return {
      metrics: { totalVisitors: 0, pageViews: 0, uniqueVisitors: 0 },
      trafficByDate: [],
      topPages: [],
      devices: [],
      browsers: [],
      trafficSources: [],
      realtimeVisitors: 0,
    };
  }

  const uniqueVisitors = new Set(pageViews.map(pv => pv.visitor_id)).size;

  // Traffic by date
  const trafficByDate = pageViews.reduce((acc, pv) => {
    const date = new Date(pv.created_at).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = { visitors: new Set(), pageViews: 0 };
    acc[date].visitors.add(pv.visitor_id);
    acc[date].pageViews++;
    return acc;
  }, {} as Record<string, { visitors: Set<string>; pageViews: number }>);

  const trafficData = Object.entries(trafficByDate).map(([date, data]) => ({
    date,
    visitors: data.visitors.size,
    pageViews: data.pageViews,
  }));

  // Top pages
  const pageCounts = pageViews.reduce((acc, pv) => {
    const path = pv.path || '/';
    if (!acc[path]) acc[path] = { views: 0, visitors: new Set(), title: pv.page_title || path };
    acc[path].views++;
    acc[path].visitors.add(pv.visitor_id);
    return acc;
  }, {} as Record<string, { views: number; visitors: Set<string>; title: string }>);

  const topPages = Object.entries(pageCounts)
    .map(([page, data]) => ({ page, title: data.title, views: data.views, uniqueVisitors: data.visitors.size }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Devices
  const deviceCounts = pageViews.reduce((acc, pv) => {
    const device = pv.device_type || 'Desktop';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const devices = Object.entries(deviceCounts).map(([device, count]) => ({ device, count }));

  // Browsers
  const browserCounts = pageViews.reduce((acc, pv) => {
    const browser = pv.browser || 'Other';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalBrowser = Object.values(browserCounts).reduce((a, b) => a + b, 0);
  const browsers = Object.entries(browserCounts)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalBrowser) * 100) }))
    .sort((a, b) => b.count - a.count);

  // Traffic sources
  const referrerCounts = pageViews.reduce((acc, pv) => {
    let source = 'Direct';
    if (pv.referrer) {
      try {
        const url = new URL(pv.referrer);
        if (url.hostname.includes('google')) source = 'Organic Search';
        else if (['facebook', 'twitter', 'instagram', 'linkedin'].some(s => url.hostname.includes(s))) source = 'Social Media';
        else source = 'Referral';
      } catch { source = 'Direct'; }
    }
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRef = Object.values(referrerCounts).reduce((a, b) => a + b, 0);
  const trafficSources = Object.entries(referrerCounts)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalRef) * 100) }));

  // Realtime (last 5 min)
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const realtimeVisitors = new Set(
    pageViews.filter(pv => new Date(pv.created_at) > fiveMinAgo).map(pv => pv.visitor_id)
  ).size;

  return {
    metrics: { totalVisitors: uniqueVisitors, pageViews: pageViews.length, uniqueVisitors },
    trafficByDate: trafficData,
    topPages,
    devices,
    browsers,
    trafficSources,
    realtimeVisitors,
  };
}
