import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="px-4 md:px-8 pt-4 md:pt-8 pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        {eyebrow && <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1">{eyebrow}</div>}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 flex-wrap shrink-0">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, sub, tone = "default", icon, status, onClick }: { label: string; value: string | ReactNode; sub?: string; tone?: "default" | "good" | "warn" | "bad" | "gold"; icon?: ReactNode; status?: string; onClick?: () => void }) {
  const toneCls =
    tone === "good" ? "text-[color:var(--success)]"
    : tone === "warn" ? "text-[color:var(--warning)]"
    : tone === "bad" ? "text-[color:var(--destructive)]"
    : tone === "gold" ? "text-[color:var(--gold)]"
    : "text-foreground";
  return (
    <div 
      onClick={onClick}
      className={`rounded-xl border border-border bg-card p-4 flex flex-col gap-1.5 relative overflow-hidden ${onClick ? 'cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all' : ''}`}
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className={`font-display text-2xl font-bold ${toneCls}`}>{value}</div>
      <div className="flex items-center justify-between">
        {sub ? <div className="text-[11px] text-muted-foreground">{sub}</div> : <div />}
        {status === 'mock' && <span className="text-[9px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Mock Data</span>}
        {status === 'not_connected' && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Not Connected</span>}
      </div>
    </div>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-border bg-card ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between px-4 py-3 border-b border-border">
          {title && <h3 className="text-[13px] font-semibold tracking-tight">{title}</h3>}
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Pill({ tone = "default", children }: { tone?: "default" | "good" | "warn" | "bad" | "info" | "gold"; children: ReactNode }) {
  const map: Record<string, string> = {
    default: "bg-muted text-foreground",
    good: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    warn: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
    bad: "bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]",
    info: "bg-[color:var(--info)]/15 text-[color:var(--info)]",
    gold: "bg-[color:var(--gold)]/15 text-[color:var(--gold)]",
  };
  return <span className={`inline-flex items-center px-2 h-5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${map[tone]}`}>{children}</span>;
}

export function Bar({ value, tone = "gold" }: { value: number; tone?: "gold" | "good" | "warn" | "bad" | "info" }) {
  const cls: Record<string, string> = {
    gold: "gold-gradient",
    good: "bg-[color:var(--success)]",
    warn: "bg-[color:var(--warning)]",
    bad: "bg-[color:var(--destructive)]",
    info: "bg-[color:var(--info)]",
  };
  return (
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <div className={`h-full ${cls[tone]} rounded-full transition-all`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}