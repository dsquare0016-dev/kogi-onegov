import { dbGetPillarsAndObjectives, dbGetKpis, dbSaveKpi, dbDeleteKpi } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BarChart3, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/dashboard/dev-plan/kpi-framework')({
  component: DevPlanKPIFrameworkPage,
});

function DevPlanKPIFrameworkPage() {
  const [kpis, setKpis] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newMetric, setNewMetric] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [selectedPillarId, setSelectedPillarId] = useState("");

  // Edit State
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null);
  const [editKpiMetric, setEditKpiMetric] = useState("");
  const [editKpiTarget, setEditKpiTarget] = useState("");
  const [editKpiUnit, setEditKpiUnit] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      
      const [poData, kpisData] = await Promise.all([
        dbGetPillarsAndObjectives(),
        dbGetKpis()
      ]);
      setPillars(poData.pillars);
      setKpis(kpisData);
      if (poData.pillars.length > 0 && !selectedPillarId) {
        setSelectedPillarId(poData.pillars[0].id);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddKPI = async () => {
    if (!newMetric.trim() || !newTarget.trim() || !newUnit.trim() || !selectedPillarId) return;
    try {
      
      await dbSaveKpi({
        data: {
          pillar_id: selectedPillarId,
          metric: newMetric,
          target_value: Number(newTarget),
          current_value: 0,
          unit: newUnit
        }
      });
      setNewMetric("");
      setNewTarget("");
      setNewUnit("");
      loadData();
    } catch (err: any) {
      alert("Error saving KPI: " + err.message);
    }
  };

  const handleRemoveKPI = async (id: string) => {
    if (!confirm("Are you sure you want to delete this KPI?")) return;
    try {
      
      await dbDeleteKpi({ data: { id } });
      loadData();
    } catch (err: any) {
      alert("Error deleting KPI: " + err.message);
    }
  };

  const startEditingKpi = (k: any) => {
    setEditingKpiId(k.id);
    setEditKpiMetric(k.metric);
    setEditKpiTarget(k.target_value.toString());
    setEditKpiUnit(k.unit);
  };

  const saveEditKpi = async (kpi: any) => {
    try {
      
      await dbSaveKpi({
        data: {
          id: kpi.id,
          pillar_id: kpi.pillar_id,
          metric: editKpiMetric,
          target_value: Number(editKpiTarget),
          current_value: kpi.current_value,
          unit: editKpiUnit
        }
      });
      setEditingKpiId(null);
      loadData();
    } catch (err: any) {
      alert("Error saving KPI: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading KPIs...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KPI Framework</h1>
          <p className="text-muted-foreground mt-1">
            Build the Key Performance Indicator framework that will track progress towards the Strategic Pillars (Sectors).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KPI List */}
        <div className="lg:col-span-2 space-y-6">
           {pillars.length === 0 ? (
             <div className="p-12 text-center text-muted-foreground bg-muted/20 border border-dashed border-border rounded-xl">
               <p>You must define Strategic Pillars before adding KPIs.</p>
             </div>
           ) : (
             pillars.map((pillar) => {
               const pillarKpis = kpis.filter(k => k.pillar_id === pillar.id);
               if (pillarKpis.length === 0) return null; // Only show pillars that have KPIs mapped
               return (
                 <Card key={pillar.id} className="border-border/60 shadow-sm overflow-hidden">
                   <div className="bg-primary/5 p-4 border-b border-border/50">
                     <div className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-1">Sector (Pillar)</div>
                     <h3 className="font-bold text-base text-foreground">{pillar.name}</h3>
                   </div>
                   <CardContent className="p-0">
                     <table className="w-full text-sm text-left">
                       <thead className="bg-muted/30 border-b border-border/50 uppercase text-[10px] text-muted-foreground tracking-wider">
                         <tr>
                           <th className="px-4 py-3 font-semibold">Metric</th>
                           <th className="px-4 py-3 font-semibold">Target</th>
                           <th className="px-4 py-3 font-semibold">Current Baseline</th>
                           <th className="px-4 py-3 font-semibold text-right">Action</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-border/30">
                          {pillarKpis.map(kpi => (
                            <tr key={kpi.id} className={`transition-colors group ${editingKpiId === kpi.id ? 'bg-muted/10' : 'hover:bg-muted/10'}`}>
                              {editingKpiId === kpi.id ? (
                                <>
                                  <td className="px-4 py-2">
                                    <div className="flex items-center gap-2">
                                      <BarChart3 className="size-4 text-muted-foreground shrink-0" />
                                      <input type="text" value={editKpiMetric} onChange={e => setEditKpiMetric(e.target.value)} className="w-full p-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex gap-2">
                                      <input type="number" value={editKpiTarget} onChange={e => setEditKpiTarget(e.target.value)} className="w-20 p-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary" />
                                      <input type="text" value={editKpiUnit} onChange={e => setEditKpiUnit(e.target.value)} className="w-16 p-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 font-mono text-muted-foreground">
                                    {Number(kpi.current_value || 0).toLocaleString()} {kpi.unit}
                                  </td>
                                  <td className="px-4 py-2 text-right whitespace-nowrap">
                                    <button onClick={() => saveEditKpi(kpi)} className="p-1.5 text-emerald-500 hover:text-emerald-600 bg-emerald-500/10 rounded mr-1"><Check className="size-4" /></button>
                                    <button onClick={() => setEditingKpiId(null)} className="p-1.5 text-muted-foreground hover:text-foreground bg-muted rounded"><X className="size-4" /></button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                                    <BarChart3 className="size-4 text-muted-foreground" /> {kpi.metric}
                                  </td>
                                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                                    {Number(kpi.target_value || 0).toLocaleString()} {kpi.unit}
                                  </td>
                                  <td className="px-4 py-3 font-mono text-muted-foreground">
                                    {Number(kpi.current_value || 0).toLocaleString()} {kpi.unit}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className={`flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity`}>
                                      <button onClick={() => startEditingKpi(kpi)} className="p-1.5 text-muted-foreground hover:text-primary rounded hover:bg-primary/10"><Edit2 className="size-4" /></button>
                                      <button onClick={() => handleRemoveKPI(kpi.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="size-4" /></button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                       </tbody>
                     </table>
                   </CardContent>
                 </Card>
               );
             })
           )}
           {/* Fallback if no KPIs mapped yet but pillars exist */}
           {pillars.length > 0 && kpis.length === 0 && (
             <div className="p-12 text-center text-muted-foreground bg-muted/20 border border-dashed border-border rounded-xl">
               <p>No KPIs defined yet. Add one from the panel.</p>
             </div>
           )}
        </div>

        {/* Add KPI Form */}
        <div className="lg:col-span-1">
          <Card className="border-border/60 shadow-sm sticky top-6">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <CardTitle className="text-lg">Add New KPI</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 pt-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sector (Pillar)</label>
                <select 
                  value={selectedPillarId}
                  onChange={e => setSelectedPillarId(e.target.value)}
                  className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary truncate"
                >
                  {pillars.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Metric Name</label>
                <input 
                  type="text" 
                  value={newMetric}
                  onChange={e => setNewMetric(e.target.value)}
                  placeholder="e.g. Hospitals Upgraded"
                  className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Value</label>
                  <input 
                    type="number" 
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit</label>
                  <input 
                    type="text" 
                    value={newUnit}
                    onChange={e => setNewUnit(e.target.value)}
                    placeholder="e.g. Units, %, km"
                    className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              
              <button 
                onClick={handleAddKPI}
                disabled={!newMetric.trim() || !newTarget.trim() || !newUnit.trim() || !selectedPillarId}
                className="w-full mt-2 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold rounded-md transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <Plus className="size-4" /> Define KPI
              </button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
