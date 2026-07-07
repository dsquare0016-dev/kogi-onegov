import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings2, Save, Calculator, Plus, TrendingUp, Users, ShieldCheck, Activity } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/budget/parameters')({
  component: BudgetParametersPage,
});

function BudgetParametersPage() {
  const [params, setParams] = useState({
    budgetUtil: 80,
    releaseRate: 75,
    costEff: 90,
    completionRate: 85,
    timeliness: 90,
    qualityScore: 80,
    povReduction: 5,
    jobCreation: 10000,
    infraGrowth: 15,
    serviceDelivery: 80,
    satisfaction: 75,
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Measurement Parameters</h1>
          <p className="text-muted-foreground mt-1">
            Define KPIs and custom formulas used for state-wide performance calculations.
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
           <Save className="size-4" /> Save Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Financial KPIs */}
         <Card className="border-border/60 shadow-sm border-t-4 border-t-emerald-500">
           <CardHeader className="border-b border-border/50 pb-4">
             <CardTitle className="flex items-center gap-2 text-base"><Activity className="size-4 text-emerald-500"/> Financial KPIs</CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
             <div>
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Target Budget Utilization (%)</label>
               <input type="range" min="0" max="100" value={params.budgetUtil} onChange={(e) => setParams({...params, budgetUtil: parseInt(e.target.value)})} className="w-full accent-emerald-500" />
               <div className="text-right font-mono font-bold text-emerald-500">{params.budgetUtil}%</div>
             </div>
             <div>
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Minimum Release Rate (%)</label>
               <input type="range" min="0" max="100" value={params.releaseRate} onChange={(e) => setParams({...params, releaseRate: parseInt(e.target.value)})} className="w-full accent-emerald-500" />
               <div className="text-right font-mono font-bold text-emerald-500">{params.releaseRate}%</div>
             </div>
             <div>
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Cost Efficiency Score Target (%)</label>
               <input type="range" min="0" max="100" value={params.costEff} onChange={(e) => setParams({...params, costEff: parseInt(e.target.value)})} className="w-full accent-emerald-500" />
               <div className="text-right font-mono font-bold text-emerald-500">{params.costEff}%</div>
             </div>
           </CardContent>
         </Card>

         {/* Project KPIs */}
         <Card className="border-border/60 shadow-sm border-t-4 border-t-blue-500">
           <CardHeader className="border-b border-border/50 pb-4">
             <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4 text-blue-500"/> Project KPIs</CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
             <div>
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Expected Completion Rate (%)</label>
               <input type="range" min="0" max="100" value={params.completionRate} onChange={(e) => setParams({...params, completionRate: parseInt(e.target.value)})} className="w-full accent-blue-500" />
               <div className="text-right font-mono font-bold text-blue-500">{params.completionRate}%</div>
             </div>
             <div>
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Timeliness Adherence (%)</label>
               <input type="range" min="0" max="100" value={params.timeliness} onChange={(e) => setParams({...params, timeliness: parseInt(e.target.value)})} className="w-full accent-blue-500" />
               <div className="text-right font-mono font-bold text-blue-500">{params.timeliness}%</div>
             </div>
             <div>
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Minimum Quality Score (%)</label>
               <input type="range" min="0" max="100" value={params.qualityScore} onChange={(e) => setParams({...params, qualityScore: parseInt(e.target.value)})} className="w-full accent-blue-500" />
               <div className="text-right font-mono font-bold text-blue-500">{params.qualityScore}%</div>
             </div>
           </CardContent>
         </Card>

         {/* Development KPIs */}
         <Card className="border-border/60 shadow-sm border-t-4 border-t-purple-500">
           <CardHeader className="border-b border-border/50 pb-4">
             <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="size-4 text-purple-500"/> Development KPIs</CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
             <div>
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Poverty Reduction Target (%)</label>
               <input type="range" min="0" max="20" value={params.povReduction} onChange={(e) => setParams({...params, povReduction: parseInt(e.target.value)})} className="w-full accent-purple-500" />
               <div className="text-right font-mono font-bold text-purple-500">{params.povReduction}%</div>
             </div>
             <div>
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Job Creation Target (Net New Jobs)</label>
               <input type="range" min="1000" max="50000" step="1000" value={params.jobCreation} onChange={(e) => setParams({...params, jobCreation: parseInt(e.target.value)})} className="w-full accent-purple-500" />
               <div className="text-right font-mono font-bold text-purple-500">{params.jobCreation.toLocaleString()} Jobs</div>
             </div>
             <div>
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Infrastructure Growth Index (%)</label>
               <input type="range" min="0" max="50" value={params.infraGrowth} onChange={(e) => setParams({...params, infraGrowth: parseInt(e.target.value)})} className="w-full accent-purple-500" />
               <div className="text-right font-mono font-bold text-purple-500">{params.infraGrowth}%</div>
             </div>
           </CardContent>
         </Card>

         {/* Citizen Impact KPIs */}
         <Card className="border-border/60 shadow-sm border-t-4 border-t-amber-500">
           <CardHeader className="border-b border-border/50 pb-4">
             <CardTitle className="flex items-center gap-2 text-base"><Users className="size-4 text-amber-500"/> Citizen Impact KPIs</CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
             <div>
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Service Delivery Score (%)</label>
               <input type="range" min="0" max="100" value={params.serviceDelivery} onChange={(e) => setParams({...params, serviceDelivery: parseInt(e.target.value)})} className="w-full accent-amber-500" />
               <div className="text-right font-mono font-bold text-amber-500">{params.serviceDelivery}%</div>
             </div>
             <div>
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Citizen Satisfaction Score (%)</label>
               <input type="range" min="0" max="100" value={params.satisfaction} onChange={(e) => setParams({...params, satisfaction: parseInt(e.target.value)})} className="w-full accent-amber-500" />
               <div className="text-right font-mono font-bold text-amber-500">{params.satisfaction}%</div>
             </div>
           </CardContent>
         </Card>
      </div>

      {/* Formula Builder */}
      <Card className="border-border/60 shadow-sm bg-muted/10 mt-8">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2"><Calculator className="size-5 text-primary" /> Custom Formula Builder</CardTitle>
          <CardDescription>Allows administrators to create custom KPI formulas combining metrics.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
           <div className="bg-background border border-border rounded-lg p-6 font-mono text-sm shadow-inner relative">
              <div className="absolute top-4 right-4 flex gap-2">
                 <button className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-colors text-xs font-sans font-bold flex items-center gap-1"><Plus className="size-3"/> Add Metric</button>
                 <button className="px-3 py-1 bg-muted border border-border rounded hover:bg-muted/80 transition-colors text-xs font-sans font-bold">Validate Syntax</button>
              </div>
              <div className="mb-2 text-muted-foreground">// Example: Overall State Health Score Formula</div>
              <div className="flex flex-wrap gap-2 items-center text-foreground">
                 <span className="text-purple-500 font-bold">STATE_HEALTH_SCORE</span> <span className="text-muted-foreground">=</span>
                 <span className="text-emerald-500">(</span>
                 <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded border border-emerald-500/20">budgetUtil</span>
                 <span className="text-muted-foreground">*</span>
                 <span className="text-amber-500">0.4</span>
                 <span className="text-emerald-500">)</span>
                 <span className="text-muted-foreground">+</span>
                 <span className="text-emerald-500">(</span>
                 <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded border border-blue-500/20">completionRate</span>
                 <span className="text-muted-foreground">*</span>
                 <span className="text-amber-500">0.4</span>
                 <span className="text-emerald-500">)</span>
                 <span className="text-muted-foreground">+</span>
                 <span className="text-emerald-500">(</span>
                 <span className="bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded border border-amber-500/20">satisfaction</span>
                 <span className="text-muted-foreground">*</span>
                 <span className="text-amber-500">0.2</span>
                 <span className="text-emerald-500">)</span>
              </div>
              <div className="mt-6">
                 <input type="text" className="w-full bg-transparent border-b border-border/50 pb-2 focus:outline-none focus:border-primary text-foreground font-mono placeholder:text-muted-foreground/50" placeholder="Type new formula here..." />
              </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
