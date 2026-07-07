import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Filter, FileSpreadsheet, File as FilePdf } from 'lucide-react';

export const Route = createFileRoute('/dashboard/tasks/reports')({
  component: TaskReportsComponent,
})

function TaskReportsComponent() {
  const [scope, setScope] = useState("Statewide (All Ministries)");

  const ministries = ["Ministry of Agriculture", "Ministry of Education", "Ministry of Health", "Ministry of Finance", "Ministry of Works"];
  const departments = ["Primary Education Dept", "Public Health Dept", "Crop Production Dept", "Tax Assessment Dept"];
  const agencies = ["Kogi State Revenue Service", "Kogi State Primary Health Care Development Agency", "Kogi State Agricultural Development Project"];

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Reports</h1>
        <p className="text-muted-foreground mt-1">Generate automated reports across various formats and timeframes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card className="md:col-span-1 border-border/60 shadow-sm h-fit">
          <CardHeader className="pb-4 border-b border-border/50">
             <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="size-5 text-primary" /> Report Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <select className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm">
                <option>Daily Report</option>
                <option>Weekly Report</option>
                <option>Monthly Report</option>
                <option>Quarterly Report</option>
                <option>Annual Report</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Scope</label>
              <select 
                className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
              >
                <option>Statewide (All Ministries)</option>
                <option>Specific Ministry</option>
                <option>Specific Department</option>
                <option>Specific Agency</option>
              </select>
            </div>

            {scope === "Specific Ministry" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Select Ministry</label>
                <select className="w-full p-2 bg-white dark:bg-background border border-primary/50 rounded-md text-sm">
                  <option value="">Select a Ministry...</option>
                  {ministries.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            )}

            {scope === "Specific Department" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Select Department</label>
                <select className="w-full p-2 bg-white dark:bg-background border border-primary/50 rounded-md text-sm">
                  <option value="">Select a Department...</option>
                  {departments.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            )}

            {scope === "Specific Agency" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Select Agency</label>
                <select className="w-full p-2 bg-white dark:bg-background border border-primary/50 rounded-md text-sm">
                  <option value="">Select an Agency...</option>
                  {agencies.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Filter</label>
              <select className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm">
                <option>All Tasks</option>
                <option>Completed Only</option>
                <option>Delayed Only</option>
                <option>Pending Verification</option>
              </select>
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
              Generate Report Preview
            </button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
             <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="size-5 text-indigo-500" /> Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="border border-border rounded-lg p-4 hover:border-red-500 hover:bg-red-500/5 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <FilePdf className="size-8 text-red-500" />
                  <Download className="size-4 text-muted-foreground group-hover:text-red-500" />
                </div>
                <h3 className="font-semibold mb-1">Export as PDF</h3>
                <p className="text-xs text-muted-foreground">Executive summary ready for printing or email distribution.</p>
              </div>

              <div className="border border-border rounded-lg p-4 hover:border-emerald-500 hover:bg-emerald-500/5 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <FileSpreadsheet className="size-8 text-emerald-500" />
                  <Download className="size-4 text-muted-foreground group-hover:text-emerald-500" />
                </div>
                <h3 className="font-semibold mb-1">Export as Excel</h3>
                <p className="text-xs text-muted-foreground">Raw data dump for custom analysis and pivot tables.</p>
              </div>

            </div>

             <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">Automated Delivery</h3>
                <p className="text-xs text-blue-700/80 dark:text-blue-200/80 mb-3">You can schedule this report to automatically email to the DG or Governor on a recurring basis.</p>
                <button className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 transition-colors">Setup Schedule</button>
             </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
