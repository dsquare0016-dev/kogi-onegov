import { getAgenciesList } from '@/lib/postgres-service';
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Search, ArrowRight, Network, ChevronDown, ChevronUp, MapPin, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/agencies")({ component: AgenciesPage });

function AgenciesPage() {
  const location = useLocation();
  const [q, setQ] = useState("");
  const [expandedAgencyName, setExpandedAgencyName] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      
      const data = await getAgenciesList();
      setAgencies(data.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    }
    load();
  }, []);

  if (location.pathname !== '/dashboard/agencies') {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading parastatals...</p>
      </div>
    );
  }

  const filtered = agencies.filter(a => {
  const name = a.name ?? "";
  const ministry = a.motherMinistry ?? "";
  return name.toLowerCase().includes(q.toLowerCase()) || ministry.toLowerCase().includes(q.toLowerCase());
});

  const toggleExpand = (name: string) => {
    setExpandedAgencyName(expandedAgencyName === name ? null : name);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 pb-24">
      <div>
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-[11px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold mb-4 border border-emerald-500/20">
           <Network className="size-3.5" /> Government Structure
         </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Agencies, Boards & Commissions</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Complete directory of all state parastatals, mapping them directly to their supervising Mother Ministries.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search agencies or ministries..." 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg border border-border font-medium">
           Total Agencies: <strong className="text-foreground">{agencies.length}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(a => {
           const isExpanded = expandedAgencyName === a.name;
           
           return (
             <Card key={a.name} className={`border-border/60 shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-emerald-500/50' : 'hover:border-emerald-500/30'}`}>
                {/* Header / Summary Card */}
                <div 
                  className="p-6 cursor-pointer bg-background hover:bg-muted/5 transition-colors relative"
                  onClick={() => toggleExpand(a.name)}
                >
                   <div className="absolute top-4 right-4">
                      {isExpanded ? <ChevronUp className="size-5 text-muted-foreground" /> : <ChevronDown className="size-5 text-muted-foreground" />}
                   </div>
                   
                   <div className="flex items-start gap-4 pr-8">
                      <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-1">
                         <Building2 className="size-5" />
                      </div>
                      <div>
                         <h2 className="text-base font-bold text-foreground leading-snug mb-2">{a.name}</h2>
                         <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                            Reports to: <span className="text-primary">{a.motherMinistry}</span>
                         </div>
                         
                         <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mt-2 border-t border-border/50 pt-3">
                            <span className="flex items-center gap-1"><Network className="size-3.5"/> {(a.departments ?? []).length} Departments</span>
                            <span className="font-mono">₦{a.budget}M Budget</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Expanded Profile View */}
                {isExpanded && (
                   <div className="p-0 border-t border-border/50 bg-muted/5">
                      <div className="p-6 space-y-5">
                         
                         {/* Head & Status */}
                         <div className="flex justify-between items-center bg-background p-3 rounded-lg border border-border shadow-sm">
                            <div>
                               <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Agency Head</div>
                               <div className="text-sm font-bold">{a.head}</div>
                            </div>
                            <div className="text-right">
                               <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Status</div>
                               <div className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"><CheckCircle2 className="size-3"/> {a.status}</div>
                            </div>
                         </div>

                         {/* Performance Score */}
                         <div>
                            <div className="flex justify-between items-end mb-2">
                               <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Compliance Score</span>
                               <span className={`font-black font-mono ${a.score > 80 ? 'text-emerald-500' : a.score > 70 ? 'text-amber-500' : 'text-rose-500'}`}>{a.score}%</span>
                            </div>
                            <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                               <div className={`h-full ${a.score > 80 ? 'bg-emerald-500' : a.score > 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{width: `${a.score}%`}} />
                            </div>
                         </div>

                         {/* Departments */}
                         <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 border-b border-border/50 pb-1">Internal Departments</h4>
                            <div className="flex flex-wrap gap-1.5">
                               {(a.departments ?? []).map((d: string, i: number) => (
                                  <span key={i} className="text-[11px] px-2 py-1 bg-background border border-border rounded text-muted-foreground">{d}</span>
                               ))}
                            </div>
                         </div>
                         
                      </div>
                      
                      <div className="p-4 border-t border-border/50 bg-background flex justify-between items-center">
                         <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3.5"/> {a.locations?.[0] ?? 'Lokoja'}</span>
                         <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                            View {a.projectsCount ?? 0} Projects <ArrowRight className="size-3"/>
                         </button>
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
