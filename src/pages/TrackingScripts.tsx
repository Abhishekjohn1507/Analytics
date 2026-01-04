import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code, Copy, Check, ArrowLeft, BarChart3, Terminal, FileCode, Blocks, Zap, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TrackingScripts() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const hostname = searchParams.get('hostname') || 'your-website.com';
  const [copied, setCopied] = useState<string | null>(null);

  const trackingScript = `<!-- Analytics Tracking Script -->
<script>
(function() {
  var endpoint = 'https://chelqujdhnjboeeamxtu.supabase.co/functions/v1/track-pageview';
  
  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  function getVisitorId() {
    var id = localStorage.getItem('_vid');
    if (!id) {
      id = generateId();
      localStorage.setItem('_vid', id);
    }
    return id;
  }
  
  function getSessionId() {
    var id = sessionStorage.getItem('_sid');
    if (!id) {
      id = generateId();
      sessionStorage.setItem('_sid', id);
    }
    return id;
  }
  
  function trackPageView() {
    var data = {
      hostname: window.location.hostname,
      path: window.location.pathname,
      pageTitle: document.title,
      referrer: document.referrer,
      visitorId: getVisitorId(),
      sessionId: getSessionId()
    };
    
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(function(err) {
      console.log('Analytics error:', err);
    });
  }
  
  // Track initial page view
  trackPageView();
  
  // Track navigation for SPAs
  var pushState = history.pushState;
  history.pushState = function() {
    pushState.apply(history, arguments);
    trackPageView();
  };
  
  window.addEventListener('popstate', trackPageView);
})();
</script>`;

  const reactCode = `// src/components/Analytics.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ENDPOINT = 'https://chelqujdhnjboeeamxtu.supabase.co/functions/v1/track-pageview';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getVisitorId(): string {
  let id = localStorage.getItem('_vid');
  if (!id) {
    id = generateId();
    localStorage.setItem('_vid', id);
  }
  return id;
}

function getSessionId(): string {
  let id = sessionStorage.getItem('_sid');
  if (!id) {
    id = generateId();
    sessionStorage.setItem('_sid', id);
  }
  return id;
}

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostname: window.location.hostname,
            path: location.pathname,
            pageTitle: document.title,
            referrer: document.referrer,
            visitorId: getVisitorId(),
            sessionId: getSessionId(),
          }),
        });
      } catch (err) {
        console.log('Analytics error:', err);
      }
    };

    trackPageView();
  }, [location.pathname]);

  return null;
}

export default Analytics;`;

  const reactAppCode = `// src/App.tsx (or main entry)
import { BrowserRouter } from 'react-router-dom';
import Analytics from './components/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Analytics />
      {/* Your routes and components */}
    </BrowserRouter>
  );
}

export default App;`;

  const nextjsAppRouterCode = `// app/components/Analytics.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ENDPOINT = 'https://chelqujdhnjboeeamxtu.supabase.co/functions/v1/track-pageview';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('_vid');
  if (!id) {
    id = generateId();
    localStorage.setItem('_vid', id);
  }
  return id;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('_sid');
  if (!id) {
    id = generateId();
    sessionStorage.setItem('_sid', id);
  }
  return id;
}

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostname: window.location.hostname,
            path: pathname,
            pageTitle: document.title,
            referrer: document.referrer,
            visitorId: getVisitorId(),
            sessionId: getSessionId(),
          }),
        });
      } catch (err) {
        console.log('Analytics error:', err);
      }
    };

    trackPageView();
  }, [pathname]);

  return null;
}`;

  const nextjsLayoutCode = `// app/layout.tsx
import { Analytics } from './components/Analytics';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}`;

  const nextjsPagesRouterCode = `// pages/_app.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';

const ENDPOINT = 'https://chelqujdhnjboeeamxtu.supabase.co/functions/v1/track-pageview';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('_vid');
  if (!id) {
    id = generateId();
    localStorage.setItem('_vid', id);
  }
  return id;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('_sid');
  if (!id) {
    id = generateId();
    sessionStorage.setItem('_sid', id);
  }
  return id;
}

async function trackPageView(path: string) {
  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostname: window.location.hostname,
        path,
        pageTitle: document.title,
        referrer: document.referrer,
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
      }),
    });
  } catch (err) {
    console.log('Analytics error:', err);
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Track initial page view
    trackPageView(router.asPath);

    // Track route changes
    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return <Component {...pageProps} />;
}`;

  const vueCode = `// src/plugins/analytics.ts
const ENDPOINT = 'https://chelqujdhnjboeeamxtu.supabase.co/functions/v1/track-pageview';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getVisitorId(): string {
  let id = localStorage.getItem('_vid');
  if (!id) {
    id = generateId();
    localStorage.setItem('_vid', id);
  }
  return id;
}

function getSessionId(): string {
  let id = sessionStorage.getItem('_sid');
  if (!id) {
    id = generateId();
    sessionStorage.setItem('_sid', id);
  }
  return id;
}

export async function trackPageView(path: string) {
  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostname: window.location.hostname,
        path,
        pageTitle: document.title,
        referrer: document.referrer,
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
      }),
    });
  } catch (err) {
    console.log('Analytics error:', err);
  }
}

// In router/index.ts
import { trackPageView } from '@/plugins/analytics';

router.afterEach((to) => {
  trackPageView(to.fullPath);
});`;

  const handleCopy = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(type);
      toast({
        title: "Copied!",
        description: `${type} code copied to clipboard`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please select and copy the code manually",
        variant: "destructive",
      });
    }
  };

  const CopyButton = ({ code, type }: { code: string; type: string }) => (
    <Button
      variant="outline"
      size="sm"
      className="absolute top-2 right-2 gap-1.5"
      onClick={() => handleCopy(code, type)}
    >
      {copied === type ? (
        <>
          <Check className="h-4 w-4 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy
        </>
      )}
    </Button>
  );

  const frameworks = [
    { id: 'html', label: 'HTML', icon: FileCode, color: 'text-orange-500' },
    { id: 'react', label: 'React', icon: Blocks, color: 'text-cyan-500' },
    { id: 'nextjs-app', label: 'Next.js App', icon: Zap, color: 'text-foreground' },
    { id: 'nextjs-pages', label: 'Next.js Pages', icon: Zap, color: 'text-foreground' },
    { id: 'vue', label: 'Vue.js', icon: Blocks, color: 'text-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl hidden sm:inline">Analytics</span>
            </div>
          </div>
          {hostname !== 'your-website.com' && (
            <Badge variant="secondary" className="gap-1.5">
              <Terminal className="h-3 w-3" />
              {hostname}
            </Badge>
          )}
        </div>
      </nav>

      <div className="container py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Tracking Scripts</h1>
              <p className="text-muted-foreground">
                Add analytics to your website in minutes
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-medium">Lightweight</p>
                  <p className="text-sm text-muted-foreground">Under 1KB, no dependencies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Privacy-first</p>
                  <p className="text-sm text-muted-foreground">No cookies, GDPR compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-violet-500 mt-0.5" />
                <div>
                  <p className="font-medium">Real-time</p>
                  <p className="text-sm text-muted-foreground">See visitors instantly</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Installation
            </CardTitle>
            <CardDescription>
              Choose your framework and follow the instructions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1 mb-6">
                {frameworks.map((fw) => (
                  <TabsTrigger key={fw.id} value={fw.id} className="gap-2">
                    <fw.icon className={`h-4 w-4 ${fw.color}`} />
                    {fw.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* HTML */}
              <TabsContent value="html" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">HTML / Static Site</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add this script to the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">&lt;head&gt;</code> section of every page you want to track.
                  </p>
                  <div className="relative">
                    <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto text-xs font-mono max-h-[400px] overflow-y-auto">
                      <code className="text-foreground">{trackingScript}</code>
                    </pre>
                    <CopyButton code={trackingScript} type="HTML Script" />
                  </div>
                </div>
              </TabsContent>

              {/* React */}
              <TabsContent value="react" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">React (Vite, CRA, etc.)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create an Analytics component and add it to your app.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Step 1</Badge>
                      <span className="text-sm font-medium">Create the Analytics component</span>
                    </div>
                    <div className="relative">
                      <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto text-xs font-mono max-h-[300px] overflow-y-auto">
                        <code className="text-foreground">{reactCode}</code>
                      </pre>
                      <CopyButton code={reactCode} type="React Analytics" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Step 2</Badge>
                      <span className="text-sm font-medium">Add to your App</span>
                    </div>
                    <div className="relative">
                      <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto text-xs font-mono max-h-[200px] overflow-y-auto">
                        <code className="text-foreground">{reactAppCode}</code>
                      </pre>
                      <CopyButton code={reactAppCode} type="React App" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Next.js App Router */}
              <TabsContent value="nextjs-app" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Next.js App Router (v13+)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a client component and add it to your root layout.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Step 1</Badge>
                      <span className="text-sm font-medium">Create Analytics component</span>
                    </div>
                    <div className="relative">
                      <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto text-xs font-mono max-h-[300px] overflow-y-auto">
                        <code className="text-foreground">{nextjsAppRouterCode}</code>
                      </pre>
                      <CopyButton code={nextjsAppRouterCode} type="Next.js App Component" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Step 2</Badge>
                      <span className="text-sm font-medium">Add to root layout</span>
                    </div>
                    <div className="relative">
                      <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto text-xs font-mono max-h-[200px] overflow-y-auto">
                        <code className="text-foreground">{nextjsLayoutCode}</code>
                      </pre>
                      <CopyButton code={nextjsLayoutCode} type="Next.js Layout" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Next.js Pages Router */}
              <TabsContent value="nextjs-pages" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Next.js Pages Router</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your _app.tsx to track all route changes.
                  </p>
                  <div className="relative">
                    <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto text-xs font-mono max-h-[400px] overflow-y-auto">
                      <code className="text-foreground">{nextjsPagesRouterCode}</code>
                    </pre>
                    <CopyButton code={nextjsPagesRouterCode} type="Next.js Pages" />
                  </div>
                </div>
              </TabsContent>

              {/* Vue */}
              <TabsContent value="vue" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Vue.js</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a plugin and use the router afterEach hook.
                  </p>
                  <div className="relative">
                    <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto text-xs font-mono max-h-[400px] overflow-y-auto">
                      <code className="text-foreground">{vueCode}</code>
                    </pre>
                    <CopyButton code={vueCode} type="Vue.js" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Deploy and test</p>
                <p className="text-sm text-muted-foreground">
                  After adding the script, visit your site and check the dashboard. Data appears within seconds.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Single Page Apps</p>
                <p className="text-sm text-muted-foreground">
                  The script automatically tracks client-side navigation for SPAs.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Multiple domains</p>
                <p className="text-sm text-muted-foreground">
                  Add the same script to all your sites. Each domain is tracked separately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
