import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, AlertTriangle, AlertCircle, PlayCircle, Download } from 'lucide-react';

export const Route = createFileRoute('/dashboard/reports/daily')({
  component: DailyReportsComponent,
})

const TIMELINE = [
  { id: 1, time: '08:00 AM', event: 'Morning Executive Standup Completed', type: 'success', details: 'All ministries reported present. 3 key blockers identified.' },
  { id: 2, time: '10:30 AM', event: 'System Outage: Health Portal', type: 'danger', details: 'The primary health portal experienced 15 minutes of downtime due to server load.' },
  { id: 3, time: '01:15 PM', event: 'Budget Approval: Road Maintenance', type: 'success', details: 'Q3 maintenance budget signed off by EXCo.' },
  { id: 4, time: '03:00 PM', event: 'Pending Sign-offs (Critical)', type: 'warning', details: '4 official documents awaiting Governor\'s signature before EOD.' },
  { id: 5, time: 'Now', event: 'Compiling End of Day Metrics', type: 'info', details: 'System is gathering data from all active MDAs.' },
];

function DailyReportsComponent() {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Clock className="size-5" />
            <span className="font-bold uppercase tracking-wider text-sm">{currentDate}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Operational Report</h1>
          <p className="text-muted-foreground mt-1">Real-time log of today's key events, blockers, and achievements.</p>
        </div>
        <Button variant="outline" className="gap-2 font-bold bg-background">
          <Download className="size-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Timeline Feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            <CardHeader className="bg-muted/5 border-b border-border/50 pb-4">
              <CardTitle className="text-xl">Today's Activity Feed</CardTitle>
              <CardDescription>Chronological log of executive actions and system alerts.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative pl-6 border-l-2 border-border/50 space-y-8">
                {TIMELINE.map((item, index) => (
                  <div key={item.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[35px] size-4 rounded-full border-2 border-background shadow-sm
                      ${item.type === 'success' ? 'bg-emerald-500' : 
                        item.type === 'danger' ? 'bg-red-500' : 
                        item.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}
                    `}></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                      <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">{item.time}</span>
                      <h4 className="text-lg font-bold leading-tight">{item.event}</h4>
                    </div>
                    <div className={`p-4 rounded-lg border mt-2
                      ${item.type === 'danger' ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900 text-red-900 dark:text-red-200' : 
                        item.type === 'warning' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900 text-amber-900 dark:text-amber-200' : 
                        'bg-muted/30 border-border/50 text-muted-foreground'}
                    `}>
                      <p className="text-sm leading-relaxed">{item.details}</p>
                      
                      {item.type === 'danger' && (
                        <Button size="sm" variant="destructive" className="mt-3 text-xs h-7">Acknowledge Outage</Button>
                      )}
                      {item.type === 'warning' && (
                        <Button size="sm" variant="outline" className="mt-3 text-xs h-7 border-amber-500 text-amber-700 hover:bg-amber-100">Review Documents</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Quick Stats & Blockers */}
        <div className="lg:col-span-1 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-border/60 bg-emerald-500/10">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                <CheckCircle2 className="size-6 text-emerald-600 mb-1" />
                <h4 className="text-3xl font-black text-emerald-700 dark:text-emerald-400">142</h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase tracking-wider font-bold">Tasks Completed</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-blue-500/10">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                <PlayCircle className="size-6 text-blue-600 mb-1" />
                <h4 className="text-3xl font-black text-blue-700 dark:text-blue-400">45</h4>
                <p className="text-[10px] text-blue-600 dark:text-blue-500 uppercase tracking-wider font-bold">In Progress</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 shadow-sm border-t-4 border-t-red-500">
            <CardHeader className="pb-3 border-b border-border/50 bg-red-50/50 dark:bg-red-950/10">
              <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="size-4" />
                Critical Blockers (2)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <div className="p-4 hover:bg-muted/10">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">Delay in Contractor Payment (Ministry of Works)</p>
                    <Badge variant="destructive" className="text-[10px]">High</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Awaiting final sign-off from the Ministry of Finance.</p>
                </div>
                <div className="p-4 hover:bg-muted/10">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">Equipment Shortage at Lokoja Site</p>
                    <Badge variant="secondary" className="text-[10px] bg-amber-500 text-white">Medium</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Logistics team needs immediate clearance to dispatch trucks.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/60 shadow-sm bg-muted/20">
            <CardContent className="p-4 flex gap-3">
              <AlertCircle className="size-5 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                This daily report resets at midnight (WAT). All unresolved blockers will be carried over to tomorrow's log.
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
