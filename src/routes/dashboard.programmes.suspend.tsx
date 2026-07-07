import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { AlertTriangle, Search, PauseCircle, Ban, Layers, Building } from 'lucide-react';
import { programmesStore, ProgrammeRow } from '@/lib/programmesStore';

export const Route = createFileRoute('/dashboard/programmes/suspend')({
  component: SuspendProgramme,
});

function SuspendProgramme() {
  const [programmes, setProgrammes] = useState<ProgrammeRow[]>([]);
  const [q, setQ] = useState('');
  const [selectedProgId, setSelectedProgId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isSuspending, setIsSuspending] = useState(false);

  useEffect(() => {
    setProgrammes(programmesStore.programmes);
  }, []);

  const activeProgrammes = programmes.filter(p => p.status === 'Active');
  const filtered = activeProgrammes.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.mda.toLowerCase().includes(q.toLowerCase()));
  const selectedProg = programmes.find(p => p.id === selectedProgId);

  const handleSuspend = () => {
    if (!selectedProgId || !reason) return;
    setIsSuspending(true);

    const updated = programmes.map(p => p.id === selectedProgId ? {
      ...p,
      status: 'Suspended' as const,
      reason: reason
    } : p);

    programmesStore.programmes = updated;
    setProgrammes(updated);

    setTimeout(() => {
      setIsSuspending(false);
      setSelectedProgId(null);
      setReason('');
    }, 1500);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suspend Programmes</h1>
          <p className="text-muted-foreground mt-1">Temporarily halt active programmes due to funding, compliance, or strategic shifts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Search & List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Search active programmes..." className="pl-9 bg-background" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          
          <div className="space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
            {filtered.map(prog => (
              <Card 
                key={prog.id} 
                onClick={() => setSelectedProgId(prog.id)}
                className={`border-border/60 shadow-sm cursor-pointer transition-all ${selectedProgId === prog.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-muted-foreground">{prog.id}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">{prog.status}</span>
                  </div>
                  <div className="font-bold text-sm leading-tight">{prog.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Building className="size-3" /> {prog.mda}</div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/10">No active programmes found.</div>
            )}
          </div>
        </div>

        {/* Right Side: Suspension Action */}
        <div className="lg:col-span-2">
          {!selectedProg ? (
            <div className="h-[400px] flex flex-col items-center justify-center border border-dashed rounded-lg text-muted-foreground bg-muted/5">
              <Ban className="size-8 mb-3 text-muted-foreground/50" />
              <p>Select an active programme to initiate suspension</p>
            </div>
          ) : (
            <Card className="border-rose-500/30 shadow-sm animate-in fade-in zoom-in-95 duration-200">
              <CardHeader className="border-b border-border/50 bg-rose-500/5">
                <CardTitle className="text-lg flex items-center gap-2 text-rose-600"><AlertTriangle className="size-5" /> Initiate Suspension</CardTitle>
                <CardDescription>You are about to suspend {selectedProg.name}. All constituent projects will also be flagged.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="p-4 rounded-xl border border-border bg-muted/10 flex items-center gap-4">
                  <div className="size-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Layers className="size-5" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-0.5">{selectedProg.id}</div>
                    <div className="font-bold text-sm">{selectedProg.name}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Suspension <span className="text-rose-500">*</span></Label>
                    <textarea 
                      id="reason"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      className="w-full p-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary h-32" 
                      placeholder="e.g. Funding reallocation, compliance breach, environmental factors..."
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setSelectedProgId(null)}>Cancel</Button>
                  <Button 
                    onClick={handleSuspend} 
                    disabled={isSuspending || reason.trim() === ''} 
                    className="bg-rose-600 hover:bg-rose-700 text-white min-w-[150px]"
                  >
                    {isSuspending ? <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <><PauseCircle className="size-4 mr-2" /> Suspend Programme</>}
                  </Button>
                </div>

              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
