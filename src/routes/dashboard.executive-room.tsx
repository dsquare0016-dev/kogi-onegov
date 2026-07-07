import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, AlertTriangle, PhoneCall, TrendingDown, Clock, MapPin, Search, AlertOctagon, BrainCircuit } from 'lucide-react';
import { PROJECTS } from '@/lib/mock-data';

export const Route = createFileRoute('/dashboard/executive-room')({
  component: WarRoomPage,
});

function WarRoomPage() {
  const location = useLocation();
  if (location.pathname !== '/dashboard/executive-room') {
    return <Outlet />;
  }
  
  const escalations = [
    { id: "ESC-001", project: "Reference Hospital Upgrade", location: "Okene", mda: "Ministry of Health", delay: "24 Days", riskAmount: "₦1.2B", status: "Critical", recommendedAction: "Summon Commissioner for Health & Lead Contractor" },
    { id: "ESC-002", project: "Lokoja-Okene Dualization", location: "Lokoja", mda: "Ministry of Works", delay: "18 Days", riskAmount: "₦850M", status: "High Risk", recommendedAction: "Deploy DG GDU for site inspection" },
    { id: "ESC-003", project: "Omi Dam Irrigation", location: "Yagba West", mda: "Ministry of Agriculture", delay: "42 Days", riskAmount: "₦2.1B", status: "Critical", recommendedAction: "Halt further funding pending audit" },
    { id: "ESC-004", project: "Confluence Hub Setup", location: "Lokoja Central", mda: "Ministry of Innovation", delay: "12 Days", riskAmount: "₦320M", status: "Warning", recommendedAction: "Request accelerated procurement plan" },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 pb-24">
      {/* Security Banner */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex justify-between items-center text-destructive shadow-sm animate-pulse">
         <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
            <ShieldAlert className="size-4" /> Executive Room — Level 1 Access Only
         </div>
         <div className="font-mono text-xs font-bold">LIVE ESCALATIONS NETWORK</div>
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
           <AlertOctagon className="size-8 text-rose-500" /> Executive Room
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Real-time tracking of delayed projects, financial risk exposure, and immediate escalations requiring Governor intervention.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Generative AI Briefing */}
        <Card className="md:col-span-1 border-rose-500/30 shadow-xl bg-rose-500/5 relative overflow-hidden flex flex-col">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <BrainCircuit className="size-48 text-rose-500" />
           </div>
           <CardHeader className="border-b border-rose-500/20 bg-background/50 backdrop-blur-sm relative z-10 pb-4">
              <CardTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2 text-base">
                 <BrainCircuit className="size-5" /> Executive AI Briefing
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 relative z-10 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                 <div className="text-2xl font-black tracking-tight leading-tight text-foreground">
                    "3 projects are severely delayed in Lokoja. ₦2.1B total state funds are at risk of non-utilization."
                 </div>
                 
                 <div className="bg-background p-4 rounded-xl border border-rose-500/20 shadow-sm space-y-3">
                    <div className="flex items-start gap-3">
                       <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                       <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Primary Bottleneck</div>
                          <p className="text-sm font-medium leading-relaxed">Procurement delays at the Ministry of Works are cascading into site mobilization failures.</p>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-rose-500/20">
                 <button className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black tracking-widest uppercase shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-3">
                    <PhoneCall className="size-5" /> Call Commissioner for Works
                 </button>
              </div>
           </CardContent>
        </Card>

        {/* Immediate Escalations Table */}
        <Card className="md:col-span-2 border-border/60 shadow-sm flex flex-col">
           <CardHeader className="border-b border-border/50 flex flex-row justify-between items-center bg-muted/20 pb-4">
              <div>
                 <CardTitle className="text-lg">Immediate Escalations</CardTitle>
                 <CardDescription>Projects crossing the 14-day delay threshold.</CardDescription>
              </div>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                 <input 
                   type="text" 
                   placeholder="Filter escalations..." 
                   className="pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-sm w-64"
                 />
              </div>
           </CardHeader>
           <CardContent className="p-0 flex-1">
              <div className="overflow-x-auto h-full">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-muted/30 border-b border-border/50 uppercase text-[10px] text-muted-foreground tracking-wider">
                     <tr>
                       <th className="px-6 py-4 font-semibold">Delayed Project</th>
                       <th className="px-6 py-4 font-semibold">Location / MDA</th>
                       <th className="px-6 py-4 font-semibold text-center">Delay Span</th>
                       <th className="px-6 py-4 font-semibold text-right">Risk Exposure</th>
                       <th className="px-6 py-4 font-semibold">Action Required</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border/30">
                     {escalations.map((esc, i) => (
                       <tr key={i} className="hover:bg-rose-500/5 transition-colors group">
                         <td className="px-6 py-4">
                            <div className="font-bold text-foreground line-clamp-1">{esc.project}</div>
                            <div className="text-[10px] font-mono text-muted-foreground mt-1">{esc.id}</div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                               <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3"/> {esc.location}</span>
                               <span className="text-xs font-medium">{esc.mda}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
                               <Clock className="size-3" /> {esc.delay}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="font-black font-mono text-lg text-rose-600 dark:text-rose-400 flex items-center justify-end gap-1">
                               <TrendingDown className="size-4" /> {esc.riskAmount}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <button className="text-[11px] font-bold uppercase tracking-wider bg-muted text-foreground hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded transition-colors w-full text-left line-clamp-2">
                               {esc.recommendedAction}
                            </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
           </CardContent>
        </Card>

      </div>
    </div>
  );
}
