import { createFileRoute } from '@tanstack/react-router';
import { getSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building, Database, Send, PlusCircle, Save, LayoutDashboard, 
  Workflow, FileEdit, Network, ArrowRight, KanbanSquare, AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  location: z.string().min(2, "Location is required"),
  budget: z.coerce.number().positive("Budget must be a positive number")
});

const warrantSchema = z.object({
  mda: z.string().min(2, "MDA is required"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters")
});

const anomalySchema = z.object({
  severity: z.string().min(2, "Severity is required"),
  offender: z.string().min(2, "Offender is required"),
  description: z.string().min(10, "Description must be at least 10 characters")
});

export const Route = createFileRoute('/dashboard/gdu-center/requests')({
  component: GDUControlOfficeComponent,
})

function GDUControlOfficeComponent() {
  const [activeTab, setActiveTab] = useState<'input' | 'workflow' | 'cms' | 'comms'>('input');

  const projectForm = useForm<z.infer<typeof projectSchema>>({ resolver: zodResolver(projectSchema) });
  const warrantForm = useForm<z.infer<typeof warrantSchema>>({ resolver: zodResolver(warrantSchema) });
  const anomalyForm = useForm<z.infer<typeof anomalySchema>>({ resolver: zodResolver(anomalySchema) });

  const session = getSession();
  const isGovernor = session?.role === 'governor';

  const onProjectSubmit = (data: z.infer<typeof projectSchema>) => {
    console.log("Project Logged:", data);
    alert(`Project '${data.title}' logged successfully!`);
    projectForm.reset();
  };

  const onWarrantSubmit = (data: z.infer<typeof warrantSchema>) => {
    console.log("Warrant Issued:", data);
    alert(`Warrant for ${data.mda} issued successfully!`);
    warrantForm.reset();
  };

  const onAnomalySubmit = (data: z.infer<typeof anomalySchema>) => {
    console.log("Anomaly Registered:", data);
    alert(`Anomaly registered against ${data.offender} successfully!`);
    anomalyForm.reset();
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6 sm:space-y-8 pb-24">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 border-b border-border/50 pb-6 sm:pb-8">
        <div>
          <div className="flex items-center gap-3 text-primary mb-2">
            <Building className="size-5 sm:size-6" />
            <span className="font-black uppercase tracking-[0.2em] text-xs sm:text-sm">GDU Master Office</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">Central Data Management Command</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5 font-medium">Control hub for all system data, service requests, and site-wide content.</p>
        </div>
        <div className="flex gap-3 self-start sm:self-auto shrink-0">
          <Badge variant="outline" className="px-3 py-1.5 text-xs border-primary/50 text-primary bg-primary/10 font-bold uppercase tracking-widest">
            Level 5 Clearance
          </Badge>
        </div>
      </div>

      {/* Control Navigation */}
      <div className="flex gap-2 p-1.5 bg-muted/30 border border-border/50 rounded-xl overflow-x-auto w-full scrollbar-none">
        <button 
          onClick={() => setActiveTab('input')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-4 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 ${activeTab === 'input' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted/50 text-muted-foreground'}`}
        >
          <Database className="size-4" /> Global Data Input Hub
        </button>
        <button 
          onClick={() => setActiveTab('workflow')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-4 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 ${activeTab === 'workflow' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted/50 text-muted-foreground'}`}
        >
          <Workflow className="size-4" /> Service Request Workflow
        </button>
        <button 
          onClick={() => setActiveTab('cms')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-4 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 ${activeTab === 'cms' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted/50 text-muted-foreground'}`}
        >
          <FileEdit className="size-4" /> Master Content Editor
        </button>
        <button 
          onClick={() => setActiveTab('comms')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-4 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 ${activeTab === 'comms' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted/50 text-muted-foreground'}`}
        >
          <Network className="size-4" /> Cross-Dept Comms Log
        </button>
      </div>

      {/* Tab Content Areas */}
      <div className="mt-8">
        
        {/* TAB 1: Global Data Input Hub */}
        {activeTab === 'input' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold flex items-center gap-2"><Database className="size-6 text-primary" /> Core Data Ingestion</h2>
               <p className="text-muted-foreground font-medium text-sm">Data pushed here populates all maps, charts, and reports across the ERP.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Form Card 1 */}
              <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-emerald-500/5 border-b border-border/50">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Log New Project <Badge className="bg-emerald-500 hover:bg-emerald-600">Maps & GIS</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Project Title</label>
                      <Input placeholder="e.g., Eastern Bypass Construction" {...projectForm.register('title')} />
                      {projectForm.formState.errors.title && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3"/>{projectForm.formState.errors.title.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Coordinates / LGA</label>
                      <Input placeholder="Select target Local Govt..." {...projectForm.register('location')} />
                      {projectForm.formState.errors.location && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3"/>{projectForm.formState.errors.location.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Allocated Budget</label>
                      <Input type="number" placeholder="₦..." {...projectForm.register('budget')} disabled={isGovernor} />
                      {projectForm.formState.errors.budget && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3"/>{projectForm.formState.errors.budget.message}</p>}
                    </div>
                    {!isGovernor && <Button type="submit" className="w-full mt-4 gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"><Save className="size-4" /> Push to Database</Button>}
                  </form>
                </CardContent>
              </Card>

              {/* Form Card 2 */}
              <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-blue-500/5 border-b border-border/50">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Issue Financial Warrant <Badge className="bg-blue-500 hover:bg-blue-600">Treasury</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={warrantForm.handleSubmit(onWarrantSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Target MDA</label>
                      <Input placeholder="Select Ministry..." {...warrantForm.register('mda')} />
                      {warrantForm.formState.errors.mda && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3"/>{warrantForm.formState.errors.mda.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Release Amount</label>
                      <Input type="number" placeholder="₦..." {...warrantForm.register('amount')} />
                      {warrantForm.formState.errors.amount && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3"/>{warrantForm.formState.errors.amount.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Warrant Purpose</label>
                      <Textarea placeholder="Detail the specific project or operational cost..." className="h-10 min-h-0" {...warrantForm.register('purpose')} disabled={isGovernor} />
                      {warrantForm.formState.errors.purpose && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3"/>{warrantForm.formState.errors.purpose.message}</p>}
                    </div>
                    {!isGovernor && <Button type="submit" className="w-full mt-4 gap-2 font-bold bg-blue-600 hover:bg-blue-700 text-white"><Save className="size-4" /> Push to Database</Button>}
                  </form>
                </CardContent>
              </Card>

              {/* Form Card 3 */}
              <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-amber-500/5 border-b border-border/50">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Register Audit Anomaly <Badge className="bg-amber-500 hover:bg-amber-600">Audit Center</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={anomalyForm.handleSubmit(onAnomalySubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Severity Level</label>
                      <Input placeholder="Critical / High / Medium" {...anomalyForm.register('severity')} />
                      {anomalyForm.formState.errors.severity && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3"/>{anomalyForm.formState.errors.severity.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Offending MDA / Vendor</label>
                      <Input placeholder="Enter details..." {...anomalyForm.register('offender')} />
                      {anomalyForm.formState.errors.offender && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3"/>{anomalyForm.formState.errors.offender.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Flag Description</label>
                      <Textarea placeholder="Describe the anomaly..." className="h-10 min-h-0" {...anomalyForm.register('description')} disabled={isGovernor} />
                      {anomalyForm.formState.errors.description && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3"/>{anomalyForm.formState.errors.description.message}</p>}
                    </div>
                    {!isGovernor && <Button type="submit" className="w-full mt-4 gap-2 font-bold bg-amber-600 hover:bg-amber-700 text-white"><Save className="size-4" /> Push to Database</Button>}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: Service Request Workflow */}
        {activeTab === 'workflow' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[700px] flex flex-col">
            <div className="flex items-center justify-between mb-2">
               <h2 className="text-2xl font-bold flex items-center gap-2"><KanbanSquare className="size-6 text-primary" /> Service Request Kanban</h2>
               {!isGovernor && <Button variant="outline" className="gap-2 font-bold"><PlusCircle className="size-4" /> Create Manual Ticket</Button>}
            </div>
            
            <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
               {/* Column 1 */}
               <div className="w-96 shrink-0 bg-muted/20 rounded-2xl border border-border/50 flex flex-col">
                  <div className="p-4 border-b border-border/50 bg-background/50 rounded-t-2xl font-bold flex justify-between items-center">
                    <span>Incoming (Unassigned)</span>
                    <Badge variant="secondary">3</Badge>
                  </div>
                  <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                    <Card className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm">
                      <CardContent className="p-4 space-y-3">
                         <div className="flex justify-between items-start">
                           <Badge variant="outline" className="text-[10px]">REQ-099</Badge>
                           <Badge className="bg-red-500 hover:bg-red-600 text-[10px]">Urgent</Badge>
                         </div>
                         <p className="font-bold text-sm leading-tight">Request for Emergency Vehicle Deployment</p>
                         <p className="text-xs text-muted-foreground flex items-center gap-1"><Building className="size-3" /> Ministry of Health</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm">
                      <CardContent className="p-4 space-y-3">
                         <div className="flex justify-between items-start">
                           <Badge variant="outline" className="text-[10px]">REQ-098</Badge>
                         </div>
                         <p className="font-bold text-sm leading-tight">Timeline Extension Request: Dekina Road</p>
                         <p className="text-xs text-muted-foreground flex items-center gap-1"><Building className="size-3" /> Ministry of Works</p>
                      </CardContent>
                    </Card>
                  </div>
               </div>

               {/* Column 1.5: AI Escalations */}
               <div className="w-96 shrink-0 bg-amber-500/5 rounded-2xl border border-amber-500/20 flex flex-col">
                  <div className="p-4 border-b border-amber-500/20 bg-background/50 rounded-t-2xl font-bold flex justify-between items-center text-amber-800 dark:text-amber-500">
                    <span className="flex items-center gap-2">AI Escalations</span>
                    <Badge className="bg-amber-500 hover:bg-amber-600">1</Badge>
                  </div>
                  <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                    <Card className="cursor-grab active:cursor-grabbing border-amber-500/30 hover:border-amber-500 transition-colors shadow-md relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                      <CardContent className="p-4 space-y-3 pl-5">
                         <div className="flex justify-between items-start">
                           <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">TKT-8942-A</Badge>
                           <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 animate-pulse">Needs Response</span>
                         </div>
                         <p className="font-bold text-sm leading-tight text-foreground">Complex budget delay request requiring human review</p>
                         <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                           <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold uppercase tracking-wider">Source: Floating AI</p>
                           {!isGovernor && <Button size="sm" className="h-6 px-2 text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-bold">Reply to User</Button>}
                         </div>
                      </CardContent>
                    </Card>
                  </div>
               </div>

               {/* Column 2 */}
               <div className="w-96 shrink-0 bg-blue-500/5 rounded-2xl border border-blue-500/20 flex flex-col">
                  <div className="p-4 border-b border-blue-500/20 bg-background/50 rounded-t-2xl font-bold flex justify-between items-center text-blue-800 dark:text-blue-300">
                    <span>Under Review (GDU Active)</span>
                    <Badge className="bg-blue-500 hover:bg-blue-600">1</Badge>
                  </div>
                  <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                    <Card className="cursor-grab active:cursor-grabbing border-blue-500/30 hover:border-blue-500 transition-colors shadow-sm">
                      <CardContent className="p-4 space-y-3">
                         <div className="flex justify-between items-start">
                           <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-600">REQ-095</Badge>
                           <span className="text-[10px] font-bold text-blue-600">Reviewing Data</span>
                         </div>
                         <p className="font-bold text-sm leading-tight">Approval for Additional Vendor Bids</p>
                         <p className="text-xs text-muted-foreground flex items-center gap-1"><Building className="size-3" /> State Procurement Agency</p>
                      </CardContent>
                    </Card>
                  </div>
               </div>

               {/* Column 3 */}
               <div className="w-96 shrink-0 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 flex flex-col">
                  <div className="p-4 border-b border-emerald-500/20 bg-background/50 rounded-t-2xl font-bold flex justify-between items-center text-emerald-800 dark:text-emerald-300">
                    <span>Approved & Processed</span>
                    <Badge className="bg-emerald-500 hover:bg-emerald-600">12</Badge>
                  </div>
                  <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                     <p className="text-sm text-center text-muted-foreground mt-10 font-medium">12 requests processed this week. <br/><a href="#" className="text-emerald-600 hover:underline">View History</a></p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* TAB 3: Master Content Editor */}
        {activeTab === 'cms' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold flex items-center gap-2"><FileEdit className="size-6 text-primary" /> Dynamic Content Control</h2>
             </div>
             
             <Card className="border-border/60 shadow-sm max-w-4xl">
               <CardHeader className="bg-muted/5 border-b border-border/50">
                 <CardTitle>System-wide Greetings & Banners</CardTitle>
                 <CardDescription>Update the welcome messages and active alerts displayed to all state users.</CardDescription>
               </CardHeader>
               <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold">Global Dashboard Header Banner (Active)</label>
                    <div className="flex gap-2">
                       <Input defaultValue="Urgent: All MDAs must submit Q3 reconciliations by Friday." className="font-medium text-red-600" disabled={isGovernor} />
                       {!isGovernor && <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">Set Alert Color</Button>}
                    </div>
                  </div>
                  <div className="space-y-3 pt-6 border-t border-border/50">
                    <label className="text-sm font-bold">Custom "Good Morning" Prefix Override</label>
                    <div className="flex gap-2">
                       <Input defaultValue="Welcome to the GDU ERP," className="font-medium" disabled={isGovernor} />
                       {!isGovernor && <Button className="bg-primary text-primary-foreground font-bold px-8">Save Change</Button>}
                    </div>
                  </div>
               </CardContent>
             </Card>
          </div>
        )}

        {/* TAB 4: Cross-Dept Comms */}
        {activeTab === 'comms' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold flex items-center gap-2"><Network className="size-6 text-primary" /> Executive Dispatch Ledger</h2>
             </div>
             
             <Card className="border-border/60 shadow-sm max-w-5xl">
               <CardContent className="p-0 flex flex-col md:flex-row h-[500px]">
                  <div className="w-full md:w-1/3 border-r border-border/50 bg-muted/10 p-4 space-y-4">
                     <h3 className="font-bold uppercase text-xs tracking-wider text-muted-foreground">Issue New Directive</h3>
                     <div className="space-y-3">
                       <Input placeholder="Recipient Ministry..." className="bg-background" />
                       <Input placeholder="Directive Subject..." className="bg-background" disabled={isGovernor} />
                       <Textarea placeholder="Official directive contents..." className="bg-background h-32" disabled={isGovernor} />
                       {!isGovernor && <Button className="w-full gap-2 font-bold"><Send className="size-4" /> Dispatch Official Order</Button>}
                     </div>
                  </div>
                  <div className="w-full md:w-2/3 p-6 flex flex-col bg-slate-50 dark:bg-slate-900/50">
                     <h3 className="font-bold uppercase text-xs tracking-wider text-muted-foreground mb-4">Recent Dispatches</h3>
                     <div className="flex-1 space-y-4 overflow-y-auto">
                        <div className="p-4 bg-background border border-border/50 rounded-xl shadow-sm">
                           <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold">Mandatory IT Infrastructure Audit</h4>
                             <Badge className="bg-emerald-500">Acknowledged</Badge>
                           </div>
                           <p className="text-xs text-muted-foreground mb-2">To: All MDAs • Dispatched: 2 days ago</p>
                           <p className="text-sm leading-relaxed text-foreground/80">Please ensure all hardware procurement records from 2025 are available for the central audit team next week.</p>
                        </div>
                        <div className="p-4 bg-background border border-border/50 rounded-xl shadow-sm border-l-4 border-l-amber-500">
                           <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold">Halt on Capital Expenditure</h4>
                             <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/10">Pending Receipt (3)</Badge>
                           </div>
                           <p className="text-xs text-muted-foreground mb-2">To: Min. of Works, Min. of Transport • Dispatched: 4 hours ago</p>
                           <p className="text-sm leading-relaxed text-foreground/80">By order of the Governor, freeze all new capital drawdowns pending the outcome of the Q3 Treasury Review.</p>
                        </div>
                     </div>
                  </div>
               </CardContent>
             </Card>
          </div>
        )}

      </div>
    </div>
  );
}
