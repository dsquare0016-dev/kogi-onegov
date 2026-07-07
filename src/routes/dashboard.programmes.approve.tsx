import { dbGetPendingApprovals, dbRecordApprovalAction } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Layers, Building } from 'lucide-react';
import { programmesStore, ProgrammeRow } from '@/lib/programmesStore';
import { getSession } from '@/lib/auth';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/programmes/approve')({
  component: ApproveProgramme,
});


function ApproveProgramme() {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [selectedProg, setSelectedProg] = useState<any | null>(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const session = getSession();

  const loadPendingApprovals = async () => {
    setLoading(true);
    try {
      
      if (session?.email) {
        const apps = await dbGetPendingApprovals({ data: { email: session.email } });
        const progApps = apps.filter((a: any) => a.source_type === 'programme');
        
        if (progApps.length > 0) {
          const mapped = progApps.map((a: any) => ({
            id: a.source_id,
            approvalId: a.id,
            name: a.title || 'Untitled Programme',
            pillar: a.workflow_name || 'Strategic Development',
            mda: a.mda_name || 'Ministry',
            budget: Number(a.amount || 0),
            status: a.status || 'Pending Approval',
            progress: 0,
            projects: []
          }));
          setProgrammes(mapped);
          return;
        }
      }
      
      // Fallback to local programmesStore
      const fallback = programmesStore.programmes.filter(p => p.status === 'Planning' || p.status === 'Pending Approval');
      setProgrammes(fallback);
    } catch (err) {
      console.error("Error loading pending programme approvals:", err);
      const fallback = programmesStore.programmes.filter(p => p.status === 'Planning' || p.status === 'Pending Approval');
      setProgrammes(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const approveProgramme = async () => {
    if (!selectedProg) return;

    try {
      if (selectedProg.approvalId && session?.email) {
        
        await dbRecordApprovalAction({
          data: {
            email: session.email,
            approvalId: selectedProg.approvalId,
            action: 'approve',
            comment: remarks
          }
        });
        toast.success("Programme authorized and marked as active in database.");
      } else {
        // Fallback for store-only update
        const updated = programmesStore.programmes.map(p => 
          p.id === selectedProg.id ? { ...p, status: 'Active' as const } : p
        );
        programmesStore.programmes = updated;
        toast.success("Programme authorized successfully (fallback).");
      }
      
      setSelectedProg(null);
      setRemarks('');
      loadPendingApprovals();
    } catch (err: any) {
      toast.error(err.message || "Failed to authorize programme.");
    }
  };

  const rejectProgramme = async () => {
    if (!selectedProg) return;

    try {
      if (selectedProg.approvalId && session?.email) {
        
        await dbRecordApprovalAction({
          data: {
            email: session.email,
            approvalId: selectedProg.approvalId,
            action: 'reject',
            comment: remarks
          }
        });
        toast.success("Programme rejected and archived in database.");
      } else {
        // Fallback for store-only update
        const updated = programmesStore.programmes.map(p => 
          p.id === selectedProg.id ? { ...p, status: 'Archived' as const } : p
        );
        programmesStore.programmes = updated;
        toast.success("Programme rejected successfully (fallback).");
      }
      
      setSelectedProg(null);
      setRemarks('');
      loadPendingApprovals();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject programme.");
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `₦${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `₦${(amount / 1e6).toFixed(1)}M`;
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programme Approval Engine</h1>
          <p className="text-muted-foreground mt-1">Review strategic programmes and authorize them for execution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Awaiting Executive Approval</h3>
          {programmes.length === 0 && (
            <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground bg-muted/5 flex flex-col items-center">
              <CheckCircle2 className="size-8 text-emerald-500 mb-2 opacity-50"/>
              No programmes awaiting approval
            </div>
          )}
          {programmes.map(prog => (
            <Card 
              key={prog.id} 
              className={`border-border/60 shadow-sm cursor-pointer transition-all hover:border-primary/50 ${selectedProg?.id === prog.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`} 
              onClick={() => setSelectedProg(prog)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-600"><Clock className="size-4" /></div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {prog.id.length > 10 ? `PRG-${prog.id.substring(0,6).toUpperCase()}` : prog.id}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-bold">{prog.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Building className="size-3" /> {prog.mda}</div>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                  <span className="text-muted-foreground font-mono">{formatCurrency(prog.budget)}</span>
                  <span className="text-amber-600 font-bold">{prog.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          {!selectedProg ? (
            <div className="h-[400px] flex flex-col items-center justify-center border border-dashed rounded-lg text-muted-foreground bg-muted/5">
              <Layers className="size-8 mb-3 text-muted-foreground/50" />
              <p>Select a programme to review its details</p>
            </div>
          ) : (
            <Card className="border-border/60 shadow-sm animate-in fade-in zoom-in-95 duration-200">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{selectedProg.name}</CardTitle>
                    <CardDescription className="mt-1">{selectedProg.mda} • Proposed under {selectedProg.pillar} Pillar</CardDescription>
                  </div>
                  <div className="bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-xs font-bold uppercase border border-amber-500/20">
                    {selectedProg.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-muted/10">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Programme ID</div>
                    <div className="font-mono font-bold text-sm">
                      {selectedProg.id.length > 10 ? `PRG-${selectedProg.id.substring(0,6).toUpperCase()}` : selectedProg.id}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/10">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Development Pillar</div>
                    <div className="font-bold text-sm">{selectedProg.pillar}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/10">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Executing MDA</div>
                    <div className="font-bold text-sm">{selectedProg.mda}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/10 bg-primary/5 border-primary/20">
                    <div className="text-xs text-primary font-bold uppercase mb-1">Total Budget</div>
                    <div className="font-bold text-lg text-primary">{formatCurrency(selectedProg.budget)}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Constituent Projects Preview</h3>
                  <div className="rounded-lg border border-border/60 overflow-hidden divide-y divide-border/50">
                    {(!selectedProg.projects || selectedProg.projects.length === 0) && (
                      <div className="p-4 text-center text-sm text-muted-foreground">No linked projects yet.</div>
                    )}
                    {(selectedProg.projects || []).map((proj: any, idx: number) => (
                      <div key={idx} className="p-3 flex justify-between items-center bg-muted/5">
                        <div className="text-sm font-medium">{proj.name}</div>
                        <div className="text-xs font-mono px-2 py-1 bg-muted rounded">{proj.status}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <h3 className="font-semibold text-sm mb-3">Executive Action</h3>
                  <div className="space-y-4">
                    <textarea 
                      className="w-full p-3 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary h-24" 
                      placeholder="Enter executive remarks..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    ></textarea>
                    <div className="flex items-center gap-4">
                      <Button onClick={approveProgramme} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12">
                        <CheckCircle2 className="size-5 mr-2" /> Approve Programme
                      </Button>
                      <Button onClick={rejectProgramme} variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive/10 font-bold h-12">
                        <XCircle className="size-5 mr-2" /> Reject & Archive
                      </Button>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
