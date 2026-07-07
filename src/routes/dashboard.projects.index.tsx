import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Stat } from "@/components/ui-bits";
import { useMemo, useState, useEffect } from "react";
import { Filter, Search, MapPin, Wallet, AlertTriangle, CheckCircle2, ShieldCheck, ShieldAlert, FolderKanban } from "lucide-react";
import { projectsStore, Category, ProjectRow, MajorProject } from "@/lib/projectsStore";
import { getSession, roleById } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/projects/")({ component: Projects });

function Projects() {
  const [session, setSession] = useState(getSession());
  useEffect(() => setSession(getSession()), []);
  const profile = session ? roleById(session.role) : null;
  const mdaFilter = session?.mda || profile?.ministry;

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  
  const [pageTitle, setPageTitle] = useState("");
  const [pageSubtitle, setPageSubtitle] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);

  useEffect(() => {
    setPageTitle(projectsStore.pageTitle);
    setPageSubtitle(projectsStore.pageSubtitle);
    setCategories(projectsStore.categories);
    setProjects(projectsStore.projects);

    const handleUpdate = () => {
      setPageTitle(projectsStore.pageTitle);
      setPageSubtitle(projectsStore.pageSubtitle);
      setCategories(projectsStore.categories);
      setProjects(projectsStore.projects);
    };
    window.addEventListener('projectsStoreUpdate', handleUpdate);
    return () => window.removeEventListener('projectsStoreUpdate', handleUpdate);
  }, []);

  const mdaFilteredProjects = useMemo(() => {
    return projects.filter(p => !mdaFilter || p.ministry.toLowerCase() === mdaFilter.toLowerCase());
  }, [projects, mdaFilter]);

  const filtered = useMemo(() => mdaFilteredProjects.filter(p =>
    (statusFilter === "All" || p.status === statusFilter) &&
    (q === "" || (p.name + p.ministry + p.lga).toLowerCase().includes(q.toLowerCase()))
  ), [q, statusFilter, mdaFilteredProjects]);

  const verificationFor = (id: string): { label: string; tone: "good" | "warn" | "bad" | "info"; icon: typeof ShieldCheck } => {
    const h = id.charCodeAt(id.length - 1) % 4;
    if (h === 0) return { label: "Verified", tone: "good", icon: ShieldCheck };
    if (h === 1) return { label: "Pending", tone: "warn", icon: ShieldAlert };
    if (h === 2) return { label: "Under Review", tone: "info", icon: ShieldAlert };
    return { label: "Rejected", tone: "bad", icon: ShieldAlert };
  };

  return (
    <div>
      {/* Header Area */}
      <div className="bg-card border-b border-border px-4 sm:px-6 md:px-8 py-5 md:py-6 relative group">
        <div className="max-w-[1200px]">
           <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Delivery</div>
           <h1 className="text-2xl font-bold text-foreground mb-1">{pageTitle}</h1>
           <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">{pageSubtitle}</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-5 md:py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Stat label="Verified" value={`${Math.round(mdaFilteredProjects.length * 0.45)}`} sub="Photos, GPS & cert" tone="good" icon={<ShieldCheck className="size-4 shrink-0" />} />
          <Stat label="On Track" value={`${mdaFilteredProjects.filter(p=>p.status==="On-Track").length}`} tone="good" icon={<CheckCircle2 className="size-4" />} />
          <Stat label="At Risk / Delayed" value={`${mdaFilteredProjects.filter(p=>p.status==="At-Risk"||p.status==="Delayed").length}`} tone="warn" icon={<AlertTriangle className="size-4" />} />
          <Stat label="Total Outlay" value={`₦${(mdaFilteredProjects.reduce((s,p)=>s+p.budget,0)/1000).toFixed(1)}B`} tone="gold" icon={<Wallet className="size-4" />} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Card key={cat.id} className="border-border/60 shadow-sm flex flex-col hover:border-primary/30 transition-colors group/cat relative">
              <div className="p-4 border-b border-border/50 bg-muted/10 flex items-center gap-3">
                <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FolderKanban className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm uppercase tracking-wide text-foreground">{cat.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{cat.projects.length} Major Projects</div>
                </div>
              </div>
              <div className="p-0 flex-1 relative">
                <ul className="divide-y divide-border/50 text-[12.5px]">
                  {cat.projects.map((p) => (
                    <li key={p.id} className="p-4 flex justify-between items-center hover:bg-muted/5 group/proj relative">
                      <span className="font-medium truncate pr-2" title={p.name}>{p.name}</span>
                      <span className="font-bold text-primary tabular-nums shrink-0">₦{(p.amount / 1000000).toFixed(0)}M</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="h-9 px-3 rounded-lg bg-muted/60 border border-border flex items-center gap-2 flex-1 w-full min-w-0 sm:min-w-[200px]">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by name, ministry, LGA…" className="bg-transparent outline-none text-[13px] flex-1 min-w-0" />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-0 whitespace-nowrap">
              {(["All","On-Track","At-Risk","Delayed","Completed","Planning"] as const).map(s => (
                <button key={s} onClick={()=>setStatusFilter(s)} className={`h-8 sm:h-9 px-3 rounded-lg text-[11px] sm:text-[12px] border transition-colors shrink-0 ${statusFilter===s ? "gold-gradient text-gold-foreground border-transparent font-semibold" : "border-border bg-card hover:bg-accent"}`}>{s}</button>
              ))}
            </div>
            <button className="h-8 sm:h-9 px-3 rounded-lg border border-border bg-card text-[11px] sm:text-[12px] inline-flex items-center gap-1.5 shrink-0 self-end sm:self-auto"><Filter className="size-3.5" /> More filters</button>
          </div>
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-[12.5px] min-w-[1000px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                  {["ID","Project","Ministry","LGA","Budget (₦M)","Progress","Risk","Status","Verification"].map(h=>(<th key={h} className="px-4 py-2 font-medium">{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const v = verificationFor(p.id);
                  const VIcon = v.icon;
                  
                  return (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/40 group/row">
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{p.id}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.ministry}</td>
                    <td className="px-4 py-3 text-muted-foreground inline-flex items-center gap-1"><MapPin className="size-3" />{p.lga}</td>
                    <td className="px-4 py-3 tabular-nums">{p.budget.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden w-16">
                          <div className="h-full bg-primary" style={{width: `${p.progress}%`}} />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${p.risk === "HIGH" ? "bg-red-500/10 text-red-600" : p.risk === "MEDIUM" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>{p.risk}</span>
                    </td>
                    <td className="px-4 py-3">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${p.status === "On-Track" ? "bg-emerald-500/10 text-emerald-600" : p.status === "Delayed" ? "bg-red-500/10 text-red-600" : p.status === "At-Risk" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3">
                       <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${v.tone === "good" ? "text-emerald-600" : v.tone === "warn" ? "text-amber-600" : v.tone === "bad" ? "text-red-600" : "text-blue-600"}`}>
                         <VIcon className="size-3.5" /> {v.label}
                       </span>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}