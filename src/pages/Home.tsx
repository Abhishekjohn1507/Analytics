import { Link } from "react-router-dom";
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  SignUpButton, 
  UserButton 
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart3, 
  Globe, 
  Zap, 
  Shield, 
  LineChart, 
  Users,
  ArrowRight,
  Code,
  Smartphone,
  Activity,
  CheckCircle2,
  Copy,
  MousePointerClick,
  Eye,
  TrendingUp,
  Clock,
  Check,
  X,
  Crown
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "See your visitors as they happen with live updating dashboards and instant insights."
  },
  {
    icon: Globe,
    title: "Multi-site Tracking",
    description: "Track unlimited websites from a single dashboard with easy-to-embed scripts."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Lightweight tracking script that won't slow down your website performance."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "No cookies required. Compliant with GDPR and privacy regulations."
  },
  {
    icon: LineChart,
    title: "Traffic Insights",
    description: "Understand where your visitors come from and how they interact with your site."
  },
  {
    icon: Users,
    title: "Visitor Behavior",
    description: "Track page views, sessions, devices, browsers and more in real-time."
  }
];

const steps = [
  {
    number: "1",
    icon: Globe,
    title: "Add Your Website",
    description: "Enter your website URL in the dashboard to register it for tracking."
  },
  {
    number: "2",
    icon: Copy,
    title: "Copy Tracking Script",
    description: "Get your unique tracking code from the dashboard with one click."
  },
  {
    number: "3",
    icon: Code,
    title: "Paste in Your Site",
    description: "Add the script to your website's HTML, just before the closing </head> tag."
  },
  {
    number: "4",
    icon: TrendingUp,
    title: "Watch the Data Flow",
    description: "Start seeing real-time analytics as visitors interact with your site."
  }
];

const integrations = [
  { icon: Code, name: "HTML/JS" },
  { icon: Smartphone, name: "React" },
  { icon: Activity, name: "Next.js" },
];

