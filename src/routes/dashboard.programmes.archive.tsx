import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Search, Archive, Layers, Building, AlertCircle } from 'lucide-react';
import { programmesStore, ProgrammeRow } from '@/lib/programmesStore';

export const Route = createFileRoute('/dashboard/programmes/archive')({
  component: ArchiveProgramme,
});

function ArchiveProgramme() {
  const [programmes, setProgrammes] = useState<ProgrammeRow[]>([]);
  const [q, setQ] = useState('');
  const [selectedProgId, setSelectedProgId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    setProgrammes(programmesStore.programmes);
  }, []);

  const archivableProgrammes = programmes.filter(p => p.status !== 'Archived');
  const filtered = archivableProgrammes.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.mda.toLowerCase().includes(q.toLowerCase()));
  const selectedProg = programmes.find(p => p.id === selectedProgId);

  const handleArchive = () => {
    if (!selectedProgId || !reason) return;
    setIsArchiving(true);

    const updated = programmes.map(p => p.id === selectedProgId ? {
      ...p,
      status: 'Archived' as const,
      reason: reason
    } : p);

    programmesStore.programmes = updated;
    setProgrammes(updated);

    setTimeout(() => {
      setIsArchiving(false);
      setSelectedProgId(null);
      setReason('');
    }, 1500);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Archive Programmes</h1>
          <p className="text-muted-foreground mt-1">Permanently close completed or decommissioned programmes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Search & List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Search programmes to archive..." className="pl-9 bg-background" value={q} onChange={(e) => setQ(e.target.value)} />
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
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      prog.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' :
                      prog.status === 'Suspended' ? 'bg-rose-500/10 text-rose-600' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>{prog.status}</span>
                  </div>
                  <div className="font-bold text-sm leading-tight">{prog.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Building className="size-3" /> {prog.mda}</div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/10">No archivable programmes found.</div>
            )}
          </div>
        </div>

        {/* Right Side: Archive Action */}
        <div className="lg:col-span-2">
          {!selectedProg ? (
            <div className="h-[400px] flex flex-col items-center justify-center border border-dashed rounded-lg text-muted-foreground bg-muted/5">
              <Archive className="size-8 mb-3 text-muted-foreground/50" />
              <p>Select a programme to archive</p>
            </div>
          ) : (
            <Card className="border-border/60 shadow-sm animate-in fade-in zoom-in-95 duration-200">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground"><Archive className="size-5" /> Archive Programme</CardTitle>
                <CardDescription>Archiving a programme removes it from active dashboards. This action preserves historical records.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="size-5 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong>Warning:</strong> You are about to archive <strong>{selectedProg.name}</strong>. 
                    All underlying projects will also be marked as archived. Ensure final audits are completed.
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Archive Reason / Final Remarks <span className="text-rose-500">*</span></Label>
                    <textarea 
                      id="reason"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      className="w-full p-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary h-32" 
                      placeholder="e.g. Programme successfully completed, merged with another programme, decommissioned..."
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setSelectedProgId(null)}>Cancel</Button>
                  <Button 
                    onClick={handleArchive} 
                    disabled={isArchiving || reason.trim() === ''} 
                    className="bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-200 dark:hover:bg-zinc-100 dark:text-zinc-900 text-white min-w-[150px]"
                  >
                    {isArchiving ? <div className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : <><Archive className="size-4 mr-2" /> Confirm Archive</>}
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
