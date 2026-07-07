import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Search, ShieldAlert, ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/dashboard/tasks/assignment')({
  component: TaskAssignmentComponent,
})

function TaskAssignmentComponent() {
  const unassignedTasks = [
    { id: "TSK-102", title: "Review Q2 Budget Draft", department: "Finance", priority: "High" },
    { id: "TSK-105", title: "Inspect Lokoja Road Site", department: "Works", priority: "Critical" },
    { id: "TSK-110", title: "Compile Staff Nominal Roll", department: "Civil Service", priority: "Medium" },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Officer Assignment</h1>
        <p className="text-muted-foreground mt-1">Assign tasks down the hierarchy to specific officers or staff members.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-border/60 shadow-sm h-fit">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="size-5 text-amber-500" /> Unassigned Tasks ({unassignedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {unassignedTasks.map(t => (
                <div key={t.id} className="p-4 hover:bg-muted/20 cursor-pointer transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono font-medium text-primary">{t.id}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${t.priority === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>{t.priority}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{t.title}</h3>
                  <div className="text-xs text-muted-foreground">{t.department}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
             <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="size-5 text-primary" /> Assignment Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
               <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Selected Task</h3>
               <div className="text-xl font-bold">Inspect Lokoja Road Site <span className="text-sm font-mono text-primary font-normal ml-2">TSK-105</span></div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-2">Hierarchy Routing</h3>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium">Assign to Level</label>
                  <select className="w-full p-2.5 bg-muted/50 border border-border rounded-md text-sm">
                    <option>Commissioner</option>
                    <option>Permanent Secretary</option>
                    <option>Director</option>
                    <option>Deputy Director</option>
                    <option>HOD</option>
                    <option>Desk Officer</option>
                    <option>Staff</option>
                  </select>
                </div>
                <ArrowRight className="size-5 text-muted-foreground mt-6 hidden md:block" />
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium">Specific Officer</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input type="text" className="w-full pl-9 p-2.5 bg-muted/50 border border-border rounded-md text-sm" placeholder="Search name or ID..." />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-border">
               <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                Confirm Assignment
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
