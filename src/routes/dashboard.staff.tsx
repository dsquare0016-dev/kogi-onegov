import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { PageHeader, Card, Pill, Stat, Bar } from "@/components/ui-bits";
import { STAFF_SAMPLE } from "@/lib/mock-data";
import { Users, UserCheck, Award, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/dashboard/staff")({ component: Staff });

function Staff() {
  const location = useLocation();
  if (location.pathname !== '/dashboard/staff') {
    return <Outlet />;
  }

  return (
    <div>
      <PageHeader eyebrow="HR" title="Staff & Workforce Management"
        subtitle="Digital personnel files, attendance, performance, leave, training and payroll-ready." />
      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Workforce" value="14,820" sub="State-wide" tone="gold" icon={<Users className="size-4" />} />
          <Stat label="Attendance" value="91%" sub="This week" tone="good" icon={<UserCheck className="size-4" />} />
          <Stat label="Avg Performance" value="78" sub="Out of 100" icon={<Award className="size-4" />} />
          <Stat label="In Training" value="612" sub="Across 28 programs" icon={<GraduationCap className="size-4" />} />
        </div>
        <Card title="Personnel Directory (sample)">
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-[12.5px] min-w-[800px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                  {["Staff ID","Name","Cadre","Ministry","Attendance","Performance","Status"].map(h => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {STAFF_SAMPLE.map(s => (
                  <tr key={s.id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{s.id}</td>
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.cadre}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.ministry}</td>
                    <td className="px-4 py-3 w-40"><div className="flex items-center gap-2"><Bar value={s.attendance} tone="good" /><span className="text-[11px] w-8 text-right tabular-nums">{s.attendance}%</span></div></td>
                    <td className="px-4 py-3 w-40"><div className="flex items-center gap-2"><Bar value={s.performance} tone="gold" /><span className="text-[11px] w-8 text-right tabular-nums">{s.performance}</span></div></td>
                    <td className="px-4 py-3"><Pill tone={s.status==="Active"?"good":"warn"}>{s.status}</Pill></td>
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