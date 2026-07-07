import { dbGetPillarsAndObjectives, dbSavePillar, dbDeletePillar } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Landmark, Trash2, Edit2, Check, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/dashboard/dev-plan/pillars')({
  component: DevPlanPillarsPage,
});

function DevPlanPillarsPage() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [pillars, setPillars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Pillar Form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editBudget, setEditBudget] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      
      const data = await dbGetPillarsAndObjectives();
      setPillars(data.pillars);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddPillar = async () => {
    if (!newTitle.trim() || !newDesc.trim()) return;
    try {
      
      await dbSavePillar({
        data: {
          name: newTitle,
          description: newDesc,
          plan_year_start: 2026,
          plan_year_end: 2058,
          status: 'active'
        }
      });
      setNewTitle("");
      setNewDesc("");
      loadData();
    } catch (e: any) {
      alert("Error adding pillar: " + e.message);
    }
  };

  const handleRemovePillar = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pillar?")) return;
    try {
      
      await dbDeletePillar({ data: { id } });
      loadData();
    } catch (e: any) {
      alert("Error deleting pillar: " + e.message);
    }
  };

  const startEditing = (p: any) => {
    setEditingId(p.id);
    setEditTitle(p.name);
    setEditDesc(p.description || "");
    setEditBudget(0); // Optional: add budget concept to DB if needed
  };

  const saveEdit = async () => {
    try {
      
      await dbSavePillar({
        data: {
          id: editingId,
          name: editTitle,
          description: editDesc
        }
      });
      setEditingId(null);
      loadData();
    } catch (e: any) {
      alert("Error updating pillar: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading Pillars...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Strategic Pillars</h1>
            <div className="flex items-center bg-muted/50 border border-border rounded-md px-3 py-1.5 shadow-sm">
              <span className="text-sm text-muted-foreground mr-2 font-medium">Year:</span>
              <input 
                type="number" 
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="w-20 bg-transparent outline-none font-bold text-primary text-lg"
                min="2024"
                max="2056"
              />
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            Define the high-level focus areas of the 32-Year Development Plan for <strong>{currentYear}</strong>. All state projects and budgets will map back to these pillars.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pillar List */}
        <div className="lg:col-span-2 space-y-4">
           {pillars.length === 0 ? (
             <div className="p-12 text-center text-muted-foreground bg-muted/20 border border-dashed border-border rounded-xl">
               <Landmark className="size-12 mx-auto mb-3 opacity-20" />
               <p>No strategic pillars defined yet. Add one from the panel.</p>
             </div>
           ) : (
             pillars.map((pillar, idx) => (
               <Card key={pillar.id} className={`border-border/60 shadow-sm relative group ${editingId === pillar.id ? 'ring-2 ring-primary border-transparent' : ''}`}>
                 <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   {editingId === pillar.id ? (
                     <>
                       <button onClick={saveEdit} className="text-emerald-500 hover:text-emerald-600 bg-emerald-500/10 p-1.5 rounded-md"><Check className="size-4" /></button>
                       <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground bg-muted p-1.5 rounded-md"><X className="size-4" /></button>
                     </>
                   ) : (
                     <>
                       <button onClick={() => startEditing(pillar)} className="text-muted-foreground hover:text-primary"><Edit2 className="size-4" /></button>
                       <button onClick={() => handleRemovePillar(pillar.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="size-4" /></button>
                     </>
                   )}
                 </div>
                 <CardContent className="p-6">
                   <div className="flex items-start gap-4">
                     <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary mt-1">
                       {idx + 1}
                     </div>
                     <div className="flex-1 pr-16">
                       {editingId === pillar.id ? (
                         <div className="space-y-3">
                           <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full font-bold text-lg p-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                           <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full text-sm p-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20" />
                         </div>
                       ) : (
                         <>
                           <h3 className="font-bold text-lg">{pillar.name}</h3>
                           <p className="text-muted-foreground text-sm mt-1">{pillar.description}</p>
                         </>
                       )}
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ))
           )}
        </div>

        {/* Add Pillar Form */}
        <div className="lg:col-span-1">
          <Card className="border-border/60 shadow-sm sticky top-6">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <CardTitle className="text-lg">Add New Pillar</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 pt-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pillar Name</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Health & Human Services"
                  className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea 
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Briefly describe the goals of this pillar..."
                  className="w-full h-24 p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <button 
                onClick={handleAddPillar}
                disabled={!newTitle.trim() || !newDesc.trim()}
                className="w-full py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold rounded-md transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <Plus className="size-4" /> Add Pillar
              </button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
