import { createFileRoute } from '@tanstack/react-router';
import { getSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Search, UserCheck, Settings2, UserPlus } from 'lucide-react';

export const Route = createFileRoute('/dashboard/my-team')({
  component: MyTeamPage,
});

function MyTeamPage() {
  const session = getSession();
  const isHead = ['commissioner', 'perm_secretary', 'dg_gdu'].includes(session?.role || '');
  const isSuperAdmin = session?.role === 'super_admin';

  if (!isHead && !isSuperAdmin) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
        <p className="text-muted-foreground">Only MDA Heads can access team configuration.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Team & Assistants</h1>
        <p className="text-muted-foreground mt-1">Configure your immediate office staff and memo routing delegates.</p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="flex items-center gap-2"><Settings2 className="size-5 text-primary" /> Secretary / PA Assignment</CardTitle>
          <CardDescription>
            All incoming memos will be routed to your assigned Secretary first for vetting before reaching your desk.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold shadow-sm border border-border">
                {session?.role === 'commissioner' ? 'EO' : 'None'}
              </div>
              <div>
                <h3 className="font-bold">{session?.role === 'commissioner' ? 'Mr. Emmanuel Ojo' : 'No Secretary Assigned'}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
                  Current MDA Secretary
                </p>
              </div>
            </div>
            {session?.role === 'commissioner' && (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="size-3" /> Active
              </span>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Assign New Secretary</h4>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search staff nominal roll by name or ID..." 
                  className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:bg-primary/90 transition-colors shadow-sm">
                Assign
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: You can only assign verified staff from the nominal roll. If you need an adhoc staff assigned, contact the Superadmin.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
