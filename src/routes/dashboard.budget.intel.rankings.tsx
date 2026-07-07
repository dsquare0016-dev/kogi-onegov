import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, TrendingUp, TrendingDown, Target, Search, ChevronDown, Activity, Users, FileText } from 'lucide-react';
import React, { useState } from 'react';

export const Route = createFileRoute('/dashboard/budget/intel/rankings')({
  component: MdaRankingsPage,
});

const RANKINGS = [
  { rank: 1, mda: 'Ministry of Works & Infrastructure', budget: 45000, util: 42000, perf: 94, proj: 24, rev: 150 },
  { rank: 2, mda: 'Kogi State Internal Revenue Service', budget: 8500, util: 8200, perf: 91, proj: 5, rev: 45200 },
  { rank: 3, mda: 'Ministry of Health', budget: 32000, util: 28000, perf: 86, proj: 18, rev: 450 },
  { rank: 4, mda: 'Ministry of Education', budget: 28000, util: 21000, perf: 75, proj: 42, rev: 120 },
  { rank: 18, mda: 'Ministry of Agriculture', budget: 15000, util: 6000, perf: 42, proj: 2, rev: 80 },
];

function MdaRankingsPage() {
  const [expandedMda, setExpandedMda] = useState<number | null>(null);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MDA Budget Ranking</h1>
          <p className="text-muted-foreground mt-1">
            State-wide performance leaderboard and execution deep-dives.
          </p>
        </div>
        <div className="relative">
           <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
           <input type="text" placeholder="Search MDA..." className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
         <Card className="border-emerald-500/30 shadow-sm bg-emerald-500/5">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-500"><Trophy className="size-6"/></div>
               <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">State Champion (FY26)</div>
                  <div className="text-lg font-bold">Ministry of Works</div>
                  <div className="text-sm font-mono text-emerald-600 mt-1">94.0% Overall Score</div>
               </div>
            </CardContent>
         </Card>
         <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="p-4 rounded-full bg-primary/10 text-primary"><TrendingUp className="size-6"/></div>
               <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Most Improved</div>
                  <div className="text-lg font-bold">Ministry of Environment</div>
                  <div className="text-sm font-mono text-emerald-500 mt-1">+14% Yoy Growth</div>
               </div>
            </CardContent>
         </Card>
         <Card className="border-destructive/30 shadow-sm bg-destructive/5">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="p-4 rounded-full bg-destructive/20 text-destructive"><TrendingDown className="size-6"/></div>
               <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-1">Critical Watchlist</div>
                  <div className="text-lg font-bold text-destructive">Ministry of Agriculture</div>
                  <div className="text-sm font-mono text-destructive mt-1">42% Execution Rate</div>
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle>State-Wide Leaderboard</CardTitle>
          <CardDescription>Click any MDA to open its detailed executive dossier.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-muted/30 border-b border-border/50 uppercase text-[10px] text-muted-foreground tracking-wider">
                 <tr>
                   <th className="px-6 py-4 font-semibold text-center w-16">Rank</th>
                   <th className="px-6 py-4 font-semibold">MDA</th>
                   <th className="px-6 py-4 font-semibold text-right">Budget (₦M)</th>
                   <th className="px-6 py-4 font-semibold text-right">Utilization (₦M)</th>
                   <th className="px-6 py-4 font-semibold text-center">Perf %</th>
                   <th className="px-6 py-4 font-semibold text-center">Projects Completed</th>
                   <th className="px-6 py-4 font-semibold text-right">Rev. Generated (₦M)</th>
                   <th className="px-6 py-4 font-semibold w-12"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/30">
                 {RANKINGS.map((mda, idx) => (
                   <React.Fragment key={idx}>
                     <tr 
                       className={`hover:bg-muted/10 transition-colors cursor-pointer ${expandedMda === idx ? 'bg-primary/5' : ''}`}
                       onClick={() => setExpandedMda(expandedMda === idx ? null : idx)}
                     >
                       <td className="px-6 py-4 text-center font-bold text-lg">
                          <span className={mda.rank === 1 ? 'text-amber-500' : mda.rank === 2 ? 'text-slate-400' : mda.rank === 3 ? 'text-amber-700' : 'text-muted-foreground'}>
                             #{mda.rank}
                          </span>
                       </td>
                       <td className="px-6 py-4 font-bold text-primary">{mda.mda}</td>
                       <td className="px-6 py-4 text-right font-mono font-medium">{mda.budget.toLocaleString()}</td>
                       <td className="px-6 py-4 text-right font-mono text-purple-500">{mda.util.toLocaleString()}</td>
                       <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full font-mono font-bold text-xs ${mda.perf >= 80 ? 'bg-emerald-500/10 text-emerald-600' : mda.perf >= 60 ? 'bg-amber-500/10 text-amber-600' : 'bg-destructive/10 text-destructive'}`}>
                            {mda.perf}%
                          </span>
                       </td>
                       <td className="px-6 py-4 text-center font-mono">{mda.proj}</td>
                       <td className="px-6 py-4 text-right font-mono text-emerald-600">{mda.rev.toLocaleString()}</td>
                       <td className="px-6 py-4 text-center text-muted-foreground">
                          <ChevronDown className={`size-4 transition-transform ${expandedMda === idx ? 'rotate-180 text-primary' : ''}`} />
                       </td>
                     </tr>
                     {expandedMda === idx && (
                       <tr>
                         <td colSpan={8} className="p-0 border-b border-border/50">
                           <div className="bg-muted/5 p-6 animate-in slide-in-from-top-2 duration-200">
                             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                               <div className="space-y-4">
                                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Target className="size-4 text-primary"/> Budget Details</h4>
                                  <div className="space-y-2 text-sm">
                                     <div className="flex justify-between"><span className="text-muted-foreground">Capital:</span> <span className="font-mono font-bold">₦{(mda.budget * 0.7).toLocaleString()}M</span></div>
                                     <div className="flex justify-between"><span className="text-muted-foreground">Recurrent:</span> <span className="font-mono font-bold">₦{(mda.budget * 0.3).toLocaleString()}M</span></div>
                                     <div className="flex justify-between"><span className="text-muted-foreground">YTD Released:</span> <span className="font-mono font-bold text-blue-500">₦{mda.util.toLocaleString()}M</span></div>
                                  </div>
                               </div>
                               <div className="space-y-4">
                                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Activity className="size-4 text-emerald-500"/> Core KPIs</h4>
                                  <div className="space-y-2 text-sm">
                                     <div className="flex justify-between"><span className="text-muted-foreground">Cost Efficiency:</span> <span className="font-mono font-bold text-emerald-500">92%</span></div>
                                     <div className="flex justify-between"><span className="text-muted-foreground">Timeliness:</span> <span className="font-mono font-bold text-emerald-500">88%</span></div>
                                     <div className="flex justify-between"><span className="text-muted-foreground">Quality Score:</span> <span className="font-mono font-bold text-emerald-500">95%</span></div>
                                  </div>
                               </div>
                               <div className="space-y-4">
                                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Users className="size-4 text-purple-500"/> Staff Performance</h4>
                                  <div className="space-y-2 text-sm">
                                     <div className="flex justify-between"><span className="text-muted-foreground">Active Staff:</span> <span className="font-mono font-bold">1,245</span></div>
                                     <div className="flex justify-between"><span className="text-muted-foreground">Avg Appraisal:</span> <span className="font-mono font-bold text-purple-500">4.2/5.0</span></div>
                                     <div className="flex justify-between"><span className="text-muted-foreground">Training Comp.:</span> <span className="font-mono font-bold">78%</span></div>
                                  </div>
                               </div>
                               <div className="space-y-4">
                                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2"><FileText className="size-4 text-amber-500"/> Dev. Contributions</h4>
                                  <div className="space-y-2 text-sm">
                                     <div className="flex justify-between"><span className="text-muted-foreground">Infra Growth:</span> <span className="font-mono font-bold">2.4%</span></div>
                                     <div className="flex justify-between"><span className="text-muted-foreground">Job Creation:</span> <span className="font-mono font-bold">1,450</span></div>
                                     <div className="mt-2 text-[10px] uppercase font-bold text-primary cursor-pointer hover:underline">View Full Impact Report &rarr;</div>
                                  </div>
                               </div>
                             </div>
                           </div>
                         </td>
                       </tr>
                     )}
                   </React.Fragment>
                 ))}
               </tbody>
             </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
