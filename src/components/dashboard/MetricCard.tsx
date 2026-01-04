import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export function MetricCard({ title, value, change, changeType, icon: Icon }: MetricCardProps) {
  const changeColor = {
    positive: "text-emerald-600 dark:text-emerald-400",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${changeColor[changeType]} mt-1`}>
          {change} from last period
        </p>
      </CardContent>
    </Card>
  );
}
