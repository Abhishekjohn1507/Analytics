import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Globe, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const websiteSchema = z.string()
  .trim()
  .min(1, "Please enter a website URL")
  .max(500, "URL is too long")
  .refine((url) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      return parsed.hostname.includes('.');
    } catch {
      return false;
    }
  }, "Please enter a valid website URL");

interface AddWebsiteFormProps {
  onAddWebsite: (url: string) => void;
  isLoading?: boolean;
}

export function AddWebsiteForm({ onAddWebsite, isLoading }: AddWebsiteFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = websiteSchema.safeParse(url);
    
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      const parsed = new URL(formattedUrl);
      onAddWebsite(parsed.hostname);
      setUrl("");
      toast({
        title: "Website added",
        description: `Now tracking ${parsed.hostname}`,
      });
    } catch {
      setError("Please enter a valid website URL");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Add Website to Track
        </CardTitle>
        <CardDescription>
          Enter the URL of the website you want to track
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
