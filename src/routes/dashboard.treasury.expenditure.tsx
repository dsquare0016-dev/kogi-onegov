import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ActivitySquare, CreditCard, Download, Filter, Flame } from 'lucide-react';

export const Route = createFileRoute('/dashboard/treasury/expenditure')({
  component: TreasuryExpenditureComponent,
})

const TOP_SPENDERS = [
  { mda: 'Ministry of Works', cap: 85, rec: 15, total: '₦1.2B', color: 'bg-red-500' },
  { mda: 'Ministry of Health', cap: 60, rec: 40, total: '₦850M', color: 'bg-amber-500' },
  { mda: 'State House', cap: 20, rec: 80, total: '₦620M', color: 'bg-blue-500' },
  { mda: 'Ministry of Education', cap: 45, rec: 55, total: '₦410M', color: 'bg-emerald-500' },
  { mda: 'Ministry of Agriculture', cap: 70, rec: 30, total: '₦350M', color: 'bg-purple-500' },
];

function TreasuryExpenditureComponent() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
        <div>
          <div className="flex items-center gap-3 text-red-600 mb-3">
            <CreditCard className="size-6" />
            <span className="font-bold uppercase tracking-[0.2em] text-sm">Outflow Tracking</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">State Expenditure</h1>
          <p className="text-lg text-muted-foreground mt-2 font-medium">Tracking actual spending, burn rates, and capital vs recurrent ratios.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-background border-border/60">
            <Filter className="size-4" /> Filter by Quarter
          </Button>
          <Button className="gap-2 font-bold shadow-md bg-red-600 hover:bg-red-700 text-white">
            <Download className="size-4" /> Export Expense Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Summary & Ratios */}
        <div className="lg:col-span-1 space-y-8">
          
          <Card className="border-border/60 shadow-sm border-t-4 border-t-red-500">
             <CardContent className="p-8 text-center space-y-2">
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Total Expenditure (YTD)</p>
                <h2 className="text-5xl font-black text-red-600 dark:text-red-400">₦4.82B</h2>
                <Badge variant="outline" className="font-bold border-red-500 text-red-600 bg-red-500/10 mt-2">Current Burn Rate: High</Badge>
             </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
             <CardHeader className="bg-muted/5 border-b border-border/50 pb-4">
                <CardTitle className="text-base uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-2">
                   <ActivitySquare className="size-4 text-primary" /> Cap vs Rec Ratio
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="flex items-end justify-between">
                   <div>
                      <h3 className="text-3xl font-black text-primary">62%</h3>
                      <p className="text-xs font-bold uppercase text-muted-foreground">Capital Exp.</p>
                   </div>
                   <div className="text-right">
                      <h3 className="text-3xl font-black text-slate-500">38%</h3>
                      <p className="text-xs font-bold uppercase text-muted-foreground">Recurrent Exp.</p>
                   </div>
                </div>
                <div className="h-4 w-full rounded-full flex overflow-hidden">
                   <div className="h-full bg-primary" style={{ width: '62%' }}></div>
                   <div className="h-full bg-slate-400" style={{ width: '38%' }}></div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                  The state is currently exceeding its target of maintaining Capital Expenditure above 55%.
                </p>
             </CardContent>
          </Card>
        </div>

        {/* Right Side: Top Spenders Heatmap List */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="border-b border-border/50 bg-muted/5 pb-4 flex flex-row items-center justify-between">
               <div>
                 <CardTitle className="text-lg flex items-center gap-2">
                   <Flame className="size-5 text-red-500" />
                   Top Spending Ministries
                 </CardTitle>
                 <CardDescription>Ranked by highest total expenditure YTD.</CardDescription>
               </div>
            </CardHeader>
            <CardContent className="p-6">
               <div className="space-y-8">
                  {TOP_SPENDERS.map((mda, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex items-end justify-between">
                          <h4 className="font-bold text-base flex items-center gap-2">
                             <span className="text-muted-foreground text-xs w-4">{i+1}.</span>
                             {mda.mda}
                          </h4>
                          <span className="font-black text-xl">{mda.total}</span>
                       </div>
                       
                       <div className="space-y-1">
                          <div className="h-6 w-full rounded-md flex overflow-hidden border border-border/50 shadow-sm relative group">
                             {/* Capital Block */}
                             <div className={`h-full ${mda.color} flex items-center justify-center`} style={{ width: `${mda.cap}%` }}>
                                {mda.cap > 15 && <span className="text-[10px] font-bold text-white uppercase opacity-0 group-hover:opacity-100 transition-opacity">Capital {mda.cap}%</span>}
                             </div>
                             {/* Recurrent Block */}
                             <div className="h-full bg-muted/50 dark:bg-slate-800 flex items-center justify-center border-l border-background/20" style={{ width: `${mda.rec}%` }}>
                                {mda.rec > 15 && <span className="text-[10px] font-bold text-foreground/70 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Recurrent {mda.rec}%</span>}
                             </div>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                             <span>Cap</span>
                             <span>Rec</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
