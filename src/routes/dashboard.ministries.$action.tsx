import { getMinistriesList, getStaffSearchableList, saveOrganizationRecord, deleteOrganizationRecord, dbAssignOfficeHolder, getNominalRollList } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Save, Trash2, X, Wallet, FolderKanban, Loader2, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { SearchableSelect } from '@/components/SearchableSelect';

export const Route = createFileRoute('/dashboard/ministries/$action')({
  component: MinistryActionPage,
});

function MinistryActionPage() {
  const { action } = Route.useParams();
  const session = getSession();

  if (session?.role !== 'super_admin') {
    return (
      <div className="p-6 max-w-[800px] mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
        <Lock className="size-16 text-rose-500 mb-4 opacity-80" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Restricted</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Only the Super Admin has clearance to create, modify, or delete ministries. Please contact the administrator.
        </p>
      </div>
    );
  }

  const [selectedMinistry, setSelectedMinistry] = useState<any>(null);
  
  // Create Form States
  const [name, setName] = useState('');
  const [mandate, setMandate] = useState('');
  const [budget, setBudget] = useState('');
  
  // Edit Form States
  const [editCommName, setEditCommName] = useState('');
  const [editCommPhone, setEditCommPhone] = useState('');
  const [editCommEmail, setEditCommEmail] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const [ministries, setMinistries] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMinistries = async () => {
    setLoading(true);
    
    const [mdata, sdata] = await Promise.all([
      getMinistriesList(),
      getStaffSearchableList()
    ]);
    setMinistries(mdata);
    setStaffList(sdata);
    setLoading(false);
  };

  useEffect(() => {
    loadMinistries();
  }, []);

  useEffect(() => {
    if (selectedMinistry) {
      setEditCommName(selectedMinistry.commissioner?.name || '');
      setEditCommPhone(selectedMinistry.commissioner?.phone || '');
      setEditCommEmail(selectedMinistry.commissioner?.email || '');
      setEditBudget(selectedMinistry.budget?.toString() || '');
      
      // Match existing commissioner to staff list if possible
      const match = staffList.find(s => s.name === selectedMinistry.commissioner?.name);
      setSelectedStaffId(match?.userId || null);
    }
  }, [selectedMinistry, staffList]);

  const handleStaffChange = (userId: string) => {
    setSelectedStaffId(userId);
    const staff = staffList.find(s => s.userId === userId);
    if (staff) {
      setEditCommName(staff.name);
      setEditCommEmail(staff.email);
      // Pre-fill phone if available (nominal roll has it)
      getNominalRollList().then(list => {
          const matched = list.find((nr: any) => nr.staffId === staff.staffId);
          if (matched && matched.phoneNumber) {
            setEditCommPhone(matched.phoneNumber);
          }
        });
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return alert("Ministry name is required");
    
    try {
      await saveOrganizationRecord({
        data: {
          name,
          type: 'ministry',
          mandate,
          is_active: true
        }
      });
      alert("Ministry created successfully!");
      window.location.href = '/dashboard/ministries';
    } catch (err: any) {
      alert("Failed to create ministry: " + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMinistry) return;
    
    try {
      await saveOrganizationRecord({
        data: {
          id: selectedMinistry.id,
          name: selectedMinistry.name,
          type: 'ministry',
          mandate: selectedMinistry.mandate,
          is_active: true
        }
      });
      
      // Save commissioner assignment
      if (selectedStaffId) {
        await dbAssignOfficeHolder({
          data: {
            orgId: selectedMinistry.id,
            userId: selectedStaffId,
            roleName: 'commissioner'
          }
        });
      }

      alert("Ministry updated successfully!");
      window.location.href = '/dashboard/ministries';
    } catch (err: any) {
      alert("Failed to update ministry: " + err.message);
    }
  };


  const handleDelete = async () => {
    if (!selectedMinistry) return;
    if (!confirm(`Are you sure you want to permanently delete the ${selectedMinistry.name}?`)) return;
    
    
    try {
      await deleteOrganizationRecord({ data: { id: selectedMinistry.id } });
      alert("Ministry deleted successfully!");
      window.location.href = '/dashboard/ministries';
    } catch (err: any) {
      alert("Failed to delete ministry: " + err.message);
    }
  };

  const actionTitle = action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const isDelete = action === 'delete';
  const isAssign = action.startsWith('assign') || action === 'edit';
  const isCreate = action === 'create';

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading form panels...</p>
      </div>
    );
  }

  if (isCreate) {
    return (
      <div className="p-6 max-w-[800px] mx-auto space-y-6 pb-24">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Ministry</h1>
          <p className="text-muted-foreground mt-1">Add a new ministry to the state structure.</p>
        </div>
        <Card className="border-border/60 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 bg-card">
          <CardHeader className="border-b border-border/50 bg-muted/10">
            <CardTitle className="flex items-center gap-2"><Building2 className="size-5 text-primary" /> Create Form</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Ministry Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                placeholder="e.g. Ministry of Works" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Ministry Mandate</label>
              <textarea 
                value={mandate}
                onChange={e => setMandate(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary h-24" 
                placeholder="Description of the ministry's core function..."
              ></textarea>
            </div>
            
            <div className="space-y-1.5 max-w-xs pt-2">
              <label className="text-sm font-semibold text-foreground">Allocated Budget (₦ Millions)</label>
              <input 
                type="number" 
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                placeholder="e.g. 5000" 
              />
            </div>

            <div className="pt-4 flex justify-end">
               <button 
                 onClick={handleCreate}
                 className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold inline-flex items-center gap-2 hover:bg-primary/90 cursor-pointer"
               >
                 <Save className="size-4" /> Save Details
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
        <h1 className="text-3xl font-black tracking-tight">{actionTitle} Ministry</h1>
        <p className="text-muted-foreground mt-1">Select a Ministry below to perform the {actionTitle} action.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-700">
        {ministries.map(min => (
          <Card key={min.id} className="border-border/60 bg-card shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-primary/50" onClick={() => setSelectedMinistry(min)}>
            <CardHeader className="p-4 border-b border-border/30">
              <div className="flex flex-row items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    <Building2 className="size-4 text-[#C5A059]" />
                  </div>
                  <div className="font-bold text-sm leading-tight line-clamp-2">{min.name}</div>
                </div>
                <div className="text-emerald-500 text-xs font-black bg-emerald-500/10 px-2 py-1 rounded-full shrink-0 ml-2">{min.score}%</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[11px] text-muted-foreground truncate flex-1">Hon. Comm: <span className="font-bold text-foreground">{min.commissioner?.name || "Awaiting Appointment"}</span></div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
               <div className="flex items-center gap-2 text-xs text-muted-foreground">
                 <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded font-bold"><FolderKanban className="size-3.5" /> {min.activeProjectsCount} projects</div>
                 <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded font-mono font-bold"><Wallet className="size-3.5" /> ₦{min.budget}M</div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMinistry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl border-border/60 bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <CardHeader className={`border-b border-border/50 flex flex-row items-center justify-between sticky top-0 bg-background z-10 ${isDelete ? 'bg-destructive/5' : 'bg-muted/10'}`}>
              <div>
                <CardTitle className={`flex items-center gap-2 font-black ${isDelete ? 'text-destructive' : 'text-foreground'}`}>
                  {isDelete ? <Trash2 className="size-5" /> : <Building2 className="size-5 text-[#C5A059]" />}
                  {actionTitle}: {selectedMinistry.name}
                </CardTitle>
                <CardDescription className="text-xs">Detailed overview and administrative controls.</CardDescription>
              </div>
              <button onClick={() => setSelectedMinistry(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="size-5 text-muted-foreground" /></button>
            </CardHeader>
            
            <div className="overflow-y-auto p-6 space-y-6">
              {!isDelete && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Commissioner Appointment Info</h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Commissioner (Select Staff)</label>
                      <SearchableSelect
                        options={staffList.map(s => ({
                          id: s.userId,
                          name: s.name,
                          subtext: `${s.staffId} • ${s.mda}`
                        }))}
                        value={selectedStaffId}
                        onChange={handleStaffChange}
                        placeholder="Select from registered Staff database"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</label>
                      <input 
                        type="text" 
                        value={editCommPhone}
                        onChange={e => setEditCommPhone(e.target.value)}
                        className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                        placeholder="e.g. +234..." 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                      <input 
                        type="email" 
                        value={editCommEmail}
                        onChange={e => setEditCommEmail(e.target.value)}
                        className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                        placeholder="e.g. comm@kogi.gov.ng" 
                      />
                    </div>
                    {/* Budget is computed dynamically based on projects/nominal roll and not edited here */}
                  </div>
                </div>
              )}

              {isDelete && (
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm font-semibold">
                    Warning: You are about to permanently delete the Ministry of {selectedMinistry.name} from the state registry.
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-3 sticky bottom-0">
               <button onClick={() => setSelectedMinistry(null)} className="px-4 py-2 border border-border bg-background rounded-md text-sm font-semibold hover:bg-muted transition-colors cursor-pointer">Cancel</button>
               <button 
                 onClick={isDelete ? handleDelete : handleUpdate}
                 className={`px-4 py-2 rounded-md text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                   isDelete ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                 }`}
               >
                 {isDelete ? <Trash2 className="size-4" /> : <Save className="size-4" />}
                 {isDelete ? 'Confirm Deletion' : 'Save Changes'}
               </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

