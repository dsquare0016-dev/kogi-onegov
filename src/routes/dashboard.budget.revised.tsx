import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, FileText, SplitSquareVertical, ArrowDownRight, ArrowUpRight, History, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MINISTRIES } from '@/lib/mock-data';

export const Route = createFileRoute('/dashboard/budget/revised')({
  component: RevisedBudgetPage,
});

const REVISIONS = [
  { mda: 'Ministry of Works', original: 15000, revised: 12000, reason: 'Funds diverted to emergency flood relief.', approvedBy: 'Gov. Executive Council', date: 'Oct 15, 2026', status: 'Approved' },
  { mda: 'Ministry of Environment', original: 2500, revised: 5500, reason: 'Emergency flood relief allocation.', approvedBy: 'State Assembly', date: 'Oct 18, 2026', status: 'Approved' },
  { mda: 'Ministry of Health', original: 8500, revised: 9000, reason: 'Medical supplies inflation adjustment.', approvedBy: 'Pending EXCO', date: 'Nov 02, 2026', status: 'Pending Review' },
];

function RevisedBudgetPage() {
  return (
    <div className="p-6 max-w-[1500px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revised Budget & Adjustments</h1>
          <p className="text-muted-foreground mt-1">
            Manage budget adjustments, virement requests, and audit revision history.
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">
          Submit Revision Request
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* 1. Dashboard Exec Cards */}
         <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Original Appropriation</div>
                       <div className="text-3xl font-bold text-foreground font-mono">₦250,000M</div>
                    </div>
                    <FileText className="size-8 text-muted-foreground/30" />
                 </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-sm bg-primary/5">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Revised Appropriation</div>
                       <div className="text-3xl font-bold text-foreground font-mono">₦252,500M</div>
                       <div className="text-xs text-amber-600 mt-2 flex items-center gap-1 font-bold"><ArrowUpRight className="size-3"/> ₦2.5B Net Increase</div>
                    </div>
                    <SplitSquareVertical className="size-8 text-primary/30" />
                 </div>
              </CardContent>
            </Card>
         </div>

         {/* 2. AI Analysis Impact */}
         <Card className="col-span-1 border-indigo-500/30 shadow-sm bg-indigo-500/5">
            <CardContent className="p-6">
               <h3 className="font-bold text-sm uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2"><BrainCircuit className="size-4"/> AI Impact Analysis</h3>
               <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                 The proposed ₦500M adjustment to the Ministry of Health will increase the overall State fiscal deficit by 0.2%. However, this prevents a critical stock-out of essential medicines across 12 general hospitals.
               </p>
               <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 p-2 rounded flex items-center gap-2">
                 <CheckCircle2 className="size-4" /> AI Recommendation: Approve
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 3. Workflow & Audit Trail */}
        <div className="col-span-1 space-y-6">
           <Card className="border-border/60 shadow-sm">
             <CardHeader className="border-b border-border/50 pb-4">
               <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4 text-emerald-500"/> Approval Workflow</CardTitle>
             </CardHeader>
             <CardContent className="p-4 space-y-4">
                <div className="flex flex-col gap-1">
                   <div className="text-sm font-bold text-emerald-600 flex items-center gap-2"><CheckCircle2 className="size-3"/> Revision Request</div>
                   <div className="text-[10px] text-muted-foreground ml-5">MDA Budget Officer</div>
                </div>
                <div className="flex flex-col gap-1">
                   <div className="text-sm font-bold text-emerald-600 flex items-center gap-2"><CheckCircle2 className="size-3"/> Technical Review</div>
                   <div className="text-[10px] text-muted-foreground ml-5">General Budget Office</div>
                </div>
                <div className="flex flex-col gap-1">
                   <div className="text-sm font-bold text-primary flex items-center gap-2"><div className="size-2 rounded-full bg-primary ml-0.5 mr-0.5"/> Executive Approval</div>
                   <div className="text-[10px] text-muted-foreground ml-5">Governor's Office / EXCO</div>
                </div>
                <div className="flex flex-col gap-1 opacity-50">
                   <div className="text-sm font-bold flex items-center gap-2"><div className="size-2 rounded-full border border-current ml-0.5 mr-0.5"/> Legislative Approval</div>
                   <div className="text-[10px] ml-5">State House of Assembly</div>
                </div>
             </CardContent>
           </Card>
           
           <Card className="border-border/60 shadow-sm">
             <CardHeader className="border-b border-border/50 pb-4">
               <CardTitle className="flex items-center gap-2 text-base"><History className="size-4 text-muted-foreground"/> Audit Trail</CardTitle>
             </CardHeader>
             <CardContent className="p-4 space-y-4">
                <div className="text-xs">
                   <div className="font-bold mb-1">Oct 18, 14:30 - System</div>
                   <div className="text-muted-foreground">Revision VRM-26-11 committed to master ledger.</div>
                </div>
                <div className="text-xs">
                   <div className="font-bold mb-1">Oct 17, 09:15 - Hon. Speaker</div>
                   <div className="text-emerald-500">Legislative approval granted via Resolution 45.</div>
                </div>
                <div className="text-xs">
                   <div className="font-bold mb-1">Oct 15, 16:45 - Gov. Office</div>
                   <div className="text-primary">Executive Council approved draft adjustment.</div>
                </div>
             </CardContent>
           </Card>
        </div>

        {/* 4. Revision History Table */}
        <Card className="col-span-3 border-border/60 shadow-sm h-fit">
          <CardHeader className="border-b border-border/50">
            <CardTitle>Revision History Ledger</CardTitle>
            <CardDescription>Comprehensive list of all budget alterations.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-muted/30 border-b border-border/50 uppercase text-[10px] text-muted-foreground tracking-wider">
                   <tr>
                     <th className="px-6 py-4 font-semibold">Target MDA</th>
                     <th className="px-6 py-4 font-semibold text-right">Original (₦M)</th>
                     <th className="px-6 py-4 font-semibold text-right">Revised (₦M)</th>
                     <th className="px-6 py-4 font-semibold text-center">Difference</th>
                     <th className="px-6 py-4 font-semibold">Reason for Revision</th>
                     <th className="px-6 py-4 font-semibold">Approved By</th>
                     <th className="px-6 py-4 font-semibold">Date</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/30">
                   {REVISIONS.map((rev, idx) => {
                     const diff = rev.revised - rev.original;
                     const isCut = diff < 0;
                     
                     return (
                     <tr key={idx} className="hover:bg-muted/10 transition-colors">
                       <td className="px-6 py-4 font-bold text-foreground whitespace-nowrap">{rev.mda}</td>
                       <td className="px-6 py-4 text-right font-mono text-muted-foreground">{rev.original.toLocaleString()}</td>
                       <td className="px-6 py-4 text-right font-mono font-bold">{rev.revised.toLocaleString()}</td>
                       <td className="px-6 py-4 text-center">
                         <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold ${isCut ? 'text-destructive' : 'text-emerald-500'}`}>
                            {isCut ? <ArrowDownRight className="size-3"/> : <ArrowUpRight className="size-3"/>}
                            {Math.abs(diff).toLocaleString()}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs">{rev.reason}</td>
                       <td className="px-6 py-4 text-xs font-medium whitespace-nowrap">{rev.approvedBy}</td>
                       <td className="px-6 py-4 text-xs font-mono text-muted-foreground whitespace-nowrap">{rev.date}</td>
                     </tr>
                   )})}
                 </tbody>
               </table>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
