import { createFileRoute } from '@tanstack/react-router';
import { Route as RouteIcon, Map, CheckCircle2, Goal, Edit2, Save, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/dashboard/command-center/development-plan')({
  component: DevelopmentPlanMonitoringPage,
});

const INITIAL_PILLARS = [
  { id: 1, name: "Fostering Prosperity", progress: 72, weight: 45 },
  { id: 2, name: "Building Resilience", progress: 81, weight: 35 },
  { id: 3, name: "Providing Direction", progress: 64, weight: 20 },
];

function DevelopmentPlanMonitoringPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [pillars, setPillars] = useState(INITIAL_PILLARS);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleUpdatePillar = (id: number, field: string, value: string | number) => {
    setPillars(pillars.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const addPillar = () => {
    setPillars([...pillars, { id: Date.now(), name: "New Pillar", progress: 0, weight: 0 }]);
  };

  const removePillar = (id: number) => {
    setPillars(pillars.filter(p => p.id !== id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0A1142] p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-current">
            <polygon points="0,100 100,0 100,100" />
          </svg>
        </div>

        <div className="relative z-10 flex-1 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-2">
                <RouteIcon className="size-4" />
                DG GDU Command Center
              </div>
              <h1 className="text-4xl font-black tracking-tight">32-Year Development Plan</h1>
              <p className="text-white/70 mt-2 text-lg max-w-2xl">
                Strategic monitoring of the Kogi State macroeconomic framework (2024–2056) and immediate term alignment.
              </p>
            </div>
            
            <div className="flex items-center gap-4 shrink-0 mt-4 md:mt-0">
              {isEditing ? (
                <Button onClick={handleSave} size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] border-none">
                  <Save className="size-4" />
                  Save Changes
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 border-white/20 text-white gap-2 font-bold backdrop-blur">
                  <Edit2 className="size-4" />
                  Edit Plan
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2 text-foreground">
            <Map className="size-5" /> Pillar Progression Tracker
          </h2>
          {isEditing && (
            <Button onClick={addPillar} variant="outline" size="sm" className="gap-2 border-primary text-primary hover:bg-primary/10">
              <Plus className="size-4" /> Add Pillar
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {pillars.map((p, idx) => (
            <div key={p.id} className={`bg-card border ${isEditing ? 'border-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-border'} rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center transition-all duration-300 relative overflow-hidden`}>
              <div className="flex items-center justify-center size-12 bg-primary/10 text-primary font-black rounded-lg shrink-0">
                0{idx + 1}
              </div>
              
              <div className="flex-1 w-full space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        Pillar Name
                      </label>
                      <Input 
                        value={p.name}
                        onChange={(e) => handleUpdatePillar(p.id, 'name', e.target.value)}
                        className="font-bold text-lg h-12 bg-background/50 focus-visible:ring-primary"
                        placeholder="Enter Pillar Name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Weight (%)</label>
                        <Input 
                          type="number"
                          value={p.weight}
                          onChange={(e) => handleUpdatePillar(p.id, 'weight', parseInt(e.target.value) || 0)}
                          className="h-12 bg-background/50 focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Progress (%)</label>
                        <Input 
                          type="number"
                          value={p.progress}
                          onChange={(e) => handleUpdatePillar(p.id, 'progress', parseInt(e.target.value) || 0)}
                          className="h-12 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 focus-visible:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-xl mb-1">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">Strategic macro-economic pillar weight: <span className="font-bold text-foreground">{p.weight}%</span> of total state delivery.</p>
                  </>
                )}
                
                <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden mt-4">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${p.progress}%` }}
                  />
                  <div className="absolute top-0 left-[25%] w-px h-full bg-white/50" />
                  <div className="absolute top-0 left-[50%] w-px h-full bg-white/50" />
                  <div className="absolute top-0 left-[75%] w-px h-full bg-white/50" />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-bold">
                  <span>Start</span>
                  <span>Quarter</span>
                  <span>Mid-Point</span>
                  <span>Final Phase</span>
                  <span>Target</span>
                </div>
              </div>
              
              <div className="shrink-0 bg-muted/50 p-4 rounded-lg min-w-[160px] border border-border flex flex-col justify-center items-center relative mt-4 md:mt-0 w-full md:w-auto">
                 {isEditing && (
                    <Button onClick={() => removePillar(p.id)} variant="ghost" size="icon" className="absolute -top-3 -right-3 text-rose-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-full h-8 w-8 shadow-sm border border-rose-200 dark:border-rose-900 bg-background z-10">
                      <Trash2 className="size-4" />
                    </Button>
                 )}
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                  <Goal className="size-3"/> Progress
                </div>
                <div className="text-3xl font-black text-foreground">{p.progress}%</div>
                <div className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> On Track
                </div>
              </div>
            </div>
          ))}
          {pillars.length === 0 && (
            <div className="text-center p-12 border-2 border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No development pillars defined.</p>
              {isEditing && (
                <Button onClick={addPillar} variant="outline" className="mt-4 gap-2">
                  <Plus className="size-4" /> Create First Pillar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
