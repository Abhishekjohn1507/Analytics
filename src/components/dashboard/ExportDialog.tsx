import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AnalyticsData } from "@/lib/analyticsApi";

interface ExportDialogProps {
  hostname: string;
  analyticsData: AnalyticsData;
}

export function ExportDialog({ hostname, analyticsData }: ExportDialogProps) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  const exportCSV = () => {
    setExporting("csv");
    try {
      // Build CSV content
      let csv = "Analytics Report for " + hostname + "\n";
      csv += "Generated: " + new Date().toLocaleDateString() + "\n\n";

      // Metrics
      csv += "METRICS\n";
      csv += "Metric,Value\n";
      csv += `Total Visitors,${analyticsData.metrics.totalVisitors}\n`;
      csv += `Page Views,${analyticsData.metrics.pageViews}\n`;
      csv += `Unique Visitors,${analyticsData.metrics.uniqueVisitors}\n`;
      csv += `Average Session,${analyticsData.metrics.avgSession}\n`;
      csv += `Bounce Rate,${analyticsData.metrics.bounceRate}\n`;
      csv += `Realtime Visitors,${analyticsData.realtimeVisitors}\n\n`;

      // Traffic data
      csv += "TRAFFIC BY DATE\n";
      csv += "Date,Visitors,Page Views\n";
      analyticsData.trafficData.forEach((d) => {
        csv += `${d.date},${d.visitors},${d.pageViews}\n`;
      });
      csv += "\n";

      // Top pages
      csv += "TOP PAGES\n";
      csv += "Page,Title,Views,Unique Visitors,Bounce Rate\n";
      analyticsData.topPages.forEach((p) => {
        csv += `"${p.page}","${p.title}",${p.views},${p.uniqueVisitors},${p.bounceRate}\n`;
      });
      csv += "\n";

      // Traffic sources
      csv += "TRAFFIC SOURCES\n";
      csv += "Source,Percentage\n";
      analyticsData.trafficSources.forEach((s) => {
        csv += `${s.name},${s.value}%\n`;
      });
      csv += "\n";

      // Devices
      csv += "DEVICES\n";
      csv += "Device,Visitors\n";
      analyticsData.devices.forEach((d) => {
        csv += `${d.device},${d.visitors}\n`;
      });
      csv += "\n";

      // Browsers
      csv += "BROWSERS\n";
      csv += "Browser,Sessions,Percentage\n";
      analyticsData.browsers.forEach((b) => {
        csv += `${b.name},${b.sessions},${b.percentage}%\n`;
      });

      // Download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `analytics-${hostname}-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();

      toast({
        title: "Export complete",
        description: "CSV file downloaded successfully",
      });
    } catch (error) {
      console.error("CSV export error:", error);
      toast({
        title: "Export failed",
        description: "Could not generate CSV file",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  const exportPDF = () => {
    setExporting("pdf");
    try {
      // Create printable HTML content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Analytics Report - ${hostname}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1f2937; }
            h1 { color: #7c3aed; margin-bottom: 5px; }
            h2 { color: #4b5563; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            .meta { color: #6b7280; margin-bottom: 30px; }
            .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .metric { background: #f9fafb; border-radius: 8px; padding: 20px; text-align: center; }
            .metric-value { font-size: 28px; font-weight: bold; color: #7c3aed; }
            .metric-label { color: #6b7280; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e5e7eb; }
            th { background: #f9fafb; font-weight: 600; }
            .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>Analytics Report</h1>
          <p class="meta">${hostname} • Generated on ${new Date().toLocaleDateString()}</p>
          
          <div class="metrics">
            <div class="metric">
              <div class="metric-value">${analyticsData.metrics.totalVisitors.toLocaleString()}</div>
              <div class="metric-label">Total Visitors</div>
            </div>
            <div class="metric">
              <div class="metric-value">${analyticsData.metrics.pageViews.toLocaleString()}</div>
              <div class="metric-label">Page Views</div>
            </div>
            <div class="metric">
              <div class="metric-value">${analyticsData.metrics.uniqueVisitors.toLocaleString()}</div>
              <div class="metric-label">Unique Visitors</div>
            </div>
            <div class="metric">
              <div class="metric-value">${analyticsData.metrics.avgSession}</div>
              <div class="metric-label">Avg. Session</div>
            </div>
            <div class="metric">
              <div class="metric-value">${analyticsData.metrics.bounceRate}</div>
              <div class="metric-label">Bounce Rate</div>
            </div>
            <div class="metric">
              <div class="metric-value">${analyticsData.realtimeVisitors}</div>
              <div class="metric-label">Realtime Visitors</div>
            </div>
          </div>

          <h2>Top Pages</h2>
          <table>
            <thead>
              <tr><th>Page</th><th>Views</th><th>Unique Visitors</th><th>Bounce Rate</th></tr>
            </thead>
            <tbody>
              ${analyticsData.topPages.map(p => `
                <tr><td>${p.page}</td><td>${p.views}</td><td>${p.uniqueVisitors}</td><td>${p.bounceRate}</td></tr>
              `).join("")}
            </tbody>
          </table>

          <h2>Traffic Sources</h2>
          <table>
            <thead>
              <tr><th>Source</th><th>Percentage</th></tr>
            </thead>
            <tbody>
              ${analyticsData.trafficSources.map(s => `
                <tr><td>${s.name}</td><td>${s.value}%</td></tr>
              `).join("")}
            </tbody>
          </table>

          <h2>Devices</h2>
          <table>
            <thead>
              <tr><th>Device</th><th>Visitors</th></tr>
            </thead>
            <tbody>
              ${analyticsData.devices.map(d => `
                <tr><td>${d.device}</td><td>${d.visitors}</td></tr>
              `).join("")}
            </tbody>
          </table>

          <h2>Browsers</h2>
          <table>
            <thead>
              <tr><th>Browser</th><th>Sessions</th><th>Percentage</th></tr>
            </thead>
            <tbody>
              ${analyticsData.browsers.map(b => `
                <tr><td>${b.name}</td><td>${b.sessions}</td><td>${b.percentage}%</td></tr>
              `).join("")}
            </tbody>
          </table>

          <div class="footer">
            <p>Analytics Report • ${hostname}</p>
          </div>
        </body>
        </html>
      `;

      // Open in new window and trigger print
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }

      toast({
        title: "Export ready",
        description: "Print dialog opened for PDF export",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: "Could not generate PDF",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Analytics</DialogTitle>
          <DialogDescription>
            Download analytics data for {hostname}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={exportCSV}
            disabled={exporting !== null}
          >
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            <div className="text-left">
              <div className="font-medium">Export as CSV</div>
              <div className="text-sm text-muted-foreground">
                Spreadsheet format for Excel, Google Sheets
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={exportPDF}
            disabled={exporting !== null}
          >
            <FileText className="h-8 w-8 text-red-600" />
            <div className="text-left">
              <div className="font-medium">Export as PDF</div>
              <div className="text-sm text-muted-foreground">
                Print-ready report format
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
