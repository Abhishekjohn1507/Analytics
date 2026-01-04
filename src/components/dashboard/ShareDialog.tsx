import { useState } from "react";
import { Share2, Copy, Check, Globe, Lock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ShareDialogProps {
  websiteId: string;
  hostname: string;
  isPublic: boolean;
  shareToken: string | null;
  onUpdate: (isPublic: boolean, shareToken: string | null) => void;
}

export function ShareDialog({ websiteId, hostname, isPublic, shareToken, onUpdate }: ShareDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareToken = () => {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  };

  const getShareUrl = () => {
    if (!shareToken) return '';
    return `${window.location.origin}/public/${shareToken}`;
  };

  const handleTogglePublic = async (checked: boolean) => {
    setLoading(true);
    try {
      const newToken = checked ? (shareToken || generateShareToken()) : shareToken;
      
      const { error } = await supabase
        .from('tracked_websites')
        .update({ 
          is_public: checked,
          share_token: newToken
        })
        .eq('id', websiteId);

      if (error) throw error;

      onUpdate(checked, newToken);
      toast({
        title: checked ? "Dashboard is now public" : "Dashboard is now private",
        description: checked 
          ? "Anyone with the link can view your analytics"
          : "Only you can access this dashboard",
      });
    } catch (err) {
      console.error("Error updating share settings:", err);
      toast({
        title: "Error",
        description: "Failed to update sharing settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateToken = async () => {
    setLoading(true);
    try {
      const newToken = generateShareToken();
      
      const { error } = await supabase
        .from('tracked_websites')
        .update({ share_token: newToken })
        .eq('id', websiteId);

      if (error) throw error;

      onUpdate(isPublic, newToken);
      toast({
        title: "New link generated",
        description: "Previous share link will no longer work",
      });
    } catch (err) {
      console.error("Error regenerating token:", err);
      toast({
        title: "Error",
        description: "Failed to generate new link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Dashboard</DialogTitle>
          <DialogDescription>
            Share a read-only view of analytics for {hostname}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Public toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="h-5 w-5 text-primary" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="public-toggle" className="font-medium">
                  Public Dashboard
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isPublic ? "Anyone with the link can view" : "Only you can access"}
                </p>
              </div>
            </div>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={handleTogglePublic}
              disabled={loading}
            />
          </div>

          {/* Share link */}
          {isPublic && shareToken && (
            <div className="space-y-3">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={getShareUrl()}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  disabled={loading}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateToken}
                  disabled={loading}
                  className="text-xs"
                >
                  Generate New Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={getShareUrl()} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Preview
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
