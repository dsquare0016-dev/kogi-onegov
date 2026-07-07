import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill, Stat } from "@/components/ui-bits";
import { GEO_PROJECT_PINS, LGA_GEO } from "@/lib/governance-data";
import { MapPin, Layers, Activity } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/map")({ component: MapPage });

function MapPage() {
  const [pinId, setPinId] = useState<string | null>(GEO_PROJECT_PINS[0]?.id ?? null);
  const [heat, setHeat] = useState(false);
  const selected = GEO_PROJECT_PINS.find((p) => p.id === pinId);

  const color = (status: string) =>
    status === "On-Track" ? "var(--success)"
    : status === "At-Risk" ? "var(--warning)"
    : status === "Delayed" ? "var(--destructive)"
    : status === "Completed" ? "var(--gold)" : "var(--info)";

  return (
    <div>
      <PageHeader
        eyebrow="Geo-Spatial Project Monitoring"
        title="Kogi State — Project Map"
        subtitle="Project locations across the 21 LGAs with status, evidence, and Development Plan coverage overlays."
        action={
          <button onClick={() => setHeat((h) => !h)} className="h-9 px-3 rounded-lg border border-border bg-card text-[12px] font-semibold inline-flex items-center gap-1.5">
            <Layers className="size-3.5" /> {heat ? "Hide" : "Show"} dev-plan heat
          </button>
        }
      />
      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="LGAs Mapped" value={`${LGA_GEO.length}`} sub="21 of 21" tone="gold" icon={<MapPin className="size-4" />} />
          <Stat label="Project Pins" value={`${GEO_PROJECT_PINS.length}`} sub="Geo-tagged" />
          <Stat label="On-Track" value={`${GEO_PROJECT_PINS.filter(p=>p.status==='On-Track').length}`} tone="good" icon={<Activity className="size-4" />} />
          <Stat label="Delayed / At-Risk" value={`${GEO_PROJECT_PINS.filter(p=>p.status==='Delayed' || p.status==='At-Risk').length}`} tone="warn" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Kogi State Project Map" className="lg:col-span-2">
            <div className="aspect-[4/3] w-full rounded-xl bg-muted/40 border border-border relative overflow-hidden">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                {/* stylised state outline */}
                <defs>
                  <linearGradient id="bg-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.10" />
                  </linearGradient>
                </defs>
                <path d="M10,30 Q15,10 35,12 Q60,8 70,22 Q92,28 88,55 Q92,80 70,88 Q45,94 25,82 Q6,72 10,50 Z" fill="url(#bg-grad)" stroke="var(--border)" strokeWidth="0.4" />

                {/* heat overlay */}
                {heat && LGA_GEO.map((l) => (
                  <circle key={`h-${l.name}`} cx={l.x} cy={l.y} r="8" fill="var(--gold)" opacity="0.10" />
                ))}

                {/* LGA labels */}
                {LGA_GEO.map((l) => (
                  <g key={l.name}>
                    <circle cx={l.x} cy={l.y} r="0.6" fill="var(--muted-foreground)" />
                    <text x={l.x + 1.2} y={l.y + 0.6} fontSize="1.7" fill="var(--muted-foreground)">{l.name}</text>
                  </g>
                ))}

                {/* project pins */}
                {GEO_PROJECT_PINS.map((p) => {
                  const sel = p.id === pinId;
                  return (
                    <g key={p.id} className="cursor-pointer" onClick={() => setPinId(p.id)}>
                      <circle cx={p.x} cy={p.y} r={sel ? 2.4 : 1.6} fill={color(p.status)} stroke="white" strokeWidth="0.3" />
                      {sel && <circle cx={p.x} cy={p.y} r="3.5" fill="none" stroke={color(p.status)} strokeWidth="0.3" />}
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
              <Legend color="var(--success)" label="On-Track" />
              <Legend color="var(--warning)" label="At-Risk" />
              <Legend color="var(--destructive)" label="Delayed" />
              <Legend color="var(--gold)" label="Completed" />
              <Legend color="var(--info)" label="Planning" />
            </div>
          </Card>

          <Card title="Project Inspector" action={selected ? <Pill tone="info">{selected.lga}</Pill> : null}>
            {selected ? (
              <div className="space-y-3 text-[13px]">
                <div className="font-semibold leading-tight">{selected.name}</div>
                <div className="text-[11.5px] text-muted-foreground">{selected.ministry} · {selected.id}</div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div><div className="text-muted-foreground">Status</div><div className="font-semibold">{selected.status}</div></div>
                  <div><div className="text-muted-foreground">Progress</div><div className="font-semibold tabular-nums">{selected.progress}%</div></div>
                  <div><div className="text-muted-foreground">Budget</div><div className="font-semibold tabular-nums">₦{selected.budget.toFixed(1)}M</div></div>
                </div>
                <button className="w-full h-9 rounded-lg gold-gradient text-gold-foreground text-[12px] font-semibold">View project file</button>
              </div>
            ) : <div className="text-[13px] text-muted-foreground">Select a pin on the map.</div>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <div className="inline-flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full" style={{ background: color }} /> {label}</div>;
}
