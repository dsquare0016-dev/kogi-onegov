import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, AlertOctagon, CheckCircle2, Clock, BarChart, Flag, X } from 'lucide-react';
import { getSession, roleById } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/activities/monitor')({
  component: MonitorActivityPage,
});

const MOCK_ACTIVITIES = [
  {
    id: "ACT-001",
    name: "Statewide Malaria Eradication Campaign",
    mda: "Ministry of Health",
    coordinator: "Dr. S. Ibrahim",
    completedTasks: 14,
    totalTasks: 20,
    status: "On Track",
    blocker: null
  },
  {
    id: "ACT-002",
    name: "Okene Water Reticulation Upgrade",
    mda: "Ministry of Water Resources",
    coordinator: "Engr. M. Bappa",
    completedTasks: 2,
    totalTasks: 8,
    status: "Behind Schedule",
    blocker: null
  },
  {
    id: "ACT-003",
    name: "Digital Economy Hub Construction",
    mda: "Ministry of Science & Tech",
    coordinator: "P. Adamu",
    completedTasks: 0,
    totalTasks: 5,
    status: "Blocked",
    blocker: "Funding Delay from Finance"
  },
  {
    id: "ACT-004",
    name: "Lokoja Road Rehabilitation Phase 1",
    mda: "Ministry of Works",
    coordinator: "Engr. T. Abubakar",
    completedTasks: 18,
    totalTasks: 20,
    status: "On Track",
    blocker: null
  }
];

