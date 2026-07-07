import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, Search, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/admin/users/suspend')({
  component: SuspendUser,
});

function SuspendUser() {
  const [searched, setSearched] = useState(false);

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Suspend User</h1>
        <p className="text-muted-foreground mt-1">Temporarily suspend a user account for a specific duration.</p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2"><Search className="size-5 text-primary" /> Lookup User</CardTitle>
          <CardDescription>Search by email to locate the account to suspend.</CardDescription>
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
        <Card className="border-amber-500/30 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500"><Clock className="size-5" /> Target Account: John Doe</CardTitle>
            <CardDescription>user@kogistate.gov.ng • Ministry of Finance • Staff</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg flex gap-3">
              <AlertCircle className="size-5 shrink-0" />
              <div className="text-sm">
                Suspension is temporary. The account will automatically unlock when the selected duration expires.
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Suspension Duration</label>
                <select className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500">
                  <option>24 Hours</option>
                  <option>7 Days</option>
                  <option>14 Days</option>
                  <option>30 Days</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Reason for Suspension</label>
                <input type="text" className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="e.g. Under disciplinary review" />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-semibold inline-flex items-center gap-2 transition-colors">
                <Clock className="size-4" /> Apply Suspension
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
