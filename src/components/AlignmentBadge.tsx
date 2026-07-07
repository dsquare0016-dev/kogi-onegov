import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useSettingsStore } from "@/lib/settingsStore";

interface AlignmentBadgeProps {
  pillarId?: string;
  objectiveId?: string;
}

export function AlignmentBadge({ pillarId, objectiveId }: AlignmentBadgeProps) {
  const isAligned = Boolean(pillarId && objectiveId);
  const { governanceAlignmentLevel } = useSettingsStore();

  if (isAligned) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold tracking-wider uppercase">
        <ShieldCheck className="size-3" /> Aligned
      </div>
    );
  }

  let badgeClass = "bg-rose-500/10 text-rose-600 border border-rose-500/20";
  let label = "Not Aligned";

  if (governanceAlignmentLevel === 3) {
    badgeClass = "bg-rose-600 text-white border-rose-700 shadow-sm animate-pulse";
    label = "Non-Compliant";
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${badgeClass}`}>
      <AlertTriangle className="size-3" /> {label}
    </div>
  );
}
