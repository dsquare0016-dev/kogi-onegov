import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Network, ShieldAlert, Crosshair, TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, Info, X, Edit2, Check, ExternalLink, ArrowDown, Database, Target, Building, Layers, FolderKanban, Activity, CheckSquare, Users, LineChart, Award } from 'lucide-react';
import { devPlanStore, Pillar } from '@/lib/devPlanStore';
import { useSettingsStore } from '@/lib/settingsStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const Route = createFileRoute('/dashboard/alignment-engine')({
  component: AlignmentEnginePage,
});

function AlignmentEnginePage() {
  const { governanceAlignmentLevel, setGovernanceAlignmentLevel } = useSettingsStore();
  const strictMode = governanceAlignmentLevel === 3;

  // Modals state
  const [globalScoreModalOpen, setGlobalScoreModalOpen] = useState(false);
  const [rogueSpendModalOpen, setRogueSpendModalOpen] = useState(false);

  const FLOW_NODES = [
    { label: "Development Plan Pillar", icon: <Database className="size-5" /> },
    { label: "Strategic Objective", icon: <Target className="size-5" /> },
    { label: "Budget Allocation", icon: <Building className="size-5" /> },
    { label: "Programme", icon: <Layers className="size-5" /> },
    { label: "Project", icon: <FolderKanban className="size-5" /> },
    { label: "Activity", icon: <Activity className="size-5" /> },
    { label: "Task", icon: <CheckSquare className="size-5" /> },
    { label: "Staff", icon: <Users className="size-5" /> },
    { label: "KPI", icon: <LineChart className="size-5" /> },
    { label: "Outcome", icon: <Award className="size-5" /> },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 pb-24 relative">
      <div>
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-[11px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold mb-4 border border-emerald-500/20">
           <Network className="size-3.5" /> Enforcement Module
         </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Alignment Engine</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Enforces the golden thread linking the State Vision down to individual staff tasks and outcomes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* The Golden Thread / Flow */}
        <Card className="border-border/60 shadow-sm lg:col-span-1 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
           <CardHeader className="border-b border-border/50">
             <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Network className="size-5 text-primary" /> The Golden Thread
             </CardTitle>
             <CardDescription>The mandatory architectural alignment flow for all government activities.</CardDescription>
           </CardHeader>
           <CardContent className="p-6">
              <div className="relative">
                 <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gradient-to-b from-primary via-emerald-500 to-gold" />
                 
                 <div className="space-y-4">
                    {FLOW_NODES.map((node, i) => (
                       <div key={i} className="flex items-center gap-4 relative z-10">
                          <div className="size-12 rounded-xl bg-background border-2 border-border shadow-sm flex items-center justify-center shrink-0 text-muted-foreground">
                             {node.icon}
                          </div>
                          <div className="flex-1 bg-background border border-border/60 rounded-lg p-3 shadow-sm flex items-center justify-between">
                             <span className="font-bold text-sm">{node.label}</span>
                             {i === 0 && <span className="text-[9px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">Origin</span>}
                             {i === FLOW_NODES.length - 1 && <span className="text-[9px] uppercase font-bold tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded">Goal</span>}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
           
           {/* Top Metrics */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card 
               className="border-emerald-500/30 bg-emerald-500/5 shadow-sm hover:bg-emerald-500/10 cursor-pointer transition-colors"
               onClick={() => setGlobalScoreModalOpen(true)}
             >
               <CardContent className="p-6 relative">
                 <Info className="absolute top-4 right-4 size-4 text-emerald-500/50" />
                 <div className="flex items-center gap-3 mb-2">
                   <Crosshair className="size-5 text-emerald-600 dark:text-emerald-400" />
                   <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">Global Alignment Score</h3>
                 </div>
                 <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black text-emerald-700 dark:text-emerald-400">84%</span>
                 </div>
                 <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-2">84% of all approved state budgets directly map to a Strategic Pillar.</p>
               </CardContent>
             </Card>

             <Card 
               className="border-amber-500/30 bg-amber-500/5 shadow-sm hover:bg-amber-500/10 cursor-pointer transition-colors"
               onClick={() => setRogueSpendModalOpen(true)}
             >
               <CardContent className="p-6 relative">
                 <ExternalLink className="absolute top-4 right-4 size-4 text-amber-500/50" />
                 <div className="flex items-center gap-3 mb-2">
                   <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
                   <h3 className="font-semibold text-amber-800 dark:text-amber-200">Rogue Spending Detected</h3>
                 </div>
                 <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black text-amber-700 dark:text-amber-400">₦3.1B</span>
                 </div>
                 <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-2">Budgets allocated to projects with no defined link to a Strategic Objective.</p>
               </CardContent>
             </Card>
           </div>

           {/* Alignment Status Matrix */}
           <Card className="border-border/60 shadow-sm">
             <CardHeader className="border-b border-border/50">
               <CardTitle className="text-lg">Programme Alignment Status</CardTitle>
               <CardDescription>Live tracking of alignment across major state programmes.</CardDescription>
             </CardHeader>
             <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-muted/30 border-b border-border/50 uppercase text-[10px] text-muted-foreground tracking-wider">
                     <tr>
                       <th className="px-6 py-4 font-semibold">Programme Name</th>
                       <th className="px-6 py-4 font-semibold">Executing MDA</th>
                       <th className="px-6 py-4 font-semibold">Linked Pillar</th>
                       <th className="px-6 py-4 font-semibold text-right">Alignment Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border/30">
                     {[
                       { prog: "Agricultural Transformation", mda: "Agriculture & Food Security", pillar: "Agriculture & Food Security", status: "Aligned" },
                       { prog: "Digital Identification Rollout", mda: "Innovation, Science & Tech", pillar: "Digital Economy", status: "Aligned" },
                       { prog: "State Secretariate Renovation", mda: "Works", pillar: "Infrastructure", status: "Partially Aligned" },
                       { prog: "Directorate Fleet Procurement", mda: "Special Duties", pillar: "None", status: "Not Aligned" },
                       { prog: "Free Basic Education", mda: "Education", pillar: "Education", status: "Aligned" },
                     ].map((row, i) => (
                       <tr key={i} className="hover:bg-muted/10 transition-colors">
                         <td className="px-6 py-4 font-bold text-foreground">{row.prog}</td>
                         <td className="px-6 py-4 text-muted-foreground">{row.mda}</td>
                         <td className="px-6 py-4 text-muted-foreground">{row.pillar}</td>
                         <td className="px-6 py-4 text-right">
                           <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                             row.status === 'Aligned' ? 'bg-emerald-500/10 text-emerald-600' :
                             row.status === 'Partially Aligned' ? 'bg-amber-500/10 text-amber-600' :
                             'bg-rose-500/10 text-rose-600'
                           }`}>
                             {row.status}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </CardContent>
           </Card>

           {/* Enforcement Banner */}
           <div className="bg-primary border border-primary text-primary-foreground rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
                 <ShieldCheck className="size-48" />
              </div>
              <div className="relative z-10">
                 <h3 className="text-xl font-black tracking-tight mb-2">Strict Mode Active</h3>
                 <p className="text-primary-foreground/80 text-sm max-w-lg">
                   The system is currently hard-blocking any budget approval, task assignment, or project creation that cannot be fully traced up to the Development Plan.
                 </p>
              </div>
              <div className="relative z-10 shrink-0">
                 <button onClick={() => setGovernanceAlignmentLevel(strictMode ? 2 : 3)} className="px-6 py-3 bg-white text-primary rounded-lg font-bold shadow-sm hover:bg-white/90 transition-colors">
                   {strictMode ? 'Disable Enforcement (Set Level 2)' : 'Enable Strict Mode (Set Level 3)'}
                 </button>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
