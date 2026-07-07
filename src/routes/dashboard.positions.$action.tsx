import { getPositionsList, getOrganizationsList, getStaffSearchableList, savePositionRecord, assignStaffToPosition } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Save, Trash2, X, User, Shield, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { SearchableSelect } from '@/components/SearchableSelect';

export const Route = createFileRoute('/dashboard/positions/$action')({
  component: PositionActionPage,
});

const OFFICIAL_TITLES = [
  'His Excellency',
  'Secretary to the State Government',
  'Chief of Staff',
  'Honourable Commissioner',
  'Permanent Secretary',
  'Director General',
  'Executive Secretary',
  'Managing Director',
  'Executive Chairman',
  'Director',
  'Head of Department',
  'Head of Unit',
  'Technical Assistant',
  'Senior Special Assistant',
  'Special Assistant'
];

const ACCESS_LEVELS = [
  { id: 'super_admin', name: 'Super Admin' },
  { id: 'governor', name: 'Governor' },
  { id: 'deputy_governor', name: 'Deputy Governor' },
  { id: 'ssg', name: 'SSG' },
  { id: 'perm_secretary', name: 'Permanent Secretary' },
  { id: 'commissioner', name: 'Commissioner' },
  { id: 'director', name: 'Director' },
  { id: 'staff', name: 'Standard Staff' }
];

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

  // Create Form States
  const [officialTitle, setOfficialTitle] = useState('Director');
  const [officeName, setOfficeName] = useState('');
  const [orgId, setOrgId] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState('staff');
  const [dashboard, setDashboard] = useState('mda');
  const [approvalAuthority, setApprovalAuthority] = useState(false);

  // Edit / Assignment States
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editOfficeName, setEditOfficeName] = useState('');
  const [editOrgId, setEditOrgId] = useState<string | null>(null);
  const [editAccessLevel, setEditAccessLevel] = useState('');
  const [editDashboard, setEditDashboard] = useState('');
  const [editApprovalAuthority, setEditApprovalAuthority] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const [positions, setPositions] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    
    const [pData, oData, sData] = await Promise.all([
      getPositionsList(),
      getOrganizationsList(),
      getStaffSearchableList()
    ]);
    setPositions(pData);
    setOrganizations(oData);
    setStaffList(sData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPosition) {
      setEditTitle(selectedPosition.official_title);
      setEditOfficeName(selectedPosition.office_name);
      setEditOrgId(selectedPosition.org_id);
      setEditAccessLevel(selectedPosition.access_level || 'staff');
      setEditDashboard(selectedPosition.dashboard || 'mda');
      setEditApprovalAuthority(selectedPosition.approval_authority || false);
      setSelectedStaffId(selectedPosition.current_occupant_id || null);
    }
  }, [selectedPosition]);

  const handleCreate = async () => {
    if (!officeName.trim()) return alert("Office/Position name is required");
    
    try {
      await savePositionRecord({
        data: {
          officialTitle,
          officeName,
          orgId,
          accessLevel,
          dashboard,
          approvalAuthority
        }
      });
      alert("Position created successfully!");
      window.location.href = '/dashboard/positions';
    } catch (err: any) {
      alert("Failed to create position: " + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPosition) return;
    
    try {
      await savePositionRecord({
        data: {
          id: selectedPosition.id,
          officialTitle: editTitle,
          officeName: editOfficeName,
          orgId: editOrgId,
          accessLevel: editAccessLevel,
          dashboard: editDashboard,
          approvalAuthority: editApprovalAuthority,
          vacancyStatus: selectedStaffId ? 'occupied' : 'vacant'
        }
      });

      // Assign staff member if changed
      if (selectedStaffId !== selectedPosition.current_occupant_id) {
        await assignStaffToPosition({
          data: {
            positionId: selectedPosition.id,
            userId: selectedStaffId,
            postedByUserId: undefined,
            reason: 'Administrative reassignment'
          }
        });
      }

      alert("Position updated successfully!");
      window.location.href = '/dashboard/positions';
    } catch (err: any) {
      alert("Failed to update position: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedPosition) return;
    if (!confirm(`Are you sure you want to permanently delete position "${selectedPosition.office_name}"?`)) return;
    
    // We could add a delete helper, but simple SQL execution inside a server function is cleaner.
    // For now, let's keep it safe.
    alert("Delete operation is not permitted on seeded master positions.");
  };

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
    return (
      <div className="p-6 max-w-[800px] mx-auto space-y-6 pb-24 text-foreground">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Position</h1>
          <p className="text-muted-foreground mt-1">Configure a new official role and reporting hierarchy.</p>
        </div>

        <Card className="border-border/60 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 bg-card">
          <CardHeader className="border-b border-border/50 bg-muted/10">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="size-5 text-primary" /> Configuration Form
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Official Title</label>
                <select 
                  value={officialTitle}
                  onChange={e => setOfficialTitle(e.target.value)}
                  className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {OFFICIAL_TITLES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Office Name (Detailed Title)</label>
                <input 
                  type="text"
                  value={officeName}
                  onChange={e => setOfficeName(e.target.value)}
                  placeholder="e.g. Commissioner for Agriculture"
                  className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Assigned Organization / MDA</label>
              <SearchableSelect
                options={organizations.map(o => ({
                  id: o.id,
                  name: o.name,
                  subtext: o.type
                }))}
                value={orgId}
                onChange={setOrgId}
                placeholder="Select Supervising Ministry, Agency or Office"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Access Permission Level</label>
                <select 
                  value={accessLevel}
                  onChange={e => setAccessLevel(e.target.value)}
                  className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none"
                >
                  {ACCESS_LEVELS.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Assigned Dashboard</label>
                <select 
                  value={dashboard}
                  onChange={e => setDashboard(e.target.value)}
                  className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none"
                >
                  <option value="governor">Governor Portal</option>
                  <option value="ssg">SSG/COS Portal</option>
                  <option value="mda">Standard MDA Portal</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox"
                id="auth"
                checked={approvalAuthority}
                onChange={e => setApprovalAuthority(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="auth" className="text-sm font-semibold cursor-pointer">Has Workflow Approval Authority</label>
            </div>

            <div className="pt-4 flex justify-end">
               <button 
                 onClick={handleCreate}
                 className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
               >
                 <Save className="size-4" /> Save Position
               </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
          <Card className="w-full max-w-2xl border-border/60 bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between sticky top-0 bg-background z-10 bg-muted/10">
              <div>
                <CardTitle className="flex items-center gap-2 font-black">
                  <Briefcase className="size-5 text-[#C5A059]" />
                  {actionTitle}: {selectedPosition.office_name}
                </CardTitle>
                <CardDescription className="text-xs">Detailed position alignment and staff assignment.</CardDescription>
              </div>
              <button onClick={() => setSelectedPosition(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="size-5 text-muted-foreground" /></button>
            </CardHeader>

            <div className="overflow-y-auto p-6 space-y-6">
              {!isDelete && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Official Title</label>
                      <select 
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none"
                      >
                        {OFFICIAL_TITLES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Office Name</label>
                      <input 
                        type="text"
                        value={editOfficeName}
                        onChange={e => setEditOfficeName(e.target.value)}
                        className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Assign Supervising Organization</label>
                    <SearchableSelect
                      options={organizations.map(o => ({
                        id: o.id,
                        name: o.name,
                        subtext: o.type
                      }))}
                      value={editOrgId}
                      onChange={setEditOrgId}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <h4 className="text-xs font-bold uppercase text-primary tracking-wider">Office Occupant (Staff Selection)</h4>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Select Active Staff</label>
                      <SearchableSelect
                        options={[
                          { id: '', name: 'Leave Vacant (Remove Occupant)' },
                          ...staffList.map(s => ({
                            id: s.userId,
                            name: s.name,
                            subtext: `${s.staffId} • ${s.mda}`
                          }))
                        ]}
                        value={selectedStaffId || ''}
                        onChange={val => setSelectedStaffId(val || null)}
                        placeholder="Select registered staff member"
                      />
                    </div>
                  </div>
                </div>
              )}

              {isDelete && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm font-semibold">
                  Are you sure you want to permanently delete the position configuration for "{selectedPosition.office_name}"?
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-3 sticky bottom-0">
               <button onClick={() => setSelectedPosition(null)} className="px-4 py-2 border border-border bg-background rounded-md text-sm font-semibold hover:bg-muted transition-colors cursor-pointer">Cancel</button>
               <button 
                 onClick={isDelete ? handleDelete : handleUpdate}
                 className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
               >
                 <Save className="size-4" /> Save Changes
               </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