function MonitorActivityPage() {
  const session = getSession();
  const profile = session ? roleById(session.role) : null;
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [filterType, setFilterType] = useState("All Activities");

  const visibleActivities = useMemo(() => {
    if (!profile) return [];
    let filtered = MOCK_ACTIVITIES;
    
    // Filter by role permissions
    if (!['executive', 'command'].includes(profile.scope)) {
      filtered = filtered.filter(act => 
        act.mda.includes(profile.mda || "") || 
        (profile.motherMinistry && act.mda.includes(profile.motherMinistry))
      );
    }
    
    // Filter by type (mock logic for dropdown)
    if (filterType !== "All Activities") {
      filtered = filtered.filter(act => act.mda.includes(filterType) || act.name.includes(filterType));
    }
    
    return filtered;
  }, [profile, filterType]);

  const activeCount = visibleActivities.length;
  const behindCount = visibleActivities.filter(a => a.status === 'Behind Schedule').length;
  const blockedCount = visibleActivities.filter(a => a.status === 'Blocked').length;
  const completedCount = 12; // Mock static completed YTD for demo

  return (
    <div className="p-6 max-w-[1400px] mx-auto pb-24 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitor Activities</h1>
        <p className="text-muted-foreground mt-1">
          Real-time tracking of activities, sub-task aggregation, and blocker resolution.
          {['executive', 'command'].includes(profile?.scope || "") 
            ? " (State-wide Oversight)" 
            : ` (${profile?.mda || profile?.ministry} Oversight)`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
             <div className="flex items-center gap-2 text-primary mb-2">
               <Activity className="size-5" />
               <span className="font-bold text-sm uppercase tracking-wider">Active Programs</span>
             </div>
             <div className="text-4xl font-black">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
             <div className="flex items-center gap-2 text-amber-600 mb-2">
               <Clock className="size-5" />
               <span className="font-bold text-sm uppercase tracking-wider">Behind Schedule</span>
             </div>
             <div className="text-4xl font-black">{behindCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm bg-red-500/5 border-red-500/20">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
             <div className="flex items-center gap-2 text-red-600 mb-2">
               <AlertOctagon className="size-5" />
               <span className="font-bold text-sm uppercase tracking-wider">Blocked</span>
             </div>
             <div className="text-4xl font-black text-red-700 dark:text-red-400">{blockedCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
             <div className="flex items-center gap-2 text-emerald-600 mb-2">
               <CheckCircle2 className="size-5" />
               <span className="font-bold text-sm uppercase tracking-wider">Completed YTD</span>
             </div>
             <div className="text-4xl font-black">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Monitoring Board */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="size-5 text-primary" /> Activity Tracker
            </CardTitle>
            <CardDescription>Aggregated progress based on underlying task completions within MDAs.</CardDescription>
          </div>
          <select 
            className="p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary w-48"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
             <option>All Activities</option>
             <option>Health</option>
             <option>Water</option>
             <option>Tech</option>
             <option>Works</option>
          </select>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold w-1/3">Activity Name & Lead MDA</th>
                  <th className="px-6 py-4 font-semibold">Sub-Tasks</th>
                  <th className="px-6 py-4 font-semibold w-1/4">Overall Progress</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {visibleActivities.length > 0 ? visibleActivities.map(act => {
                  const progress = Math.round((act.completedTasks / act.totalTasks) * 100) || 0;
                  const isBlocked = act.status === 'Blocked';
                  const isBehind = act.status === 'Behind Schedule';
                  
                  return (
                    <tr 
                      key={act.id} 
                      onClick={() => setSelectedActivity(act)}
                      className={`cursor-pointer transition-colors ${
                        isBlocked ? 'hover:bg-red-500/10 bg-red-500/5' : 
                        isBehind ? 'hover:bg-amber-500/10 bg-amber-500/5' : 
                        'hover:bg-muted/10'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className={`font-bold text-base mb-1 ${isBlocked ? 'text-red-700 dark:text-red-400' : ''}`}>
                          {act.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="font-semibold text-primary">{act.mda}</span> • Coordinator: {act.coordinator}
                        </div>
                        {isBlocked && act.blocker && (
                          <div className="text-[10px] font-bold text-red-600 bg-red-500/10 inline-flex items-center gap-1 px-2 py-0.5 rounded mt-2">
                            <Flag className="size-3" /> Blocker: {act.blocker}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                         <div className={`text-xs font-semibold ${isBlocked ? 'text-red-600/80' : ''}`}>
                           {act.completedTasks} / {act.totalTasks} Tasks Completed
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className="w-full bg-muted rounded-full h-2">
                             <div 
                               className={`h-2 rounded-full ${isBlocked ? 'bg-red-500' : isBehind ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                               style={{ width: `${progress}%` }}
                             ></div>
                           </div>
                           <span className={`font-bold text-xs ${isBlocked ? 'text-red-600/80' : ''}`}>
                             {progress}%
                           </span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                           isBlocked ? 'bg-red-500 text-white' : 
                           isBehind ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 
                           'bg-emerald-500/10 text-emerald-600'
                         }`}>
                           {act.status}
                         </span>
                         {isBlocked && ['executive', 'command'].includes(profile?.scope || "") && (
                           <button className="block mt-2 ml-auto text-[10px] font-bold text-red-600 hover:underline">Escalate to Gov</button>
                         )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No activities match your current oversight permissions.
                    </td>
                  </tr>
                )}
              </tbody>
           </table>
        </CardContent>
      </Card>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center p-6 border-b border-border/50">
               <div>
                 <h3 className="text-xl font-bold">{selectedActivity.name}</h3>
                 <p className="text-sm text-muted-foreground">{selectedActivity.id} • {selectedActivity.mda}</p>
               </div>
               <button onClick={() => setSelectedActivity(null)} className="p-2 hover:bg-muted/50 rounded-full transition-colors">
                 <X className="size-5" />
               </button>
             </div>
             
             <div className="p-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-muted/30 rounded-lg">
                   <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Coordinator</div>
                   <div className="font-bold">{selectedActivity.coordinator}</div>
                 </div>
                 <div className="p-4 bg-muted/30 rounded-lg">
                   <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Status</div>
                   <div className={`font-bold ${
                     selectedActivity.status === 'Blocked' ? 'text-red-500' :
                     selectedActivity.status === 'Behind Schedule' ? 'text-amber-500' : 'text-emerald-500'
                   }`}>{selectedActivity.status}</div>
                 </div>
               </div>

               {selectedActivity.blocker && (
                 <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-700 dark:text-red-400">
                   <AlertOctagon className="size-5 shrink-0 mt-0.5" />
                   <div>
                     <div className="font-bold text-sm mb-1">Active Blocker</div>
                     <div className="text-sm">{selectedActivity.blocker}</div>
                   </div>
                 </div>
               )}

               <div className="space-y-2">
                 <div className="flex justify-between items-center text-sm font-semibold">
                   <span>Overall Progress</span>
                   <span>{Math.round((selectedActivity.completedTasks / selectedActivity.totalTasks) * 100)}%</span>
                 </div>
                 <div className="w-full bg-muted rounded-full h-3">
                   <div 
                     className={`h-3 rounded-full ${
                       selectedActivity.status === 'Blocked' ? 'bg-red-500' :
                       selectedActivity.status === 'Behind Schedule' ? 'bg-amber-500' : 'bg-emerald-500'
                     }`} 
                     style={{ width: `${Math.round((selectedActivity.completedTasks / selectedActivity.totalTasks) * 100)}%` }}
                   ></div>
                 </div>
                 <div className="text-xs text-muted-foreground text-right mt-1">
                   {selectedActivity.completedTasks} out of {selectedActivity.totalTasks} sub-tasks completed
                 </div>
               </div>
             </div>

             <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
               <button 
                 onClick={() => setSelectedActivity(null)}
                 className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
               >
                 Close Details
               </button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
