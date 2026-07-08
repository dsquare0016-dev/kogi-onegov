import { getPositionsList, getOrganizationsList, getStaffSearchableList, savePositionRecord, assignStaffToPosition } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Save, X, Loader2, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { SearchableSelect } from '@/components/SearchableSelect';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/positions/$action')({
  component: PositionActionPage,
});

const OFFICIAL_TITLES = [
  'His Excellency', 'Secretary to the State Government', 'Chief of Staff', 'Honourable Commissioner',
  'Permanent Secretary', 'Director General', 'Executive Secretary', 'Managing Director',
  'Executive Chairman', 'Director', 'Head of Department', 'Head of Unit',
  'Technical Assistant', 'Senior Special Assistant', 'Special Assistant', 'Desk Officer'
];

const ACCESS_LEVELS = [
  { id: 'super_admin', name: 'Super Admin' }, { id: 'governor', name: 'Governor' },
  { id: 'deputy_governor', name: 'Deputy Governor' }, { id: 'ssg', name: 'SSG' },
  { id: 'perm_secretary', name: 'Permanent Secretary' }, { id: 'commissioner', name: 'Commissioner' },
  { id: 'director', name: 'Director' }, { id: 'staff', name: 'Standard Staff' }
];

const SCOPES = ['Entire State', 'Own Ministry', 'Own Department', 'Own Agency', 'Restricted'];
const DASHBOARD_THEMES = ['Default', 'Dark', 'Light', 'Executive', 'Classic'];
const WORKFLOW_LEVELS = [1, 2, 3, 4, 5, 6, 7];
const STATUSES = ['Active', 'Inactive', 'Suspended'];

