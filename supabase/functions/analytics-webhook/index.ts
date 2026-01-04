import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Webhook endpoint to push analytics data to external services.
 * 
 * POST body:
 * {
 *   "token": "your-share-token",
 *   "webhookUrl": "https://your-other-site.com/api/receive-analytics",
 *   "days": 7 (optional, default 7, max 30)
 * }
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: { token?: string; webhookUrl?: string; days?: number };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token, webhookUrl, days = 7 } = body;

    if (!token || !webhookUrl) {
      return new Response(
        JSON.stringify({ error: 'token and webhookUrl are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate webhook URL
    try {
      const url = new URL(webhookUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid webhookUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find website by share token
    const { data: website, error: websiteError } = await supabase
      .from('tracked_websites')
      .select('id, hostname, is_public, share_token')
      .eq('share_token', token)
      .maybeSingle();

    if (websiteError || !website) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or website not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!website.is_public) {
      return new Response(
        JSON.stringify({ error: 'Analytics sharing is not enabled' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch analytics data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.min(days, 30));

    const { data: pageViews } = await supabase
      .from('page_views')
      .select('*')
      .eq('website_id', website.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    const analytics = calculateAnalytics(pageViews || [], website.hostname);

    const payload = {
      source: 'analytics-dashboard',
      hostname: website.hostname,
      timestamp: new Date().toISOString(),
      period: { days, startDate: startDate.toISOString(), endDate: new Date().toISOString() },
      data: analytics,
    };

    // Send to webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      console.error('Webhook delivery failed:', webhookResponse.status);
      return new Response(
        JSON.stringify({ 
          error: 'Webhook delivery failed', 
          status: webhookResponse.status 
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Analytics sent to webhook' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
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
    };
  }

  const uniqueVisitors = new Set(pageViews.map(pv => pv.visitor_id)).size;

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

  const deviceCounts = pageViews.reduce((acc, pv) => {
    const device = pv.device_type || 'Desktop';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const devices = Object.entries(deviceCounts).map(([device, count]) => ({ device, count }));

  const browserCounts = pageViews.reduce((acc, pv) => {
    const browser = pv.browser || 'Other';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalBrowser = Object.values(browserCounts).reduce((a, b) => a + b, 0);
  const browsers = Object.entries(browserCounts)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalBrowser) * 100) }))
    .sort((a, b) => b.count - a.count);

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

  return {
    metrics: { totalVisitors: uniqueVisitors, pageViews: pageViews.length, uniqueVisitors },
    trafficByDate: trafficData,
    topPages,
    devices,
    browsers,
    trafficSources,
  };
}
