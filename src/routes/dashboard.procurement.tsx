import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill, Stat } from "@/components/ui-bits";
import { PROCUREMENTS } from "@/lib/mock-data";
import { ShoppingCart, Clock4, BadgeCheck, Building2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/procurement")({ component: Procurement });

function Procurement() {
  return (
    <div>
      <PageHeader eyebrow="Procurement" title="e-Procurement & Contracts"
        subtitle="Tender, bid evaluation, award, contracts, and vendor performance." />
      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Open Tenders" value="14" sub="3 closing this week" tone="gold" icon={<ShoppingCart className="size-4" />} />
          <Stat label="Avg Turnaround" value="19d" sub="-28% MoM" tone="good" icon={<Clock4 className="size-4" />} />
          <Stat label="Awards (YTD)" value="64" sub="₦142.8B" icon={<BadgeCheck className="size-4" />} />
          <Stat label="Active Vendors" value="312" sub="Pre-qualified" icon={<Building2 className="size-4" />} />
        </div>
        <Card title="Procurement Pipeline">
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-[12.5px] min-w-[800px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                  {["Ref","Title","Ministry","Value (₦M)","Stage","Vendor","Status"].map(h => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {PROCUREMENTS.map(p => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{p.id}</td>
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.ministry}</td>
                    <td className="px-4 py-3 tabular-nums">{p.value.toFixed(1)}</td>
                    <td className="px-4 py-3"><Pill tone="info">{p.stage}</Pill></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.vendor}</td>
                    <td className="px-4 py-3"><Pill tone={p.awarded ? "good" : "warn"}>{p.awarded ? "Awarded" : "Open"}</Pill></td>
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