import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill, Bar } from "@/components/ui-bits";
import { BRIEFINGS } from "@/lib/governance-data";
import { KPIS, MINISTRIES, AI_INSIGHTS } from "@/lib/mock-data";
import { Download, Sparkles, Newspaper } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/briefings")({ component: BriefingsPage });

const TABS = [
  { id: "daily", label: "Daily", data: BRIEFINGS.daily },
  { id: "weekly", label: "Weekly", data: BRIEFINGS.weekly },
  { id: "monthly", label: "Monthly", data: BRIEFINGS.monthly },
  { id: "quarterly", label: "Quarterly", data: BRIEFINGS.monthly },
  { id: "annual", label: "Annual", data: BRIEFINGS.monthly },
];

function BriefingsPage() {
  const [tab, setTab] = useState(TABS[0].id);
  const current = TABS.find((t) => t.id === tab)!.data;

  return (
    <div>
      <PageHeader
        eyebrow="Executive One-Page Briefing"
        title="Auto-Generated Executive Briefings"
        subtitle="Designed specifically for executive consumption — Daily, Weekly, Monthly, Quarterly, Annual."
        action={
          <button className="h-9 px-4 rounded-lg gold-gradient text-gold-foreground text-[12px] font-semibold inline-flex items-center gap-2">
            <Download className="size-3.5" /> Download PDF
          </button>
        }
      />
      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`h-9 px-4 rounded-lg text-[12px] font-semibold border ${t.id === tab ? "gold-gradient text-gold-foreground border-transparent" : "bg-card border-border hover:bg-accent"}`}>{t.label}</button>
          ))}
        </div>

        <Card title={current.title} action={<Pill tone="gold">Auto-generated · {current.date}</Pill>}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Executive Highlights</div>
                <ul className="space-y-2">
                  {current.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-[13px] leading-relaxed"><Newspaper className="size-4 text-[color:var(--gold)] shrink-0 mt-0.5" /> {b}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Mini label="Budget Utilization" value={`${KPIS.budgetUtil}%`} />
                <Mini label="Dev Plan Progress" value={`${KPIS.developmentPlan}%`} />
                <Mini label="State Performance" value={`${KPIS.statePerformance}`} />
                <Mini label="Delayed Projects" value={`${KPIS.projectsDelayed}`} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Top 5 MDA Rankings</div>
                <div className="space-y-2">
                  {MINISTRIES.slice(0,5).map((m, i) => (
                    <div key={m.name} className="flex items-center gap-3 text-[12.5px]">
                      <div className="size-6 rounded-md bg-muted flex items-center justify-center text-[11px] font-bold">{i+1}</div>
                      <div className="flex-1 min-w-0"><div className="font-medium truncate">{m.name}</div><Bar value={m.score} tone="gold" /></div>
                      <div className="font-display font-bold tabular-nums w-8 text-right">{m.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">AI Recommendations</div>
                <div className="space-y-2">
                  {AI_INSIGHTS.slice(0, 3).map((t, i) => (
                    <div key={i} className="flex gap-2 text-[12.5px] p-3 rounded-lg bg-muted/40 border border-border">
                      <Sparkles className="size-4 text-[color:var(--gold)] shrink-0 mt-0.5" />
                      <p>{t}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl p-4 navy-gradient text-white">
                <div className="text-[10px] uppercase tracking-widest text-white/60">Prepared for</div>
                <div className="font-display text-lg font-semibold mt-1">H.E. The Governor</div>
                <div className="text-[11px] text-white/70">Governance Delivery Unit (GDU) · {current.date}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-bold text-[color:var(--gold)]">{value}</div>
    </div>
  );
}
