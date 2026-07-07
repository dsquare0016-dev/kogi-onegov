import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, ShieldAlert, FileSignature, CheckCircle2, FileText, Send, Building2 } from 'lucide-react';

export const Route = createFileRoute('/dashboard/budget/supplementary')({
  component: SupplementaryBudgetPage,
});

const BILLS = [
  { id: 'SUP-01-26', title: 'Emergency Flood Relief Funding', mda: 'Ministry of Environment', amount: 2500, status: 'Draft', date: 'Oct 12, 2026' },
  { id: 'SUP-02-26', title: 'Security Apparatus Upgrade', mda: 'Ministry of Internal Security', amount: 5000, status: 'Pending Assembly', date: 'Sep 05, 2026' },
  { id: 'SUP-03-26', title: 'Rural Electrification Expansion', mda: 'Ministry of Power', amount: 1200, status: 'Approved', date: 'Aug 20, 2026' },
];

function SupplementaryBudgetPage() {
  const stats = [
    { label: 'Total Supplementary', value: '₦8.7B', color: 'text-foreground' },
    { label: 'Total Requests', value: '14', color: 'text-blue-500' },
    { label: 'Approved Requests', value: '5', color: 'text-emerald-500' },
    { label: 'Rejected Requests', value: '2', color: 'text-destructive' },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplementary Budget</h1>
          <p className="text-muted-foreground mt-1">
            Manage out-of-cycle funding requests requiring legislative approval.
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="size-4"/> New Supplementary Bill
        </button>
      </div>

      {/* 1. Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {stats.map((stat, i) => (
            <Card key={i} className="border-border/60 shadow-sm">
               <CardContent className="p-6 flex flex-col justify-between h-full">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{stat.label}</span>
                 <span className={`text-3xl font-mono font-bold ${stat.color}`}>{stat.value}</span>
               </CardContent>
            </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* 2. Bill Cards */}
         <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {BILLS.map((bill, i) => (
              <Card key={i} className={`border-border/60 shadow-sm ${bill.status === 'Approved' ? 'bg-emerald-500/5 border-emerald-500/20' : ''}`}>
                <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-4">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{bill.id}</span>
                     <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${
                       bill.status === 'Draft' ? 'bg-muted text-muted-foreground' :
                       bill.status === 'Pending Assembly' ? 'bg-amber-500/10 text-amber-600' :
                       'bg-emerald-500/10 text-emerald-600'
                     }`}>{bill.status}</span>
                   </div>
                   <h3 className="font-bold text-lg leading-tight mb-2">{bill.title}</h3>
                   <div className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5"><Building2 className="size-3"/> {bill.mda}</div>
                   <div className="flex justify-between items-end pt-4 border-t border-border/50">
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground mb-1">Requested Amount</div>
                        <div className="text-2xl font-bold font-mono">₦{bill.amount.toLocaleString()}M</div>
                      </div>
                      <button className="p-2 bg-background border border-border rounded hover:bg-muted transition-colors"><FileSignature className="size-4 text-muted-foreground"/></button>
                   </div>
                </CardContent>
              </Card>
            ))}
         </div>

         {/* 3. Workflow & Warning */}
         <div className="col-span-1 space-y-6">
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-6 flex flex-col gap-4">
                 <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
                    <ShieldAlert className="size-5 shrink-0" /> Legal Compliance
                 </div>
                 <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                   Supplementary budgets directly alter the State's fiscal deficit. All requests here must be accompanied by explicit Executive Council memos and State Assembly resolutions before funds are disbursed.
                 </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
               <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-base">Approval Workflow</CardTitle>
               </CardHeader>
               <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">1</div>
                     <div>
                        <div className="text-sm font-bold">Submission</div>
                        <div className="text-xs text-muted-foreground">MDA submits request memo.</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="size-8 rounded bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">2</div>
                     <div>
                        <div className="text-sm font-bold">Technical Review</div>
                        <div className="text-xs text-muted-foreground">GBO validates fiscal headroom.</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="size-8 rounded bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs">3</div>
                     <div>
                        <div className="text-sm font-bold">EXCO & Assembly</div>
                        <div className="text-xs text-muted-foreground">Formal legislative approval.</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="size-8 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">4</div>
                     <div>
                        <div className="text-sm font-bold">Publication</div>
                        <div className="text-xs text-muted-foreground">Enacted into state law.</div>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
