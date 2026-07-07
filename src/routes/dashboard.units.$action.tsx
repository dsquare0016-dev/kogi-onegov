import { getUnitsList, getDepartmentsList, getStaffSearchableList, saveOrganizationRecord, dbAssignOfficeHolder, deleteOrganizationRecord } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layers, Save, Trash2, UserCheck, X, Lock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { SearchableSelect } from '@/components/SearchableSelect';

export const Route = createFileRoute('/dashboard/units/$action')({
  component: UnitActionPage,
});

// Helper to generate consistent mock scores
const getScore = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 65 + (Math.abs(hash) % 30);
};

function UnitActionPage() {
  const { action } = Route.useParams();
  const session = getSession();

  if (session?.role !== 'super_admin') {
    return (
      <div className="p-6 max-w-[800px] mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
        <Lock className="size-16 text-rose-500 mb-4 opacity-80" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Restricted</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Only the Super Admin has clearance to create, modify, or delete units. Please contact the administrator.
        </p>
      </div>
    );
  }

  // Create Form States
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  
  // Edit Form States
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [editParentId, setEditParentId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [editHeadName, setEditHeadName] = useState('');
  const [editHeadEmail, setEditHeadEmail] = useState('');

  const [units, setUnits] = useState<any[]>([]);
  const [parentOptions, setParentOptions] = useState<any[]>([]); // Departments only
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    
    const [unitsData, deptsData, staffData] = await Promise.all([
      getUnitsList(),
      getDepartmentsList(),
      getStaffSearchableList()
    ]);
    setUnits(unitsData);
    setParentOptions(deptsData);
    setStaffList(staffData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      setEditParentId(selectedUnit.parent_id || null);
      setEditHeadName(selectedUnit.head || '');
      
      const match = staffList.find(s => s.name === selectedUnit.head);
      setSelectedStaffId(match?.userId || null);
      if (match) {
        setEditHeadEmail(match.email);
      }
    }
  }, [selectedUnit, staffList]);

  const handleStaffChange = (userId: string) => {
    setSelectedStaffId(userId);
    const staff = staffList.find(s => s.userId === userId);
    if (staff) {
      setEditHeadName(staff.name);
      setEditHeadEmail(staff.email);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return alert("Unit name is required");
    
    try {
      await saveOrganizationRecord({
        data: {
          name,
          type: 'unit',
          parent_id: parentId,
          is_active: true
        }
      });
      alert("Unit created successfully!");
      window.location.href = '/dashboard/units';
    } catch (err: any) {
      alert("Failed to create unit: " + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUnit) return;
    
    try {
      await saveOrganizationRecord({
        data: {
          id: selectedUnit.id,
          name: selectedUnit.name,
          type: 'unit',
          parent_id: editParentId,
          is_active: true
        }
      });

      if (selectedStaffId) {
        await dbAssignOfficeHolder({
          data: {
            orgId: selectedUnit.id,
            userId: selectedStaffId,
            roleName: 'head_of_department'
          }
        });
      }

      alert("Unit updated successfully!");
      window.location.href = '/dashboard/units';
    } catch (err: any) {
      alert("Failed to update unit: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedUnit) return;
    if (!confirm(`Are you sure you want to permanently delete the unit "${selectedUnit.name}"?`)) return;
    
    
    try {
      await deleteOrganizationRecord({ data: { id: selectedUnit.id } });
      alert("Unit deleted successfully!");
      window.location.href = '/dashboard/units';
    } catch (err: any) {
      alert("Failed to delete unit: " + err.message);
    }
  };

  const actionTitle = action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const isDelete = action === 'delete';
  const isCreate = action === 'create';

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading units...</p>
      </div>
    );
  }

  if (isCreate) {
    return (
      <div className="p-6 max-w-[800px] mx-auto space-y-6 pb-24 text-foreground">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Unit</h1>
          <p className="text-muted-foreground mt-1">Manage localized operational units under Departments.</p>
        </div>

        <Card className="border-border/60 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 bg-card">
          <CardHeader className="border-b border-border/50 bg-muted/10">
            <CardTitle className="flex items-center gap-2">
              <Layers className="size-5 text-primary" /> Create Form
            </CardTitle>
            <CardDescription>Configure the unit attributes below.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Unit Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                placeholder="e.g. Server Infrastructure Unit..." 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Parent Department</label>
              <SearchableSelect
                options={parentOptions.map(p => ({
                  id: p.id,
                  name: p.name,
                  subtext: p.parentName ? `Reports to: ${p.parentName}` : 'Department'
                }))}
                value={parentId}
                onChange={setParentId}
                placeholder="Select Parent Department"
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
        <h1 className="text-3xl font-bold tracking-tight">{actionTitle} Unit</h1>
        <p className="text-muted-foreground mt-1">Select an Operational Unit below to perform the {actionTitle} action.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-in fade-in duration-700">
        {units.map(unit => {
          const score = getScore(unit.name + unit.parent_department);
          return (
            <Card key={unit.id} className="border-border/60 bg-card shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-violet-500/50" onClick={() => setSelectedUnit(unit)}>
              <CardHeader className="p-4 border-b border-border/30">
                <div className="flex flex-row items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                      <Layers className="size-4 text-violet-600" />
                    </div>
                    <div className="font-semibold text-sm leading-tight line-clamp-2">{unit.name}</div>
                  </div>
                  <div className="text-violet-500 text-xs font-bold bg-violet-500/10 px-2 py-1 rounded-full shrink-0 ml-2">{score}</div>
                </div>
                <div className="text-[11px] font-medium text-muted-foreground bg-muted/40 px-2 py-1 rounded inline-flex items-center gap-1 mt-1 line-clamp-1">
                  Department: <span className="text-primary truncate">{unit.parent_department || 'Direct Report'}</span>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl border-border/60 bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <CardHeader className={`border-b border-border/50 flex flex-row items-center justify-between sticky top-0 bg-background z-10 ${isDelete ? 'bg-destructive/5' : 'bg-muted/10'}`}>
              <div>
                <CardTitle className={`flex items-center gap-2 font-black ${isDelete ? 'text-destructive' : ''}`}>
                  {isDelete ? <Trash2 className="size-5" /> : <Layers className="size-5 text-primary" />}
                  {actionTitle}: {selectedUnit.name}
                </CardTitle>
                <CardDescription className="text-xs">Detailed overview and administrative controls.</CardDescription>
              </div>
              <button onClick={() => setSelectedUnit(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="size-5 text-muted-foreground" /></button>
            </CardHeader>
            
            <div className="overflow-y-auto p-6 space-y-6">
              {!isDelete && (
                 <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Parent Department</label>
                      <SearchableSelect
                        options={parentOptions.map(p => ({
                          id: p.id,
                          name: p.name,
                          subtext: p.parentName ? `Reports to: ${p.parentName}` : 'Department'
                        }))}
                        value={editParentId}
                        onChange={editParentId => setEditParentId(editParentId)}
                        placeholder="Select Parent Department"
                      />
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Unit Head Details</h4>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground uppercase">Unit Head / Coordinator (Select Staff)</label>
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
                            value={editHeadEmail}
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
                    Warning: You are about to permanently delete the operational unit "{selectedUnit.name}".
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-3 sticky bottom-0">
               <button onClick={() => setSelectedUnit(null)} className="px-4 py-2 border border-border bg-background rounded-md text-sm font-semibold hover:bg-muted transition-colors cursor-pointer">Cancel</button>
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
