import { getMinistriesList } from '@/lib/postgres-service';
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Search, ArrowRight, User, Phone, Mail, FolderKanban, TrendingUp, Activity, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/ministries")({ component: MinistriesPage });

function MinistriesPage() {
  const location = useLocation();
  const [q, setQ] = useState("");
  const [expandedMinistryId, setExpandedMinistryId] = useState<string | null>(null);
  const [ministries, setMinistries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      
      const data = await getMinistriesList();
      setMinistries(data);
      setLoading(false);
    }
    load();
  }, []);

  if (location.pathname !== '/dashboard/ministries') {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading Ministries...</p>
      </div>
    );
  }

  const enrichedMinistries = ministries;

  const filtered = enrichedMinistries.filter(m => m.name.toLowerCase().includes(q.toLowerCase()));

  const toggleExpand = (id: string) => {
    setExpandedMinistryId(expandedMinistryId === id ? null : id);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6 pb-24">
      <div>
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full text-[11px] uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold mb-4 border border-blue-500/20">
           <Building2 className="size-3.5" /> Government Structure
         </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">State Ministries Directory</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Comprehensive profile of all {ministries.length > 0 ? ministries.length : ''} Ministries, including Commissioner information, budgets, and KPI performance.
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search ministries..." 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(m => {
           const isExpanded = expandedMinistryId === m.id;
           const utilRate = Math.round((m.spent/m.budget)*100);
           
           return (
             <Card key={m.id} className={`border-border/60 shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary/50' : 'hover:border-primary/30'}`}>
                {/* Header / Summary Row */}
                <div 
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer bg-muted/5 hover:bg-muted/10 transition-colors"
                  onClick={() => toggleExpand(m.id)}
                >
                   <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                         <Building2 className="size-6" />
                      </div>
                      <div>
                         <h2 className="text-xl font-bold text-foreground">{m.name}</h2>
                         <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                            <span><User className="inline size-3.5 mr-1"/> {m.commissioner.name}</span>
                            <span>·</span>
                            <span className="font-mono">₦{m.budget.toLocaleString()}M</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                         <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Performance</div>
                         <div className={`text-lg font-black font-mono ${m.score > 80 ? 'text-emerald-500' : m.score > 60 ? 'text-amber-500' : 'text-rose-500'}`}>{m.score}%</div>
                      </div>
                      <div className="text-muted-foreground">
                         {isExpanded ? <ChevronUp className="size-6" /> : <ChevronDown className="size-6" />}
                      </div>
                   </div>
                </div>

                {/* Expanded Profile View */}
                {isExpanded && (
                   <div className="p-4 sm:p-6 border-t border-border/50 bg-background">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         
                         {/* Left Column: Commissioner & Budget */}
                         <div className="space-y-6">
                            <div>
                               <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"><User className="size-4 text-primary"/> Commissioner Profile</h3>
                               <div className="bg-muted/20 p-4 rounded-xl border border-border/50">
                                  <div className="font-bold text-lg mb-2">{m.commissioner.name}</div>
                                  <div className="space-y-2 text-sm text-muted-foreground">
                                     <div className="flex items-center gap-2"><Phone className="size-3.5"/> {m.commissioner.phone}</div>
                                     <div className="flex items-center gap-2"><Mail className="size-3.5"/> {m.commissioner.email}</div>
                                  </div>
                               </div>
                            </div>
                            
                            <div>
                               <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"><Activity className="size-4 text-emerald-500"/> Annual Budget Utilization</h3>
                               <div className="bg-muted/20 p-4 rounded-xl border border-border/50">
                                  <div className="flex justify-between items-end mb-2">
                                     <div>
                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Spent / Allocated</div>
                                        <div className="font-mono font-bold">₦{m.spent.toLocaleString()}M / ₦{m.budget.toLocaleString()}M</div>
                                     </div>
                                     <div className={`font-black text-xl ${utilRate > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{utilRate}%</div>
                                  </div>
                                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                     <div className={`h-full ${utilRate > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{width: `${utilRate}%`}} />
                                  </div>
                               </div>
                            </div>
                         </div>

                         {/* Middle Column: Active Projects */}
                         <div className="space-y-6">
                            <div>
                               <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"><FolderKanban className="size-4 text-blue-500"/> Active Projects ({m.activeProjectsCount})</h3>
                               <div className="space-y-3">
                                  {m.topProjects.map((p: any, idx: number) => (
                                     <div key={idx} className="bg-background p-3 rounded-xl border border-border hover:border-primary/30 transition-colors">
                                        <div className="font-bold text-[13px] mb-2">{p.name}</div>
                                        <div className="flex justify-between items-center text-xs">
                                           <span className="font-mono text-muted-foreground">{p.budget}</span>
                                           <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider text-[10px] flex items-center gap-1"><CheckCircle2 className="size-3"/> {p.status}</span>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                               <button className="w-full mt-3 py-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-1">
                                  View All {m.activeProjectsCount} Projects <ArrowRight className="size-3"/>
                               </button>
                            </div>
                         </div>

                         {/* Right Column: KPI Performance */}
                         <div className="space-y-6">
                            <div>
                               <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"><TrendingUp className="size-4 text-purple-500"/> KPI Performance</h3>
                               <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border/50">
                                  {m.kpis.map((kpi: any, idx: number) => (
                                     <div key={idx}>
                                        <div className="flex justify-between items-center mb-1">
                                           <span className="text-xs font-medium text-foreground">{kpi.name}</span>
                                           <span className="text-xs font-bold font-mono">{kpi.actual}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                                           <span>Target: {kpi.target}</span>
                                        </div>
                                        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                           <div className="h-full bg-purple-500" style={{width: kpi.actual}} />
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         </div>

                      </div>
                   </div>
                )}
             </Card>
           )
        })}
      </div>
    </div>
  );
}