import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Banknote, LineChart, PieChart, Download, DollarSign } from 'lucide-react';

export const Route = createFileRoute('/dashboard/treasury/revenue')({
  component: TreasuryRevenueComponent,
})

const REVENUE_STREAMS = [
  { name: 'Internal Revenue (IGR)', amount: '₦2.4 Billion', share: 45, color: 'bg-emerald-500', icon: TrendingUp },
  { name: 'Federal Allocation (FAAC)', amount: '₦2.1 Billion', share: 40, color: 'bg-blue-500', icon: Banknote },
  { name: 'Grants & Aids', amount: '₦500 Million', share: 10, color: 'bg-purple-500', icon: DollarSign },
  { name: 'Investments & Dividends', amount: '₦250 Million', share: 5, color: 'bg-amber-500', icon: LineChart },
];

function TreasuryRevenueComponent() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
        <div>
          <div className="flex items-center gap-3 text-emerald-600 mb-3">
            <TrendingUp className="size-6" />
            <span className="font-bold uppercase tracking-[0.2em] text-sm">Inflow Tracking</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Revenue Dashboard</h1>
          <p className="text-lg text-muted-foreground mt-2 font-medium">Tracking state-wide Internal Generated Revenue and Federal Allocations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-background border-border/60">
            Generate Tax Report
          </Button>
          <Button className="gap-2 font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white">
            <Download className="size-4" /> Export Financials
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Growth Chart & Total */}
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="border-border/60 shadow-sm overflow-hidden border-t-4 border-t-emerald-500">
             <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Revenue (YTD)</p>
                  <h2 className="text-5xl font-black text-emerald-600 dark:text-emerald-400">₦5.25 Billion</h2>
                </div>
                <div className="flex gap-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900 text-center min-w-32">
                    <p className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-500 mb-1">Target Pace</p>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">112%</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900 text-center min-w-32">
                    <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-500 mb-1">YoY Growth</p>
                    <p className="text-2xl font-black text-blue-700 dark:text-blue-400">+14.2%</p>
                  </div>
                </div>
             </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm h-[450px] relative overflow-hidden">
             <CardHeader className="border-b border-border/50 bg-muted/5 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                 <LineChart className="size-5 text-emerald-500" />
                 Monthly Revenue Trajectory
               </CardTitle>
             </CardHeader>
             <CardContent className="absolute inset-0 top-[68px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
               {/* Decorative Area Chart background */}
               <div className="absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-emerald-500/20 to-transparent"></div>
               <svg className="absolute inset-x-0 bottom-0 w-full h-2/3" preserveAspectRatio="none" viewBox="0 0 100 100">
                 <path d="M0,100 L0,50 Q25,30 50,60 T100,20 L100,100 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500" />
               </svg>
               
               <div className="relative z-10 text-center">
                 <LineChart className="size-16 text-emerald-600 mx-auto mb-4" />
                 <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Revenue Growth Visualization</h3>
                 <p className="text-sm text-slate-500 mt-2">Interactive D3/Recharts component will render the upward trending IGR data here.</p>
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Side: Revenue Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/60 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-muted/5 border-b border-border/50 pb-4">
               <CardTitle className="flex items-center gap-2">
                 <PieChart className="size-5 text-primary" />
                 Revenue Streams Breakdown
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col space-y-8">
              
              {/* Simulated Donut Chart */}
              <div className="relative size-48 mx-auto flex items-center justify-center my-4">
                {/* SVG Donut Segments */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="20" className="text-amber-500" strokeDasharray="251" strokeDashoffset={251 - (251 * 100) / 100} />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="20" className="text-purple-500" strokeDasharray="251" strokeDashoffset={251 - (251 * 95) / 100} />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="20" className="text-blue-500" strokeDasharray="251" strokeDashoffset={251 - (251 * 85) / 100} />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="20" className="text-emerald-500" strokeDasharray="251" strokeDashoffset={251 - (251 * 45) / 100} />
                </svg>
              </div>

              <div className="flex-1 space-y-4">
                {REVENUE_STREAMS.map((stream, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`size-3 rounded-full ${stream.color}`}></div>
                      <div>
                        <p className="text-sm font-bold">{stream.name}</p>
                        <p className="text-xs text-muted-foreground">{stream.share}% of total</p>
                      </div>
                    </div>
                    <span className="font-bold">{stream.amount}</span>
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