export default function Home() {
  return (
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
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Get Started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Activity className="h-4 w-4" />
              Privacy-friendly website analytics
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Track Your Website Visitors <br />
              <span className="text-primary">Without Compromising Privacy</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get real-time insights about your website traffic. No cookies, no complex setup, 
              no privacy concerns. Start tracking in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button size="lg" className="gap-2 w-full sm:w-auto text-base px-8">
                    Start Free Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button size="lg" className="gap-2 w-full sm:w-auto text-base px-8">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </SignedIn>
              <Link to="/tracking-scripts">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto text-base px-8">
                  <Code className="h-4 w-4" />
                  View Integration Guide
                </Button>
              </Link>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 max-w-5xl mx-auto">
            <Card className="overflow-hidden border-2 border-border/50 shadow-xl bg-card">
              <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-chart-1/60" />
                  <div className="h-3 w-3 rounded-full bg-chart-4/60" />
                </div>
                <div className="flex-1 text-center text-sm text-muted-foreground">
                  analytics-dashboard
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs font-medium">Page Views</span>
                    </div>
                    <p className="text-2xl font-bold">12,847</p>
                    <p className="text-xs text-chart-4">+23% from last week</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs font-medium">Unique Visitors</span>
                    </div>
                    <p className="text-2xl font-bold">3,421</p>
                    <p className="text-xs text-chart-4">+15% from last week</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <MousePointerClick className="h-4 w-4" />
                      <span className="text-xs font-medium">Bounce Rate</span>
                    </div>
                    <p className="text-2xl font-bold">42%</p>
                    <p className="text-xs text-chart-4">-5% from last week</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-medium">Avg. Time</span>
                    </div>
                    <p className="text-2xl font-bold">2m 34s</p>
                    <p className="text-xs text-chart-4">+12% from last week</p>
                  </div>
                </div>
                <div className="h-32 bg-gradient-to-t from-primary/20 to-transparent rounded-lg flex items-end justify-around px-4 pb-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80].map((height, i) => (
                    <div 
                      key={i} 
                      className="w-4 md:w-6 bg-primary/80 rounded-t transition-all hover:bg-primary"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-card/50 border-y border-border/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="h-3 w-3" />
              Quick Setup
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Start tracking your website visitors in 4 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                  <CardContent className="p-6 text-center">
                    <div className="relative inline-flex mb-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <step.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="gap-2">
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <CheckCircle2 className="h-3 w-3" />
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful analytics features without the complexity
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-card/50 border-y border-border/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Crown className="h-3 w-3" />
              Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="relative hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Free</h3>
                  <p className="text-muted-foreground">Perfect for personal projects</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-chart-4 flex-shrink-0" />
                    <span>Up to 3 websites</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-chart-4 flex-shrink-0" />
                    <span>10,000 pageviews/month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-chart-4 flex-shrink-0" />
                    <span>Real-time analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-chart-4 flex-shrink-0" />
                    <span>7-day data retention</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Custom events</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">API access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Priority support</span>
                  </li>
                </ul>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button variant="outline" className="w-full" size="lg">
                      Get Started Free
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard" className="block">
                    <Button variant="outline" className="w-full" size="lg">
                      Go to Dashboard
                    </Button>
                  </Link>
                </SignedIn>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative hover:shadow-lg transition-all duration-300 border-primary/50 bg-gradient-to-b from-primary/5 to-transparent">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Premium</h3>
                  <p className="text-muted-foreground">For growing businesses</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-chart-4 flex-shrink-0" />
                    <span>Unlimited websites</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-chart-4 flex-shrink-0" />
                    <span>Unlimited pageviews</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-chart-4 flex-shrink-0" />
                    <span>Real-time analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-chart-4 flex-shrink-0" />
                    <span>Unlimited data retention</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-chart-4 flex-shrink-0" />
                    <span>Custom events tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-chart-4 flex-shrink-0" />
                    <span>Full API access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-chart-4 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button className="w-full" size="lg">
                      Start 14-day Free Trial
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard" className="block">
                    <Button className="w-full" size="lg">
                      Upgrade Now
                    </Button>
                  </Link>
                </SignedIn>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-muted-foreground mt-8">
            All plans include GDPR compliance, no cookies, and privacy-first analytics
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary/5">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">100%</div>
              <div className="text-muted-foreground mt-1">Privacy Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">&lt;1KB</div>
              <div className="text-muted-foreground mt-1">Script Size</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">Real-time</div>
              <div className="text-muted-foreground mt-1">Live Updates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">∞</div>
              <div className="text-muted-foreground mt-1">Unlimited Sites</div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Works with Any Framework
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple copy-paste integration. No complex configuration needed.
            </p>
          </div>
          <div className="flex justify-center gap-8 flex-wrap mb-12">
            {integrations.map((integration, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <integration.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="font-medium">{integration.name}</span>
              </div>
            ))}
          </div>
          
          {/* Code Example */}
          <Card className="max-w-2xl mx-auto bg-card border-border overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-mono">index.html</span>
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">Just 2 lines!</span>
            </div>
            <CardContent className="p-0">
              <pre className="p-4 text-sm overflow-x-auto font-mono">
                <code className="text-foreground">
{`<head>
  ...
  <!-- Add before closing </head> tag -->
  <script src="https://yoursite.com/tracker.js"></script>
</head>`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/20 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Understand Your Visitors?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Start tracking your website in under 2 minutes. Free forever for personal projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button size="lg" className="gap-2">
                      Start Tracking Free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard">
                    <Button size="lg" className="gap-2">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </SignedIn>
                <Link to="/tracking-scripts">
                  <Button size="lg" variant="outline" className="gap-2">
                    View Documentation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Analytics</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Analytics. Privacy-first website tracking.
          </p>
        </div>
      </footer>
    </div>
  );
}
