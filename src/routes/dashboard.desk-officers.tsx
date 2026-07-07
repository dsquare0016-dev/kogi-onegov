import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Stat, Pill, Bar } from "@/components/ui-bits";
import { DESK_OFFICERS } from "@/lib/governance-data";
import { IdCard, GraduationCap, ShieldCheck, RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/dashboard/desk-officers")({ component: DOPage });

function DOPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Continuity & Capacity"
        title="Desk Officer Certification & Training"
        subtitle="Preserve institutional knowledge across MDAs — assignments, training, certification, replacement and competency records."
      />
      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Desk Officers" value={`${DESK_OFFICERS.length}`} sub="Across MDAs" tone="gold" icon={<IdCard className="size-4" />} />
          <Stat label="Certified" value={`${DESK_OFFICERS.filter(d=>d.certified).length}`} tone="good" icon={<ShieldCheck className="size-4" />} />
          <Stat label="In Training" value={`${DESK_OFFICERS.filter(d=>d.trained && !d.certified).length}`} icon={<GraduationCap className="size-4" />} />
          <Stat label="Replacement Requested" value={`${DESK_OFFICERS.filter(d=>d.status==='Replacement Requested').length}`} tone="warn" icon={<RefreshCcw className="size-4" />} />
        </div>

        <Card title="Desk Officer Register">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                <tr><th className="text-left py-2 px-2">ID</th><th className="text-left">Officer</th><th className="text-left">Ministry</th><th className="text-left">Assignment</th><th className="text-left">Trained</th><th className="text-left">Certified</th><th className="text-left">Status</th><th className="text-left w-40">Competency</th></tr>
              </thead>
              <tbody>
                {DESK_OFFICERS.map((d) => (
                  <tr key={d.id} className="border-b border-border/60">
                    <td className="py-2 px-2 tabular-nums">{d.id}</td>
                    <td className="font-medium">{d.name}</td>
                    <td>{d.ministry}</td>
                    <td>{d.assignment}</td>
                    <td>{d.trained ? <Pill tone="good">Yes</Pill> : <Pill tone="warn">No</Pill>}</td>
                    <td>{d.certified ? <Pill tone="good">Yes</Pill> : <Pill tone="warn">No</Pill>}</td>
                    <td><Pill tone={d.status === "Active" ? "good" : d.status === "On Leave" ? "info" : "warn"}>{d.status}</Pill></td>
                    <td className="pr-2"><Bar value={d.competency} tone={d.competency > 80 ? "good" : d.competency > 70 ? "gold" : "warn"} /></td>
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
