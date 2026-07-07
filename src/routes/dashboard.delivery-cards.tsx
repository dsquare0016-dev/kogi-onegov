import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HardHat, CheckCircle2, AlertOctagon, Map, Target, FileText, X, Download, Calendar, DollarSign, Activity, Loader2, Database, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/dashboard/delivery-cards')({
  component: DeliveryCardsPage,
});

function DeliveryCardsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { safeGetCollection } = await import('@/lib/firebase');
      const data = await safeGetCollection('projects', []);
      if (data.length === 0) {
        setIsFallback(true);
      } else {
        setProjects(data);
        setIsFallback(false);
      }
    } catch (e) {
      console.error(e);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 h-[60vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading operations & delivery sheets...</p>
      </div>
    );
  }

  // Fallback structures if database has no projects
  const activeCount = isFallback ? 118 : projects.filter(p => p.status === 'Active' || p.status === 'ON SCHEDULE' || p.status === 'In Progress').length;
  const completedCount = isFallback ? 45 : projects.filter(p => p.status === 'Completed').length;
  const delayedCount = isFallback ? 12 : projects.filter(p => p.status === 'Delayed' || p.status === 'SLIGHT DELAY' || p.status === 'CRITICAL RISK').length;
  
  const totalBudgetVal = isFallback 
    ? 84.3 
    : (projects.reduce((acc, p) => acc + (parseFloat(p.budget) || 0), 0) / 1000); // converting millions to billions or sum direct

  const displayedProjects = isFallback ? [
    {
      id: "proj-1",
      name: "Confluence University of Science and Technology (CUSTECH) Phase II",
      location: "Osara (Adavi LGA)",
      contractor: "Julius Berger",
      status: "ON SCHEDULE",
      progress: 65,
      estCompletion: "Nov 2026",
      budget: "₦14.5 Billion",
      description: "Phase II expansion involving the construction of 4 new faculty buildings, a central library, and advanced research laboratories.",
      milestones: [
        { name: "Foundation & Earthworks", completed: true },
        { name: "Structural Framing", completed: true },
        { name: "Roofing & Exterior", completed: false },
        { name: "Interior Finishing & MEP", completed: false }
      ]
    },
    {
      id: "proj-2",
      name: "Okene Reference Hospital Expansion",
      location: "Okene LGA",
      contractor: "CCECC",
      status: "SLIGHT DELAY",
      progress: 82,
      estCompletion: "Aug 2026 (Revised)",
      budget: "₦8.2 Billion",
      description: "Expansion of the clinical wards to add 150 new beds, including a state-of-the-art oncology center and upgraded diagnostic wing.",
      milestones: [
        { name: "Main Ward Construction", completed: true },
        { name: "Oncology Center Superstructure", completed: true },
        { name: "Equipment Installation", completed: false },
        { name: "Commissioning", completed: false }
      ]
    },
    {
      id: "proj-3",
      name: "Lokoja-Ganaja Road Embankment",
      location: "Lokoja LGA",
      contractor: "Setraco",
      status: "CRITICAL RISK",
      progress: 28,
      estCompletion: "Unknown",
      budget: "₦5.6 Billion",
      description: "Construction of a heavy-duty embankment and drainage system along the Ganaja corridor to prevent annual flooding disruptions.",
      milestones: [
        { name: "Site Clearing & Mobilization", completed: true },
        { name: "Initial Drainage Excavation", completed: true },
        { name: "Main Embankment Casting", completed: false },
        { name: "Asphalt Laying", completed: false }
      ]
    }
  ] : projects.map(p => ({
    id: p.id,
    name: p.name,
    location: p.location || "Statewide",
    contractor: p.contractor || "Direct Labour",
    status: p.status || "Active",
    progress: p.progress || 50,
    estCompletion: p.estCompletion || "Dec 2026",
    budget: `₦${p.budget} Million`,
    description: p.description || "Capital project currently administered by the state registry.",
    milestones: p.milestones || [
      { name: "Planning & Design", completed: true },
      { name: "Procurement & Excavation", completed: true },
      { name: "Superstructure Assembly", completed: false },
      { name: "Final Handover & Launch", completed: false }
    ]
  }));

  return (
    <div className="p-6 max-w-[1400px] mx-auto pb-24 space-y-6 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Delivery & Operations</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tracking the execution of physical infrastructure and capital projects across all 21 Local Government Areas.
          </p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded-md text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
        >
          <Loader2 className="size-3.5" /> Sync Projects
        </button>
      </div>

      {isFallback && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <AlertCircle className="size-4 shrink-0 text-amber-500 animate-pulse" /> 
            Capital Projects Registry Empty / Offline Fallback Mode
          </div>
          <p className="leading-relaxed">
            This module relies on live database content from the Firestore collection <code className="bg-amber-500/15 px-1.5 py-0.5 rounded font-mono font-bold">projects</code>. 
            If no records exist, the page displays mock cached operations.
          </p>
          <div className="pt-1">
            <span className="font-bold">Required Data Action:</span> Add, modify, or create projects in the Projects Center at the <Link to="/dashboard/projects" className="font-extrabold underline text-amber-700 hover:text-amber-800">Projects Center (/dashboard/projects)</Link> or use the create actions in the admin panel.
          </div>
        </div>
      )}

      {!isFallback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs flex items-center gap-2 font-bold">
          <Database className="size-4 shrink-0 text-emerald-500" /> Live Data Connected: Fetched {projects.length} capital projects from Firestore.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/60 shadow-sm bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-primary mb-2">
              <HardHat className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Active Projects</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">{activeCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Capital projects currently underway</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <CheckCircle2 className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Completed</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">{completedCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Delivered this fiscal cycle</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-amber-600 mb-2">
              <AlertOctagon className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Delayed / At Risk</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">{delayedCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Requiring governor intervention</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-[#C5A059] mb-2">
              <DollarSign className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Total Capital Value</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">₦{totalBudgetVal.toFixed(1)}B</div>
            <div className="text-xs text-muted-foreground mt-1">Aggregated budget commitments</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-md">
        <CardHeader className="border-b border-border/40 bg-muted/10">
          <CardTitle className="text-lg">Key Capital Projects Registry</CardTitle>
          <CardDescription>Select any project card to review milestones and official files.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {displayedProjects.map((p) => (
              <div 
                key={p.id} 
                className="p-4 hover:bg-muted/15 transition-colors cursor-pointer flex justify-between items-center"
                onClick={() => setSelectedProject(p)}
              >
                <div>
                  <h4 className="font-bold text-sm">{p.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">Location: {p.location} | Contractor: {p.contractor}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-primary">{p.budget}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 font-bold">Progress: {p.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl border-border/60 bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black">{selectedProject.name}</CardTitle>
                <CardDescription className="text-xs">{selectedProject.location}</CardDescription>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="size-5 text-muted-foreground" /></button>
            </CardHeader>
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div>
                <span className="font-bold block text-xs text-muted-foreground uppercase">Project Mandate</span>
                <p className="mt-1">{selectedProject.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold block text-xs text-muted-foreground uppercase">Contractor</span>
                  <span className="font-bold text-foreground">{selectedProject.contractor}</span>
                </div>
                <div>
                  <span className="font-bold block text-xs text-muted-foreground uppercase">Budget</span>
                  <span className="font-bold text-primary">{selectedProject.budget}</span>
                </div>
              </div>
              <div>
                <span className="font-bold block text-xs text-muted-foreground uppercase mb-2">Milestones</span>
                <div className="space-y-1.5">
                  {selectedProject.milestones.map((m: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className={`size-3 rounded-full ${m.completed ? 'bg-emerald-500' : 'bg-muted border border-border'}`}></div>
                      <span className={m.completed ? 'line-through text-muted-foreground' : 'font-bold'}>{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end">
              <button onClick={() => setSelectedProject(null)} className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-semibold cursor-pointer">Close Portal</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
