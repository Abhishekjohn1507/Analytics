import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight } from "lucide-react";

interface TopPage {
  page: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  bounceRate: string;
}

interface TopPagesTableProps {
  data?: TopPage[];
}

export function TopPagesTable({ data = [] }: TopPagesTableProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Top Pages</CardTitle>
        <CardDescription>Most visited pages on your website</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Unique Visitors</TableHead>
              <TableHead className="text-right">Bounce Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((page) => (
              <TableRow key={page.page} className="hover:bg-accent/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1">
                    <span className="text-primary">{page.page}</span>
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell>{page.title}</TableCell>
                <TableCell className="text-right font-mono">{page.views.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{page.uniqueVisitors.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{page.bounceRate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
