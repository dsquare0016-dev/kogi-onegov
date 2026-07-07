import { dbGetActivities } from '@/lib/postgres-service';
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Card, Pill, Bar, Stat } from "@/components/ui-bits";
import { ClipboardList, Calendar, Wallet, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { getSession, roleById } from "@/lib/auth";
import { useState, useEffect, useMemo } from "react";

export const Route = createFileRoute("/dashboard/activities")({ component: ActivitiesPage });

function ActivitiesPage() {
  const session = getSession();
  const profile = session ? roleById(session.role) : null;
  const mdaFilter = session?.mda || profile?.ministry;
  const isFullAccess = session?.role === 'super_admin' || session?.role === 'governor';

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    setLoading(true);
    
    const data = await dbGetActivities();
    setActivities(data);
    setLoading(false);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const visibleActivities = useMemo(() => {
    if (isFullAccess) return activities;
    return activities.filter(a => !mdaFilter || a.mda?.toLowerCase() === mdaFilter.toLowerCase());
  }, [activities, mdaFilter, isFullAccess]);

  const totalBudget = visibleActivities.reduce((s, a) => s + (a.budget || 0), 0);
  const totalSpent = visibleActivities.reduce((s, a) => s + (a.spent || 0), 0);

  // Group activities by MDA for display
  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    visibleActivities.forEach(a => {
      const key = a.mda || 'General Administration';
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return Object.entries(groups).map(([mdaName, list]) => ({
      mdaName,
      pillar: list[0]?.pillar || 'Strategic Pillar',
      list
    }));
  }, [visibleActivities]);

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading Activities Board...</p>
      </div>
    );
  }

  return (
    <div className="text-foreground animate-in fade-in duration-500">
      <PageHeader
        eyebrow="Activity → Task → Evidence"
        title="Activities & Tasks"
        subtitle="Every ministry budget speaks to activities. Every activity speaks to tasks. Every task requires evidence."
        action={<Pill tone="gold">PostgreSQL Live Data Mode</Pill>}
      />
      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Total Groupings" value={`${groupedActivities.length}`} sub="Active MDA groups" tone="gold" icon={<ClipboardList className="size-4" />} />
          <Stat label="Active Activities" value={`${visibleActivities.length}`} sub={mdaFilter ? `In ${mdaFilter}` : "Across Kogi State"} />
          <Stat label="Activity Budget Allocation" value={`₦${(totalBudget / 1000000).toFixed(1)}M`} sub="Approved limit" tone="good" icon={<Wallet className="size-4" />} />
          <Stat label="Spent YTD" value={`₦${(totalSpent / 1000000).toFixed(1)}M`} sub={totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}% utilised` : "0% utilised"} tone="gold" />
        </div>

        {groupedActivities.map((group, idx) => (
          <Card key={idx} title={group.mdaName} action={<Pill tone="info">{group.pillar}</Pill>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.list.map((a) => {
                const progress = a.progress || 35; // Default mock progress if empty
                return (
                  <div key={a.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-[13.5px] leading-tight text-foreground">{a.title}</div>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                        <div className="text-[10px] text-muted-foreground mt-2">
                          <Calendar className="inline size-3 mr-1" /> {a.start || '2026-01-01'} → {a.end || '2026-12-31'} · {a.location}
                        </div>
                      </div>
                      <Pill tone={progress > 70 ? "good" : progress > 40 ? "gold" : "warn"}>{progress}%</Pill>
                    </div>
                    <div className="mt-3">
                      <Bar value={progress} tone={progress > 70 ? "good" : progress > 40 ? "gold" : "warn"} />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                      <div><div className="text-muted-foreground">Budget Limit</div><div className="font-semibold tabular-nums">₦{(a.budget / 1000000).toFixed(1)}M</div></div>
                      <div><div className="text-muted-foreground">Spent YTD</div><div className="font-semibold tabular-nums">₦{(a.spent / 1000000).toFixed(1)}M</div></div>
                      <div><div className="text-muted-foreground">Pillar</div><div className="font-semibold truncate">{a.pillar}</div></div>
                    </div>
                    <div className="mt-3 text-[11.5px] text-muted-foreground">
                      <span className="font-medium text-foreground">Officer:</span> {a.creator}
                    </div>
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Sparkles className="size-3 text-amber-500" /> AI Status: on-trajectory</div>
                      <Link to="/dashboard/tasks/$activityId" params={{ activityId: a.id }} className="text-[12px] font-semibold text-[#C5A059] inline-flex items-center gap-1 hover:underline">
                        Open task chain <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
