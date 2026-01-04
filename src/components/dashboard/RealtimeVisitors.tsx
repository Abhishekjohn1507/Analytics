import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Globe, Clock, Monitor, Smartphone, Tablet, ExternalLink, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RealtimeVisitor {
  id: string;
  path: string;
  country: string | null;
  created_at: string;
  page_title: string | null;
  device_type: string | null;
  browser: string | null;
}

interface RealtimeVisitorsProps {
  count?: number;
  hostname?: string;
}

export function RealtimeVisitors({ count = 0, hostname = '' }: RealtimeVisitorsProps) {
  const [visitors, setVisitors] = useState<RealtimeVisitor[]>([]);
  const [liveCount, setLiveCount] = useState(count);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!hostname) return;

    const fetchRealtimeVisitors = async () => {
      // Get website ID first
      const { data: website } = await supabase
        .from('tracked_websites')
        .select('id')
        .eq('hostname', hostname)
        .maybeSingle();

      if (!website) return;

      // Get page views from the last 15 minutes
      const fifteenMinutesAgo = new Date();
      fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

      const { data: recentViews, error } = await supabase
        .from('page_views')
        .select('id, path, country, created_at, page_title, device_type, browser')
        .eq('website_id', website.id)
        .gte('created_at', fifteenMinutesAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching realtime visitors:', error);
        return;
      }

      setVisitors(recentViews || []);
      
      // Count unique visitors in last 5 minutes
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      const activeCount = (recentViews || []).filter(
        v => new Date(v.created_at) > fiveMinutesAgo
      ).length;
      setLiveCount(activeCount);
    };

    fetchRealtimeVisitors();

    // Set up realtime subscription
    const channel = supabase
      .channel(`realtime-visitors-${hostname}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'page_views'
        },
        async (payload) => {
          // Check if this is for our website
          const { data: website } = await supabase
            .from('tracked_websites')
            .select('id')
            .eq('hostname', hostname)
            .maybeSingle();

          if (website && payload.new.website_id === website.id) {
            const newVisitor: RealtimeVisitor = {
              id: payload.new.id,
              path: payload.new.path,
              country: payload.new.country,
              created_at: payload.new.created_at,
              page_title: payload.new.page_title,
              device_type: payload.new.device_type,
              browser: payload.new.browser,
            };
            
            setVisitors(prev => [newVisitor, ...prev.slice(0, 9)]);
            setLiveCount(prev => prev + 1);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Refresh every 30 seconds
    const interval = setInterval(fetchRealtimeVisitors, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [hostname]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-3 w-3" />;
      case 'tablet':
        return <Tablet className="h-3 w-3" />;
      default:
        return <Monitor className="h-3 w-3" />;
    }
  };

  const getStatusColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'bg-emerald-500';
    if (diffMins < 5) return 'bg-yellow-500';
    return 'bg-muted-foreground/50';
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-primary/5 pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between relative">
        <CardTitle className="flex items-center gap-2">
          <div className="relative">
            <Activity className="h-5 w-5 text-emerald-500" />
            {isConnected && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          Live Activity
        </CardTitle>
        <Badge 
          variant="secondary" 
          className={`${liveCount > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-muted text-muted-foreground'} transition-colors`}
        >
          <span className="relative flex h-2 w-2 mr-2">
            <span className={`${liveCount > 0 ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full ${liveCount > 0 ? 'bg-emerald-400' : 'bg-muted-foreground'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${liveCount > 0 ? 'bg-emerald-500' : 'bg-muted-foreground'}`}></span>
          </span>
          {liveCount} online
        </Badge>
      </CardHeader>
      <CardContent className="relative">
        {visitors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
              <Activity className="h-16 w-16 mx-auto opacity-30 relative" />
            </div>
            <p className="text-sm font-medium">Waiting for visitors...</p>
            <p className="text-xs mt-1 opacity-70">Real-time activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visitors.map((visitor, index) => (
              <div 
                key={visitor.id} 
                className={`group flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all ${index === 0 ? 'ring-1 ring-emerald-500/20' : ''}`}
              >
                {/* Status indicator */}
                <div className="flex-shrink-0 mt-1.5">
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(visitor.created_at)} transition-colors`}></div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {visitor.path}
                    </p>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {visitor.page_title && visitor.page_title !== visitor.path && (
                    <p className="text-xs text-muted-foreground truncate">{visitor.page_title}</p>
                  )}
                  
                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1" title={visitor.device_type || 'Desktop'}>
                      {getDeviceIcon(visitor.device_type)}
                      <span className="hidden sm:inline">{visitor.device_type || 'Desktop'}</span>
                    </div>
                    
                    {visitor.browser && (
                      <span className="hidden md:inline">{visitor.browser}</span>
                    )}
                    
                    {visitor.country && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{visitor.country}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 ml-auto">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(visitor.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Connection status */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-destructive'}`}></div>
            <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
          <span>Updates in real-time</span>
        </div>
      </CardContent>
    </Card>
  );
}
