import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, XCircle, AlertTriangle, MessageSquare, 
  Search, Filter, Clock, Eye
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/budget/director-review')({
  component: DirectorBudgetReviewComponent,
})

function DirectorBudgetReviewComponent() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const pendingProposals = [
    { id: 'PROP-2027-014', mda: 'Ministry of Health', title: 'Hospital Equipment Upgrade', amount: 450000000, date: '2 hours ago', risk: 'Low' },
    { id: 'PROP-2027-015', mda: 'Ministry of Education', title: 'School Renovation Phase 2', amount: 1200000000, date: '5 hours ago', risk: 'Medium' },
    { id: 'PROP-2027-016', mda: 'Dept of Transport', title: 'Fleet Maintenance', amount: 85000000, date: '1 day ago', risk: 'High' },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-[calc(100vh-172px)] flex flex-col">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Director Budget Review</h1>
          <p className="text-muted-foreground mt-1">Review, approve, or reject budget proposals submitted by departments and units.</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="px-4 py-1.5 text-sm font-bold bg-primary/10 text-primary border-primary/20">
             3 Pending Reviews
           </Badge>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Left Side: Proposal Queue */}
        <div className="w-96 flex flex-col gap-4">
          <Card className="border-border/60 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/5 flex flex-col gap-4">
               <div className="flex bg-muted/50 p-1 rounded-lg">
                 <button onClick={() => setActiveTab('pending')} className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors ${activeTab === 'pending' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}>Pending</button>
                 <button onClick={() => setActiveTab('approved')} className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors ${activeTab === 'approved' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}>Approved</button>
                 <button onClick={() => setActiveTab('rejected')} className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors ${activeTab === 'rejected' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}>Rejected</button>
               </div>
               <div className="flex items-center gap-2 text-muted-foreground bg-background border border-border/50 rounded-md px-3 py-2 text-sm">
                 <Search className="size-4 shrink-0" />
                 <input placeholder="Search proposals..." className="bg-transparent border-none outline-none w-full" />
                 <Filter className="size-4 shrink-0 cursor-pointer hover:text-foreground" />
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {pendingProposals.map((prop, idx) => (
                <div 
                  key={prop.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${idx === 0 ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card border-border/40 hover:border-primary/30'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">{prop.id}</span>
                    <Badge variant="secondary" className={`text-[10px] font-bold ${
                      prop.risk === 'High' ? 'bg-red-500/10 text-red-600' :
                      prop.risk === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {prop.risk} Risk
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm leading-tight mb-1">{prop.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{prop.mda}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
                    <span className="font-black text-sm">₦{(prop.amount / 1000000).toFixed(1)}M</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="size-3" /> {prop.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: Review Interface */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 border-border/60 shadow-sm flex flex-col overflow-hidden">
             {/* Header */}
             <div className="p-6 border-b border-border/50 bg-muted/5 flex justify-between items-start">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                     <Badge variant="outline" className="font-mono bg-background">PROP-2027-014</Badge>
                     <Badge className="bg-blue-500 hover:bg-blue-600">Pending Review</Badge>
                   </div>
                   <h2 className="text-2xl font-black">Hospital Equipment Upgrade</h2>
                   <p className="text-muted-foreground">Ministry of Health • Submitted by Dr. Yakubu</p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold uppercase text-muted-foreground mb-1">Total Requested</p>
                   <p className="text-4xl font-black text-primary tracking-tight">₦450,000,000</p>
                </div>
             </div>

             {/* Body */}
             <div className="flex-1 overflow-y-auto p-6 flex gap-6">
                
                {/* Details */}
                <div className="flex-[2] space-y-8">
                   <div>
                     <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Strategic Justification</h3>
                     <p className="text-sm leading-relaxed text-foreground/90 bg-muted/30 p-4 rounded-xl border border-border/50">
                       This proposal covers the procurement of essential diagnostic equipment (2 MRI machines, 5 X-Ray units) for the Lokoja General Hospital. This aligns with Pillar 3 of the 32-Year Development Plan focusing on accessible healthcare infrastructure. The current equipment is over 15 years old and causes severe delays in patient care.
                     </p>
                   </div>

                   <div>
                     <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Line Items Ledger</h3>
                     <div className="border border-border/50 rounded-xl overflow-hidden bg-background">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50 border-b border-border/50 text-left text-xs uppercase text-muted-foreground">
                              <th className="p-3 font-bold">Description</th>
                              <th className="p-3 font-bold">Category</th>
                              <th className="p-3 font-bold text-right">Amount (₦)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            <tr className="hover:bg-muted/10">
                              <td className="p-3 font-medium">MRI Machines (2 Units)</td>
                              <td className="p-3"><Badge variant="outline" className="text-[10px]">Capital</Badge></td>
                              <td className="p-3 text-right font-mono font-bold">350,000,000</td>
                            </tr>
                            <tr className="hover:bg-muted/10">
                              <td className="p-3 font-medium">Digital X-Ray Units (5 Units)</td>
                              <td className="p-3"><Badge variant="outline" className="text-[10px]">Capital</Badge></td>
                              <td className="p-3 text-right font-mono font-bold">75,000,000</td>
                            </tr>
                            <tr className="hover:bg-muted/10">
                              <td className="p-3 font-medium">Installation & Training</td>
                              <td className="p-3"><Badge variant="outline" className="text-[10px]">Recurrent</Badge></td>
                              <td className="p-3 text-right font-mono font-bold">25,000,000</td>
                            </tr>
                          </tbody>
                        </table>
                     </div>
                   </div>
                </div>

                {/* Right Sidebar actions */}
                <div className="flex-1 space-y-6">
                   <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-4">
                      <h4 className="font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2 mb-2">
                        <Eye className="size-4" /> System Intelligence
                      </h4>
                      <p className="text-sm text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                        This request exceeds the Ministry's quarterly historical average by 15%. However, it directly links to a high-priority KPI in the Development Plan.
                      </p>
                   </div>

                   <div className="space-y-3 pt-4 border-t border-border/50">
                     <label className="text-xs font-bold uppercase text-muted-foreground">Reviewer Comments (Visible to Submitter)</label>
                     <Textarea placeholder="Add notes, conditions for approval, or reasons for rejection..." className="h-32 resize-none" />
                   </div>

                   <div className="flex flex-col gap-3 pt-4">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-base gap-2">
                         <CheckCircle className="size-5" /> Approve Proposal
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="font-bold border-amber-500/50 text-amber-600 hover:bg-amber-50 gap-2">
                           <AlertTriangle className="size-4" /> Request Change
                        </Button>
                        <Button variant="outline" className="font-bold border-red-500/50 text-red-600 hover:bg-red-50 gap-2">
                           <XCircle className="size-4" /> Reject
                        </Button>
                      </div>
                   </div>
                </div>

             </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