function PositionActionPage() {
  const { action } = Route.useParams();
  const session = getSession();

  if (session?.role !== 'super_admin') {
    return (
      <div className="p-6 max-w-[800px] mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
        <Lock className="size-16 text-rose-500 mb-4 opacity-80" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Restricted</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Only the Super Admin has clearance to configure official government positions. Please contact the administrator.
        </p>
      </div>
    );
  }

  const [positions, setPositions] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPosition, setSelectedPosition] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    const [pData, oData, sData] = await Promise.all([
      getPositionsList(),
      getOrganizationsList(),
      getStaffSearchableList()
    ]);
    setPositions(pData || []);
    setOrganizations(oData || []);
    setStaffList(sData || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const actionTitle = action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const isDelete = action === 'delete';
  const isCreate = action === 'create';

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading forms panel...</p>
      </div>
    );
  }

  if (isCreate) {
    return <PositionForm 
             mode="create" 
             organizations={organizations} 
             positions={positions} 
             staffList={staffList} 
             onSave={() => loadData()}
           />;
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 pb-24 relative text-foreground">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{actionTitle} Position</h1>
        <p className="text-muted-foreground mt-1">Select a position card below to perform the {actionTitle} action.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-700">
        {positions.map(p => {
          const isVacant = p.vacancy_status === 'vacant';
          return (
            <Card key={p.id} className="border-border/60 bg-card shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-primary/50" onClick={() => setSelectedPosition(p)}>
              <CardHeader className="p-4 border-b border-border/30 flex flex-row justify-between items-start">
                <div>
                  <div className="font-bold text-sm leading-tight">{p.office_name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">{p.official_title}</div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  isVacant ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {p.vacancy_status}
                </span>
              </CardHeader>
              <CardContent className="p-4 text-xs text-muted-foreground">
                <div>Occupant: <span className="font-bold text-foreground">{p.occupant_name || 'Vacant'}</span></div>
                <div className="mt-1">Organization: <span className="text-foreground">{p.organization_name || 'State Govt'}</span></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl border-border/60 bg-card shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between sticky top-0 bg-background z-10 bg-muted/10 shrink-0">
              <div>
                <CardTitle className="flex items-center gap-2 font-black">
                  <Briefcase className="size-5 text-primary" />
                  {actionTitle}: {selectedPosition.office_name}
                </CardTitle>
                <CardDescription className="text-xs">Detailed position alignment and staff assignment.</CardDescription>
              </div>
              <button onClick={() => setSelectedPosition(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="size-5 text-muted-foreground" /></button>
            </CardHeader>

            <div className="overflow-y-auto p-0 flex-1">
              {!isDelete ? (
                <PositionForm 
                  mode="edit" 
                  initialData={selectedPosition}
                  organizations={organizations} 
                  positions={positions} 
                  staffList={staffList} 
                  onSave={() => { setSelectedPosition(null); loadData(); }}
                />
              ) : (
                <div className="p-6">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm font-semibold">
                    Are you sure you want to permanently delete the position configuration for "{selectedPosition.office_name}"?
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                     <button onClick={() => setSelectedPosition(null)} className="px-4 py-2 border border-border bg-background rounded-md text-sm font-semibold">Cancel</button>
                     <button onClick={() => { alert("Delete operation is not permitted on seeded master positions."); setSelectedPosition(null); }} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-semibold">Confirm Delete</button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function PositionForm({ mode, initialData, organizations, positions, staffList, onSave }: any) {
  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    officialTitle: initialData?.official_title || 'Director',
    officeName: initialData?.office_name || '',
    orgId: initialData?.org_id || null,
    accessLevel: initialData?.access_level || 'staff',
    dashboard: initialData?.dashboard || 'mda',
    dashboardTheme: initialData?.dashboard_theme || 'Default',
    approvalAuthority: initialData?.approval_authority || false,
    workflowLevel: initialData?.workflow_level || 1,
    maxApprovalAmount: initialData?.max_approval_amount || '',
    scope: initialData?.scope || 'Own Department',
    reportingLine: initialData?.reporting_line || null,
    supervises: initialData?.supervises || [],
    permissions: initialData?.permissions || [],
    notificationAccess: initialData?.notification_access || [],
    aiAccess: initialData?.ai_access || [],
    status: initialData?.status || 'Active',
    occupantId: initialData?.current_occupant_id || null,
    bypassCrossOrg: false,
    bypassHierarchy: false
  });

  const updateField = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleCheckboxToggle = (listField: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const list = (prev as any)[listField] as string[];
      if (checked) {
        return { ...prev, [listField]: [...list, value] };
      } else {
        return { ...prev, [listField]: list.filter(item => item !== value) };
      }
    });
  };

  const handleSave = async () => {
    if (!formData.officeName.trim()) {
      toast.error("Office/Position name is required");
      return;
    }
    
    try {
      await savePositionRecord({
        data: {
          ...formData,
          vacancyStatus: formData.occupantId ? 'occupied' : 'vacant',
          maxApprovalAmount: formData.maxApprovalAmount ? parseFloat(formData.maxApprovalAmount) : null
        }
      });

      if (mode === 'edit' && formData.occupantId !== initialData?.current_occupant_id) {
        await assignStaffToPosition({
          data: {
            positionId: formData.id,
            userId: formData.occupantId,
            reason: 'Administrative reassignment'
          }
        });
      }

      toast.success(`Position ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      if (mode === 'create') {
        window.location.href = '/dashboard/positions';
      } else {
        onSave();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save position");
    }
  };

  const reportingOptions = positions
    .filter(p => formData.bypassCrossOrg || p.org_id === formData.orgId)
    .map(p => ({
      id: p.id,
      name: `${p.office_name} — ${p.organization_name || 'Unknown MDA'}`,
      subtext: `Level ${p.workflow_level || 1} • ${p.official_title}`
    }));

  return (
    <div className={mode === 'create' ? "p-6 max-w-[1000px] mx-auto space-y-6 pb-24 text-foreground" : "p-6 space-y-6 text-foreground"}>
      {mode === 'create' && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Position</h1>
          <p className="text-muted-foreground mt-1">Configure a new official role and reporting hierarchy.</p>
        </div>
      )}

      {/* 1. Basic Position Details */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Basic Position Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Official Title</label>
            <select value={formData.officialTitle} onChange={e => updateField('officialTitle', e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none">
              {OFFICIAL_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Office Name (Detailed Title)</label>
            <input type="text" value={formData.officeName} onChange={e => updateField('officeName', e.target.value)} placeholder="e.g. Commissioner for Agriculture" className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Organization & Dashboard */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Organization & Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Assigned Organization / MDA</label>
            <SearchableSelect
              options={organizations.map(o => ({ id: o.id, name: o.name, subtext: o.type }))}
              value={formData.orgId} onChange={val => updateField('orgId', val)} placeholder="Select Supervising Ministry, Agency or Office"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Access Permission Level</label>
              <select value={formData.accessLevel} onChange={e => updateField('accessLevel', e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none">
                {ACCESS_LEVELS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Assigned Dashboard</label>
              <select value={formData.dashboard} onChange={e => updateField('dashboard', e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none">
                <option value="governor">Governor Portal</option>
                <option value="ssg">SSG/COS Portal</option>
                <option value="mda">Standard MDA Portal</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Dashboard Theme</label>
              <select value={formData.dashboardTheme} onChange={e => updateField('dashboardTheme', e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none">
                {DASHBOARD_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Hierarchy & Workflow */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Hierarchy & Workflow</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-col gap-1">
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase">Reports To</label>
                <div className="flex items-center gap-1.5">
                   <input type="checkbox" id="bypassCross" checked={formData.bypassCrossOrg} onChange={e => updateField('bypassCrossOrg', e.target.checked)} className="rounded" />
                   <label htmlFor="bypassCross" className="text-[10px] uppercase font-bold text-rose-500 cursor-pointer">Show Cross-Organization</label>
                </div>
             </div>
             <SearchableSelect
                options={reportingOptions}
                value={formData.reportingLine} onChange={val => updateField('reportingLine', val)} placeholder="Select Superior Position"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="space-y-1.5">
               <label className="text-xs font-bold text-muted-foreground uppercase">Workflow Level</label>
               <select value={formData.workflowLevel} onChange={e => updateField('workflowLevel', parseInt(e.target.value))} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none">
                 {WORKFLOW_LEVELS.map(l => <option key={l} value={l}>Level {l}</option>)}
               </select>
             </div>
             <div className="space-y-1.5">
               <label className="text-xs font-bold text-muted-foreground uppercase">Max Approval Amount (₦)</label>
               <input type="number" value={formData.maxApprovalAmount} onChange={e => updateField('maxApprovalAmount', e.target.value)} placeholder="Leave blank for unlimited" className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none" />
             </div>
             <div className="flex items-center gap-2 pt-6">
               <input type="checkbox" id="auth" checked={formData.approvalAuthority} onChange={e => updateField('approvalAuthority', e.target.checked)} className="rounded border-border text-primary focus:ring-primary size-4" />
               <label htmlFor="auth" className="text-sm font-semibold cursor-pointer">Has Approval Authority</label>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Permissions */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">System Permissions</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
           <div className="space-y-1.5 w-1/3">
             <label className="text-xs font-bold text-muted-foreground uppercase">Scope of Access</label>
             <select value={formData.scope} onChange={e => updateField('scope', e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none">
               {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
             {['approve', 'create', 'edit', 'delete'].map(action => (
               <div key={action} className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-foreground">Can {action}</h4>
                  {['Projects', 'Budgets', 'Leave', 'Memos', 'Staff'].map(resource => {
                    const permString = `${action}:${resource.toLowerCase()}`;
                    return (
                      <div key={permString} className="flex items-center gap-2">
                        <input type="checkbox" id={permString} checked={formData.permissions.includes(permString)} onChange={e => handleCheckboxToggle('permissions', permString, e.target.checked)} className="rounded" />
                        <label htmlFor={permString} className="text-xs cursor-pointer">{resource}</label>
                      </div>
                    );
                  })}
               </div>
             ))}
           </div>
        </CardContent>
      </Card>

      {/* 5. Notifications & AI */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Notifications & AI Access</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <h4 className="text-xs font-bold uppercase text-foreground">Notifications</h4>
             {['Memo Alerts', 'Budget Alerts', 'Leave Requests', 'System Updates'].map(n => (
                <div key={n} className="flex items-center gap-2">
                  <input type="checkbox" id={`n_${n}`} checked={formData.notificationAccess.includes(n)} onChange={e => handleCheckboxToggle('notificationAccess', n, e.target.checked)} className="rounded" />
                  <label htmlFor={`n_${n}`} className="text-xs cursor-pointer">{n}</label>
                </div>
             ))}
           </div>
           <div className="space-y-2">
             <h4 className="text-xs font-bold uppercase text-foreground">AI Capabilities</h4>
             {['Generate Reports', 'Summarize Documents', 'Draft Memos', 'Data Insights'].map(ai => (
                <div key={ai} className="flex items-center gap-2">
                  <input type="checkbox" id={`ai_${ai}`} checked={formData.aiAccess.includes(ai)} onChange={e => handleCheckboxToggle('aiAccess', ai, e.target.checked)} className="rounded" />
                  <label htmlFor={`ai_${ai}`} className="text-xs cursor-pointer">{ai}</label>
                </div>
             ))}
           </div>
        </CardContent>
      </Card>

      {/* 6. Status and Occupant (Edit Mode Only) */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Operational Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-1.5 w-1/3">
             <label className="text-xs font-bold text-muted-foreground uppercase">Position Status</label>
             <select value={formData.status} onChange={e => updateField('status', e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none">
               {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
          {mode === 'edit' && (
            <div className="pt-2 border-t border-border/50 mt-4">
              <h4 className="text-xs font-bold uppercase text-primary tracking-wider mb-2">Office Occupant (Staff Selection)</h4>
              <SearchableSelect
                options={[
                  { id: '', name: 'Leave Vacant (Remove Occupant)' },
                  ...staffList.map(s => ({ id: s.userId, name: s.name, subtext: `${s.staffId} • ${s.mda}` }))
                ]}
                value={formData.occupantId || ''}
                onChange={val => updateField('occupantId', val || null)}
                placeholder="Select registered staff member"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="pt-4 flex justify-end gap-3">
         {mode === 'edit' && <button onClick={() => onSave()} className="px-4 py-2 border border-border bg-background rounded-md text-sm font-semibold hover:bg-muted transition-colors cursor-pointer">Cancel</button>}
         <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer">
           <Save className="size-4" /> {mode === 'create' ? 'Create Position' : 'Save Changes'}
         </button>
      </div>
    </div>
  );
}
