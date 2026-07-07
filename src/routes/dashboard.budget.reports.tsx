import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart4, ArrowUpRight, ArrowDownRight, FileWarning, CheckCircle2, TrendingUp
} from 'lucide-react';

export const Route = createFileRoute('/dashboard/budget/reports')({
  component: EndOfYearReportingComponent,
})

function EndOfYearReportingComponent() {
  const mdaPerformance = [
    { name: 'Ministry of Health', allocated: 45000000000, spent: 44200000000, status: 'On Target' },
    { name: 'Ministry of Works & Infrastructure', allocated: 85000000000, spent: 92000000000, status: 'Over Budget' },
    { name: 'Ministry of Education', allocated: 60000000000, spent: 48000000000, status: 'Under-utilized' },
    { name: 'Ministry of Agriculture', allocated: 25000000000, spent: 24800000000, status: 'On Target' },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 pb-24">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">End-of-Year Reporting & Review</h1>
          <p className="text-muted-foreground mt-1">Budget vs. Actuals variance analysis and fiscal compliance tracking.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="font-bold border-border/50 shadow-sm">Export Audit Report</Button>
           <Button className="font-bold gap-2"><FileWarning className="size-4" /> Flag Non-Compliant MDAs</Button>
        </div>
      </div>

      {/* Top Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-muted-foreground uppercase mb-1">Total State Budget</p>
            <h3 className="text-3xl font-black tracking-tighter">₦250B</h3>
            <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1"><CheckCircle2 className="size-3" /> Fully Funded</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-muted-foreground uppercase mb-1">Total Actual Spend</p>
            <h3 className="text-3xl font-black tracking-tighter">₦238.4B</h3>
            <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1"><ArrowDownRight className="size-3" /> 4.64% Under Budget</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-muted-foreground uppercase mb-1">CAPEX Execution Rate</p>
            <h3 className="text-3xl font-black tracking-tighter">82%</h3>
            <p className="text-xs text-amber-600 mt-2 font-medium flex items-center gap-1"><TrendingUp className="size-3" /> Below 90% Target</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/5 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-red-600 uppercase mb-1">Critical Overspends</p>
            <h3 className="text-3xl font-black tracking-tighter text-red-700 dark:text-red-400">₦7.0B</h3>
            <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1"><ArrowUpRight className="size-3" /> Across 3 MDAs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Variance Table */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="bg-muted/5 border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2"><BarChart4 className="size-5 text-primary" /> MDA Budget vs. Actuals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                   <thead>
                     <tr className="bg-muted/30 border-b border-border/50 text-left text-xs uppercase text-muted-foreground">
                       <th className="p-4 font-bold">MDA Name</th>
                       <th className="p-4 font-bold text-right">Allocated (₦)</th>
                       <th className="p-4 font-bold text-right">Spent (₦)</th>
                       <th className="p-4 font-bold text-right">Variance (%)</th>
                       <th className="p-4 font-bold">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border/50">
                     {mdaPerformance.map((mda) => {
                        const variance = ((mda.spent - mda.allocated) / mda.allocated) * 100;
                        const isOver = variance > 0;
                        return (
                          <tr key={mda.name} className="hover:bg-muted/10 transition-colors">
                            <td className="p-4 font-bold">{mda.name}</td>
                            <td className="p-4 text-right font-mono">{(mda.allocated / 1000000000).toFixed(2)}B</td>
                            <td className="p-4 text-right font-mono font-bold">{(mda.spent / 1000000000).toFixed(2)}B</td>
                            <td className={`p-4 text-right font-mono font-bold ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
                              {isOver ? '+' : ''}{variance.toFixed(1)}%
                            </td>
                            <td className="p-4">
                               <Badge variant="secondary" className={`font-bold ${
                                 mda.status === 'Over Budget' ? 'bg-red-500/10 text-red-600' :
                                 mda.status === 'Under-utilized' ? 'bg-amber-500/10 text-amber-600' :
                                 'bg-emerald-500/10 text-emerald-600'
                               }`}>
                                 {mda.status}
                               </Badge>
                            </td>
                          </tr>
                        );
                     })}
                   </tbody>
                 </table>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Visualizations */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="border-border/60 shadow-sm">
             <CardHeader className="bg-muted/5 border-b border-border/50">
               <CardTitle className="text-lg">Compliance Scorecard</CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-muted-foreground uppercase text-xs">MDAs Within Budget limits</span>
                        <span className="font-bold">85%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[85%] rounded-full"></div>
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-muted-foreground uppercase text-xs">Funds Properly Retired</span>
                        <span className="font-bold">62%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[62%] rounded-full"></div>
                      </div>
                      <p className="text-xs text-amber-600 mt-1">Warning: 38% of funds lack final retirement documentation.</p>
                   </div>
                </div>
             </CardContent>
           </Card>

           <Card className="border-border/60 shadow-sm border-l-4 border-l-red-500">
             <CardContent className="p-6">
               <h3 className="font-bold text-red-600 mb-2 flex items-center gap-2"><FileWarning className="size-4" /> Immediate Action Required</h3>
               <p className="text-sm leading-relaxed text-foreground/80 mb-4">
                 The Ministry of Works & Infrastructure has exceeded its allocation by ₦7.0B without supplementary approval. An automated audit query has been drafted.
               </p>
               <Button variant="outline" className="w-full text-xs font-bold border-red-200 text-red-600 hover:bg-red-50">Review Audit Query</Button>
             </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
}
