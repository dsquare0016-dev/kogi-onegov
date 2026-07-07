import { createFileRoute } from "@tanstack/react-router";
import { HardHat, AlertOctagon, TrendingUp, Filter, CalendarDays, Wallet } from "lucide-react";

export const Route = createFileRoute("/dashboard/executive-room/projects")({
  component: ProjectRankingsPage,
});

const MOCK_PROJECTS = [
  { id: 1, name: "Okene-Kuroko-Amuro Road Rehabilitation", contractor: "Julius Berger PLC", budget: 4500, spent: 3800, completion: 82, status: "On Track" },
  { id: 2, name: "Confluence University Infrastructure", contractor: "CGC Nigeria Ltd", budget: 12000, spent: 8500, completion: 65, status: "Delayed" },
  { id: 3, name: "Reference Hospital Okene - Equipment", contractor: "GE Healthcare", budget: 8500, spent: 8000, completion: 95, status: "On Track" },
  { id: 4, name: "Lokoja Water Works Expansion", contractor: "Mothercat Ltd", budget: 3200, spent: 2900, completion: 40, status: "At Risk" },
  { id: 5, name: "Ganaja Flyover Construction", contractor: "Tec Engineering", budget: 6800, spent: 4000, completion: 55, status: "On Track" },
];

function ProjectRankingsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-1">
            <HardHat className="size-4" />
            Executive Room
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Project Rankings</h1>
          <p className="text-muted-foreground mt-1">
            Track capital expenditure burn rates, completion velocity, and critical delays across state projects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground">
            <Filter className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2 text-amber-600">
            <AlertOctagon className="size-5" /> High-Priority Watchlist
          </h2>
          
          <div className="space-y-4">
            {MOCK_PROJECTS.sort((a,b) => (a.spent/a.budget) - (b.spent/b.budget)).map((p) => {
              const burnRate = (p.spent / p.budget) * 100;
              const isOverbudget = burnRate > p.completion + 15;
              
              return (
                <div key={p.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                      <div className="text-sm text-muted-foreground">{p.contractor}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      p.status === 'On Track' ? 'bg-emerald-500/10 text-emerald-500' :
                      p.status === 'Delayed' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-rose-500/10 text-rose-500'
                    }`}>
                      {p.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Budget</div>
                      <div className="font-mono font-bold">₦{p.budget.toLocaleString()}M</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Disbursed</div>
                      <div className="font-mono font-bold">₦{p.spent.toLocaleString()}M</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Burn Rate</div>
                      <div className={`font-bold ${isOverbudget ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {burnRate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Completion</div>
                      <div className="font-bold text-primary">{p.completion}%</div>
                    </div>
                  </div>
                  
                  {isOverbudget && (
                    <div className="mt-3 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-xs font-bold flex items-center gap-2">
                      <AlertOctagon className="size-4" /> Warning: Capital burn rate exceeds physical completion percentage.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0A1142] rounded-xl p-6 border border-primary/20 text-white">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Capital Allocation Summary</h3>
            <div className="space-y-6">
              <div>
                <div className="text-xs text-white/60 uppercase tracking-widest mb-1">Total CAPEX Portfolio</div>
                <div className="text-3xl font-black">₦145.2B</div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="text-xs text-white/60 uppercase tracking-widest mb-1">Total Disbursed (YTD)</div>
                <div className="text-3xl font-black text-emerald-400">₦82.5B</div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="text-xs text-white/60 uppercase tracking-widest mb-1">Average Completion</div>
                <div className="text-3xl font-black text-[#CBA344]">68.4%</div>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
             <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
               <TrendingUp className="size-4 text-emerald-500" /> Fastest Moving Projects
             </h3>
             <div className="space-y-4">
               {MOCK_PROJECTS.filter(p => p.status === 'On Track').slice(0,3).map(p => (
                 <div key={p.id} className="flex items-center gap-3">
                   <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                      <CalendarDays className="size-5" />
                   </div>
                   <div>
                     <div className="text-sm font-bold line-clamp-1">{p.name}</div>
                     <div className="text-xs text-muted-foreground">{p.completion}% Complete</div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
