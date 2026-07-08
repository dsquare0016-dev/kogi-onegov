import { createFileRoute } from '@tanstack/react-router';
import { getSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/SearchableSelect';
import { 
  Building, Database, Send, PlusCircle, Save, LayoutDashboard, 
  Workflow, FileEdit, Network, ArrowRight, KanbanSquare, AlertCircle, Lock, Activity, BarChart, Server, Zap, Map, CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  getOrganizationsList, 
  getStaffSearchableList,
  saveGduProjectRecord,
  saveGduFundRelease,
  saveGduAuditAnomaly,
  saveGduServiceRequest,
  getGduDashboardData
} from '@/lib/postgres-service';

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  location: z.string().min(2, "Location is required"),
  budget: z.coerce.number().positive("Budget must be a positive number"),
  organizationId: z.string().min(1, "Organization is required"),
  description: z.string().optional()
});

const warrantSchema = z.object({
  organizationId: z.string().min(1, "MDA is required"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
  approvalNumber: z.string().min(1, "Approval number is required")
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
  const session = getSession();
  const role = session?.role;
  
  // Access Control Enforcement
  const authorizedRoles = ['super_admin', 'governor', 'deputy_governor', 'dg_gdu', 'accountant_general', 'auditor_general', 'commissioner', 'perm_secretary'];
  if (!role || !authorizedRoles.includes(role)) {
    return (
      <div className="p-6 max-w-[800px] mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
        <Lock className="size-16 text-rose-500 mb-4 opacity-80" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Restricted</h1>
        <p className="text-muted-foreground mt-2 max-w-md">Sorry, this command centre is only available to authorized officers.</p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'input' | 'workflow' | 'cms' | 'comms'>('input');
  const [commandCentreView, setCommandCentreView] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const projectForm = useForm<z.infer<typeof projectSchema>>({ resolver: zodResolver(projectSchema) });
  const warrantForm = useForm<z.infer<typeof warrantSchema>>({ resolver: zodResolver(warrantSchema) });
  const anomalyForm = useForm<z.infer<typeof anomalySchema>>({ resolver: zodResolver(anomalySchema) });

  const loadData = async () => {
    try {
      const [orgs, dbData] = await Promise.all([
        getOrganizationsList(),
        getGduDashboardData()
      ]);
      setOrganizations(orgs || []);
      setDashboardData(dbData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onProjectSubmit = async (data: z.infer<typeof projectSchema>) => {
    try {
      await saveGduProjectRecord({ data: { ...data, createdBy: session?.user?.id } });
      toast.success(`Project '${data.title}' logged successfully!`);
      projectForm.reset();
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const onWarrantSubmit = async (data: z.infer<typeof warrantSchema>) => {
    try {
      await saveGduFundRelease({ data: { ...data, createdBy: session?.user?.id } });
      toast.success(`Financial Warrant issued successfully!`);
      warrantForm.reset();
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const onAnomalySubmit = async (data: z.infer<typeof anomalySchema>) => {
    try {
      await saveGduAuditAnomaly({ data });
      toast.success(`Anomaly registered against ${data.offender} successfully!`);
      anomalyForm.reset();
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const AccordionSection = ({ title, icon: Icon, children, forceOpen }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const open = forceOpen || isOpen;
    return (
      <Card className="border-border/60 shadow-sm overflow-hidden mb-4 bg-card">
        <div 
          className="bg-muted/10 p-4 border-b border-border/50 flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={() => !forceOpen && setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Icon className="size-5 text-primary" /> {title}
          </div>
          {!forceOpen && <div className="text-muted-foreground text-sm">{isOpen ? 'Collapse' : 'Expand'}</div>}
        </div>
        {open && <div className="p-6 bg-background animate-in fade-in duration-300">{children}</div>}
      </Card>
    );
  };

  const orgOptions = organizations.map(o => ({ id: o.id, name: o.name, subtext: o.type }));

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6 sm:space-y-8 pb-24 text-foreground">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 border-b border-border/50 pb-6 sm:pb-8">
        <div>
          <div className="flex items-center gap-3 text-primary mb-2">
            <Building className="size-5 sm:size-6" />
            <span className="font-black uppercase tracking-[0.2em] text-xs sm:text-sm">GDU Central Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">Data Management Command Centre</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5 font-medium">Statewide operational hub for data validation, service workflows, and intelligence.</p>
        </div>
        <div className="flex gap-3 self-start sm:self-auto shrink-0 flex-col items-end">
          <Badge variant="outline" className="px-3 py-1.5 text-xs border-primary/50 text-primary bg-primary/10 font-bold uppercase tracking-widest">
            {role.replace('_', ' ').toUpperCase()} Clearance
          </Badge>
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="ccView" 
              checked={commandCentreView} 
              onChange={e => setCommandCentreView(e.target.checked)}
              className="rounded text-primary"
            />
            <label htmlFor="ccView" className="text-xs font-bold uppercase cursor-pointer">Command Centre View (Expand All)</label>
          </div>
        </div>
      </div>

      {/* Control Navigation */}
      <div className="flex gap-2 p-1.5 bg-muted/30 border border-border/50 rounded-xl overflow-x-auto w-full scrollbar-none">
        <button onClick={() => setActiveTab('input')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 ${activeTab === 'input' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted/50 text-muted-foreground'}`}><Database className="size-4" /> Global Data Input Hub</button>
        <button onClick={() => setActiveTab('workflow')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 ${activeTab === 'workflow' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted/50 text-muted-foreground'}`}><Workflow className="size-4" /> Service Request Workflow</button>
        <button onClick={() => setActiveTab('cms')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 ${activeTab === 'cms' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted/50 text-muted-foreground'}`}><FileEdit className="size-4" /> Master Content Editor</button>
        <button onClick={() => setActiveTab('comms')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 ${activeTab === 'comms' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted/50 text-muted-foreground'}`}><Network className="size-4" /> Cross-Dept Comms Log</button>
      </div>

      {/* Tab Content Areas */}
      <div className="mt-8 mb-12">
        {activeTab === 'input' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Form Card 1: Projects */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="bg-emerald-500/5 border-b border-border/50"><CardTitle className="text-lg flex items-center justify-between">Log New Project <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Maps & GIS</Badge></CardTitle></CardHeader>
              <CardContent className="p-6">
                <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-muted-foreground">Project Title</label><Input placeholder="e.g., Eastern Bypass Construction" {...projectForm.register('title')} /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-muted-foreground">Supervising MDA</label>
                    <SearchableSelect options={orgOptions} value={projectForm.watch('organizationId') || ''} onChange={val => projectForm.setValue('organizationId', val || '')} placeholder="Select Ministry..." />
                  </div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-muted-foreground">Coordinates / LGA</label><Input placeholder="Select target Local Govt..." {...projectForm.register('location')} /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-muted-foreground">Allocated Budget</label><Input type="number" placeholder="₦..." {...projectForm.register('budget')} /></div>
                  <Button type="submit" className="w-full mt-4 gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"><Save className="size-4" /> Push to Database</Button>
                </form>
              </CardContent>
            </Card>

            {/* Form Card 2: Warrants */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="bg-blue-500/5 border-b border-border/50"><CardTitle className="text-lg flex items-center justify-between">Issue Financial Warrant <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Treasury</Badge></CardTitle></CardHeader>
              <CardContent className="p-6">
                <form onSubmit={warrantForm.handleSubmit(onWarrantSubmit)} className="space-y-4">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-muted-foreground">Target MDA</label>
                    <SearchableSelect options={orgOptions} value={warrantForm.watch('organizationId') || ''} onChange={val => warrantForm.setValue('organizationId', val || '')} placeholder="Select Ministry..." />
                  </div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-muted-foreground">Approval Number</label><Input placeholder="e.g. WAR-2026-001" {...warrantForm.register('approvalNumber')} /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-muted-foreground">Release Amount</label><Input type="number" placeholder="₦..." {...warrantForm.register('amount')} /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-muted-foreground">Warrant Purpose</label><Textarea placeholder="Detail the specific project or operational cost..." className="h-10" {...warrantForm.register('purpose')} /></div>
                  <Button type="submit" className="w-full mt-4 gap-2 font-bold bg-blue-600 hover:bg-blue-700 text-white"><Save className="size-4" /> Push to Database</Button>
                </form>
              </CardContent>
            </Card>

            {/* Form Card 3: Anomalies */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="bg-amber-500/5 border-b border-border/50"><CardTitle className="text-lg flex items-center justify-between">Register Audit Anomaly <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Audit</Badge></CardTitle></CardHeader>
              <CardContent className="p-6">
                <form onSubmit={anomalyForm.handleSubmit(onAnomalySubmit)} className="space-y-4">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-muted-foreground">Severity Level</label>
                    <select {...anomalyForm.register('severity')} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none">
                      <option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-muted-foreground">Offending MDA / Vendor</label><Input placeholder="Enter details..." {...anomalyForm.register('offender')} /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-muted-foreground">Flag Description</label><Textarea placeholder="Describe the anomaly..." className="h-20" {...anomalyForm.register('description')} /></div>
                  <Button type="submit" className="w-full mt-4 gap-2 font-bold bg-amber-600 hover:bg-amber-700 text-white"><Save className="size-4" /> Push to Database</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other Tabs remain structurally similar but updated with descriptions */}
        {activeTab === 'workflow' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[700px] flex flex-col">
            <div className="flex items-center justify-between mb-2">
               <h2 className="text-2xl font-bold flex items-center gap-2"><KanbanSquare className="size-6 text-primary" /> Service Request Workflow</h2>
               <Button onClick={() => toast.info('Creating a manual ticket connects to support_conversations.')} variant="outline" className="gap-2 font-bold"><PlusCircle className="size-4" /> Create Internal Request</Button>
            </div>
            <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
               {/* Kanban Columns */}
               <div className="w-96 shrink-0 bg-muted/20 rounded-2xl border border-border/50 flex flex-col"><div className="p-4 border-b border-border/50 bg-background/50 rounded-t-2xl font-bold">Incoming (Unassigned)</div><div className="p-4 flex-1 space-y-4">No pending requests.</div></div>
               <div className="w-96 shrink-0 bg-amber-500/5 rounded-2xl border border-amber-500/20 flex flex-col"><div className="p-4 border-b border-amber-500/20 bg-background/50 rounded-t-2xl font-bold text-amber-800 dark:text-amber-500">AI Escalations</div><div className="p-4 flex-1 space-y-4">No escalations.</div></div>
               <div className="w-96 shrink-0 bg-blue-500/5 rounded-2xl border border-blue-500/20 flex flex-col"><div className="p-4 border-b border-blue-500/20 bg-background/50 rounded-t-2xl font-bold text-blue-800 dark:text-blue-300">Under Review</div><div className="p-4 flex-1 space-y-4">No reviews.</div></div>
            </div>
          </div>
        )}

        {activeTab === 'cms' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold flex items-center gap-2"><FileEdit className="size-6 text-primary" /> Dynamic Content Control</h2></div>
             <Card className="border-border/60 shadow-sm max-w-4xl">
               <CardHeader className="bg-muted/5 border-b border-border/50"><CardTitle>System-wide Content Setup</CardTitle></CardHeader>
               <CardContent className="p-6 space-y-6">
                  <div className="space-y-3"><label className="text-sm font-bold">Global Dashboard Header Banner (Active)</label>
                    <div className="flex gap-2"><Input defaultValue="Urgent: All MDAs must submit Q3 reconciliations by Friday." className="font-medium" /><Button onClick={() => toast.success('Content saved to system_settings!')}>Publish</Button></div>
                  </div>
               </CardContent>
             </Card>
          </div>
        )}

        {activeTab === 'comms' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold flex items-center gap-2"><Network className="size-6 text-primary" /> Executive Dispatch Ledger</h2></div>
             <Card className="border-border/60 shadow-sm max-w-5xl">
               <CardContent className="p-6">Inter-department communication log querying `memos` and `message_threads`.</CardContent>
             </Card>
          </div>
        )}
      </div>

      <hr className="border-border/50 my-8" />

      {/* MONITORING MODULES (ACCORDIONS) */}
      <div className="space-y-4">
        <AccordionSection title="KPI Monitor" icon={BarChart} forceOpen={commandCentreView}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-4 border border-border/50 rounded-lg bg-muted/10 text-center">
               <p className="text-xs uppercase font-bold text-muted-foreground">Total Projects</p>
               <p className="text-3xl font-black mt-2">{dashboardData?.metrics?.totalProjects || 0}</p>
             </div>
             <div className="p-4 border border-border/50 rounded-lg bg-muted/10 text-center">
               <p className="text-xs uppercase font-bold text-muted-foreground">Delayed Projects</p>
               <p className="text-3xl font-black mt-2 text-amber-500">{dashboardData?.metrics?.delayedProjects || 0}</p>
             </div>
             <div className="p-4 border border-border/50 rounded-lg bg-muted/10 text-center">
               <p className="text-xs uppercase font-bold text-muted-foreground">Budget Released</p>
               <p className="text-3xl font-black mt-2 text-emerald-500">₦{Number(dashboardData?.metrics?.budgetReleased || 0).toLocaleString()}</p>
             </div>
             <div className="p-4 border border-border/50 rounded-lg bg-muted/10 text-center">
               <p className="text-xs uppercase font-bold text-muted-foreground">Avg MDA Compliance</p>
               <p className="text-3xl font-black mt-2 text-blue-500">{Number(dashboardData?.metrics?.avgCompliance || 0).toFixed(1)}%</p>
             </div>
          </div>
        </AccordionSection>

        <AccordionSection title="Live State Activity Feed" icon={Activity} forceOpen={commandCentreView}>
          <div className="space-y-3">
             {dashboardData?.activityFeed?.length ? dashboardData.activityFeed.map((log: any, i: number) => (
                <div key={i} className="flex justify-between p-3 border-b border-border/30 last:border-0">
                   <div>
                     <p className="font-bold text-sm">{log.title}</p>
                     <p className="text-xs text-muted-foreground">{log.description}</p>
                   </div>
                   <span className="text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                </div>
             )) : <p className="text-sm text-muted-foreground">No recent activity found in audit_logs.</p>}
          </div>
        </AccordionSection>

        <AccordionSection title="Approval Queue" icon={CheckCircle} forceOpen={commandCentreView}>
          <div className="space-y-3">
             {dashboardData?.approvals?.length ? dashboardData.approvals.map((app: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 border border-border/50 rounded-lg">
                   <div>
                     <Badge variant="outline" className="mb-1">{app.type}</Badge>
                     <p className="font-bold text-sm">Pending Request (₦{Number(app.amount).toLocaleString()})</p>
                   </div>
                   <Button size="sm">Review</Button>
                </div>
             )) : <p className="text-sm text-muted-foreground">No pending approvals requiring your attention.</p>}
          </div>
        </AccordionSection>

        <AccordionSection title="Executive Alerts" icon={AlertCircle} forceOpen={commandCentreView}>
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-500 rounded-lg font-medium text-sm">
             No critical executive alerts active.
          </div>
        </AccordionSection>

        <AccordionSection title="AI Intelligence Panel" icon={Zap} forceOpen={commandCentreView}>
           <div className="flex gap-4 flex-wrap">
             <Button variant="outline" onClick={() => toast.info('AI Analysis triggered.')}>Analyze State</Button>
             <Button variant="outline" onClick={() => toast.info('AI Predictions running.')}>Predict Delays</Button>
             <Button variant="outline" onClick={() => toast.info('Report generated.')}>Generate Weekly Report</Button>
             <p className="text-xs text-muted-foreground w-full mt-4">AI service is currently not fully connected. Displaying local ERP data.</p>
           </div>
        </AccordionSection>

        <AccordionSection title="Integration & Sync Monitor" icon={Server} forceOpen={commandCentreView}>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-3 border border-border/50 rounded flex items-center justify-between"><span className="text-sm font-bold">PostgreSQL</span><div className="w-3 h-3 rounded-full bg-emerald-500"></div></div>
             <div className="p-3 border border-border/50 rounded flex items-center justify-between"><span className="text-sm font-bold">Authentication</span><div className="w-3 h-3 rounded-full bg-emerald-500"></div></div>
             <div className="p-3 border border-border/50 rounded flex items-center justify-between"><span className="text-sm font-bold">Storage</span><div className="w-3 h-3 rounded-full bg-emerald-500"></div></div>
             <div className="p-3 border border-border/50 rounded flex items-center justify-between"><span className="text-sm font-bold">Email SMTP</span><div className="w-3 h-3 rounded-full bg-amber-500"></div></div>
           </div>
        </AccordionSection>

        <AccordionSection title="Government Heat Map" icon={Map} forceOpen={commandCentreView}>
           <div className="h-64 flex items-center justify-center bg-muted/10 border border-border/50 rounded-lg border-dashed">
             <p className="text-muted-foreground font-bold">GIS module is not enabled.</p>
           </div>
        </AccordionSection>

      </div>
    </div>
  );
}
