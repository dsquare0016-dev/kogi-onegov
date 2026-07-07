import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, Filter, ArrowUpRight, ArrowDownRight, Banknote, FileText } from "lucide-react";
import { MINISTRIES } from "@/lib/governance-data";

export const Route = createFileRoute("/dashboard/executive-room/budgets")({
  component: BudgetRankingsPage,
});

function BudgetRankingsPage() {
  const mappedMinistries = MINISTRIES.map(m => ({
    ...m,
    budgetExecution: Math.round((m.spent / m.budget) * 100),
  }));
  const sortedByAllocation = mappedMinistries.sort((a,b) => b.budget - a.budget).slice(0, 5);
  // Mocking revenue vs expenditure
  const revenueGenerators = [
    { id: 1, name: "Kogi State Internal Revenue Service", target: 45000, generated: 38500, type: "IGR" },
    { id: 2, name: "Ministry of Solid Minerals", target: 12000, generated: 14200, type: "Royalties" },
    { id: 3, name: "Ministry of Transportation", target: 8000, generated: 7100, type: "Fees & Fines" },
    { id: 4, name: "Ministry of Agriculture", target: 5500, generated: 3200, type: "Permits" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-1">
            <Wallet className="size-4" />
            Executive Room
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Budget Rankings</h1>
          <p className="text-muted-foreground mt-1">
            Rankings of top spending allocations and highest Internally Generated Revenue (IGR) contributors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold flex items-center gap-2">
            <FileText className="size-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Highest Allocations (Consumers) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2 text-rose-500">
            <ArrowDownRight className="size-5" /> Top Spending MDAs
          </h2>
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden divide-y divide-border">
            {sortedByAllocation.map((m, idx) => (
              <div key={m.name} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                <div className="size-8 rounded bg-rose-500/10 text-rose-600 font-black flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-bold">{m.name}</div>
                  <div className="flex items-center gap-4 mt-1">
                     <span className="text-xs text-muted-foreground uppercase tracking-widest">Allocated</span>
                     <span className="font-mono font-semibold text-sm">₦{(m.budget / 1000).toFixed(1)}B</span>
                     <span className="text-xs text-muted-foreground uppercase tracking-widest ml-4">Execution</span>
                     <span className={`font-bold text-sm ${m.budgetExecution < 50 ? 'text-rose-500' : 'text-emerald-500'}`}>{m.budgetExecution}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Revenue Generators */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2 text-emerald-500">
            <ArrowUpRight className="size-5" /> Top IGR Contributors
          </h2>
          <div className="bg-[#0A1142] border border-primary/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] overflow-hidden divide-y divide-white/10 text-white">
            {revenueGenerators.map((r, idx) => {
              const performance = (r.generated / r.target) * 100;
              return (
                <div key={r.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <div className="size-8 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{r.name}</div>
                    <div className="flex items-center gap-4 mt-1">
                       <span className="text-xs text-white/50 uppercase tracking-widest">Type</span>
                       <span className="text-xs font-semibold text-primary">{r.type}</span>
                       <span className="text-xs text-white/50 uppercase tracking-widest ml-4">Generated</span>
                       <span className="font-mono font-bold text-sm text-emerald-400">₦{(r.generated / 1000).toFixed(1)}B</span>
                    </div>
                  </div>
                  <div className="text-right">
                     <div className={`text-xl font-black ${performance >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                       {performance.toFixed(1)}%
                     </div>
                     <div className="text-[10px] text-white/40 uppercase tracking-widest">Of Target</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
