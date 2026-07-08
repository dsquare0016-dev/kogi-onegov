import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, LineChart, PieChart, Activity, TrendingUp, Calendar, Filter } from 'lucide-react';

export const Route = createFileRoute('/dashboard/budget/intel/analytics')({
  component: BudgetAnalyticsPage,
});

function BudgetAnalyticsPage() {
  const [activeYear, setActiveYear] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('gdu_operational_year') || '2026');
    }
    return 2026;
  });

  useEffect(() => {
    const handleUpdate = () => {
      setActiveYear(Number(localStorage.getItem('gdu_operational_year') || '2026'));
    };
    window.addEventListener('siteConfigUpdate', handleUpdate);
    return () => window.removeEventListener('siteConfigUpdate', handleUpdate);
  }, []);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Performance Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Data visualization suite tracking macroeconomic execution trends state-wide.
          </p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 border border-border rounded-md text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2"><Calendar className="size-4"/> Q1-Q4 {activeYear}</button>
           <button className="px-4 py-2 border border-border rounded-md text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2"><Filter className="size-4"/> Filter by Sector</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* 1. Budget Release Trend (Line Chart Simulation) */}
         <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50">
               <CardTitle className="flex items-center gap-2"><LineChart className="size-5 text-primary"/> Budget Release vs Expenditure Trend</CardTitle>
               <CardDescription>Monthly tracking of fund releases versus actual MDA utilization.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
               <div className="h-[300px] flex items-end justify-between gap-2 px-4 pb-8 relative">
                  {/* Y-Axis lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                     <div className="w-full h-px bg-foreground" />
                     <div className="w-full h-px bg-foreground" />
                     <div className="w-full h-px bg-foreground" />
                     <div className="w-full h-px bg-foreground" />
                  </div>
                  
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => {
                     const release = 40 + Math.random() * 40;
                     const expend = release * (0.6 + Math.random() * 0.3);
                     return (
                        <div key={i} className="relative flex-1 flex justify-center group">
                           <div className="absolute bottom-0 w-3 bg-primary/30 rounded-t-sm" style={{ height: `${release}%` }} />
                           <div className="absolute bottom-0 w-3 bg-primary rounded-t-sm" style={{ height: `${expend}%` }} />
                           <div className="absolute -bottom-6 text-[10px] font-bold text-muted-foreground uppercase">{month}</div>
                        </div>
                     )
                  })}
               </div>
               <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs font-bold"><div className="size-3 bg-primary/30 rounded-sm" /> Funds Released</div>
                  <div className="flex items-center gap-2 text-xs font-bold"><div className="size-3 bg-primary rounded-sm" /> Actual Expenditure</div>
               </div>
            </CardContent>
         </Card>

         {/* 2. Revenue Trend (Bar Chart) */}
         <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50">
               <CardTitle className="flex items-center gap-2"><BarChart3 className="size-5 text-emerald-500"/> Revenue Generation Trend</CardTitle>
               <CardDescription>Target vs Actual collection across IGR and FAAC.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
               <div className="h-[300px] flex items-end justify-between gap-4 px-4 pb-8 relative">
                  {/* Y-Axis lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                     <div className="w-full h-px bg-foreground" />
                     <div className="w-full h-px bg-foreground" />
                     <div className="w-full h-px bg-foreground" />
                     <div className="w-full h-px bg-foreground" />
                  </div>
                  
                  {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => {
                     const target = 70 + Math.random() * 20;
                     const actual = target * (0.8 + Math.random() * 0.4);
                     return (
                        <div key={i} className="relative flex-1 flex justify-center gap-1 group">
                           <div className="w-8 bg-muted rounded-t-sm relative flex items-end justify-center group-hover:bg-muted/80 transition-colors" style={{ height: `${target}%` }}>
                              <span className="absolute -top-5 text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">₦{target.toFixed(0)}B</span>
                           </div>
                           <div className={`w-8 rounded-t-sm relative flex items-end justify-center transition-colors ${actual >= target ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}`} style={{ height: `${actual}%` }}>
                              <span className="absolute -top-5 text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">₦{actual.toFixed(0)}B</span>
                           </div>
                           <div className="absolute -bottom-6 text-xs font-bold text-muted-foreground uppercase">{q}</div>
                        </div>
                     )
                  })}
               </div>
               <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs font-bold"><div className="size-3 bg-muted rounded-sm" /> Quarterly Target</div>
                  <div className="flex items-center gap-2 text-xs font-bold"><div className="size-3 bg-emerald-500 rounded-sm" /> Target Met</div>
                  <div className="flex items-center gap-2 text-xs font-bold"><div className="size-3 bg-amber-500 rounded-sm" /> Deficit</div>
               </div>
            </CardContent>
         </Card>

         {/* 3. Capital Performance (Pie Chart) */}
         <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50">
               <CardTitle className="flex items-center gap-2"><PieChart className="size-5 text-blue-500"/> Sectoral Capital Performance</CardTitle>
               <CardDescription>Execution rates broken down by government sector.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex items-center justify-between">
               <div className="relative size-48 rounded-full border-8 border-muted flex items-center justify-center mx-auto">
                  {/* CSS Simulation of Pie chart segments */}
                  <div className="absolute inset-0 rounded-full border-[24px] border-blue-500" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 50%)' }} />
                  <div className="absolute inset-0 rounded-full border-[24px] border-emerald-500" style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 0, 50% 0)' }} />
                  <div className="absolute inset-0 rounded-full border-[24px] border-purple-500" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0)' }} />
                  <div className="z-10 bg-background size-32 rounded-full flex flex-col items-center justify-center border-4 border-background shadow-inner">
                     <span className="text-3xl font-bold font-mono">82%</span>
                     <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-center">Avg Capital<br/>Execution</span>
                  </div>
               </div>
               <div className="flex-1 pl-8 space-y-4">
                  <div>
                     <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold flex items-center gap-2"><div className="size-2 rounded-full bg-blue-500"/> Infrastructure</span> <span className="font-mono text-xs font-bold">94%</span></div>
                     <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[94%]" /></div>
                  </div>
                  <div>
                     <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold flex items-center gap-2"><div className="size-2 rounded-full bg-emerald-500"/> Social (Health/Ed)</span> <span className="font-mono text-xs font-bold">76%</span></div>
                     <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[76%]" /></div>
                  </div>
                  <div>
                     <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold flex items-center gap-2"><div className="size-2 rounded-full bg-purple-500"/> Administration</span> <span className="font-mono text-xs font-bold">88%</span></div>
                     <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[88%]" /></div>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* 4. Heat Map */}
         <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50">
               <CardTitle className="flex items-center gap-2"><Activity className="size-5 text-orange-500"/> Budget Leakage Heatmap</CardTitle>
               <CardDescription>Identifying areas with consistently high overhead variance.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
               <div className="grid grid-cols-5 gap-1">
                  {Array.from({length: 35}).map((_, i) => {
                     const val = Math.random();
                     const color = val > 0.8 ? 'bg-destructive' : val > 0.6 ? 'bg-orange-500' : val > 0.3 ? 'bg-amber-500' : 'bg-emerald-500/20 text-emerald-500';
                     return (
                        <div key={i} className={`aspect-square rounded flex items-center justify-center font-mono text-[10px] font-bold ${color} hover:opacity-80 transition-opacity cursor-pointer`} title={`MDA Index ${i}`}>
                           {(val * 100).toFixed(0)}
                        </div>
                     )
                  })}
               </div>
               <div className="flex justify-between items-center mt-4 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  <span>Low Risk (0-30%)</span>
                  <span>Critical Variance (80%+)</span>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
