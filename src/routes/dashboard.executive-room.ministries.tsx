import { createFileRoute } from "@tanstack/react-router";
import { Building2, Search, ArrowUpDown, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { MINISTRIES } from "@/lib/governance-data";

export const Route = createFileRoute("/dashboard/executive-room/ministries")({
  component: MinistryRankingsPage,
});

function MinistryRankingsPage() {
  const mappedMinistries = MINISTRIES.map(m => ({
    ...m,
    budgetExecution: Math.round((m.spent / m.budget) * 100),
    kpiDelivery: m.score,
    head: "Hon. Commissioner"
  }));
  const sortedMinistries = mappedMinistries.sort((a, b) => b.budgetExecution - a.budgetExecution);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-1">
            <Building2 className="size-4" />
            Executive Room
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Ministry Rankings</h1>
          <p className="text-muted-foreground mt-1">
            Institutional comparative analysis of Budget Execution versus actual KPI Delivery.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input type="text" placeholder="Search ministries..." className="pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/50" />
           </div>
           <button className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground">
              <Filter className="size-4" />
           </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Ministries" value={MINISTRIES.length.toString()} />
        <StatCard title="Avg Budget Execution" value="64.2%" trend="up" />
        <StatCard title="Avg KPI Delivery" value="58.9%" trend="down" />
        <StatCard title="Critical Lags" value="3" subtitle="< 40% execution" alert />
      </div>

      {/* Main Data Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold tracking-widest cursor-pointer hover:text-foreground group">
                  <div className="flex items-center gap-2">Ministry <ArrowUpDown className="size-3 opacity-0 group-hover:opacity-100" /></div>
                </th>
                <th className="px-6 py-4 font-bold tracking-widest w-1/3">Budget Execution</th>
                <th className="px-6 py-4 font-bold tracking-widest w-1/3">KPI Delivery</th>
                <th className="px-6 py-4 font-bold tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedMinistries.map((m) => (
                <tr key={m.name} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">
                    {m.name}
                    <div className="text-xs text-muted-foreground font-normal mt-0.5">{m.head}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{m.budgetExecution}%</span>
                      <span className="text-xs text-muted-foreground">₦{(m.budget / 1000).toFixed(1)}B</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${m.budgetExecution > 70 ? 'bg-emerald-500' : m.budgetExecution > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${m.budgetExecution}%` }} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{m.kpiDelivery}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${m.kpiDelivery > 70 ? 'bg-blue-500' : m.kpiDelivery > 40 ? 'bg-indigo-500' : 'bg-violet-500'}`} style={{ width: `${m.kpiDelivery}%` }} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {m.kpiDelivery < m.budgetExecution - 20 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-rose-500/10 text-rose-500">
                        Underperforming
                      </span>
                    ) : m.kpiDelivery > 75 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-500">
                        Optimal
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-500/10 text-amber-500">
                        Average
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, trend, alert }: any) {
  return (
    <div className={`bg-card border ${alert ? 'border-rose-500/50' : 'border-border'} rounded-xl p-5 shadow-sm`}>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <div className={`text-3xl font-black ${alert ? 'text-rose-500' : 'text-foreground'}`}>{value}</div>
        {trend === 'up' && <span className="text-emerald-500 flex items-center gap-1 text-sm font-bold"><TrendingUp className="size-4"/></span>}
        {trend === 'down' && <span className="text-rose-500 flex items-center gap-1 text-sm font-bold"><TrendingDown className="size-4"/></span>}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}
