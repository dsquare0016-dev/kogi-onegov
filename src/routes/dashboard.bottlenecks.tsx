import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Stat, Pill } from "@/components/ui-bits";
import { BOTTLENECKS } from "@/lib/governance-data";
import { AlertTriangle, Clock, Activity } from "lucide-react";
import { BarChart, Bar as RBar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/dashboard/bottlenecks")({ component: BottlenecksPage });

function BottlenecksPage() {
  const bySource = Object.values(BOTTLENECKS.reduce<Record<string, { source: string; days: number; count: number }>>((acc, b) => {
    acc[b.source] = acc[b.source] ?? { source: b.source, days: 0, count: 0 };
    acc[b.source].days += b.durationDays; acc[b.source].count += 1;
    return acc;
  }, {}));

  const byImpact = ["Low","Medium","High","Critical"].map((k) => ({ name: k, value: BOTTLENECKS.filter(b => b.impact === k).length }));

  return (
    <div>
      <PageHeader
        eyebrow="Delay Detection & Bottleneck Analysis"
        title="Delays & Bottlenecks"
        subtitle="Automatic detection of implementation delays — by source, duration, responsible officer, risk score and escalation level."
        action={<Pill tone="bad">{BOTTLENECKS.filter(b => b.impact === "Critical" || b.impact === "High").length} high-risk</Pill>}
      />
      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Active Bottlenecks" value={`${BOTTLENECKS.length}`} sub="Tracked statewide" tone="warn" icon={<AlertTriangle className="size-4" />} />
          <Stat label="Avg Delay" value={`${Math.round(BOTTLENECKS.reduce((s,b)=>s+b.durationDays,0)/BOTTLENECKS.length)} days`} sub="Across all sources" icon={<Clock className="size-4" />} />
          <Stat label="Critical Impact" value={`${BOTTLENECKS.filter(b=>b.impact==='Critical').length}`} sub="Escalated to L4" tone="bad" />
          <Stat label="Avg Risk Score" value={`${Math.round(BOTTLENECKS.reduce((s,b)=>s+b.riskScore,0)/BOTTLENECKS.length)}`} sub="0–100 scale" tone="gold" icon={<Activity className="size-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Delay Days by Source" className="lg:col-span-2">
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={bySource} layout="vertical">
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis dataKey="source" type="category" stroke="var(--muted-foreground)" fontSize={11} width={150} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <RBar dataKey="days" fill="var(--gold)" radius={[0,6,6,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Impact Distribution">
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byImpact} dataKey="value" innerRadius={45} outerRadius={85} paddingAngle={4}>
                    {byImpact.map((_, i) => (<Cell key={i} fill={["var(--chart-3)","var(--chart-2)","var(--chart-4)","var(--destructive)"][i]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card title="Bottleneck Register">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                <tr><th className="text-left py-2 px-2">Project</th><th className="text-left">Ministry</th><th className="text-left">Source</th><th className="text-right">Days</th><th className="text-right">Risk</th><th className="text-left pl-3">Impact</th><th className="text-left">Responsible</th><th className="text-left">Esc.</th></tr>
              </thead>
              <tbody>
                {BOTTLENECKS.map((b) => (
                  <tr key={b.id} className="border-b border-border/60">
                    <td className="py-2 px-2 font-medium">{b.project}</td>
                    <td>{b.ministry}</td>
                    <td><Pill tone="warn">{b.source}</Pill></td>
                    <td className="text-right tabular-nums">{b.durationDays}</td>
                    <td className="text-right tabular-nums font-semibold">{b.riskScore}</td>
                    <td className="pl-3"><Pill tone={b.impact === "Critical" ? "bad" : b.impact === "High" ? "warn" : b.impact === "Medium" ? "gold" : "good"}>{b.impact}</Pill></td>
                    <td>{b.responsible}</td>
                    <td><Pill tone="info">{b.escalation}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
