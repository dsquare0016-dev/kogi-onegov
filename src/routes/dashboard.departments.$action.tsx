import { getDepartmentsList, getOrganizationsList, getStaffSearchableList, saveOrganizationRecord, dbAssignOfficeHolder, deleteOrganizationRecord } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Network, Save, Trash2, UserCheck, X, Lock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { SearchableSelect } from '@/components/SearchableSelect';

export const Route = createFileRoute('/dashboard/departments/$action')({
  component: DepartmentActionPage,
});

// Helper to generate consistent mock scores
const getScore = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 65 + (Math.abs(hash) % 30);
};

function DepartmentActionPage() {
  const { action } = Route.useParams();
  const session = getSession();

  if (session?.role !== 'super_admin') {
    return (
      <div className="p-6 max-w-[800px] mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
        <Lock className="size-16 text-rose-500 mb-4 opacity-80" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Restricted</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Only the Super Admin has clearance to create, modify, or delete departments. Please contact the administrator.
        </p>
      </div>
    );
  }

  // Create Form States
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  
  // Edit Form States
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [editParentId, setEditParentId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [editHodName, setEditHodName] = useState('');
  const [editHodEmail, setEditHodEmail] = useState('');

  const [departments, setDepartments] = useState<any[]>([]);
  const [parentOptions, setParentOptions] = useState<any[]>([]); // Ministries & Agencies
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    
    const [deptsData, orgsData, staffData] = await Promise.all([
      getDepartmentsList(),
      getOrganizationsList(),
      getStaffSearchableList()
    ]);
    setDepartments(deptsData);
    const parents = orgsData.filter((o: any) => o.type === 'ministry' || o.type === 'agency' || o.type === 'board' || o.type === 'commission');
    setParentOptions(parents);
    setStaffList(staffData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      setEditParentId(selectedDepartment.parent_id || null);
      setEditHodName(selectedDepartment.head || '');
      
      const match = staffList.find(s => s.name === selectedDepartment.head);
      setSelectedStaffId(match?.userId || null);
      if (match) {
        setEditHodEmail(match.email);
      }
    }
  }, [selectedDepartment, staffList]);

  const handleStaffChange = (userId: string) => {
    setSelectedStaffId(userId);
    const staff = staffList.find(s => s.userId === userId);
    if (staff) {
      setEditHodName(staff.name);
      setEditHodEmail(staff.email);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return alert("Department name is required");
    
    try {
      await saveOrganizationRecord({
        data: {
          name,
          type: 'department',
          parent_id: parentId,
          is_active: true
        }
      });
      alert("Department created successfully!");
      window.location.href = '/dashboard/departments';
    } catch (err: any) {
      alert("Failed to create department: " + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedDepartment) return;
    
    try {
      await saveOrganizationRecord({
        data: {
          id: selectedDepartment.id,
          name: selectedDepartment.name,
          type: 'department',
          parent_id: editParentId,
          is_active: true
        }
      });

      if (selectedStaffId) {
        await dbAssignOfficeHolder({
          data: {
            orgId: selectedDepartment.id,
            userId: selectedStaffId,
            roleName: 'head_of_department'
          }
        });
      }

      alert("Department updated successfully!");
      window.location.href = '/dashboard/departments';
    } catch (err: any) {
      alert("Failed to update department: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;
    if (!confirm(`Are you sure you want to permanently delete the department "${selectedDepartment.name}"?`)) return;
    
    
    try {
      await deleteOrganizationRecord({ data: { id: selectedDepartment.id } });
      alert("Department deleted successfully!");
      window.location.href = '/dashboard/departments';
    } catch (err: any) {
      alert("Failed to delete department: " + err.message);
    }
  };

  const actionTitle = action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const isDelete = action === 'delete';
  const isCreate = action === 'create';

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading departments...</p>
      </div>
    );
  }

  if (isCreate) {
    return (
      <div className="p-6 max-w-[800px] mx-auto space-y-6 pb-24 text-foreground">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Department</h1>
          <p className="text-muted-foreground mt-1">Manage departmental structures within Ministries or Agencies.</p>
        </div>

        <Card className="border-border/60 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 bg-card">
          <CardHeader className="border-b border-border/50 bg-muted/10">
            <CardTitle className="flex items-center gap-2">
              <Network className="size-5 text-primary" /> Create Form
            </CardTitle>
            <CardDescription>Configure the departmental structure below.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Department Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                placeholder="e.g. Planning, Research and Statistics (PRS)..." 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Parent Entity (Mother Ministry/Agency)</label>
              <SearchableSelect
                options={parentOptions.map(p => ({
                  id: p.id,
                  name: p.name,
                  subtext: p.type
                }))}
                value={parentId}
                onChange={setParentId}
                placeholder="Select Supervising Ministry or Agency"
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
        <h1 className="text-3xl font-bold tracking-tight">{actionTitle} Department</h1>
        <p className="text-muted-foreground mt-1">Select a Department below to perform the {actionTitle} action.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-700">
        {departments.map(dept => {
          const score = getScore(dept.name + dept.parentName);
          return (
            <Card key={dept.id} className="border-border/60 bg-card shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-500/50" onClick={() => setSelectedDepartment(dept)}>
              <CardHeader className="p-4 border-b border-border/30">
                <div className="flex flex-row items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Network className="size-4 text-blue-600" />
                    </div>
                    <div className="font-semibold text-sm leading-tight line-clamp-2">{dept.name}</div>
                  </div>
                  <div className="text-blue-500 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded-full shrink-0 ml-2">{score}</div>
                </div>
                <div className="text-[11px] font-medium text-muted-foreground bg-muted/40 px-2 py-1 rounded inline-flex items-center gap-1 mt-1 line-clamp-1">
                  Reports to: <span className="text-primary truncate">{dept.parentName || 'Independent Office'}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded uppercase tracking-widest text-[10px]"><Network className="size-3.5" /> Department Level</div>
                 </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl border-border/60 bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <CardHeader className={`border-b border-border/50 flex flex-row items-center justify-between sticky top-0 bg-background z-10 ${isDelete ? 'bg-destructive/5' : 'bg-muted/10'}`}>
              <div>
                <CardTitle className={`flex items-center gap-2 font-black ${isDelete ? 'text-destructive' : ''}`}>
                  {isDelete ? <Trash2 className="size-5" /> : <Network className="size-5 text-primary" />}
                  {actionTitle}: {selectedDepartment.name}
                </CardTitle>
                <CardDescription className="text-xs">Detailed overview and administrative controls.</CardDescription>
              </div>
              <button onClick={() => setSelectedDepartment(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="size-5 text-muted-foreground" /></button>
            </CardHeader>
            
            <div className="overflow-y-auto p-6 space-y-6">
              {!isDelete && (
                 <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Parent Entity (Mother Ministry/Agency)</label>
                      <SearchableSelect
                        options={parentOptions.map(p => ({
                          id: p.id,
                          name: p.name,
                          subtext: p.type
                        }))}
                        value={editParentId}
                        onChange={setEditParentId}
                        placeholder="Select Supervising Ministry or Agency"
                      />
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Departmental Head Details</h4>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground uppercase">Director / HOD (Select Staff)</label>
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
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground uppercase">Official Email</label>
                          <input 
                            type="email" 
                            disabled 
                            value={editHodEmail}
                            className="w-full p-2 bg-muted/30 border border-border rounded-md text-sm text-muted-foreground focus:outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                 </div>
              )}

              {isDelete && (
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm font-semibold">
                    Warning: You are about to permanently delete the department "{selectedDepartment.name}".
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-3 sticky bottom-0">
               <button onClick={() => setSelectedDepartment(null)} className="px-4 py-2 border border-border bg-background rounded-md text-sm font-semibold hover:bg-muted transition-colors cursor-pointer">Cancel</button>
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
