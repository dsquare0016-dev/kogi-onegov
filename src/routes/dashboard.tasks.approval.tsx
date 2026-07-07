import { dbGetPendingApprovals, dbRecordApprovalAction } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Circle, ArrowRight, Clock, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/dashboard/tasks/approval')({
  component: TaskApprovalComponent,
})

function TaskApprovalComponent() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');

  const session = getSession();

  const loadApprovals = async () => {
    setLoading(true);
    try {
      
      if (session?.email) {
        const data = await dbGetPendingApprovals({ data: { email: session.email } });
        setApprovals(data || []);
      }
    } catch (err) {
      console.error("Error loading approvals from PostgreSQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleAction = async (approvalId: string, action: 'approve' | 'reject' | 'return') => {
    if (!session?.email) {
      toast.error("You must be logged in to act on approvals.");
      return;
    }
    try {
      
      await dbRecordApprovalAction({
        data: {
          email: session.email,
          approvalId,
          action,
          comment: comment || undefined
        }
      });
      toast.success(`Request successfully ${action}ed.`);
      setComment('');
      loadApprovals();
    } catch (err: any) {
      toast.error(err.message || "Failed to process approval action.");
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Approval Workflows</h1>
        <p className="text-muted-foreground mt-1">Authorize, return, or reject pending state operations and transactions.</p>
      </div>

      <div className="space-y-6">
        {loading && (
          <div className="text-center py-12 text-muted-foreground">Loading pending authorization requests...</div>
        )}

        {!loading && approvals.length === 0 && (
          <div className="flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/60 rounded-xl p-12 bg-muted/5">
            <CheckCircle2 className="size-12 mb-4 text-emerald-500 opacity-60" />
            <p className="font-bold text-foreground">No Pending Approvals</p>
            <p className="text-sm mt-1">Your approval queue is currently empty. Clear to go!</p>
          </div>
        )}

        {!loading && approvals.map((app) => (
          <Card key={app.id} className="border-border/60 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="bg-muted/10 pb-4 border-b border-border/50">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-lg flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    {app.source_type} Approval Request
                  </span>
                  {app.title || `Workflow Request: ${app.id}`}
                </CardTitle>
                <Badge variant="outline" className="border-amber-500/20 text-amber-600 bg-amber-500/5 font-bold">
                  {app.status === 'submitted' ? 'Awaiting Action' : app.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-4 rounded-lg bg-muted/10 border border-border space-y-3">
                <div className="text-sm">
                  <span className="font-bold text-muted-foreground uppercase text-[10px] block mb-1">Description</span>
                  <p className="text-foreground leading-relaxed">{app.description || 'No description provided.'}</p>
                </div>
                {app.amount && Number(app.amount) > 0 && (
                  <div className="text-sm">
                    <span className="font-bold text-muted-foreground uppercase text-[10px] block mb-1">Financial Implication</span>
                    <p className="font-mono font-bold text-lg text-primary">₦{Number(app.amount).toLocaleString()}</p>
                  </div>
                )}
                {app.mda_name && (
                  <div className="text-sm">
                    <span className="font-bold text-muted-foreground uppercase text-[10px] block mb-1">Initiating MDA</span>
                    <p className="font-medium">{app.mda_name}</p>
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span>Requested By: <strong>{app.requested_by_name || 'System'}</strong></span>
                </div>
              </div>

              {/* Progress Flow Steps */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-b border-border/50 py-6">
                <WorkflowStep label="Initiated" active approved />
                <ArrowRight className="text-muted-foreground hidden md:block size-4" />
                <WorkflowStep label={app.step_name || 'Vetting'} active current />
                <ArrowRight className="text-muted-foreground hidden md:block size-4" />
                <WorkflowStep label="Final Approval" active={app.is_final_approval} />
              </div>

              {/* Action Box */}
              <div className="p-4 bg-muted/20 rounded-lg border border-border/80 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Remarks / Remarks</label>
                  <textarea 
                    className="w-full p-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary h-20" 
                    placeholder="Enter approval comments, recommendations or conditions..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 font-bold" onClick={() => handleAction(app.id, 'reject')}>
                    Reject
                  </Button>
                  <Button variant="outline" className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10 font-bold" onClick={() => handleAction(app.id, 'return')}>
                    Return to Sender
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => handleAction(app.id, 'approve')}>
                    Approve Step
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Demo/Fallback Workflows for visual layout preview if database has none */}
        {!loading && approvals.length === 0 && (
          <div className="space-y-6 opacity-60">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pt-6 border-t">Workflow Previews (Read Only)</h3>
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="bg-indigo-500/5 pb-4 border-b border-indigo-500/10">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex flex-col gap-1">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Statewide Task</span>
                    Road Rehabilitation Contract Signoff
                  </CardTitle>
                  <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-bold">
                    Governor Level
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <WorkflowStep label="Officer" active approved />
                  <ArrowRight className="text-muted-foreground hidden md:block" />
                  <WorkflowStep label="HOD" active approved />
                  <ArrowRight className="text-muted-foreground hidden md:block" />
                  <WorkflowStep label="Commissioner" active approved />
                  <ArrowRight className="text-muted-foreground hidden md:block" />
                  <WorkflowStep label="Governor" active current />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowStep({ label, active, approved, current }: { label: string, active?: boolean, approved?: boolean, current?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${!active && !current ? 'opacity-40' : ''}`}>
      <div className={`size-10 rounded-full flex items-center justify-center border-2 
        ${approved ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
        ${current ? 'bg-background border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] animate-pulse' : ''}
        ${!approved && !current ? 'bg-background border-border text-muted-foreground' : ''}
      `}>
        {approved ? <CheckCircle2 className="size-5" /> : current ? <Clock className="size-5" /> : <Circle className="size-3" />}
      </div>
      <span className={`text-xs font-bold text-center ${current ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
    </div>
  )
}
