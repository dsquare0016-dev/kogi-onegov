import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Calculator, Settings2, Percent, Plus, Trash2 } from 'lucide-react';
import { devPlanStore, SPIMetric } from '@/lib/devPlanStore';

export const Route = createFileRoute('/dashboard/dev-plan/spi-formula')({
  component: DevPlanSPIFormulaPage,
});

function DevPlanSPIFormulaPage() {
  const [metrics, setMetrics] = useState<SPIMetric[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  
  // For Simulation Box
  const [simulationScores, setSimulationScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const data = devPlanStore.spiFormula;
    setMetrics(data);
    
    // Initialize simulation scores to 50% for all metrics
    const initialSim: Record<string, number> = {};
    data.forEach(m => initialSim[m.id] = 50);
    setSimulationScores(initialSim);
    
    const handleUpdate = () => {
      setMetrics(devPlanStore.spiFormula);
    };
    window.addEventListener('devPlanUpdate', handleUpdate);
    return () => window.removeEventListener('devPlanUpdate', handleUpdate);
  }, []);

  const totalWeight = useMemo(() => metrics.reduce((sum, m) => sum + m.weight, 0), [metrics]);

  const handleSave = () => {
    if (totalWeight !== 100) {
      alert("Total weights must sum up to exactly 100% before saving.");
      return;
    }
    devPlanStore.spiFormula = metrics;
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleWeightChange = (id: string, newWeight: number) => {
    if (newWeight < 0) return;
    setMetrics(metrics.map(m => m.id === id ? { ...m, weight: newWeight } : m));
  };

  const handleSimulationChange = (id: string, val: number) => {
    if (val < 0 || val > 100) return;
    setSimulationScores(prev => ({ ...prev, [id]: val }));
  };

  const removeMetric = (id: string) => {
    setMetrics(metrics.filter(m => m.id !== id));
  };

  const addMetric = () => {
    const newMetric: SPIMetric = {
      id: `sm${Date.now()}`,
      name: 'New Custom Metric',
      description: 'Enter a description for this metric.',
      weight: 0,
      color: 'slate'
    };
    setMetrics([...metrics, newMetric]);
  };

  const simulatedFinalScore = useMemo(() => {
    if (metrics.length === 0) return 0;
    // We only simulate if weight sums to 100 to avoid confusing results
    if (totalWeight !== 100) return 0; 

    return metrics.reduce((total, m) => {
      const score = simulationScores[m.id] || 0;
      return total + (score * (m.weight / 100));
    }, 0);
  }, [metrics, simulationScores, totalWeight]);

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SPI Formula Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Configure the State Performance Index algorithm. Add custom metrics, adjust weights, and simulate scenarios.
          </p>
        </div>
        <div className="flex items-center gap-4">
           {isSaved && <span className="text-emerald-500 font-semibold text-sm animate-pulse">Formula updated!</span>}
           <div className={`text-sm font-bold px-3 py-1.5 rounded-md ${totalWeight === 100 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
             Total Weight: {totalWeight}%
           </div>
           <button 
             onClick={handleSave}
             disabled={totalWeight !== 100}
             className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Save className="size-4" /> Save Formula
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Metric Weights Builder */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-primary/5 border-b border-border/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2"><Settings2 className="size-5 text-primary" /> Dynamic Multiplier Weights</CardTitle>
              <CardDescription>Adjust the weights used to calculate the final SPI. These must sum up to exactly 100%.</CardDescription>
            </div>
            <button onClick={addMetric} className="p-2 bg-background border border-border rounded-md hover:bg-muted text-foreground transition-colors shrink-0">
              <Plus className="size-4" />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {metrics.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm italic">No metrics defined. Add one to start.</div>
              ) : (
                metrics.map((metric) => (
                  <div key={metric.id} className="p-6 space-y-4 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <input 
                          type="text" 
                          value={metric.name}
                          onChange={(e) => setMetrics(metrics.map(m => m.id === metric.id ? { ...m, name: e.target.value } : m))}
                          className="font-bold text-base bg-transparent border-none p-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground w-full mb-1" 
                          placeholder="Metric Name"
                        />
                        <input 
                          type="text" 
                          value={metric.description}
                          onChange={(e) => setMetrics(metrics.map(m => m.id === metric.id ? { ...m, description: e.target.value } : m))}
                          className="text-xs text-muted-foreground bg-transparent border-none p-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50 w-full" 
                          placeholder="Brief description..."
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <div className={`text-xl font-mono font-bold ${metric.weight > 0 ? `text-${metric.color}-600 dark:text-${metric.color}-400` : 'text-muted-foreground'}`}>
                            {metric.weight}%
                          </div>
                        </div>
                        <button onClick={() => removeMetric(metric.id)} className="p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-red-50 dark:hover:bg-red-500/10">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                    
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={metric.weight} 
                      onChange={e => handleWeightChange(metric.id, Number(e.target.value))}
                      className={`w-full accent-${metric.color}-500`}
                    />
                  </div>
                ))
              )}
            </div>
            {totalWeight !== 100 && (
              <div className="p-4 bg-red-500/10 border-t border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold flex items-center justify-center gap-2">
                Warning: Total weights equal {totalWeight}%. Please adjust them to sum to exactly 100%.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Interactive Simulation Sandbox */}
          <Card className="border-border/60 shadow-sm bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2"><Percent className="size-5 text-primary" /> Interactive Scenario Sandbox</CardTitle>
              <CardDescription>Simulate an MDA's performance across the metrics to see their final SPI score.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {totalWeight !== 100 ? (
                <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 p-4 rounded-lg border border-amber-500/20 text-center font-medium">
                  Simulation unavailable until formula weights equal 100%.
                </div>
              ) : (
                <div className="space-y-6">
                  {metrics.map(metric => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span>{metric.name} <span className="text-muted-foreground text-xs font-normal">({metric.weight}% weight)</span></span>
                        <span className={`font-mono text-${metric.color}-600 dark:text-${metric.color}-400 bg-${metric.color}-500/10 px-2 py-0.5 rounded`}>{simulationScores[metric.id] || 0}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={simulationScores[metric.id] || 0} 
                        onChange={e => handleSimulationChange(metric.id, Number(e.target.value))}
                        className={`w-full accent-${metric.color}-500`}
                      />
                    </div>
                  ))}
                  
                  <div className="mt-8 p-6 bg-card border border-border/50 rounded-xl shadow-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Simulated Final SPI Score</h4>
                      <p className="text-xs text-muted-foreground mt-1">Calculated using the configured weights above.</p>
                    </div>
                    <div className="text-4xl font-black text-primary font-mono tabular-nums">
                      {simulatedFinalScore.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dynamic Formula Preview */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-wider text-muted-foreground font-bold"><Calculator className="size-4" /> Formula Engine Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-5 bg-muted/30 border border-border/50 rounded-xl font-mono text-sm leading-loose overflow-x-auto whitespace-nowrap">
                 <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">SPI</span> = <br/>
                 {metrics.map((m, idx) => (
                   <span key={m.id}>
                     &nbsp;&nbsp;{idx > 0 && '+ '}
                     ( <span className={`text-${m.color}-600 dark:text-${m.color}-400 font-bold`}>{m.name} %</span> × <span className="text-foreground bg-background border border-border/50 px-1.5 py-0.5 rounded shadow-sm">{m.weight / 100}</span> ) <br/>
                   </span>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
