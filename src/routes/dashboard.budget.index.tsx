import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Stat, Pill, Bar } from "@/components/ui-bits";
import { BUDGET_TREND, REVENUE_MIX, MINISTRIES } from "@/lib/mock-data";
import { AreaChart, Area, BarChart, Bar as RBar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { Wallet, TrendingUp, Coins, ArrowDownToLine } from "lucide-react";

export const Route = createFileRoute("/dashboard/budget/")({ component: BudgetIndex });

function BudgetIndex() {
  return (
    <div>
      <PageHeader eyebrow="Finance" title="Budget & Finance Intelligence" subtitle="Appropriation, releases, expenditure, revenue and forecasts across MDAs." />
      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="FY26 Appropriation" value="₦462.8B" sub="Approved" tone="gold" icon={<Wallet className="size-4" />} />
          <Stat label="Releases YTD" value="₦284.1B" sub="61% of budget" icon={<ArrowDownToLine className="size-4" />} />
          <Stat label="Expenditure" value="₦231.6B" sub="82% utilization" tone="good" icon={<Coins className="size-4" />} />
          <Stat label="IGR" value="₦47.9B" sub="+19% vs target" tone="good" icon={<TrendingUp className="size-4" />} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Plan vs Actual — FY26" className="lg:col-span-2">
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={BUDGET_TREND}>
                  <defs>
                    <linearGradient id="b1" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--gold)" stopOpacity={0.6} /><stop offset="100%" stopColor="var(--gold)" stopOpacity={0} /></linearGradient>
                    <linearGradient id="b2" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient>
                  </defs>
                  <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="planned" stroke="var(--primary)" fill="url(#b2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="actual" stroke="var(--gold)" fill="url(#b1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Revenue Composition">
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={REVENUE_MIX} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={3}>
                    {REVENUE_MIX.map((_, i) => <Cell key={i} fill={["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-5)"][i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <Card title="MDA Budget Performance" action={<Pill tone="gold">Top 10</Pill>}>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={MINISTRIES.slice(0,10)} layout="vertical" margin={{ left: 60 }}>
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={10} width={150} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <RBar dataKey="budget" fill="var(--primary)" radius={[0,6,6,0]} />
                <RBar dataKey="spent" fill="var(--gold)" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {MINISTRIES.slice(0,5).map(m => (
              <div key={m.name} className="flex items-center gap-3 text-[12.5px]">
                <div className="flex-1 truncate font-medium">{m.name}</div>
                <div className="w-48"><Bar value={Math.round((m.spent/m.budget)*100)} tone="gold" /></div>
                <div className="w-16 text-right tabular-nums text-muted-foreground">{Math.round((m.spent/m.budget)*100)}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
