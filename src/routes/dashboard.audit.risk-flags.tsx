import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Activity, Radar, BellRing, Eye, ShieldAlert } from 'lucide-react';

export const Route = createFileRoute('/dashboard/audit/risk-flags')({
  component: RiskFlagsComponent,
})

const ALERTS = [
  { id: 'RF-992', title: 'Abnormal Budget Drawdown Velocity', mda: 'Ministry of Works', severity: 'Critical', time: '10 mins ago', desc: '45% of Q3 capital allocation was drawn down within a 48-hour window.' },
  { id: 'RF-991', title: 'Multiple Contract Splitting Detected', mda: 'Ministry of Health', severity: 'High', time: '1 hour ago', desc: 'Algorithm detected 3 consecutive contracts awarded to the same vendor just below the tender threshold.' },
  { id: 'RF-990', title: 'Delayed Project Milestone', mda: 'Kogi State Water Board', severity: 'Medium', time: '3 hours ago', desc: 'Okene Water project is 14 days past the scheduled Phase 2 completion date.' },
  { id: 'RF-989', title: 'Unusual Payroll Spike', mda: 'Ministry of Education', severity: 'High', time: 'Yesterday', desc: 'Net payroll expenditure increased by 8% without corresponding new hire documentation.' },
  { id: 'RF-988', title: 'Low IGR Remittance', mda: 'State Transport Service', severity: 'Medium', time: 'Yesterday', desc: 'Weekly revenue remittance is 15% below the 6-month moving average.' },
];

function RiskFlagsComponent() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      {/* Alert Banner */}
      <div className="bg-red-500 text-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
            <BellRing className="size-5" />
          </div>
          <div>
             <h3 className="font-bold text-lg leading-tight">System Defense Active</h3>
             <p className="text-white/80 text-sm">2 Critical and 4 High-Severity anomalies detected in the last 48 hours.</p>
          </div>
        </div>
        <Button variant="secondary" className="font-bold bg-white text-red-600 hover:bg-white/90">
          Acknowledge All
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <Radar className="size-5" />
            <span className="font-bold uppercase tracking-wider text-sm">Early Warning System</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Risk Flags</h1>
          <p className="text-muted-foreground mt-1">Auto-generated anomaly detections powered by the state AI heuristics engine.</p>
        </div>
        <Button variant="outline" className="gap-2 font-bold bg-background">
          <Activity className="size-4" /> View AI Engine Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Threat Matrix */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/60 shadow-sm bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
            <CardContent className="p-8 text-center relative z-10">
              <ShieldAlert className="size-16 text-red-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-6xl font-black text-red-500">12</h2>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mt-2">Active Threats</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/5 border-b border-border/50 pb-4">
              <CardTitle className="text-sm uppercase tracking-wider font-bold">Severity Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <div className="p-4 flex justify-between items-center bg-red-50/50 dark:bg-red-950/20">
                  <span className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <div className="size-2 rounded-full bg-red-500"></div> Critical
                  </span>
                  <span className="font-black text-lg">2</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="font-semibold text-amber-600 dark:text-amber-500 flex items-center gap-2">
                    <div className="size-2 rounded-full bg-amber-500"></div> High
                  </span>
                  <span className="font-black text-lg">4</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="font-semibold text-blue-600 dark:text-blue-500 flex items-center gap-2">
                    <div className="size-2 rounded-full bg-blue-500"></div> Medium
                  </span>
                  <span className="font-black text-lg">6</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Alert Feed */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="bg-muted/5 border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2">
                Real-Time Anomaly Feed
              </CardTitle>
              <CardDescription className="mt-1">Ranked by severity and time of detection.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {ALERTS.map(alert => (
                  <div key={alert.id} className="p-6 transition-colors hover:bg-muted/5 group relative">
                    {/* Severity Left Border */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      alert.severity === 'Critical' ? 'bg-red-500' :
                      alert.severity === 'High' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></div>
                    
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs bg-background">{alert.id}</Badge>
                          <Badge className={`text-xs font-bold border-none ${
                            alert.severity === 'Critical' ? 'bg-red-500 hover:bg-red-600 text-white' :
                            alert.severity === 'High' ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                            'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}>
                            {alert.severity} Risk
                          </Badge>
                          <span className="text-xs font-medium text-muted-foreground">{alert.time}</span>
                        </div>
                        <h4 className="text-lg font-bold leading-tight">{alert.title}</h4>
                        <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                          Source: <span className="text-foreground">{alert.mda}</span>
                        </p>
                        <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl mt-2 p-3 bg-muted/20 rounded-md border border-border/50">
                          {alert.desc}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" className="w-full gap-2 font-bold"><Eye className="size-3" /> Investigate</Button>
                        <Button size="sm" variant="outline" className="w-full">Dismiss</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border/50 bg-muted/5 flex justify-center">
                 <Button variant="ghost" className="font-bold text-sm">Load Older Flags</Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
