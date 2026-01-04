import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, X, Check } from "lucide-react";

export interface TrackedWebsite {
  id: string;
  hostname: string;
  addedAt: Date;
  isActive: boolean;
}

interface WebsiteSelectorProps {
  websites: TrackedWebsite[];
  selectedWebsite: string | null;
  onSelect: (hostname: string) => void;
  onRemove: (id: string) => void;
}

export function WebsiteSelector({ websites, selectedWebsite, onSelect, onRemove }: WebsiteSelectorProps) {
  if (websites.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-wrap gap-2">
          {websites.map((website) => (
            <div
              key={website.id}
              className={`
                group flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer
                ${selectedWebsite === website.hostname 
                  ? 'bg-primary/10 border-primary text-primary' 
                  : 'bg-card hover:bg-accent border-border'
                }
              `}
              onClick={() => onSelect(website.hostname)}
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{website.hostname}</span>
              {selectedWebsite === website.hostname && (
                <Check className="h-4 w-4" />
              )}
              {website.isActive && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">
                  Live
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(website.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
