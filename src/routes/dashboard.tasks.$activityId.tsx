import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Card, Pill, Bar } from "@/components/ui-bits";
import { ACTIVITIES, TASKS } from "@/lib/governance-data";
import { ArrowLeft, Camera, FileText, MapPin, Video, CheckCircle2, XCircle, Clock, Upload, ShieldCheck } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/tasks/$activityId")({ component: TasksPage });

function TasksPage() {
  const { activityId } = Route.useParams();
  const activity = ACTIVITIES.find((a) => a.id === activityId);
  const tasks = TASKS.filter((t) => t.activityId === activityId);
  const [selected, setSelected] = useState(tasks[0]?.id ?? "");
  const task = tasks.find((t) => t.id === selected) ?? tasks[0];

  if (!activity) {
    return (
      <div className="p-8">
        <Link to="/dashboard/activities" className="text-[12px] inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Back</Link>
        <h1 className="mt-4 text-xl font-semibold">Activity not found</h1>
      </div>
    );
  }

  const evidenceComplete = task && task.evidence.length > 0 && task.evidence.every((e) => e.verified);

  return (
    <div>
      <PageHeader
        eyebrow={activity.ministry}
        title={activity.name}
        subtitle={`Activity ${activity.id} · ${activity.kpi} · Officer: ${activity.officer} · Approver: ${activity.approver}`}
        action={
          <Link to="/dashboard/activities" className="text-[12px] inline-flex items-center gap-1 px-3 h-9 rounded-lg border border-border bg-card hover:bg-accent">
            <ArrowLeft className="size-3.5" /> All activities
          </Link>
        }
      />
      <div className="px-6 md:px-8 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Task Chain" className="lg:col-span-1">
          <ol className="space-y-2">
            {tasks.map((t, i) => {
              const isSel = t.id === task?.id;
              const tone = t.status === "Completed" ? "good" : t.status === "Green" ? "good" : t.status === "Amber" ? "gold" : t.status === "Red" ? "bad" : "info";
              return (
                <li key={t.id}>
                  <button onClick={() => setSelected(t.id)} className={`w-full text-left rounded-lg border p-3 transition-colors ${isSel ? "border-[color:var(--gold)] bg-muted/40" : "border-border hover:bg-muted/30"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[11px] text-muted-foreground">Task {i + 1}</div>
                        <div className="text-[13px] font-semibold leading-tight truncate">{t.name}</div>
                      </div>
                      <Pill tone={tone as any}>{t.status}</Pill>
                    </div>
                    <div className="mt-2"><Bar value={t.progress} tone={t.progress > 70 ? "good" : t.progress > 30 ? "gold" : "warn"} /></div>
                  </button>
                </li>
              );
            })}
          </ol>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {task && (
            <>
              <Card title={task.name} action={<Pill tone={task.status === "Completed" || task.status === "Green" ? "good" : task.status === "Amber" ? "gold" : task.status === "Red" ? "bad" : "info"}>{task.status}</Pill>}>
                <div className="text-[13px] text-muted-foreground">{task.description}</div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11.5px]">
                  <Info label="Officer" value={task.officer} />
                  <Info label="Inspector" value={task.inspector} />
                  <Info label="Approving Authority" value={task.approver} />
                  <Info label="Budget Component" value={`₦${task.budget.toLocaleString()}M`} />
                  <Info label="Start" value={task.start} />
                  <Info label="End" value={task.end} />
                  <Info label="Progress" value={`${task.progress}%`} />
                  <Info label="Deliverables" value={task.deliverables.join(", ")} />
                </div>
              </Card>

              <Card title="Evidence Vault" action={
                <button className="h-8 px-3 rounded-lg gold-gradient text-gold-foreground text-[11.5px] font-semibold inline-flex items-center gap-1.5">
                  <Upload className="size-3.5" /> Upload Evidence
                </button>
              }>
                {task.evidence.length === 0 ? (
                  <div className="text-[13px] text-muted-foreground p-4 border border-dashed border-border rounded-lg">
                    No evidence yet. Photos, videos, reports, GPS coordinates and completion certificates are required before this task can be marked complete.
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {task.evidence.map((e, i) => (
                      <li key={i} className="py-3 flex items-center gap-3 text-[12.5px]">
                        <EvidenceIcon kind={e.kind} />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{e.label}</div>
                          <div className="text-[11px] text-muted-foreground">{e.uploadedBy} · {e.at}</div>
                        </div>
                        {e.verified ? <Pill tone="good">Verified</Pill> : <Pill tone="warn">Pending Review</Pill>}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border text-[12px]">
                  <ShieldCheck className="inline size-4 text-[color:var(--success)] mr-1.5 align-text-bottom" />
                  The system will not permit this task to be marked complete unless evidence is verified by the inspector and approved by <strong>{task.approver}</strong>.
                </div>
              </Card>

              <Card title="Approval Workflow">
                <div className="flex flex-wrap gap-2">
                  <button className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white" style={{ background: "var(--success)" }} disabled={!evidenceComplete}>
                    <CheckCircle2 className="inline size-3.5 mr-1.5" /> Approve & Mark Complete
                  </button>
                  <button className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white" style={{ background: "var(--warning)" }}>
                    <Clock className="inline size-3.5 mr-1.5" /> Request More Evidence
                  </button>
                  <button className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white" style={{ background: "var(--destructive)" }}>
                    <XCircle className="inline size-3.5 mr-1.5" /> Reject
                  </button>
                </div>
                {!evidenceComplete && (
                  <div className="mt-3 text-[11.5px] text-[color:var(--warning)]">Approval is locked until all uploaded evidence is verified.</div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-medium mt-0.5 text-[12px]">{value}</div>
    </div>
  );
}

function EvidenceIcon({ kind }: { kind: string }) {
  const I = kind === "photo" ? Camera : kind === "video" ? Video : kind === "gps" ? MapPin : FileText;
  return <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-[color:var(--gold)]"><I className="size-4" /></div>;
}
