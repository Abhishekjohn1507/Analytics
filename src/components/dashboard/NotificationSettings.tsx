import { useState, useEffect } from "react";
import { Bell, BellOff, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NotificationSettingsProps {
  websiteId: string;
  hostname: string;
}

const MILESTONES = [100, 500, 1000, 5000, 10000, 50000, 100000];

export function NotificationSettings({ websiteId, hostname }: NotificationSettingsProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifiedMilestones, setNotifiedMilestones] = useState<number[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      // Load notification email
      const { data: website } = await supabase
        .from("tracked_websites")
        .select("notification_email")
        .eq("id", websiteId)
        .single();

      if (website?.notification_email) {
        setEmail(website.notification_email);
        setEnabled(true);
      }

      // Load notified milestones
      const { data: notifications } = await supabase
        .from("milestone_notifications")
        .select("milestone")
        .eq("website_id", websiteId);

      if (notifications) {
        setNotifiedMilestones(notifications.map((n) => n.milestone));
      }
    };

    loadSettings();
  }, [websiteId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("tracked_websites")
        .update({
          notification_email: enabled ? email : null,
        })
        .eq("id", websiteId);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      toast({
        title: enabled ? "Notifications enabled" : "Notifications disabled",
        description: enabled
          ? `Milestone alerts will be sent to ${email}`
          : "You won't receive milestone notifications",
      });
    } catch (err) {
      console.error("Error saving notification settings:", err);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    if (!checked) {
      handleSave();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {enabled ? (
            <Bell className="h-4 w-4 mr-2" />
          ) : (
            <BellOff className="h-4 w-4 mr-2" />
          )}
          Alerts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Milestone Notifications</DialogTitle>
          <DialogDescription>
            Get notified when {hostname} reaches traffic milestones
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="notifications-toggle" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for visitor milestones
                </p>
              </div>
            </div>
            <Switch
              id="notifications-toggle"
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={loading}
            />
          </div>

          {/* Email input */}
          {enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="notification-email">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="notification-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button onClick={handleSave} disabled={loading || !email}>
                    {saved ? <Check className="h-4 w-4" /> : "Save"}
                  </Button>
                </div>
              </div>

              {/* Milestones list */}
              <div className="space-y-2">
                <Label>Milestones</Label>
                <div className="grid grid-cols-4 gap-2">
                  {MILESTONES.map((milestone) => {
                    const isNotified = notifiedMilestones.includes(milestone);
                    return (
                      <div
                        key={milestone}
                        className={`text-center p-2 rounded-lg text-sm ${
                          isNotified
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {milestone >= 1000
                          ? `${milestone / 1000}k`
                          : milestone}
                        {isNotified && (
                          <Check className="h-3 w-3 inline ml-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {notifiedMilestones.length > 0
                    ? `${notifiedMilestones.length} milestone(s) already reached`
                    : "You'll be notified when each milestone is reached"}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
