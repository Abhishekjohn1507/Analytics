import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Browser {
  name: string;
  sessions: number;
  percentage: number;
}

interface BrowsersTableProps {
  data?: Browser[];
}

export function BrowsersTable({ data = [] }: BrowsersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Browsers</CardTitle>
        <CardDescription>Sessions by browser</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((browser) => (
          <div key={browser.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{browser.name}</span>
              <span className="text-muted-foreground font-mono">
                {browser.sessions.toLocaleString()} ({browser.percentage}%)
              </span>
            </div>
            <Progress value={browser.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
