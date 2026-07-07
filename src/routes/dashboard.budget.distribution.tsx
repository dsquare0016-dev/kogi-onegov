import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, GitMerge, ArrowRightCircle, ArrowDown, Share2, Calculator
} from 'lucide-react';

export const Route = createFileRoute('/dashboard/budget/distribution')({
  component: MinistryDownstreamDistributionComponent,
})

function MinistryDownstreamDistributionComponent() {
  const MINISTRY_ENVELOPE = 45000000000; // 45 Billion (Healthcare)

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Ministry Downstream Distribution</h1>
          <p className="text-muted-foreground mt-1">Visualize and balance the flow of funds from the Ministry level down to specific departments.</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="px-4 py-1.5 text-sm font-bold border-blue-500/50 text-blue-600 bg-blue-500/10">
             Ministry of Health
           </Badge>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        
        {/* Top Node: Ministry Envelope */}
        <Card className="border-border/60 shadow-lg border-b-4 border-b-primary w-full max-w-2xl text-center relative z-10">
           <CardContent className="p-8">
             <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Building className="size-8 text-primary" />
             </div>
             <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Ministry Envelope</p>
             <h2 className="text-5xl font-black tracking-tighter text-foreground">₦45.00 Billion</h2>
             <p className="text-sm text-emerald-600 font-bold mt-3 bg-emerald-500/10 inline-block px-3 py-1 rounded-full border border-emerald-500/20">
               Fully Balanced
             </p>
           </CardContent>
        </Card>

        {/* Tree Connectors */}
        <div className="relative w-full h-16 max-w-4xl flex justify-center -mt-8 z-0">
           {/* Center Trunk */}
           <div className="w-1 bg-border/50 h-full"></div>
           {/* Horizontal Branch */}
           <div className="absolute top-1/2 left-[16.66%] right-[16.66%] h-1 bg-border/50"></div>
           
           {/* Downward branches */}
           <div className="absolute top-1/2 left-[16.66%] w-1 h-1/2 bg-border/50"></div>
           <div className="absolute top-1/2 left-[50%] w-1 h-1/2 bg-border/50"></div>
           <div className="absolute top-1/2 right-[16.66%] w-1 h-1/2 bg-border/50"></div>
        </div>

        {/* Level 2 Nodes: Departments/Agencies */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
           
           {/* Node 1 */}
           <Card className="border-border/60 shadow-md hover:border-primary/50 transition-colors">
              <CardHeader className="bg-muted/5 border-b border-border/50 p-4">
                 <Badge variant="outline" className="w-fit mb-2">Agency</Badge>
                 <CardTitle className="text-lg">State Hospitals Management Board</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Allocated Funds</p>
                 <p className="text-3xl font-black text-foreground mb-4">₦22.50B</p>
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs border-b border-border/50 pb-2">
                       <span className="text-muted-foreground">Personnel</span>
                       <span className="font-bold">₦8.5B</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-border/50 pb-2">
                       <span className="text-muted-foreground">Overhead</span>
                       <span className="font-bold">₦4.0B</span>
                    </div>
                    <div className="flex justify-between text-xs pb-1">
                       <span className="text-muted-foreground">Capital</span>
                       <span className="font-bold text-primary">₦10.0B</span>
                    </div>
                 </div>
                 <Button variant="outline" className="w-full mt-4 gap-2 text-xs h-8"><GitMerge className="size-3" /> View Sub-Distribution</Button>
              </CardContent>
           </Card>

           {/* Node 2 */}
           <Card className="border-border/60 shadow-md hover:border-primary/50 transition-colors">
              <CardHeader className="bg-muted/5 border-b border-border/50 p-4">
                 <Badge variant="outline" className="w-fit mb-2">Agency</Badge>
                 <CardTitle className="text-lg">Primary Healthcare Dev. Agency</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Allocated Funds</p>
                 <p className="text-3xl font-black text-foreground mb-4">₦15.00B</p>
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs border-b border-border/50 pb-2">
                       <span className="text-muted-foreground">Personnel</span>
                       <span className="font-bold">₦6.0B</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-border/50 pb-2">
                       <span className="text-muted-foreground">Overhead</span>
                       <span className="font-bold">₦3.5B</span>
                    </div>
                    <div className="flex justify-between text-xs pb-1">
                       <span className="text-muted-foreground">Capital</span>
                       <span className="font-bold text-primary">₦5.5B</span>
                    </div>
                 </div>
                 <Button variant="outline" className="w-full mt-4 gap-2 text-xs h-8"><GitMerge className="size-3" /> View Sub-Distribution</Button>
              </CardContent>
           </Card>

           {/* Node 3 */}
           <Card className="border-border/60 shadow-md hover:border-primary/50 transition-colors">
              <CardHeader className="bg-muted/5 border-b border-border/50 p-4">
                 <Badge variant="outline" className="w-fit mb-2">Department</Badge>
                 <CardTitle className="text-lg">HQ Admin & Policy Planning</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Allocated Funds</p>
                 <p className="text-3xl font-black text-foreground mb-4">₦7.50B</p>
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs border-b border-border/50 pb-2">
                       <span className="text-muted-foreground">Personnel</span>
                       <span className="font-bold">₦3.5B</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-border/50 pb-2">
                       <span className="text-muted-foreground">Overhead</span>
                       <span className="font-bold">₦2.0B</span>
                    </div>
                    <div className="flex justify-between text-xs pb-1">
                       <span className="text-muted-foreground">Capital</span>
                       <span className="font-bold text-primary">₦2.0B</span>
                    </div>
                 </div>
                 <Button variant="outline" className="w-full mt-4 gap-2 text-xs h-8"><GitMerge className="size-3" /> View Sub-Distribution</Button>
              </CardContent>
           </Card>

        </div>

        {/* Balancing Control Panel */}
        <Card className="w-full max-w-4xl mt-8 border-border/60 shadow-sm bg-slate-50 dark:bg-slate-900/50">
           <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary/10 rounded-full text-primary">
                   <Calculator className="size-6" />
                 </div>
                 <div>
                   <p className="font-bold text-sm">Distribution Balance Engine</p>
                   <p className="text-xs text-muted-foreground">Ensure sum of downstream nodes equals the master envelope.</p>
                 </div>
              </div>
              <div className="flex items-center gap-8">
                 <div className="text-right">
                   <p className="text-[10px] font-bold uppercase text-muted-foreground">Envelope</p>
                   <p className="font-mono font-bold">₦45.00B</p>
                 </div>
                 <div className="text-center">
                   <p className="text-[10px] font-bold uppercase text-muted-foreground">Distributed</p>
                   <p className="font-mono font-bold">₦45.00B</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] font-bold uppercase text-muted-foreground">Variance</p>
                   <p className="font-mono font-black text-emerald-600">₦0.00</p>
                 </div>
              </div>
           </CardContent>
        </Card>

      </div>
    </div>
  );
}
