import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Stat, Pill } from "@/components/ui-bits";
import { BUDGET_TREND, MINISTRIES, LGAS } from "@/lib/mock-data";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar as RBar, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { BarChart3, TrendingUp, MapPin, Activity } from "lucide-react";

export const Route = createFileRoute("/dashboard/analytics")({ component: Analytics });

function Analytics() {
  const lgaData = LGAS.map((l, i) => ({ lga: l, score: 55 + ((i * 13) % 45) }));
  const radar = ["Health","Education","Roads","Water","Power","Security"].map((k, i) => ({ k, A: 60 + ((i * 7) % 35), B: 50 + ((i * 11) % 40) }));
  return (
    <div>
      <PageHeader eyebrow="Insights" title="BI & Analytics Center"
        subtitle="Cross-ministry comparison, trends, forecasting, GIS and predictive analytics." />
      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Live Dashboards" value="64" tone="gold" icon={<BarChart3 className="size-4" />} />
          <Stat label="Data Sources" value="38" sub="MDAs + LGAs" icon={<Activity className="size-4" />} />
          <Stat label="Trend Watchers" value="142" sub="AI agents" icon={<TrendingUp className="size-4" />} />
          <Stat label="LGAs Mapped" value="21/21" tone="good" icon={<MapPin className="size-4" />} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="State Performance Trend" className="lg:col-span-2">
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={BUDGET_TREND.map((b,i)=>({...b, perf: 60+((i*7)%30)}))}>
                  <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Line dataKey="perf" stroke="var(--gold)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--gold)" }} />
                  <Line dataKey="actual" stroke="var(--primary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Sector Comparison" action={<Pill tone="gold">Now vs LY</Pill>}>
            <div className="h-64">
              <ResponsiveContainer>
                <RadarChart data={radar}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="k" stroke="var(--muted-foreground)" fontSize={10} />
                  <Radar dataKey="A" stroke="var(--gold)" fill="var(--gold)" fillOpacity={0.4} />
                  <Radar dataKey="B" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <Card title="LGA Performance Heat Index" action={<Pill tone="info">21 LGAs</Pill>}>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={lgaData}>
                <XAxis dataKey="lga" stroke="var(--muted-foreground)" fontSize={10} angle={-30} textAnchor="end" height={70} interval={0} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <RBar dataKey="score" fill="var(--gold)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Ministry Comparison Grid">
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-[12.5px] min-w-[800px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                  {["Ministry","Score","Projects","Budget","Spent","Utilization"].map(h => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {MINISTRIES.map(m => (
                  <tr key={m.name} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3 tabular-nums">{m.score}</td>
                    <td className="px-4 py-3 tabular-nums">{m.projects}</td>
                    <td className="px-4 py-3 tabular-nums">₦{m.budget.toLocaleString()}M</td>
                    <td className="px-4 py-3 tabular-nums">₦{m.spent.toLocaleString()}M</td>
                    <td className="px-4 py-3 tabular-nums">{Math.round((m.spent/m.budget)*100)}%</td>
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