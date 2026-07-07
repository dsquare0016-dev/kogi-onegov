import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Lock, ShieldAlert, Database, Mail, HardDrive, ShieldCheck, Wrench, ServerCrash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getSession } from '@/lib/auth';
import { AccessDenied } from '@/components/AccessDenied';

export const Route = createFileRoute('/dashboard/admin/')({
  component: SystemAdminDashboard,
})

function SystemAdminDashboard() {
  const session = getSession();
  const isAdmin = session?.role === 'super_admin' || session?.role === 'governor';

  if (!isAdmin) {
    return <AccessDenied message="You do not have administrative privileges to view the system dashboard." />;
  }

  const systemStatus = [
    { label: "Database Clusters", status: "Healthy", icon: Database, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "SMTP Email Service", status: "Degraded", icon: Mail, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "File Storage (GCS)", status: "Healthy", icon: HardDrive, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Automated Backups", status: "Syncing", icon: ServerCrash, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Security Firewall", status: "Active", icon: ShieldCheck, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Maintenance Mode", status: "Disabled", icon: Wrench, color: "text-gray-500", bg: "bg-gray-500/10" },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">System Dashboard</h1>
        <p className="text-muted-foreground mt-1">Master operational overview for the Kogi State Digital Governance ERP.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Users" value="1,402" icon={Users} color="text-blue-500" />
        <StatCard title="Active Users" value="892" icon={Users} color="text-emerald-500" />
        <StatCard title="Online Now" value="145" icon={Users} color="text-indigo-500" />
        <StatCard title="Failed Logins Today" value="23" icon={ShieldAlert} color="text-amber-500" />
        <StatCard title="Locked Accounts" value="4" icon={Lock} color="text-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
             <CardTitle className="text-lg font-bold">System Health Monitor</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {systemStatus.map((s, i) => {
                 const Icon = s.icon;
                 return (
                   <div key={i} className="flex items-center gap-4 p-3 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors">
                     <div className={`p-2 rounded-md ${s.bg} ${s.color}`}>
                       <Icon className="size-5" />
                     </div>
                     <div>
                       <div className="text-sm font-semibold">{s.label}</div>
                       <div className={`text-xs font-bold ${s.color}`}>{s.status}</div>
                     </div>
                   </div>
                 )
               })}
             </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between">
             <CardTitle className="text-lg font-bold">Recent Security Alerts</CardTitle>
             <Badge variant="outline" className="text-amber-500 border-amber-500/50">3 Unresolved</Badge>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border/50">
                <div className="p-4 flex gap-3 hover:bg-muted/20">
                  <ShieldAlert className="size-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold">Multiple Failed Logins Detected</div>
                    <div className="text-xs text-muted-foreground mt-1">IP 192.168.1.45 attempted to access 'perm.sec.finance' 8 times in 5 minutes.</div>
                    <div className="text-xs font-mono text-muted-foreground mt-2">Today, 14:32 PM</div>
                  </div>
                </div>
                <div className="p-4 flex gap-3 hover:bg-muted/20">
                  <ServerCrash className="size-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold">Database Latency Spike</div>
                    <div className="text-xs text-muted-foreground mt-1">Read operations on the Projects table exceeded 500ms threshold.</div>
                    <div className="text-xs font-mono text-muted-foreground mt-2">Today, 11:15 AM</div>
                  </div>
                </div>
                <div className="p-4 flex gap-3 hover:bg-muted/20">
                  <Lock className="size-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold">Account Locked: Chief Accountant</div>
                    <div className="text-xs text-muted-foreground mt-1">Account locked automatically due to suspicious login location (Ukraine).</div>
                    <div className="text-xs font-mono text-muted-foreground mt-2">Yesterday, 09:40 AM</div>
                  </div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg bg-muted/50 ${color}`}>
            <Icon className="size-4" />
          </div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className="text-xs font-medium text-muted-foreground">{title}</div>
      </CardContent>
    </Card>
  )
}
