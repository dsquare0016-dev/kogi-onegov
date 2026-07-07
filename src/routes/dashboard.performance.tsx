import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Stat, Bar, Pill } from "@/components/ui-bits";
import { PERFORMANCE_CASCADE, COMMISSIONERS } from "@/lib/governance-data";
import { Activity, Users, Award } from "lucide-react";

export const Route = createFileRoute("/dashboard/performance")({ component: PerformancePage });

function PerformancePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Performance Management Engine"
        title="Statewide Performance Cascade"
        subtitle="Staff → Department → Agency → Ministry → State. Weighted across task completion, project delivery, budget, KPIs and Dev Plan contribution."
      />
      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="State Score" value={`${PERFORMANCE_CASCADE.state}`} sub="+3 pts QoQ" tone="gold" icon={<Activity className="size-4" />} />
          <Stat label="Top Ministry" value="Finance" sub="Score 95" tone="good" icon={<Award className="size-4" />} />
          <Stat label="Bottom Ministry" value="Tourism" sub="Score 68" tone="warn" />
          <Stat label="Staff Tracked" value="1,248" sub="Across 20 MDAs" icon={<Users className="size-4" />} />
        </div>

        <Card title="Commissioner Performance Ranking">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                <tr><th className="text-left py-2 px-2">#</th><th className="text-left">Commissioner</th><th className="text-left">Ministry</th><th className="text-right">Score</th><th className="text-right">Delivery</th><th className="text-right">Budget Util.</th><th>Flag</th></tr>
              </thead>
              <tbody>
                {COMMISSIONERS.sort((a,b)=>b.score-a.score).map((c, i) => (
                  <tr key={c.ministry} className="border-b border-border/60">
                    <td className="py-2 px-2 tabular-nums">{i+1}</td>
                    <td className="font-medium">{c.name}</td>
                    <td>{c.ministry}</td>
                    <td className="text-right tabular-nums font-semibold">{c.score}</td>
                    <td className="text-right tabular-nums">{c.delivery}</td>
                    <td className="text-right tabular-nums">{c.budgetUtil}%</td>
                    <td>{c.flagged ? <Pill tone="warn">Review</Pill> : <Pill tone="good">OK</Pill>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {PERFORMANCE_CASCADE.ministries.map((m) => (
            <Card key={m.name} title={m.name} action={<Pill tone={m.score > 85 ? "good" : m.score > 75 ? "gold" : "warn"}>{m.score}</Pill>}>
              <div className="space-y-3">
                {m.depts.map((d) => (
                  <div key={d.name}>
                    <div className="flex items-center justify-between text-[12px] mb-1.5">
                      <span className="font-medium">{d.name} <span className="text-muted-foreground text-[10.5px]">· {d.staff} staff</span></span>
                      <span className="text-muted-foreground tabular-nums">{d.score}</span>
                    </div>
                    <Bar value={d.score} tone={d.score > 80 ? "good" : d.score > 70 ? "gold" : "warn"} />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
