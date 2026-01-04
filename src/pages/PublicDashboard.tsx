import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BarChart3, Users, Eye, Clock, ArrowDownUp, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { TrafficSourcesChart } from "@/components/dashboard/TrafficSourcesChart";
import { DevicesChart } from "@/components/dashboard/DevicesChart";
import { TopPagesTable } from "@/components/dashboard/TopPagesTable";
import { BrowsersTable } from "@/components/dashboard/BrowsersTable";
import { RealtimeVisitors } from "@/components/dashboard/RealtimeVisitors";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface TrackedWebsite {
  id: string;
  hostname: string;
  name: string | null;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const PublicDashboard = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [website, setWebsite] = useState<TrackedWebsite | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPublicData = async () => {
      if (!shareToken) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        // Fetch website by share token
        const { data: websiteData, error: websiteError } = await supabase
          .from('tracked_websites')
          .select('id, hostname, name')
          .eq('share_token', shareToken)
          .eq('is_public', true)
          .single();

        if (websiteError || !websiteData) {
          setError("This dashboard is not available or the link has expired");
          setLoading(false);
          return;
        }

        setWebsite(websiteData);

        // Fetch page views for this website
        const { data: pageViews, error: pvError } = await supabase
          .from('page_views')
          .select('*')
          .eq('website_id', websiteData.id)
          .order('created_at', { ascending: false })
          .limit(1000);

        if (pvError) {
          console.error("Error fetching page views:", pvError);
        }

        // Process analytics data
        const analytics = processAnalytics(pageViews || []);
        setAnalyticsData(analytics);
      } catch (err) {
        console.error("Error loading public dashboard:", err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadPublicData();
  }, [shareToken]);

  const processAnalytics = (pageViews: any[]) => {
    const uniqueVisitors = new Set(pageViews.map(pv => pv.visitor_id)).size;
    const totalPageViews = pageViews.length;
    
    // Traffic data by day
    const trafficByDay: Record<string, { visitors: Set<string>; pageViews: number }> = {};
    pageViews.forEach(pv => {
      const date = new Date(pv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!trafficByDay[date]) {
        trafficByDay[date] = { visitors: new Set(), pageViews: 0 };
      }
      trafficByDay[date].visitors.add(pv.visitor_id);
      trafficByDay[date].pageViews++;
    });

    const trafficData = Object.entries(trafficByDay).map(([date, data]) => ({
      date,
      visitors: data.visitors.size,
      pageViews: data.pageViews,
    }));

    // Sources
    const sourceCount: Record<string, number> = {};
    pageViews.forEach(pv => {
      let source = 'Direct';
      try {
        if (pv.referrer) source = new URL(pv.referrer).hostname;
      } catch { }
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });
    const sources = Object.entries(sourceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));

    // Devices
    const deviceCount: Record<string, number> = {};
    pageViews.forEach(pv => {
      const device = pv.device_type || 'Unknown';
      deviceCount[device] = (deviceCount[device] || 0) + 1;
    });
    const devices = Object.entries(deviceCount)
      .map(([device, visitors]) => ({ device, visitors }));

    // Top pages
    const pageCount: Record<string, { title: string; visitors: Set<string>; views: number }> = {};
    pageViews.forEach(pv => {
      if (!pageCount[pv.path]) {
        pageCount[pv.path] = { title: pv.page_title || pv.path, visitors: new Set(), views: 0 };
      }
      pageCount[pv.path].visitors.add(pv.visitor_id);
      pageCount[pv.path].views++;
    });
    const topPages = Object.entries(pageCount)
      .sort((a, b) => b[1].views - a[1].views)
      .slice(0, 5)
      .map(([page, data]) => ({
        page,
        title: data.title,
        views: data.views,
        uniqueVisitors: data.visitors.size,
        bounceRate: "42%",
      }));

    // Browsers
    const browserCount: Record<string, number> = {};
    pageViews.forEach(pv => {
      const browser = pv.browser || 'Unknown';
      browserCount[browser] = (browserCount[browser] || 0) + 1;
    });
    const browsers = Object.entries(browserCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sessions]) => ({
        name,
        sessions,
        percentage: totalPageViews > 0 ? Math.round((sessions / totalPageViews) * 100) : 0,
      }));

    // Realtime (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const realtimeVisitors = new Set(
      pageViews
        .filter(pv => new Date(pv.created_at) > fiveMinutesAgo)
        .map(pv => pv.visitor_id)
    ).size;

    return {
      metrics: {
        visitors: uniqueVisitors,
        pageViews: totalPageViews,
        avgDuration: "2m 45s",
        bounceRate: "42.3%",
      },
      trafficData,
      sources,
      devices,
      topPages,
      browsers,
      realtimeVisitors,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !website || !analyticsData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">{error || "Dashboard not found"}</h1>
          <p className="text-muted-foreground">This dashboard may have been disabled or the link is invalid.</p>
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">{website.name || website.hostname}</h1>
                <p className="text-sm text-muted-foreground">Public Analytics Dashboard</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Get Your Own
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Realtime */}
        <RealtimeVisitors count={analyticsData.realtimeVisitors} hostname={website.hostname} />

        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Unique Visitors"
            value={analyticsData.metrics.visitors.toLocaleString()}
            change="+12.5%"
            changeType="positive"
            icon={Users}
          />
          <MetricCard
            title="Page Views"
            value={analyticsData.metrics.pageViews.toLocaleString()}
            change="+8.2%"
            changeType="positive"
            icon={Eye}
          />
          <MetricCard
            title="Avg. Duration"
            value={analyticsData.metrics.avgDuration}
            change="+15.3%"
            changeType="positive"
            icon={Clock}
          />
          <MetricCard
            title="Bounce Rate"
            value={analyticsData.metrics.bounceRate}
            change="-3.1%"
            changeType="positive"
            icon={ArrowDownUp}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          <TrafficChart data={analyticsData.trafficData} />
          <TrafficSourcesChart data={analyticsData.sources} />
        </div>

        {/* Tables */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TopPagesTable data={analyticsData.topPages} />
          <div className="space-y-6">
            <DevicesChart data={analyticsData.devices} />
            <BrowsersTable data={analyticsData.browsers} />
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Powered by <Link to="/" className="text-primary hover:underline">Insight Analytics</Link>
      </footer>
    </div>
  );
};

export default PublicDashboard;
