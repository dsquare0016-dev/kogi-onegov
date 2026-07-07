import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, Calendar, FileText, PlusCircle, Trash2, 
  Calculator, Send, Save, AlertCircle 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { useBudgetLinesStore } from '@/lib/budgetLinesStore';

export const Route = createFileRoute('/dashboard/budget/proposal')({
  component: CreateBudgetProposalComponent,
})

function CreateBudgetProposalComponent() {
  const session = getSession();
  const userMda = session?.mda || 'Ministry of Works & Housing';
  
  const budgetLines = useBudgetLinesStore(state => state.budgetLines);
  const [lineItems, setLineItems] = useState<{ id: string; description: string; category: string; amount: number }[]>([]);
  const [proposalTitle, setProposalTitle] = useState("Infrastructure Expansion Budget");
  const [justification, setJustification] = useState("");
  const [fiscalYear, setFiscalYear] = useState("2026");

  useEffect(() => {
    const mdaLines = budgetLines.filter(item => item.mda.toLowerCase() === userMda.toLowerCase());
    if (mdaLines.length > 0) {
      setLineItems(mdaLines.map((l, idx) => ({
        id: l.id || `line-${idx}`,
        description: l.description,
        category: l.category,
        amount: l.amount
      })));
    } else {
      setLineItems([
        { id: 'line-1', description: 'Office Equipment Procurement', category: 'Capital Expenditure', amount: 15000000 },
        { id: 'line-2', description: 'Staff Training Workshop', category: 'Recurrent Expenditure', amount: 3500000 },
      ]);
    }
  }, [budgetLines, userMda]);

  const totalAmount = lineItems.reduce((acc, curr) => acc + curr.amount, 0);

  const handleSaveDraft = async () => {
    await useBudgetLinesStore.getState().saveBudgetLinesForMda(userMda, lineItems.map(item => ({
      description: item.description,
      category: item.category,
      amount: item.amount
    })), Number(fiscalYear));
    alert(`Budget Proposal draft saved successfully for ${userMda}.`);
  };

  const handleSubmit = async () => {
    await useBudgetLinesStore.getState().saveBudgetLinesForMda(userMda, lineItems.map(item => ({
      description: item.description,
      category: item.category,
      amount: item.amount
    })), Number(fiscalYear));
    alert(`Budget Proposal submitted to Director successfully. Total: ₦${(totalAmount / 1000000).toFixed(2)}M`);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `line-${Date.now()}`,
        description: 'New Line Item',
        category: 'Capital Expenditure',
        amount: 1000000
      }
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(l => l.id !== id));
  };

  const updateLineItem = (index: number, key: string, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [key]: value };
    setLineItems(updated);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Create Budget Proposal</h1>
          <p className="text-muted-foreground mt-1">Draft and itemize annual financial requirements for your Ministry/Agency.</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="px-4 py-1.5 text-sm font-semibold border-amber-500/50 text-amber-600 bg-amber-500/10">Draft Status</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Header Details */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="border-border/60 shadow-sm">
             <CardHeader className="bg-muted/5 border-b border-border/50">
               <CardTitle className="text-lg">Proposal Header</CardTitle>
               <CardDescription>Basic metadata for this submission</CardDescription>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2"><Building2 className="size-3" /> Submitting MDA</label>
                 <Input value={userMda} disabled className="bg-muted/30 font-bold" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2"><Calendar className="size-3" /> Fiscal Year</label>
                 <select 
                   value={fiscalYear}
                   onChange={e => setFiscalYear(e.target.value)}
                   className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                 >
                    <option value="2027">2027</option>
                    <option value="2026">2026</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2"><FileText className="size-3" /> Proposal Title</label>
                 <Input value={proposalTitle} onChange={e => setProposalTitle(e.target.value)} placeholder="e.g. Infrastructure Expansion Budget" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-muted-foreground">Strategic Justification</label>
                 <Textarea value={justification} onChange={e => setJustification(e.target.value)} placeholder="Explain how this aligns with the 32-year plan..." className="h-24 resize-none" />
               </div>
             </CardContent>
           </Card>

           <Card className="border-border/60 shadow-sm bg-primary/5 border-primary/20">
             <CardContent className="p-6 text-center lg:text-left">
                <div className="flex items-center gap-3 text-primary mb-2 justify-center lg:justify-start">
                  <Calculator className="size-6" />
                  <h3 className="font-black uppercase tracking-wider text-sm">Total Requested</h3>
                </div>
                <p className="text-3xl font-black text-primary">₦{totalAmount.toLocaleString()}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button onClick={handleSaveDraft} className="w-full font-bold gap-2 cursor-pointer"><Save className="size-4" /> Save as Draft</Button>
                  <Button onClick={handleSubmit} className="w-full font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"><Send className="size-4" /> Submit to Director</Button>
                </div>
             </CardContent>
           </Card>
        </div>

        {/* Right Col: Itemized Ledger */}
        <div className="lg:col-span-2">
           <Card className="border-border/60 shadow-sm h-full flex flex-col">
              <CardHeader className="bg-muted/5 border-b border-border/50 flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-lg">Itemized Ledger</CardTitle>
                  <CardDescription>Breakdown of requested funds</CardDescription>
                </div>
                <Button onClick={addLineItem} variant="outline" size="sm" className="gap-2 font-bold text-primary border-primary/30 hover:bg-primary/5 cursor-pointer">
                  <PlusCircle className="size-4" /> Add Line Item
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col justify-between">
                 <div>
                   <div className="border-b border-border/50 bg-muted/30 px-6 py-3 flex gap-4 text-xs font-bold uppercase text-muted-foreground">
                      <div className="flex-[3]">Description</div>
                      <div className="flex-[2]">Category</div>
                      <div className="flex-[2] text-right">Amount (₦)</div>
                      <div className="w-10"></div>
                   </div>
                   <div className="divide-y divide-border/50 max-h-[450px] overflow-y-auto">
                     {lineItems.map((item, index) => (
                       <div key={item.id} className="px-6 py-3 flex gap-4 items-center group hover:bg-muted/10 transition-colors">
                          <div className="flex-[3]">
                            <Input 
                              value={item.description} 
                              onChange={e => updateLineItem(index, 'description', e.target.value)} 
                              className="bg-transparent border-transparent group-hover:border-input transition-colors focus:bg-background" 
                            />
                          </div>
                          <div className="flex-[2]">
                            <select 
                              value={item.category} 
                              onChange={e => updateLineItem(index, 'category', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-transparent bg-transparent px-3 py-2 text-sm ring-offset-background group-hover:border-input focus:bg-background"
                            >
                               <option value="Capital Expenditure">Capital Expenditure</option>
                               <option value="Recurrent Expenditure">Recurrent Expenditure</option>
                               <option value="Personnel Cost">Personnel Cost</option>
                            </select>
                          </div>
                          <div className="flex-[2]">
                            <Input 
                              type="number"
                              value={item.amount} 
                              onChange={e => updateLineItem(index, 'amount', Number(e.target.value) || 0)}
                              className="bg-transparent border-transparent group-hover:border-input transition-colors text-right font-mono font-bold focus:bg-background" 
                            />
                          </div>
                          <div className="w-10 flex justify-end">
                             <Button onClick={() => removeLineItem(item.id)} variant="ghost" size="icon" className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 cursor-pointer">
                               <Trash2 className="size-4" />
                             </Button>
                          </div>
                       </div>
                     ))}
                   </div>
                 </div>
                 
                 <div className="p-6 bg-amber-50/50 dark:bg-amber-950/10 border-t border-amber-200 dark:border-amber-900/30 flex items-start gap-3 mt-auto">
                    <AlertCircle className="size-5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-500 font-medium">Ensure all capital expenditures are directly mapped to a project in the 32-Year Development Plan before submission.</p>
                 </div>
              </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
}
