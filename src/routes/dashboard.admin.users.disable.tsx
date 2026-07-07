import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserMinus, Search, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/admin/users/disable')({
  component: DisableUser,
});

function DisableUser() {
  const [searched, setSearched] = useState(false);

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Disable User</h1>
        <p className="text-muted-foreground mt-1">Indefinitely disable a user account. They will be immediately logged out.</p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2"><Search className="size-5 text-primary" /> Lookup User</CardTitle>
          <CardDescription>Search by email to locate the account to disable.</CardDescription>
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
        <Card className="border-destructive/30 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-destructive"><UserMinus className="size-5" /> Target Account: John Doe</CardTitle>
            <CardDescription>user@kogistate.gov.ng • Ministry of Finance • Staff</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex gap-3">
              <AlertTriangle className="size-5 shrink-0" />
              <div className="text-sm">
                <strong>Warning:</strong> Disabling this account will terminate any active sessions and prevent future logins until the account is restored.
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reason for Disabling (Required)</label>
              <textarea className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-destructive h-24" placeholder="Enter administrative reason..."></textarea>
            </div>
            <div className="pt-4 flex justify-end">
              <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-semibold inline-flex items-center gap-2 hover:bg-destructive/90 transition-colors">
                <UserMinus className="size-4" /> Confirm Disable Account
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
