import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill, Stat } from "@/components/ui-bits";
import { SERVICE_REQUESTS, type SRStage } from "@/lib/governance-data";
import { Workflow, Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/service-requests")({ component: SRPage });

const PIPELINE: SRStage[] = ["Submitted","Under Review","Approved","Costed","Payment","Delivered"];

function SRPage() {
  return (
    <div>
      <PageHeader
        eyebrow="GDU Change & Service Request System"
        title="Service Requests"
        subtitle="Controlled post-period modifications, custom reports, integrations and historical data recovery — fully auditable workflow."
        action={
          <button className="h-9 px-4 rounded-lg gold-gradient text-gold-foreground text-[12px] font-semibold inline-flex items-center gap-2">
            <Plus className="size-3.5" /> New service request
          </button>
        }
      />
      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Open Requests" value={`${SERVICE_REQUESTS.filter(r => r.stage !== "Delivered" && r.stage !== "Rejected").length}`} sub="Across MDAs" tone="gold" icon={<Workflow className="size-4" />} />
          <Stat label="Awaiting Approval" value={`${SERVICE_REQUESTS.filter(r=>r.stage==='Under Review' || r.stage==='Submitted').length}`} sub="GDU desk" />
          <Stat label="Delivered (90d)" value={`${SERVICE_REQUESTS.filter(r=>r.stage==='Delivered').length}`} tone="good" />
          <Stat label="Total Costed" value={`₦${SERVICE_REQUESTS.reduce((s,r)=>s+r.cost,0).toFixed(1)}M`} sub="Billable services" />
        </div>

        <Card title="Request Pipeline">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {PIPELINE.map((stage) => {
              const items = SERVICE_REQUESTS.filter(r => r.stage === stage);
              return (
                <div key={stage} className="rounded-xl border border-border bg-muted/30 p-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground px-1 pb-2">
                    <span>{stage}</span><span className="text-foreground font-bold">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((r) => (
                      <div key={r.id} className="rounded-lg p-2.5 bg-card border border-border">
                        <div className="text-[11.5px] font-semibold leading-tight">{r.title}</div>
                        <div className="text-[10.5px] text-muted-foreground mt-0.5">{r.ministry}</div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <Pill tone="info">{r.type}</Pill>
                          <span className="text-[11px] font-semibold tabular-nums">₦{r.cost.toFixed(1)}M</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
