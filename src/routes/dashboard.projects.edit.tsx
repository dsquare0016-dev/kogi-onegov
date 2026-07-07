import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Edit2, Save, MapPin, Building, Banknote, Search, Calendar, FolderKanban } from 'lucide-react';
import { projectsStore, ProjectRow } from '@/lib/projectsStore';
import { useDbLgas } from '@/lib/useDbLgas';

export const Route = createFileRoute('/dashboard/projects/edit')({
  component: EditProject,
});

function EditProject() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [q, setQ] = useState('');
  
  const [name, setName] = useState('');
  const [ministry, setMinistry] = useState('');
  const [lga, setLga] = useState('');
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState('');
  const [risk, setRisk] = useState('');

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setProjects(projectsStore.projects);
    const handleUpdate = () => setProjects(projectsStore.projects);
    window.addEventListener('projectsStoreUpdate', handleUpdate);
    return () => window.removeEventListener('projectsStoreUpdate', handleUpdate);
  }, []);

  const handleSelect = (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (proj) {
      setSelectedId(id);
      setName(proj.name);
      setMinistry(proj.ministry);
      setLga(proj.lga);
      setBudget(proj.budget.toString());
      setStatus(proj.status);
      setRisk(proj.risk);
    }
  };

  const handleSave = () => {
    if (!selectedId) return;
    setIsSaved(true);
    
    // Create new array and replace modified project
    const updated = projects.map(p => {
      if (p.id === selectedId) {
        return {
          ...p,
          name,
          ministry,
          lga,
          budget: Number(budget),
          status,
          risk
        };
      }
      return p;
    });
    
    projectsStore.projects = updated;

    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.ministry.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Project Details</h1>
        <p className="text-muted-foreground mt-1">Select an existing project from the GDU pipeline to modify its parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Search & Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Search projects by name or MDA..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {filtered.map(proj => (
              <div 
                key={proj.id} 
                onClick={() => handleSelect(proj.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedId === proj.id ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' : 'border-border/60 hover:border-primary/40 bg-card shadow-sm'}`}
              >
                <div className="font-bold text-sm leading-tight mb-1">{proj.name}</div>
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Building className="size-3" /> {proj.ministry}</div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' : proj.status === 'Suspended' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'}`}>
                    {proj.status}
                  </div>
                  <div className="text-xs font-semibold">₦{(proj.budget / 1000000).toFixed(1)}M</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div className="lg:col-span-2">
          {!selectedId ? (
            <div className="h-[400px] flex flex-col items-center justify-center border border-dashed rounded-lg text-muted-foreground bg-muted/5">
              <Edit2 className="size-8 mb-3 text-muted-foreground/50" />
              <p>Select a project from the left to edit its details</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                  <CardTitle className="text-lg flex items-center gap-2"><FolderKanban className="size-5 text-primary" /> Modify Project Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ministry">Executing Ministry/Agency</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <Input id="ministry" className="pl-9" value={ministry} onChange={e => setMinistry(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lga">Local Government Area (LGA)</Label>
                      <LgaSelect value={lga} onChange={setLga} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                  <CardTitle className="text-lg flex items-center gap-2"><Banknote className="size-5 text-amber-500" /> Adjust Financials & Status</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Total Budget (₦)</Label>
                      <Input id="budget" type="number" value={budget} onChange={e => setBudget(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Current Status</Label>
                      <select 
                        id="status" 
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={status} 
                        onChange={e => setStatus(e.target.value)}
                      >
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Under Review">Under Review</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="risk">Risk Level</Label>
                      <select 
                        id="risk" 
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={risk} 
                        onChange={e => setRisk(e.target.value)}
                      >
                        <option value="Low Risk">Low Risk</option>
                        <option value="Medium Risk">Medium Risk</option>
                        <option value="High Risk">High Risk</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-3">
                <Button className="flex items-center gap-2" onClick={handleSave} disabled={isSaved}>
                  {isSaved ? <span className="flex items-center gap-2"><div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Saving Changes...</span> : <span className="flex items-center gap-2"><Save className="size-4" /> Save Modifications</span>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LgaSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { lgas, loading } = useDbLgas();
  return (
    <select
      id="lga"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={loading}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
    >
      <option value="">{loading ? 'Loading LGAs...' : 'Select LGA...'}</option>
      <option value="Statewide">Statewide</option>
      {lgas.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
    </select>
  );
}
