import { getOrganizationsList, getStaffSearchableList, saveOrganizationRecord, dbAssignOfficeHolder } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Landmark, Save, Trash2, X, User, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SearchableSelect } from '@/components/SearchableSelect';

export const Route = createFileRoute('/dashboard/executive-offices/$action')({
  component: ExecutiveOfficeActionPage,
});

function ExecutiveOfficeActionPage() {
  const { action } = Route.useParams();
  
  // Forms states
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [code, setCode] = useState('');
  
  const [selectedOffice, setSelectedOffice] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editShortName, setEditShortName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const [offices, setOffices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    
    const [orgs, staff] = await Promise.all([
      getOrganizationsList(),
      getStaffSearchableList()
    ]);
    // Filter to executive_office type
    setOffices(orgs.filter((o: any) => o.type === 'executive_office'));
    setStaffList(staff);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedOffice) {
      setEditName(selectedOffice.name);
      setEditShortName(selectedOffice.shortName || '');
      setEditCode(selectedOffice.code || '');
      setSelectedStaffId(selectedOffice.headUserId || null);
    }
  }, [selectedOffice]);

  const handleCreate = async () => {
    if (!name.trim()) return alert("Office name is required");
    
    try {
      await saveOrganizationRecord({
        data: {
          name,
          short_name: shortName,
          code,
          type: 'executive_office',
          is_active: true
        }
      });
      alert("Executive Office created successfully!");
      window.location.href = '/dashboard/executive-offices';
    } catch (err: any) {
      alert("Failed to create office: " + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedOffice) return;
    
    try {
      await saveOrganizationRecord({
        data: {
          id: selectedOffice.id,
          name: editName,
          short_name: editShortName,
          code: editCode,
          type: 'executive_office',
          is_active: true
        }
      });

      if (selectedStaffId) {
        await dbAssignOfficeHolder({
          data: {
            orgId: selectedOffice.id,
            userId: selectedStaffId,
            roleName: 'head_of_department' // Head of office
          }
        });
      }

      alert("Executive Office updated successfully!");
      window.location.href = '/dashboard/executive-offices';
    } catch (err: any) {
      alert("Failed to update office: " + err.message);
    }
  };

  const isCreate = action === 'create';
  const isDelete = action === 'delete';
  const actionTitle = action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading form panel...</p>
      </div>
    );
  }

  if (isCreate) {
    return (
      <div className="p-6 max-w-[800px] mx-auto space-y-6 pb-24 text-foreground">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Create Executive Office</h1>
          <p className="text-muted-foreground mt-1">Configure a new cabinet or strategic administration office.</p>
        </div>

        <Card className="border-border/60 bg-card shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="border-b border-border/50 bg-muted/10">
            <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
              <Landmark className="size-5 text-[#C5A059]" /> Configuration Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Office Name</label>
              <input 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Office of the Chief of Staff"
                className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Short Name</label>
                <input 
                  type="text"
                  value={shortName}
                  onChange={e => setShortName(e.target.value)}
                  placeholder="e.g. COS"
                  className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Office Code</label>
                <input 
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. COS-OFFICE"
                  className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleCreate}
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="size-4" /> Save Office
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 pb-24 text-foreground relative">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{actionTitle} Executive Office</h1>
        <p className="text-muted-foreground mt-1">Select an office card to modify details or assign holders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {offices.map(o => (
          <Card key={o.id} className="border-border/60 bg-card shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-primary/50" onClick={() => setSelectedOffice(o)}>
            <CardHeader className="p-4 border-b border-border/30">
              <h2 className="font-bold text-sm leading-tight">{o.name}</h2>
            </CardHeader>
            <CardContent className="p-4 text-xs text-muted-foreground">
              <div>Occupant: <span className="font-bold text-foreground">{o.headName || 'Vacant'}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedOffice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl border-border/60 bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between bg-muted/10">
              <div>
                <CardTitle className="flex items-center gap-2 font-black">
                  <Landmark className="size-5 text-[#C5A059]" />
                  Configure Office: {selectedOffice.name}
                </CardTitle>
              </div>
              <button onClick={() => setSelectedOffice(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="size-5 text-muted-foreground" /></button>
            </CardHeader>

            <div className="overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Office Name</label>
                  <input 
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Short Name</label>
                    <input 
                      type="text"
                      value={editShortName}
                      onChange={e => setEditShortName(e.target.value)}
                      className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Office Code</label>
                    <input 
                      type="text"
                      value={editCode}
                      onChange={e => setEditCode(e.target.value)}
                      className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Assign Office Holder</label>
                  <SearchableSelect
                    options={[
                      { id: '', name: 'Leave Vacant' },
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

            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
              <button onClick={() => setSelectedOffice(null)} className="px-4 py-2 border border-border bg-background rounded-md text-sm font-semibold hover:bg-muted transition-colors cursor-pointer">Cancel</button>
              <button 
                onClick={handleUpdate}
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
