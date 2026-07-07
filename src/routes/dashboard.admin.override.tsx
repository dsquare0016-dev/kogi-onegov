import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Crown, AlertOctagon, Key, ShieldCheck, PowerOff, DatabaseBackup } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/dashboard/admin/override')({
  component: AdminOverrideComponent,
})

function AdminOverrideComponent() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-500 flex items-center gap-3">
          <Crown className="size-8" /> DG GDU Master Override
        </h1>
        <p className="text-muted-foreground mt-1">Ultimate operational console. Actions taken here override all other system rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Profile Info */}
        <Card className="border-border/60 shadow-sm md:col-span-1 h-fit">
          <CardHeader className="pb-4 border-b border-border/50">
             <CardTitle className="text-lg">Master Administrator Profile</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">Full Name</div>
              <div className="font-bold">Director General (GDU)</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">Email</div>
              <div className="font-bold">dg@kogistate.gov.ng</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">Security Clearance</div>
              <Badge className="bg-red-500 hover:bg-red-600 mt-1">Level 5 (Ultimate)</Badge>
            </div>
            <div className="pt-4 border-t border-border/50">
              <button className="w-full px-4 py-2 border border-border bg-background rounded-md text-sm font-semibold hover:bg-muted">Change Master Password</button>
            </div>
          </CardContent>
        </Card>

        {/* Extreme Powers */}
        <div className="md:col-span-2 space-y-6">
          
          <Card className="border-red-500/30 shadow-sm bg-red-500/5">
            <CardHeader className="border-b border-red-500/10">
              <CardTitle className="text-red-700 flex items-center gap-2"><AlertOctagon className="size-5" /> Executive Destructive Actions</CardTitle>
              <CardDescription className="text-red-600/80">These actions bypass all protocols and execute immediately.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <OverrideAction 
                  title="Lock Entire ERP System" 
                  description="Instantly forces logout for all 1,402 active users and prevents any new logins except for Master Admins."
                  buttonText="Execute System Lock"
                  icon={PowerOff}
               />
               <OverrideAction 
                  title="Restore Deleted Data" 
                  description="Access the raw database tombstone records to resurrect forcefully deleted records from any module."
                  buttonText="Open Tombstone Vault"
                  icon={DatabaseBackup}
               />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2"><Key className="size-5 text-indigo-500" /> Delegation Rule Configuration</CardTitle>
              <CardDescription>Delegate Master powers to up to 5 trusted technical administrators.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div className="flex justify-between items-center bg-muted/50 p-4 rounded-md border border-border">
                  <div>
                    <div className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">Chief Technical Officer</div>
                    <div className="text-xs text-muted-foreground">cto@kogistate.gov.ng</div>
                  </div>
                  <button className="text-xs px-3 py-1.5 bg-red-500 text-white rounded font-bold">Revoke Super Admin</button>
               </div>
               <button className="w-full py-2 border border-dashed border-indigo-500/50 text-sm font-medium text-indigo-600 hover:bg-indigo-500/10">
                 + Delegate Super Admin (4 Slots Remaining)
               </button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

function OverrideAction({ title, description, buttonText, icon: Icon }: any) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-red-500/20 bg-background rounded-lg">
      <div className="flex gap-3">
        <Icon className="size-5 text-red-500 mt-1 shrink-0" />
        <div>
          <div className="font-bold text-red-900 dark:text-red-400">{title}</div>
          <div className="text-xs text-red-800/80 dark:text-red-300/80 max-w-md mt-1">{description}</div>
        </div>
      </div>
      <button className="shrink-0 px-4 py-2 bg-red-600 text-white font-bold rounded text-xs hover:bg-red-700 w-full sm:w-auto">
        {buttonText}
      </button>
    </div>
  )
}
