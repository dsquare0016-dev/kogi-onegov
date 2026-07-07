import { createFileRoute } from '@tanstack/react-router';
import { MINISTRIES, PILLARS } from '@/lib/governance-data';
import { Target, Activity, CheckCircle2, TrendingUp, AlertOctagon, Trophy } from 'lucide-react';

export const Route = createFileRoute('/dashboard/command-center/scorecard')({
  component: ScorecardPage,
});

function ScorecardPage() {
  const topMDAs = [...MINISTRIES].sort((a,b) => b.score - a.score).slice(0, 10);
  const bottomMDAs = [...MINISTRIES].sort((a,b) => a.score - b.score).slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-1">
            <Target className="size-4" />
            DG GDU Command Center
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">State Delivery Scorecard</h1>
          <p className="text-muted-foreground mt-1">
            Holistic assessment of macroeconomic pillar progress and MDA performance scores.
          </p>
        </div>
      </div>

      {/* Pillar Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {PILLARS.map(p => (
          <div key={p.name} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold text-muted-foreground line-clamp-2 min-h-[40px]">{p.name}</h3>
            <div className="mt-4 flex items-end justify-between">
              <span className={`text-2xl font-black ${p.progress >= 80 ? 'text-emerald-500' : p.progress >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                {p.progress}%
              </span>
              <Activity className={`size-5 ${p.progress >= 80 ? 'text-emerald-500' : p.progress >= 70 ? 'text-amber-500' : 'text-rose-500'}`} />
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3">
              <div 
                className={`h-1.5 rounded-full ${p.progress >= 80 ? 'bg-emerald-500' : p.progress >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                style={{ width: `${p.progress}%` }} 
              />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Weight: {p.weight}%</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2 text-emerald-600">
            <Trophy className="size-5" /> Top 10 Performing MDAs
          </h2>
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden divide-y divide-border">
            {topMDAs.map((m, i) => (
              <div key={m.name} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{m.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{m.projects} Active Projects</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-600">{m.score}%</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Delivery Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2 text-rose-600">
            <AlertOctagon className="size-5" /> Bottom 5 (Critical Lag)
          </h2>
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl shadow-sm overflow-hidden divide-y divide-rose-200/50 dark:divide-rose-900/50">
            {bottomMDAs.map((m) => (
              <div key={m.name} className="p-4 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors">
                <div className="font-semibold text-rose-900 dark:text-rose-200 leading-tight">{m.name}</div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-rose-700/70 dark:text-rose-300/70 uppercase tracking-widest">Score</span>
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400">{m.score}%</span>
                </div>
                <div className="w-full bg-rose-200 dark:bg-rose-900 rounded-full h-1 mt-1">
                  <div className="h-1 rounded-full bg-rose-600 dark:bg-rose-500" style={{ width: `${m.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
