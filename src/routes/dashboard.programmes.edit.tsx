import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Search, Save, Edit2, Layers, MapPin, Building, Target, Banknote } from 'lucide-react';
import { programmesStore, ProgrammeRow } from '@/lib/programmesStore';

export const Route = createFileRoute('/dashboard/programmes/edit')({
  component: EditProgramme,
});

function EditProgramme() {
  const [programmes, setProgrammes] = useState<ProgrammeRow[]>([]);
  const [q, setQ] = useState('');
  const [selectedProgId, setSelectedProgId] = useState<string | null>(null);

  const [editName, setEditName] = useState('');
  const [editPillar, setEditPillar] = useState('');
  const [editMda, setEditMda] = useState('');
  const [editBudget, setEditBudget] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProgrammes(programmesStore.programmes);
  }, []);

  const filtered = programmes.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.mda.toLowerCase().includes(q.toLowerCase()));
  const selectedProg = programmes.find(p => p.id === selectedProgId);

  const handleSelect = (prog: ProgrammeRow) => {
    setSelectedProgId(prog.id);
    setEditName(prog.name);
    setEditPillar(prog.pillar);
    setEditMda(prog.mda);
    setEditBudget(prog.budget);
  };

  const handleSave = () => {
    if (!selectedProgId) return;
    setIsSaving(true);

    const updated = programmes.map(p => p.id === selectedProgId ? {
      ...p,
      name: editName,
      pillar: editPillar,
      mda: editMda,
      budget: editBudget
    } : p);

    programmesStore.programmes = updated;
    setProgrammes(updated);

    setTimeout(() => {
      setIsSaving(false);
      setSelectedProgId(null);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Programmes</h1>
          <p className="text-muted-foreground mt-1">Search and modify core details of existing programmes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Search & List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Search programmes by name or MDA..." className="pl-9 bg-background" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          
          <div className="space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
            {filtered.map(prog => (
              <Card 
                key={prog.id} 
                onClick={() => handleSelect(prog)}
                className={`border-border/60 shadow-sm cursor-pointer transition-all ${selectedProgId === prog.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-muted-foreground">{prog.id}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      prog.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' :
                      prog.status === 'Suspended' ? 'bg-rose-500/10 text-rose-600' :
                      prog.status === 'Archived' ? 'bg-muted text-muted-foreground' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>{prog.status}</span>
                  </div>
                  <div className="font-bold text-sm leading-tight">{prog.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Building className="size-3" /> {prog.mda}</div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/10">No programmes found.</div>
            )}
          </div>
        </div>

        {/* Right Side: Editor */}
        <div className="lg:col-span-2">
          {!selectedProg ? (
            <div className="h-[400px] flex flex-col items-center justify-center border border-dashed rounded-lg text-muted-foreground bg-muted/5">
              <Edit2 className="size-8 mb-3 text-muted-foreground/50" />
              <p>Select a programme from the list to edit its details</p>
            </div>
          ) : (
            <Card className="border-border/60 shadow-sm animate-in fade-in zoom-in-95 duration-200">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="text-lg flex items-center gap-2"><Edit2 className="size-5 text-primary" /> Editing {selectedProg.id}</CardTitle>
                <CardDescription>Make changes to the programme's fundamental properties.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Programme Title</Label>
                    <Input value={editName} onChange={e => setEditName(e.target.value)} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Development Pillar</Label>
                      <select 
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={editPillar} 
                        onChange={e => setEditPillar(e.target.value)}
                      >
                        <option value="Fostering Prosperity">Fostering Prosperity</option>
                        <option value="Building Resilience">Building Resilience</option>
                        <option value="Providing Direction">Providing Direction</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Executing MDA</Label>
                      <Input value={editMda} onChange={e => setEditMda(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Total Budget (₦)</Label>
                    <Input type="number" value={editBudget} onChange={e => setEditBudget(Number(e.target.value))} />
                    <p className="text-[10px] text-muted-foreground text-right">Currently: ₦{(editBudget / 1e9).toFixed(2)} Billion</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setSelectedProgId(null)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground min-w-[120px]">
                    {isSaving ? <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <><Save className="size-4 mr-2" /> Save Changes</>}
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
