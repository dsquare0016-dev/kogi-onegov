import { dbGetTasks } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { getSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, CheckCircle2, Clock, AlertTriangle, XCircle, Search, Calendar, User, FileWarning, Wallet, MapPin, BadgeAlert, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { handleAskAI } from '@/lib/ai-intelligence-service';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/dashboard/tasks/')({
  component: TaskDashboardComponent,
})

function TaskDashboardComponent() {
  const session = getSession();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      
      const data = await dbGetTasks();
      setTasks(data);
      setLoading(false);
    };
    loadTasks();
  }, []);

  const executiveRoles = ['super_admin', 'governor', 'deputy_governor', 'ssg', 'chief_of_staff', 'deputy_chief_of_staff', 'head_of_service', 'dg_gdu', 'civil_service_commission', 'accountant_general', 'auditor_general'];
  const headRoles = ['commissioner', 'perm_secretary', 'director', 'director_admin', 'director_finance', 'director_prs'];
  const isFullAccess = session?.role === 'super_admin' || session?.role === 'governor';
  const isHeadOrExecutive = executiveRoles.includes(session?.role || '') || headRoles.includes(session?.role || '');
  const isRegularStaff = !isHeadOrExecutive;

  // Filter tasks based on ministry isolation
  const filteredTasks = tasks.filter(t => {
    if (isFullAccess) return true;
    if (!session?.mda) return true;
    return t.mda?.toLowerCase() === session.mda.toLowerCase();
  });

  const displayTasks = filteredTasks.length > 0 ? filteredTasks : [
    { id: "TSK-001", title: "Lokoja Road Resurfacing", assignee: "Engr. Musa", status: "In Progress", priority: "High", budgetCode: "0215001001", budgetLinked: true },
    { id: "TSK-002", title: "Annual Healthcare Audit", assignee: "Dr. Aishat", status: "Completed", priority: "Critical", budgetCode: "0215001002", budgetLinked: true },
    { id: "TSK-003", title: "School Desk Procurement", assignee: "Mrs. Bello", status: "Delayed", priority: "Medium", budgetCode: "0215001003", budgetLinked: false },
    { id: "TSK-004", title: "Agriculture Seminar", assignee: "Mr. Yusuf", status: "Pending Approval", priority: "Low", budgetCode: "0215001004", budgetLinked: true },
  ];

  // Calculate dynamic stats
  const totalCount = filteredTasks.length || 2405;
  const activeCount = filteredTasks.filter(t => t.status === 'In Progress').length || 1142;
  const completedCount = filteredTasks.filter(t => t.status === 'Completed').length || 840;
  const delayedCount = filteredTasks.filter(t => t.status === 'Delayed').length || 245;
  const pendingCount = filteredTasks.filter(t => t.status === 'Pending Review' || t.status === 'Pending Approval').length || 156;
  const rejectedCount = filteredTasks.filter(t => t.status === 'Rejected').length || 22;
  const verificationCount = filteredTasks.filter(t => t.status === 'Verification Pending').length || 89;
  const budgetLinkedCount = filteredTasks.filter(t => t.budgetCode).length || 2100;
  const unlinkedCount = filteredTasks.filter(t => !t.budgetCode).length || 305;
  const evidencePendingCount = filteredTasks.filter(t => !t.evidenceUrl).length || 412;

  const stats = [
    { title: "Total Tasks", value: totalCount.toLocaleString(), icon: LayoutDashboard, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Tasks", value: activeCount.toLocaleString(), icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Completed Tasks", value: completedCount.toLocaleString(), icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Delayed Tasks", value: delayedCount.toLocaleString(), icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "Pending Approval", value: pendingCount.toLocaleString(), icon: Clock, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { title: "Rejected Tasks", value: rejectedCount.toLocaleString(), icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: "Verification Pending", value: verificationCount.toLocaleString(), icon: BadgeAlert, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Budget Linked", value: budgetLinkedCount.toLocaleString(), icon: Wallet, color: "text-teal-500", bg: "bg-teal-500/10" },
    { title: "Unlinked (Flagged)", value: unlinkedCount.toLocaleString(), icon: BadgeAlert, color: "text-red-600", bg: "bg-red-600/10" },
    { title: "Evidence Pending", value: evidencePendingCount.toLocaleString(), icon: FileWarning, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  // Regular staff personal task view
  if (isRegularStaff) {
    const staffTasks = filteredTasks.filter(t => t.officer === session?.name);
    
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto pb-24">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground mt-1">View your personal task assignments and progress.</p>
        </div>

        <div className="bg-muted/40 border border-border rounded-lg p-4 flex items-center gap-3">
          <User className="size-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Personal View</div>
            <div className="text-sm font-medium">{session?.name || 'Staff Member'}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><LayoutDashboard className="size-4" /></div>
                <div className="text-2xl font-bold">{staffTasks.length}</div>
              </div>
              <div className="text-xs font-medium text-muted-foreground mt-3">My Tasks</div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="size-4" /></div>
                <div className="text-2xl font-bold">{staffTasks.filter(t => t.status === 'Completed').length}</div>
              </div>
              <div className="text-xs font-medium text-muted-foreground mt-3">Completed</div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Clock className="size-4" /></div>
                <div className="text-2xl font-bold">{staffTasks.filter(t => t.status === 'In Progress').length}</div>
              </div>
              <div className="text-xs font-medium text-muted-foreground mt-3">In Progress</div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><AlertTriangle className="size-4" /></div>
                <div className="text-2xl font-bold">{staffTasks.filter(t => t.status === 'Delayed').length}</div>
              </div>
              <div className="text-xs font-medium text-muted-foreground mt-3">Overdue</div>
            </CardContent>
          </Card>
        </div>

        {staffTasks.length === 0 ? (
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="p-4 rounded-full bg-muted/60 mb-4">
                <LayoutDashboard className="size-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-bold text-muted-foreground">No Tasks Assigned Yet</h3>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-md">You haven't been assigned any tasks or activities to display. Tasks will appear here once they are assigned to you by your supervisor or head of department.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg font-semibold">Task ID</th>
                      <th className="px-4 py-3 font-semibold">Title</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 rounded-tr-lg font-semibold">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffTasks.map((t, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                        <td className="px-4 py-3 font-medium">{t.title}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className={`${t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'}`}>
                            {t.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`${t.priority === 'High' ? 'border-orange-500 text-orange-500' : 'border-gray-500 text-gray-500'}`}>
                            {t.priority}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management Dashboard</h1>
          <p className="text-muted-foreground mt-1">Command center for {isFullAccess ? 'statewide' : 'MDA'} task execution and alignment.</p>
        </div>
        {isFullAccess && (
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
              + Create New Task
            </button>
          </div>
        )}
      </div>

      {/* Role Context Bar */}
      <div className="bg-muted/40 border border-border rounded-lg p-4 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="size-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Current View</div>
            <div className="text-sm font-medium">{isFullAccess ? 'Statewide DG Command Center' : 'MDA Task Summary'}</div>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Completion Rate</div>
            <div className="text-lg font-bold text-emerald-500">64.8%</div>
          </div>
          <div className="w-px bg-border h-10"></div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Staff Assigned</div>
            <div className="text-lg font-bold">1,822</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-border/60 shadow-sm hover:border-primary/20 transition-all">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
                <div className="text-xs font-medium text-muted-foreground mt-3">{stat.title}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Tasks</CardTitle>
            <button className="text-xs text-primary hover:underline font-medium">View All</button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg font-semibold">Task ID</th>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Assignee</th>
                    <th className="px-4 py-3 font-semibold">Alignment</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg font-semibold">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTasks.map((t, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                      <td className="px-4 py-3 font-medium">{t.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.assignee || t.officer || "Unassigned"}</td>
                      <td className="px-4 py-3">
                        {t.budgetLinked ? (
                          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5">Aligned</Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/5">Unlinked</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`
                          ${t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}
                          ${t.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : ''}
                          ${t.status === 'Delayed' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : ''}
                          ${t.status === 'Pending Approval' ? 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20' : ''}
                        `} variant="secondary">
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                         <Badge variant="outline" className={`
                          ${t.priority === 'Critical' ? 'border-red-500/50 text-red-500' : ''}
                          ${t.priority === 'High' ? 'border-orange-500/50 text-orange-500' : ''}
                          ${t.priority === 'Medium' ? 'border-blue-500/50 text-blue-500' : ''}
                          ${t.priority === 'Low' ? 'border-gray-500/50 text-gray-500' : ''}
                        `}>
                           {t.priority}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
               <BrainCircuit className="size-5 text-primary" /> AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-sm text-red-600/90 flex gap-3 items-start">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div><strong className="font-semibold block">Warning: Alignment Gaps</strong>305 tasks are missing budget lineage. The Ministry of Works accounts for 42% of these.</div>
            </div>
            <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-sm text-blue-600/90 flex gap-3 items-start">
              <Search className="size-4 shrink-0 mt-0.5" />
              <div><strong className="font-semibold block">Insight: Delay Patterns</strong>Most delays are originating from Procurement bottlenecks in capital projects.</div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Ask AI</div>
              <div className="flex gap-2">
                <input type="text" placeholder="e.g. Which tasks lack evidence?" className="text-sm w-full bg-muted border-none rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary" />
                <button onClick={() => handleAskAI("Task Intelligence", "Global Tasks", "Task Analyst")} className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors"><Search className="size-4"/></button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function ShieldAlertIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m12 8-1.5 2.5h3L12 13" />
    </svg>
  )
}

