import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Landmark, Wallet, PieChart, Activity, Building, Lock
} from 'lucide-react';

export const Route = createFileRoute('/dashboard/budget/allocation')({
  component: GeneralBudgetAllocationComponent,
})

function GeneralBudgetAllocationComponent() {
  const TOTAL_BUDGET = 250000000000; // 250 Billion
  
  const sectors = [
    { name: 'Infrastructure & Works', allocation: 85000000000, color: 'bg-blue-500', icon: Building },
    { name: 'Healthcare Services', allocation: 45000000000, color: 'bg-emerald-500', icon: Activity },
    { name: 'Education & Human Capital', allocation: 60000000000, color: 'bg-indigo-500', icon: Wallet },
    { name: 'Administration & Governance', allocation: 40000000000, color: 'bg-amber-500', icon: Landmark },
    { name: 'Unallocated Reserve', allocation: 20000000000, color: 'bg-slate-300', icon: Lock },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 pb-24">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">General Budget Allocation</h1>
          <p className="text-muted-foreground mt-1">Macro-level state budget assignment and sector distribution.</p>
        </div>
        <div className="flex gap-2">
           <Badge className="px-4 py-1.5 text-sm font-bold bg-primary text-primary-foreground">
             Fiscal Year 2027
           </Badge>
        </div>
      </div>

      {/* Top Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/60 shadow-sm bg-primary text-primary-foreground md:col-span-2 overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10">
            <Landmark className="size-64 -translate-y-10 translate-x-10" />
          </div>
          <CardContent className="p-8 flex flex-col justify-center h-full relative z-10">
             <p className="text-primary-foreground/80 font-bold uppercase tracking-widest text-sm mb-2">Total State Envelope</p>
             <h2 className="text-5xl font-black tracking-tighter">₦{(TOTAL_BUDGET / 1000000000).toFixed(2)} Billion</h2>
             <div className="mt-6 flex items-center gap-4">
               <div className="bg-primary-foreground/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                 <p className="text-xs font-bold text-primary-foreground/70 uppercase">Allocated</p>
                 <p className="font-bold text-xl text-white">92%</p>
               </div>
               <div className="bg-primary-foreground/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                 <p className="text-xs font-bold text-primary-foreground/70 uppercase">Reserve</p>
                 <p className="font-bold text-xl text-white">8%</p>
               </div>
             </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase text-muted-foreground">Allocation Policy</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm leading-relaxed text-foreground/80 font-medium">
               The 2027 Budget framework mandates a minimum 60% allocation towards Capital Expenditure (CAPEX) to align with the 32-Year Development Plan priorities.
             </p>
             <Button variant="outline" className="w-full mt-4 font-bold border-primary/20 text-primary hover:bg-primary/5">View Policy Framework</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Side: Sector Breakdown */}
         <div className="lg:col-span-2 space-y-6">
           <Card className="border-border/60 shadow-sm">
             <CardHeader className="bg-muted/5 border-b border-border/50 flex flex-row items-center justify-between">
               <div>
                 <CardTitle className="text-lg">Sector Envelopes</CardTitle>
                 <CardDescription>Distribute the total budget across major governance sectors</CardDescription>
               </div>
               <Button size="sm" className="font-bold">Save Allocations</Button>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {sectors.map((sector) => {
                    const percentage = (sector.allocation / TOTAL_BUDGET) * 100;
                    return (
                      <div key={sector.name} className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-4 w-64 shrink-0">
                           <div className={`p-3 rounded-lg text-white shadow-sm ${sector.color}`}>
                             <sector.icon className="size-5" />
                           </div>
                           <div>
                             <h4 className="font-bold text-sm leading-tight">{sector.name}</h4>
                             <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of total</p>
                           </div>
                        </div>
                        
                        <div className="flex-1">
                           <div className="flex items-center gap-4">
                             <Input 
                               defaultValue={sector.allocation.toLocaleString()} 
                               className="font-mono font-bold text-lg bg-background" 
                             />
                             <span className="font-bold text-muted-foreground">NGN</span>
                           </div>
                           <div className="mt-3 h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${sector.color}`} style={{ width: `${percentage}%` }}></div>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
             </CardContent>
           </Card>
         </div>

         {/* Right Side: Visualization */}
         <div className="lg:col-span-1 space-y-6">
            <Card className="border-border/60 shadow-sm h-full">
              <CardHeader className="bg-muted/5 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2"><PieChart className="size-5 text-primary" /> Visual Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                 {/* CSS Pie Chart Simulation */}
                 <div className="size-64 rounded-full relative shadow-inner overflow-hidden mb-8 border-[8px] border-background"
                      style={{
                        background: `conic-gradient(
                          #3b82f6 0% 34%, 
                          #10b981 34% 52%, 
                          #6366f1 52% 76%, 
                          #f59e0b 76% 92%, 
                          #cbd5e1 92% 100%
                        )`
                      }}
                 >
                    <div className="absolute inset-4 bg-card rounded-full flex flex-col items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Total</span>
                      <span className="text-lg font-black text-foreground">₦250B</span>
                    </div>
                 </div>

                 <div className="w-full space-y-3">
                    {sectors.map(sector => (
                      <div key={sector.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                           <div className={`size-3 rounded-sm ${sector.color}`}></div>
                           <span className="font-medium text-muted-foreground">{sector.name}</span>
                        </div>
                        <span className="font-bold">{(sector.allocation / 1000000000).toFixed(1)}B</span>
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
