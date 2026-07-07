import { dbGetPillarsAndObjectives, dbGetOrganizationAlignments } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/dashboard/dev-plan/mdas-mapping')({
  component: DevPlanMdasMappingPage,
});

function DevPlanMdasMappingPage() {
  const [pillars, setPillars] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [alignments, setAlignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        
        const [poData, alignData] = await Promise.all([
          dbGetPillarsAndObjectives(),
          dbGetOrganizationAlignments()
        ]);
        setPillars(poData.pillars);
        setObjectives(poData.objectives);
        setAlignments(alignData);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading Mappings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MDAs Mapping</h1>
          <p className="text-muted-foreground mt-1">
            Map specific Ministries, Departments, and Agencies (MDAs) to the Strategic Pillars defined for the 32-Year Development Plan.
            <br/>
            <span className="text-sm italic">Note: Mappings are managed from the Government Setup page.</span>
          </p>
        </div>
      </div>

      <div className="space-y-6">
         {pillars.length === 0 ? (
           <div className="p-12 text-center text-muted-foreground bg-muted/20 border border-dashed border-border rounded-xl">
             <p>You must define Strategic Pillars before mapping MDAs.</p>
           </div>
         ) : (
           pillars.map((pillar) => {
             // Find objectives for this pillar
             const pillarObjs = objectives.filter(o => o.pillar_id === pillar.id);
             // Find alignments that belong to these objectives
             const objIds = new Set(pillarObjs.map(o => o.id));
             const pillarAlignments = alignments.filter(a => objIds.has(a.strategic_objective_id));

             return (
               <Card key={pillar.id} className="border-border/60 shadow-sm overflow-hidden">
                 <div className="bg-muted/40 p-4 border-b border-border/50">
                   <h3 className="font-bold text-lg text-primary">{pillar.name}</h3>
                 </div>
                 <CardContent className="p-0">
                   {pillarAlignments.length === 0 ? (
                     <div className="p-6 text-sm text-muted-foreground italic text-center">
                       No MDAs mapped to this pillar yet.
                     </div>
                   ) : (
                     <ul className="divide-y divide-border/30">
                       {pillarAlignments.map(align => (
                         <li key={`${align.organization_id}-${align.strategic_objective_id}`} className="p-4 flex justify-between items-center transition-colors hover:bg-muted/10">
                           <div className="flex items-center gap-3">
                             <Target className="size-4 text-muted-foreground" />
                             <div>
                               <div className="font-medium text-primary">{align.organization_name}</div>
                               <div className="text-xs text-muted-foreground mt-0.5">
                                 Aligned Objective: <span className="text-foreground font-semibold">{align.objective_code} - {align.objective_title}</span>
                               </div>
                             </div>
                           </div>
                         </li>
                       ))}
                     </ul>
                   )}
                 </CardContent>
               </Card>
             );
           })
         )}
      </div>
    </div>
  );
}
