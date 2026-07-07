import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layers, FolderKanban, Activity, Target, Search, MapPin, Building, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { programmesStore, ProgrammeRow } from '@/lib/programmesStore';
import { getSession, roleById } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/programmes/')({
  component: ProgrammesManagementPage,
});

function ProgrammesManagementPage() {
  const [session, setSession] = useState(getSession());
  useEffect(() => setSession(getSession()), []);
  const profile = session ? roleById(session.role) : null;
  const mdaFilter = session?.mda || profile?.ministry;

  const [programmes, setProgrammes] = useState<ProgrammeRow[]>([]);
  const [q, setQ] = useState('');
  const [pillarFilter, setPillarFilter] = useState('');

  useEffect(() => {
    setProgrammes(programmesStore.programmes);
    const handleUpdate = () => setProgrammes(programmesStore.programmes);
    window.addEventListener('programmesStoreUpdate', handleUpdate);
    return () => window.removeEventListener('programmesStoreUpdate', handleUpdate);
  }, []);

  const mdaFilteredProgrammes = useMemo(() => {
    return programmes.filter(prog => !mdaFilter || prog.mda.toLowerCase() === mdaFilter.toLowerCase());
  }, [programmes, mdaFilter]);

  const filteredProgrammes = useMemo(() => {
    return mdaFilteredProgrammes.filter(prog => 
      (pillarFilter === '' || prog.pillar === pillarFilter) &&
      (q === '' || prog.name.toLowerCase().includes(q.toLowerCase()) || prog.mda.toLowerCase().includes(q.toLowerCase()))
    );
  }, [mdaFilteredProgrammes, pillarFilter, q]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `₦${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `₦${(amount / 1e6).toFixed(1)}M`;
    return `₦${amount}`;
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full text-[11px] uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold mb-4 border border-purple-500/20">
             <Layers className="size-3.5" /> Programme Hierarchy
           </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Programmes Management</h1>
          <p className="text-muted-foreground">
            A programme is a strategic collection of projects. Manage overarching state programmes here.
          </p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border shadow-sm rounded-xl p-6 flex flex-col justify-center">
           <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Total Programmes</div>
           <div className="font-black text-3xl tracking-tight text-foreground">{mdaFilteredProgrammes.length}</div>
        </div>
        <div className="bg-card border border-border shadow-sm rounded-xl p-6 flex flex-col justify-center">
           <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Active Projects Linked</div>
           <div className="font-black text-3xl tracking-tight text-foreground">{mdaFilteredProgrammes.reduce((acc, p) => acc + p.projects.length, 0)}</div>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 shadow-sm rounded-xl p-6 flex flex-col justify-center">
           <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Programmes On Track</div>
           <div className="font-black text-3xl tracking-tight text-emerald-600 dark:text-emerald-400">{mdaFilteredProgrammes.filter(p => p.progress >= 50 && p.status === 'Active').length}</div>
        </div>
        <div className="bg-rose-500/5 border border-rose-500/20 shadow-sm rounded-xl p-6 flex flex-col justify-center">
           <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">Delayed Programmes</div>
           <div className="font-black text-3xl tracking-tight text-rose-600 dark:text-rose-400">{mdaFilteredProgrammes.filter(p => p.progress < 50 && p.status === 'Active').length}</div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search programmes..." 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select 
          value={pillarFilter}
          onChange={(e) => setPillarFilter(e.target.value)}
          className="bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Pillars</option>
          <option value="Fostering Prosperity">Fostering Prosperity</option>
          <option value="Building Resilience">Building Resilience</option>
          <option value="Providing Direction">Providing Direction</option>
        </select>
      </div>

      <div className="space-y-6">
         {filteredProgrammes.length === 0 && (
            <div className="text-center p-12 border border-dashed rounded-lg text-muted-foreground bg-muted/5">
              No programmes match your search.
            </div>
         )}
         {filteredProgrammes.map((prog) => (
            <Card key={prog.id} className="border-border/60 shadow-sm overflow-hidden">
               <div className="flex flex-col lg:flex-row">
                  {/* Left: Programme Details */}
                  <div className="lg:w-1/3 bg-muted/10 p-6 border-b lg:border-b-0 lg:border-r border-border/50">
                     <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{prog.id}</span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded ${
                          prog.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' :
                          prog.status === 'Suspended' ? 'bg-rose-500/10 text-rose-600' :
                          prog.status === 'Archived' ? 'bg-muted text-muted-foreground' :
                          'bg-amber-500/10 text-amber-600'
                        }`}>{prog.status}</span>
                     </div>
                     <h2 className="text-xl font-bold mb-4 leading-tight">{prog.name}</h2>
                     <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                           <span className="text-muted-foreground flex items-center gap-1.5"><Target className="size-3.5"/> Pillar</span>
                           <span className="font-medium text-right">{prog.pillar}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-muted-foreground flex items-center gap-1.5"><Building className="size-3.5"/> Executing MDA</span>
                           <span className="font-medium text-right">{prog.mda}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-muted-foreground flex items-center gap-1.5"><Activity className="size-3.5"/> Total Budget</span>
                           <span className="font-mono font-bold text-primary">{formatCurrency(prog.budget)}</span>
                        </div>
                     </div>
                     <div className="mt-6 pt-6 border-t border-border/50">
                        <div className="flex justify-between text-[11px] font-bold mb-2">
                           <span className="uppercase tracking-wider text-muted-foreground">Programme Progress</span>
                           <span>{prog.progress}%</span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                           <div className={`h-full ${prog.progress >= 50 ? 'bg-emerald-500' : 'bg-primary'}`} style={{width: `${prog.progress}%`}} />
                        </div>
                     </div>
                  </div>

                  {/* Right: Constituent Projects */}
                  <div className="lg:w-2/3 p-6 bg-background">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                           <FolderKanban className="size-4" /> Constituent Projects ({prog.projects.length})
                        </h3>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prog.projects.length === 0 && (
                          <div className="col-span-2 text-sm text-muted-foreground py-4 px-2 italic">
                            No projects linked to this programme yet.
                          </div>
                        )}
                        {prog.projects.map((proj) => (
                           <div key={proj.id} className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors bg-muted/5 group cursor-pointer">
                              <h4 className="font-bold text-[13px] mb-3 group-hover:text-primary transition-colors line-clamp-1">{proj.name}</h4>
                              <div className="flex justify-between items-center text-[11px] mb-2 font-bold">
                                 <span className={
                                    proj.status === 'Active' ? 'text-emerald-600' :
                                    proj.status === 'Delayed' ? 'text-rose-600' :
                                    'text-amber-600'
                                 }>{proj.status}</span>
                                 <span>{proj.progress}%</span>
                              </div>
                              <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                                 <div className={`h-full ${
                                    proj.status === 'Active' ? 'bg-emerald-500' :
                                    proj.status === 'Delayed' ? 'bg-rose-500' :
                                    'bg-amber-500'
                                 }`} style={{width: `${proj.progress}%`}} />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </Card>
         ))}
      </div>
    </div>
  );
}
