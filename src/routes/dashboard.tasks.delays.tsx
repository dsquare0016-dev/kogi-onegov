import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, TrendingUp, AlertOctagon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const Route = createFileRoute('/dashboard/tasks/delays')({
  component: TaskDelaysComponent,
})

function TaskDelaysComponent() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Delay Analysis</h1>
        <p className="text-muted-foreground mt-1">Analytics identifying operational bottlenecks and delay root causes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm bg-red-500/5 border-red-500/20">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-600">
                <AlertTriangle className="size-4" />
              </div>
              <div className="text-2xl font-bold text-red-600">245</div>
            </div>
            <div className="text-xs font-medium text-red-600/80">Total Delayed Tasks</div>
          </CardContent>
        </Card>
        
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="size-4" />
              </div>
              <div className="text-2xl font-bold">14 Days</div>
            </div>
            <div className="text-xs font-medium text-muted-foreground">Average Delay Duration</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                <TrendingUp className="size-4" />
              </div>
              <div className="text-2xl font-bold">89</div>
            </div>
            <div className="text-xs font-medium text-muted-foreground">Escalated to DG</div>
          </CardContent>
        </Card>

         <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
                <AlertOctagon className="size-4" />
              </div>
              <div className="text-xl font-bold">Procurement</div>
            </div>
            <div className="text-xs font-medium text-muted-foreground">Primary Delay Source</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
             <CardTitle className="text-lg font-bold">Delay Sources Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <DelayBar label="Procurement Delay" value={45} color="bg-rose-500" count={110} />
            <DelayBar label="Funding Delay" value={25} color="bg-orange-500" count={61} />
            <DelayBar label="Contractor Delay" value={15} color="bg-amber-500" count={36} />
            <DelayBar label="Governor Approval Delay" value={5} color="bg-indigo-500" count={12} />
            <DelayBar label="Commissioner Delay" value={5} color="bg-blue-500" count={12} />
            <DelayBar label="Staff/Desk Officer Delay" value={5} color="bg-teal-500" count={14} />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
             <CardTitle className="text-lg font-bold">High Risk Escalations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border/50">
                <EscalationItem id="TSK-042" title="State Hospital Wing B Construction" days={42} risk="Critical" />
                <EscalationItem id="TSK-112" title="Textbook Distribution Batch 2" days={28} risk="High" />
                <EscalationItem id="TSK-209" title="Water Infrastructure Repair" days={21} risk="High" />
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DelayBar({ label, value, color, count }: { label: string, value: number, color: string, count: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span className="text-muted-foreground">{count} Tasks ({value}%)</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  )
}

function EscalationItem({ id, title, days, risk }: { id: string, title: string, days: number, risk: string }) {
  return (
    <div className="p-4 hover:bg-muted/20 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${risk === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
          Risk: {risk}
        </span>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground mt-2">
        <span><strong className="text-foreground">{id}</strong></span>
        <span className="text-red-500 font-medium">Delayed by {days} Days</span>
      </div>
    </div>
  )
}
