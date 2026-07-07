import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCheck, Search, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/admin/users/restore')({
  component: RestoreUser,
});

function RestoreUser() {
  const [searched, setSearched] = useState(false);

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Restore User</h1>
        <p className="text-muted-foreground mt-1">Re-activate a disabled or suspended user account.</p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2"><Search className="size-5 text-primary" /> Lookup Inactive User</CardTitle>
          <CardDescription>Search by email to locate the suspended or disabled account.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <input type="text" className="flex-1 p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter user email..." />
            <button onClick={() => setSearched(true)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-semibold hover:bg-secondary/80 transition-colors">
              Find User
            </button>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <Card className="border-emerald-500/30 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500"><ShieldCheck className="size-5" /> Target Account: John Doe</CardTitle>
            <CardDescription>user@kogistate.gov.ng • Status: <span className="text-red-500 font-medium">Disabled</span></CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="p-4 bg-muted/30 border border-border rounded-lg text-sm">
              <strong>Previous Reason for Disabling:</strong> Terminated pending investigation.
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Restoration Authorization Note</label>
              <textarea className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 h-24" placeholder="Enter administrative note regarding the restoration..."></textarea>
            </div>

            <div className="pt-4 flex justify-end">
              <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-sm font-semibold inline-flex items-center gap-2 transition-colors">
                <UserCheck className="size-4" /> Restore Account Access
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
