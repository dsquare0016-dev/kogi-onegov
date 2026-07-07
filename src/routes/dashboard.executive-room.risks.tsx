import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, AlertOctagon, Activity, ChevronRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/executive-room/risks")({
  component: RiskRankingsPage,
});

const RISKS = [
  { id: 1, title: "Lokoja Flood Threat", category: "Environmental", impact: "Critical", likelihood: "High", timeline: "Imminent (2 weeks)", mda: "Ministry of Environment", status: "Active" },
  { id: 2, name: "Contractor Abandonment: Ganaja Flyover", category: "Infrastructure", impact: "High", likelihood: "Medium", timeline: "Q3 2026", mda: "Ministry of Works", status: "Escalated" },
  { id: 3, title: "Healthcare Supply Chain Disruption", category: "Healthcare", impact: "High", likelihood: "High", timeline: "Next 30 days", mda: "Ministry of Health", status: "Active" },
  { id: 4, title: "Cyber Attack on State Treasury Portal", category: "Security", impact: "Critical", likelihood: "Low", timeline: "Ongoing", mda: "Ministry of Finance", status: "Mitigated" },
  { id: 5, title: "Public Teacher Strike Notice", category: "Education", impact: "Medium", likelihood: "Medium", timeline: "September", mda: "Ministry of Education", status: "Active" },
];

function RiskRankingsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold text-sm tracking-widest uppercase mb-1">
            <AlertOctagon className="size-4" />
            Executive Room Escalations
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Risk Rankings</h1>
          <p className="text-muted-foreground mt-1">
            Prioritized tracking of critical threats to state performance, infrastructure, and citizen well-being.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest text-foreground">Active Threat Ledger</h2>
          <div className="space-y-3">
            {RISKS.filter(r => r.status !== 'Mitigated').map(r => (
              <div key={r.id} className="bg-card border border-border rounded-xl p-5 hover:border-rose-500/50 transition-colors shadow-sm">
                 <div className="flex justify-between items-start">
                   <div className="flex gap-4">
                     <div className={`size-12 rounded-lg flex items-center justify-center shrink-0 ${r.impact === 'Critical' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
                        <AlertTriangle className="size-6" />
                     </div>
                     <div>
                       <h3 className="font-bold text-lg leading-tight">{r.title || r.name}</h3>
                       <div className="text-sm text-muted-foreground mt-1">{r.mda}</div>
                       <div className="flex items-center gap-3 mt-3">
                         <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground bg-muted px-2 py-1 rounded">{r.category}</span>
                         <span className="text-xs uppercase tracking-widest font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded">Impact: {r.impact}</span>
                         <span className="text-xs uppercase tracking-widest font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Likelihood: {r.likelihood}</span>
                       </div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Timeline</div>
                     <div className="text-sm font-semibold">{r.timeline}</div>
                     <button className="mt-4 px-4 py-2 bg-foreground text-background text-xs font-bold rounded-md hover:bg-muted-foreground transition-colors">
                       Require Briefing
                     </button>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-rose-600">
             <h3 className="font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
               <Activity className="size-5" /> Executive Alert Status
             </h3>
             <div className="text-5xl font-black tracking-tighter mb-2">DEFCON 3</div>
             <p className="text-sm font-medium">Heightened readiness required. 2 critical escalations pending executive override.</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
             <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Mitigated Risks (Last 30 Days)</h3>
             <div className="space-y-4">
               {RISKS.filter(r => r.status === 'Mitigated').map(r => (
                 <div key={r.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                   <div className="size-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                      <CheckCircle2 className="size-4" />
                   </div>
                   <div>
                     <div className="text-sm font-bold line-clamp-1">{r.title || r.name}</div>
                     <div className="text-xs text-muted-foreground">Resolved by {r.mda}</div>
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
