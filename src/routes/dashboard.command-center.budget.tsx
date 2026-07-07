import { createFileRoute } from '@tanstack/react-router';
import { MINISTRIES } from '@/lib/governance-data';
import { Wallet, AlertTriangle, TrendingDown, Building2, Calculator } from 'lucide-react';

export const Route = createFileRoute('/dashboard/command-center/budget')({
  component: BudgetMonitoringPage,
});

function BudgetMonitoringPage() {
  // Forensics view: focusing on MDAs with high variance (overspending or poor execution)
  const forensics = MINISTRIES.map(m => ({
    ...m,
    executionRate: Math.round((m.spent / m.budget) * 100),
    variance: m.budget - m.spent,
    status: (m.spent / m.budget) > 0.85 ? 'Over-Executing' : (m.spent / m.budget) < 0.4 ? 'Under-Executing' : 'On-Track'
  })).sort((a,b) => b.executionRate - a.executionRate);

  const overExecuting = forensics.filter(m => m.status === 'Over-Executing');
  const underExecuting = forensics.filter(m => m.status === 'Under-Executing').reverse();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-1">
            <Calculator className="size-4" />
            DG GDU Command Center
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Budget Forensics & Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Deep dive into MDA budgetary variances, pinpointing fiscal over-execution and critical under-spending.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Over Execution Risk */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-rose-600 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-200 dark:border-rose-900">
            <TrendingDown className="size-5" /> High Risk: Over-Execution (&gt;85%)
          </h2>
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden divide-y divide-border">
            {overExecuting.map(m => (
              <div key={m.name} className="p-4 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-bold text-sm leading-tight flex items-center gap-2">
                    <Building2 className="size-3 text-muted-foreground" /> {m.name}
                  </div>
                  <div className="text-rose-600 font-black text-lg bg-rose-50 dark:bg-rose-900/30 px-2 rounded">
                    {m.executionRate}%
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 border-t border-border pt-3">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Allocation</div>
                    <div className="font-mono text-sm font-semibold">₦{(m.budget / 1000).toFixed(2)}B</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-rose-500 uppercase tracking-widest">Spent</div>
                    <div className="font-mono text-sm font-bold text-rose-600">₦{(m.spent / 1000).toFixed(2)}B</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Under Execution Risk */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900">
            <AlertTriangle className="size-5" /> Lagging: Under-Execution (&lt;40%)
          </h2>
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden divide-y divide-border">
            {underExecuting.map(m => (
              <div key={m.name} className="p-4 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-bold text-sm leading-tight flex items-center gap-2">
                    <Building2 className="size-3 text-muted-foreground" /> {m.name}
                  </div>
                  <div className="text-amber-600 font-black text-lg bg-amber-50 dark:bg-amber-900/30 px-2 rounded">
                    {m.executionRate}%
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 border-t border-border pt-3">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Allocation</div>
                    <div className="font-mono text-sm font-semibold">₦{(m.budget / 1000).toFixed(2)}B</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-amber-500 uppercase tracking-widest">Spent</div>
                    <div className="font-mono text-sm font-bold text-amber-600">₦{(m.spent / 1000).toFixed(2)}B</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
