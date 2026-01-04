import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Users, Eye, Clock, TrendingUp, ArrowDownUp, BarChart3, Home, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { TopPagesTable } from "@/components/dashboard/TopPagesTable";
import { TrafficSourcesChart } from "@/components/dashboard/TrafficSourcesChart";
import { DevicesChart } from "@/components/dashboard/DevicesChart";
import { RealtimeVisitors } from "@/components/dashboard/RealtimeVisitors";
import { BrowsersTable } from "@/components/dashboard/BrowsersTable";
import { AddWebsiteForm } from "@/components/dashboard/AddWebsiteForm";
import { WebsiteSelector, TrackedWebsite } from "@/components/dashboard/WebsiteSelector";
import { ShareDialog } from "@/components/dashboard/ShareDialog";
import { ExportDialog } from "@/components/dashboard/ExportDialog";
import { NotificationSettings } from "@/components/dashboard/NotificationSettings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchAnalyticsData, 
  getTrackedWebsites, 
  addTrackedWebsite, 
  removeTrackedWebsite,
  AnalyticsData 
} from "@/lib/analyticsApi";

interface WebsiteShareInfo {
  isPublic: boolean;
  shareToken: string | null;
}

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const { websiteId } = useParams<{ websiteId?: string }>();
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<TrackedWebsite[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingWebsite, setIsAddingWebsite] = useState(false);
  const [shareInfo, setShareInfo] = useState<WebsiteShareInfo>({ isPublic: false, shareToken: null });

  // Load tracked websites on mount
  useEffect(() => {
    const loadWebsites = async () => {
      if (!user?.id) return;
      
      const data = await getTrackedWebsites(user.id);
      const mapped: TrackedWebsite[] = data.map((w: any) => ({
        id: w.id,
        hostname: w.hostname,
        addedAt: new Date(w.created_at),
        isActive: true,
      }));
      setWebsites(mapped);
      
      // If websiteId is in URL, find and select that website
      if (websiteId) {
        const matchedWebsite = mapped.find(w => w.id === websiteId);
        if (matchedWebsite) {
          setSelectedWebsite(matchedWebsite.hostname);
        } else if (mapped.length > 0) {
          // If websiteId not found, redirect to first website
          navigate(`/dashboard/${mapped[0].id}`, { replace: true });
          setSelectedWebsite(mapped[0].hostname);
        }
      } else if (mapped.length > 0) {
        // No websiteId in URL, redirect to first website
        navigate(`/dashboard/${mapped[0].id}`, { replace: true });
        setSelectedWebsite(mapped[0].hostname);
      }
    };
    loadWebsites();
  }, [user?.id, websiteId, navigate]);

  // Handle website selection change
  const handleSelectWebsite = (hostname: string) => {
    const website = websites.find(w => w.hostname === hostname);
    if (website) {
      navigate(`/dashboard/${website.id}`);
      setSelectedWebsite(hostname);
    }
  };

  // Fetch analytics and share info when website changes
  useEffect(() => {
    const loadAnalyticsAndShareInfo = async () => {
      if (!selectedWebsite || !user?.id) {
        setAnalyticsData(null);
        setShareInfo({ isPublic: false, shareToken: null });
        return;
      }
      
      setIsLoading(true);
      
      // Fetch analytics
      const data = await fetchAnalyticsData(selectedWebsite, user.id);
      setAnalyticsData(data);
      
      // Fetch share info and notification email
      const { data: websiteData } = await supabase
        .from('tracked_websites')
        .select('is_public, share_token, notification_email')
        .eq('hostname', selectedWebsite)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (websiteData) {
        setShareInfo({
          isPublic: websiteData.is_public ?? false,
          shareToken: websiteData.share_token ?? null,
        });

        // Check milestones if notification email is set
        if (websiteData.notification_email && data && websiteId) {
          supabase.functions.invoke('send-milestone-email', {
            body: {
              websiteId,
              hostname: selectedWebsite,
              email: websiteData.notification_email,
              currentVisitors: data.metrics.uniqueVisitors,
            }
          }).catch(err => console.log('Milestone check:', err));
        }
      }
      
      setIsLoading(false);
    };
    
    loadAnalyticsAndShareInfo();
    
    // Refresh analytics every 30 seconds
    const interval = setInterval(async () => {
      if (selectedWebsite && user?.id) {
        const data = await fetchAnalyticsData(selectedWebsite, user.id);
        setAnalyticsData(data);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedWebsite, user?.id]);

  // Handle share update
  const handleShareUpdate = (isPublic: boolean, shareToken: string | null) => {
    setShareInfo({ isPublic, shareToken });
  };

  // Real-time subscription for page views
  useEffect(() => {
    const channel = supabase
      .channel('page-views-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'page_views'
        },
        async (payload) => {
          // Check if this page view is for the selected website
          if (selectedWebsite && user?.id) {
            const { data: website } = await supabase
              .from('tracked_websites')
              .select('id')
              .eq('hostname', selectedWebsite)
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (website && payload.new.website_id === website.id) {
              // Refresh analytics data
              const data = await fetchAnalyticsData(selectedWebsite, user.id);
              setAnalyticsData(data);
              
              toast({
                title: "New page view!",
                description: `${payload.new.path} was just visited`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedWebsite, toast]);

  const handleAddWebsite = async (hostname: string) => {
    if (!user?.id) return;
    
    if (websites.some(w => w.hostname === hostname)) {
      toast({
        title: "Already tracking",
        description: `${hostname} is already being tracked`,
        variant: "destructive",
      });
      return;
    }

    setIsAddingWebsite(true);
    const result = await addTrackedWebsite(hostname, user.id);
    setIsAddingWebsite(false);

    if (result) {
      const newWebsite: TrackedWebsite = {
        id: result.id,
        hostname: result.hostname,
        addedAt: new Date(result.created_at),
        isActive: true,
      };
      setWebsites(prev => [...prev, newWebsite]);
      navigate(`/dashboard/${result.id}`);
      setSelectedWebsite(hostname);
      toast({
        title: "Website added",
        description: `Now tracking ${hostname}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add website",
        variant: "destructive",
      });
    }
  };

  const handleRemoveWebsite = async (id: string) => {
    if (!user?.id) return;
    
    const website = websites.find(w => w.id === id);
    const success = await removeTrackedWebsite(id, user.id);
    
    if (success) {
      const remaining = websites.filter(w => w.id !== id);
      setWebsites(remaining);
      
      if (website && selectedWebsite === website.hostname) {
        if (remaining.length > 0) {
          navigate(`/dashboard/${remaining[0].id}`);
          setSelectedWebsite(remaining[0].hostname);
        } else {
          navigate('/dashboard');
          setSelectedWebsite(null);
        }
      }
      
      toast({
        title: "Website removed",
        description: "The website has been removed from tracking",
      });
    }
  };

  return (
    <>
        <div className="min-h-screen bg-background">
          {/* Navigation */}
          <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedWebsite && websiteId && (
                  <>
                    <NotificationSettings
                      websiteId={websiteId}
                      hostname={selectedWebsite}
                    />
                    {analyticsData && (
                      <ExportDialog
                        hostname={selectedWebsite}
                        analyticsData={analyticsData}
                      />
                    )}
                    <ShareDialog
                      websiteId={websiteId}
                      hostname={selectedWebsite}
                      isPublic={shareInfo.isPublic}
                      shareToken={shareInfo.shareToken}
                      onUpdate={handleShareUpdate}
                    />
                    <Link to={`/tracking-scripts?hostname=${encodeURIComponent(selectedWebsite)}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Code className="h-4 w-4" />
                        <span className="hidden sm:inline">Get Tracking Script</span>
                      </Button>
                    </Link>
                  </>
                )}
                <Link to="/">
                  <Button variant="ghost" className="gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </nav>

      <div className="container py-8 space-y-6">
        {/* Add Website Form */}
        <AddWebsiteForm onAddWebsite={handleAddWebsite} isLoading={isAddingWebsite} />

        {/* Website Selector */}
        <WebsiteSelector
          websites={websites}
          selectedWebsite={selectedWebsite}
          onSelect={handleSelectWebsite}
          onRemove={handleRemoveWebsite}
        />

        {selectedWebsite ? (
          <>
            <DashboardHeader siteName={selectedWebsite} />
            
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : analyticsData ? (
              <>
                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  <MetricCard
                    title="Total Visitors"
                    value={analyticsData.metrics.totalVisitors.toLocaleString()}
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
                    title="Avg. Session"
                    value={analyticsData.metrics.avgSession}
                    change="+5.1%"
                    changeType="positive"
                    icon={Clock}
                  />
                  <MetricCard
                    title="Bounce Rate"
                    value={analyticsData.metrics.bounceRate}
                    change="-2.3%"
                    changeType="positive"
                    icon={ArrowDownUp}
                  />
                  <MetricCard
                    title="Unique Visitors"
                    value={analyticsData.metrics.uniqueVisitors.toLocaleString()}
                    change="+0.8%"
                    changeType="positive"
                    icon={TrendingUp}
                  />
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 lg:grid-cols-3">
                  <TrafficChart data={analyticsData.trafficData} />
                  <TrafficSourcesChart data={analyticsData.trafficSources} />
                </div>

                {/* Secondary Charts Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <RealtimeVisitors count={analyticsData.realtimeVisitors} hostname={selectedWebsite} />
                  <DevicesChart data={analyticsData.devices} />
                  <BrowsersTable data={analyticsData.browsers} />
                </div>

                {/* Top Pages Table */}
                <TopPagesTable data={analyticsData.topPages} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-primary/10 p-6 mb-6">
                  <Eye className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No data yet</h2>
                <p className="text-muted-foreground max-w-md">
                  Add the tracking script to your website to start collecting analytics data.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No websites tracked yet</h2>
            <p className="text-muted-foreground max-w-md">
              Add a website URL above to start tracking its analytics. You'll get a tracking script to embed on your site.
            </p>
          </div>
          )}
        </div>
      </div>
    </>
);
};

export default Dashboard;
