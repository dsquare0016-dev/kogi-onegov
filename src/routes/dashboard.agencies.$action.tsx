import { getAgenciesList, getMinistriesList, getStaffSearchableList, saveOrganizationRecord, dbAssignOfficeHolder, deleteOrganizationRecord } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building, Save, Trash2, X, Building2, Loader2, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { SearchableSelect } from '@/components/SearchableSelect';

export const Route = createFileRoute('/dashboard/agencies/$action')({
  component: AgencyActionPage,
});

function AgencyActionPage() {
  const { action } = Route.useParams();
  const session = getSession();

  if (session?.role !== 'super_admin') {
    return (
      <div className="p-6 max-w-[800px] mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
        <Lock className="size-16 text-rose-500 mb-4 opacity-80" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Restricted</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Only the Super Admin has clearance to create, modify, or delete agencies. Please contact the administrator.
        </p>
      </div>
    );
  }

  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  
  // Create Form States
  const [name, setName] = useState('');
  const [motherMinistry, setMotherMinistry] = useState('');
  const [budget, setBudget] = useState('');
  const [dgName, setDgName] = useState('');
  const [dgPhone, setDgPhone] = useState('');
  const [dgEmail, setDgEmail] = useState('');
  const [deptsCount, setDeptsCount] = useState('');

  // Edit Form States
  const [editDgName, setEditDgName] = useState('');
  const [editDgPhone, setEditDgPhone] = useState('');
  const [editDgEmail, setEditDgEmail] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editMother, setEditMother] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const [agencies, setAgencies] = useState<any[]>([]);
  const [ministries, setMinistries] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    
    const [agenciesData, ministriesData, staffData] = await Promise.all([
      getAgenciesList(),
      getMinistriesList(),
      getStaffSearchableList()
    ]);
    setAgencies(agenciesData);
    setMinistries(ministriesData);
    setStaffList(staffData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedAgency) {
      setEditDgName(selectedAgency.head || '');
      setEditDgPhone(selectedAgency.phone || '');
      setEditDgEmail(selectedAgency.email || '');
      setEditBudget(selectedAgency.budget?.toString() || '');
      setEditMother(selectedAgency.motherMinistry || '');
      
      const match = staffList.find(s => s.name === selectedAgency.head);
      setSelectedStaffId(match?.userId || null);
    }
  }, [selectedAgency, staffList]);

  const handleStaffChange = (userId: string) => {
    setSelectedStaffId(userId);
    const staff = staffList.find(s => s.userId === userId);
    if (staff) {
      setEditDgName(staff.name);
      setEditDgEmail(staff.email);
      import('@/lib/postgres-service').then(m => {
        m.getNominalRollList().then(list => {
          const matched = list.find((nr: any) => nr.staffId === staff.staffId);
          if (matched && matched.phoneNumber) {
            setEditDgPhone(matched.phoneNumber);
          }
        });
      });
    }
  };


  const handleCreate = async () => {
    if (!name.trim()) return alert("Agency name is required");
    
    try {
      let parentId = null;
      if (motherMinistry) {
        const matchingMin = ministries.find(m => m.name === motherMinistry);
        if (matchingMin) parentId = matchingMin.id;
      }

      await saveOrganizationRecord({
        data: {
          name,
          type: 'agency',
          parent_id: parentId,
          is_active: true
        }
      });
      alert("Agency created successfully!");
      window.location.href = '/dashboard/agencies';
    } catch (err: any) {
      alert("Failed to create agency: " + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAgency) return;
    
    try {
      let parentId = null;
      if (editMother) {
        const matchingMin = ministries.find(m => m.name === editMother);
        if (matchingMin) parentId = matchingMin.id;
      }

      await saveOrganizationRecord({
        data: {
          id: selectedAgency.id,
          name: selectedAgency.name,
          type: 'agency',
          parent_id: parentId,
          is_active: true
        }
      });

      if (selectedStaffId) {
        await dbAssignOfficeHolder({
          data: {
            orgId: selectedAgency.id,
            userId: selectedStaffId,
            roleName: 'head_of_department'
          }
        });
      }

      alert("Agency updated successfully!");
      window.location.href = '/dashboard/agencies';
    } catch (err: any) {
      alert("Failed to update agency: " + err.message);
    }
  };


  const handleDelete = async () => {
    if (!selectedAgency) return;
    if (!confirm(`Are you sure you want to permanently delete parastatal "${selectedAgency.name}"?`)) return;
    
    
    try {
      await deleteOrganizationRecord({ data: { id: selectedAgency.id } });
      alert("Agency deleted successfully!");
      window.location.href = '/dashboard/agencies';
    } catch (err: any) {
      alert("Failed to delete agency: " + err.message);
    }
  };

  const actionTitle = action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const isDelete = action === 'delete';
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Agency/Parastatal</h1>
          <p className="text-muted-foreground mt-1">Add a parastatal, board, or commission to the directory.</p>
        </div>

        <Card className="border-border/60 bg-card shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="border-b border-border/50 bg-muted/10">
            <CardTitle className="flex items-center gap-2">
              <Building className="size-5 text-primary" /> Create Form
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 text-foreground">
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Agency/Board Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                placeholder="Enter new agency name..." 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Mother Ministry or Parent Office</label>
              <select 
                value={motherMinistry}
                onChange={e => setMotherMinistry(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              >
                <option value="">Stand Alone (Independent parastatal)</option>
        { (ministries ?? []).map(m => (
          <option key={m.id} value={m.name}>{m.name}</option>
        ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">DG/Exec Secretary Name</label>
                <input 
                  type="text" 
                  value={dgName}
                  onChange={e => setDgName(e.target.value)}
                  className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                  placeholder="e.g. Dr. Jane Doe" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Allocated Budget (₦ Millions)</label>
                <input 
                  type="number" 
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                  placeholder="e.g. 200" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Contact Phone</label>
                <input 
                  type="text" 
                  value={dgPhone}
                  onChange={e => setDgPhone(e.target.value)}
                  className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                  placeholder="e.g. +234..." 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Contact Email</label>
                <input 
                  type="email" 
                  value={dgEmail}
                  onChange={e => setDgEmail(e.target.value)}
                  className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                  placeholder="e.g. info@agency.kg.gov.ng" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Number of Departments</label>
              <input 
                type="number" 
                value={deptsCount}
                onChange={e => setDeptsCount(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                placeholder="e.g. 3" 
              />
            </div>

            <div className="pt-4 flex justify-end">
               <button 
                 onClick={handleCreate}
                 className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
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
        <h1 className="text-3xl font-black tracking-tight">{actionTitle} Agency</h1>
        <p className="text-muted-foreground mt-1">Select an Agency below to perform the {actionTitle} action.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-700">
        { (agencies ?? []).map(agency => {
          return (
            <Card key={agency.id} className="border-border/60 bg-card shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-500/50" onClick={() => setSelectedAgency(agency)}>
              <CardHeader className="p-4 border-b border-border/30">
                <div className="flex flex-row items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Building2 className="size-4 text-emerald-600" />
                    </div>
                    <div className="font-bold text-sm leading-tight line-clamp-2">{agency.name}</div>
                  </div>
                  <div className="text-emerald-500 text-xs font-black bg-emerald-500/10 px-2 py-1 rounded-full shrink-0 ml-2">{agency.score ?? 0}%</div>
                </div>
                <div className="text-[11px] font-bold text-muted-foreground bg-muted/40 px-2 py-1 rounded inline-flex items-center gap-1 mt-1">
                  Reports to: <span className="text-primary truncate">{agency.motherMinistry}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded font-bold"><Building className="size-3.5" /> {(agency.departments ?? []).length} departments</div>
                   <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded font-mono font-bold"><Save className="size-3.5" /> ₦{agency.budget}M budget</div>
                 </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedAgency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl border-border/60 bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <CardHeader className={`border-b border-border/50 flex flex-row items-center justify-between sticky top-0 bg-background z-10 ${isDelete ? 'bg-destructive/5' : 'bg-muted/10'}`}>
              <div>
                <CardTitle className={`flex items-center gap-2 font-black ${isDelete ? 'text-destructive' : 'text-foreground'}`}>
                  {isDelete ? <Trash2 className="size-5" /> : <Building2 className="size-5 text-emerald-600" />}
                  {actionTitle}: {selectedAgency.name}
                </CardTitle>
                <CardDescription className="text-xs">Detailed parastatal management portal.</CardDescription>
              </div>
              <button onClick={() => setSelectedAgency(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="size-5 text-muted-foreground" /></button>
            </CardHeader>
            
            <div className="overflow-y-auto p-6 space-y-6">
              {!isDelete && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Director General Profile & Budget</h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">DG/Exec Secretary (Select Staff)</label>
                      <SearchableSelect
                        options={(staffList ?? []).map(s => ({
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
                        value={editDgPhone}
                        onChange={e => setEditDgPhone(e.target.value)}
                        className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                      <input 
                        type="email" 
                        value={editDgEmail}
                        onChange={e => setEditDgEmail(e.target.value)}
                        className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                      />
                    </div>
                    
                    <div className="space-y-1 pt-2 border-t border-border/50">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Supervising Ministry</label>
                      <select 
                        value={editMother}
                        onChange={e => setEditMother(e.target.value)}
                        className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                      >
                        <option value="">Stand Alone (Independent parastatal)</option>
                        {ministries.map(m => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-border/50">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Allocated Budget (₦ Millions)</label>
                      <input 
                        type="number" 
                        value={editBudget}
                        onChange={e => setEditBudget(e.target.value)}
                        className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {isDelete && (
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm font-semibold">
                    Warning: You are about to permanently delete the parastatal "{selectedAgency.name}" from the state registry.
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-3 sticky bottom-0">
               <button onClick={() => setSelectedAgency(null)} className="px-4 py-2 border border-border bg-background rounded-md text-sm font-semibold hover:bg-muted transition-colors cursor-pointer">Cancel</button>
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
