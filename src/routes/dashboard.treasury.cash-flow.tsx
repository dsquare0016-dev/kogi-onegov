import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, ArrowDownRight, ArrowUpRight, Sigma, Layers, Download } from 'lucide-react';

export const Route = createFileRoute('/dashboard/treasury/cash-flow')({
  component: TreasuryCashFlowComponent,
})

const WATERFALL_DATA = [
  { label: 'Opening Balance', amount: '₦12.5B', type: 'base', height: 'h-[300px]', bg: 'bg-slate-300 dark:bg-slate-700' },
  { label: 'FAAC Allocation', amount: '+₦2.1B', type: 'positive', height: 'h-[60px]', offset: 'mb-[300px]', bg: 'bg-emerald-500' },
  { label: 'Internal Revenue', amount: '+₦2.4B', type: 'positive', height: 'h-[70px]', offset: 'mb-[360px]', bg: 'bg-emerald-500' },
  { label: 'Capital Releases', amount: '-₦1.2B', type: 'negative', height: 'h-[35px]', offset: 'mb-[395px]', bg: 'bg-red-500' },
  { label: 'Recurrent Exp.', amount: '-₦1.55B', type: 'negative', height: 'h-[45px]', offset: 'mb-[350px]', bg: 'bg-red-500' },
  { label: 'Projected Closing', amount: '₦14.25B', type: 'base', height: 'h-[350px]', bg: 'bg-blue-600 dark:bg-blue-500' },
];

function TreasuryCashFlowComponent() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
        <div>
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <BarChart className="size-5" />
            <span className="font-bold uppercase tracking-wider text-sm">Liquidity Movement</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Cash Flow Analysis</h1>
          <p className="text-lg text-muted-foreground mt-2 font-medium">Real-time analysis of money entering versus money leaving the state coffers.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 font-bold bg-background shadow-sm">
            October 2026
          </Button>
          <Button className="gap-2 font-bold shadow-md bg-purple-600 hover:bg-purple-700 text-white">
            <Download className="size-4" /> Export Statement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Summary Panel */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="border-border/60 shadow-sm border-l-4 border-l-purple-500">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">Net Cash Position</CardTitle>
             </CardHeader>
             <CardContent className="p-6 pt-0">
               <div className="flex items-center gap-4">
                 <h2 className="text-4xl font-black">+₦1.75B</h2>
               </div>
               <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Positive net inflow for the current period, strengthening the state's liquidity reserves.</p>
             </CardContent>
           </Card>

           <Card className="border-border/60 shadow-sm">
             <CardHeader className="bg-muted/5 border-b border-border/50 pb-4">
               <CardTitle className="text-base flex items-center gap-2">
                 <Layers className="size-4 text-primary" /> Key Drivers
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y divide-border/50">
                  <div className="p-4 flex items-center justify-between hover:bg-muted/10">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="size-4 text-emerald-500" />
                      <span className="font-semibold text-sm">Total Inflows</span>
                    </div>
                    <span className="font-bold text-emerald-600">₦4.50B</span>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-muted/10">
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="size-4 text-red-500" />
                      <span className="font-semibold text-sm">Total Outflows</span>
                    </div>
                    <span className="font-bold text-red-600">₦2.75B</span>
                  </div>
               </div>
             </CardContent>
           </Card>
        </div>

        {/* Right Side: Waterfall Chart */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border/60 shadow-sm h-[600px] flex flex-col relative overflow-hidden">
             <CardHeader className="border-b border-border/50 bg-muted/5 pb-4 shrink-0">
                <CardTitle className="flex items-center gap-2">
                   <Sigma className="size-5 text-primary" /> Projected Closing Balance Waterfall
                </CardTitle>
             </CardHeader>
             <CardContent className="flex-1 p-8 relative flex flex-col justify-end overflow-x-auto">
                {/* Background Grid Lines */}
                <div className="absolute inset-x-8 inset-y-8 flex flex-col justify-between pointer-events-none opacity-20">
                   {[1, 2, 3, 4, 5, 6].map(i => (
                     <div key={i} className="w-full h-[1px] bg-foreground border-dashed border-b border-foreground/50"></div>
                   ))}
                </div>

                {/* Simulated Waterfall rendering */}
                <div className="relative z-10 flex items-end justify-between gap-2 h-full min-w-[600px] pt-12 pb-6">
                   {WATERFALL_DATA.map((col, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                         <div className={`w-full max-w-[100px] rounded-t-sm border border-black/10 dark:border-white/10 transition-all ${col.bg} ${col.height} ${col.offset || ''} group-hover:brightness-110 relative shadow-sm`}>
                            {/* Hover Tooltip/Value */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-black whitespace-nowrap bg-background px-2 py-1 rounded border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                               {col.amount}
                            </div>
                         </div>
                         <div className="mt-4 text-center">
                            <p className={`text-xs font-bold ${
                               col.type === 'positive' ? 'text-emerald-600 dark:text-emerald-400' :
                               col.type === 'negative' ? 'text-red-600 dark:text-red-400' :
                               'text-foreground'
                            }`}>{col.amount}</p>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1 truncate max-w-[80px]">{col.label}</p>
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
