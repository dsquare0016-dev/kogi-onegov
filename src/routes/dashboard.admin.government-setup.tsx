import { getOrganizationsList, getStaffSearchableList, dbGetPillarsAndObjectives, dbGetBudgetYears, dbGetBudgetLineItems, dbGetOrganizationAlignments, dbSavePillar, dbSaveObjective, dbSaveBudgetYear, dbSaveBudgetLineItem, dbSaveOrganizationAlignment, dbAssignDeskOfficer, dbDeletePillar, dbDeleteObjective, dbDeleteBudgetYear, dbSetActiveBudgetYear, dbDeleteBudgetLineItem, dbDeleteSingleOrganizationAlignment } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Landmark, Save, Plus, Trash2, Edit, CheckCircle, Briefcase, Award, Layers, Users, BookOpen, Target, Calendar, Wallet, CheckSquare, Shield, Lock, Search, HelpCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { SearchableSelect } from '@/components/SearchableSelect';

export const Route = createFileRoute('/dashboard/admin/government-setup')({
  component: GovernmentSetupPage,
});

function GovernmentSetupPage() {
  const session = getSession();

  if (session?.role !== 'super_admin') {
    return (
      <div className="p-6 max-w-[800px] mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
        <Lock className="size-16 text-rose-500 mb-4 opacity-80" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Restricted</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Only the Super Admin has clearance to access the Government Setup and Relational Alignment configurations.
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'orgs' | 'pillars' | 'budgets' | 'alignments' | 'desk-officers'>('orgs');
  const [loading, setLoading] = useState(true);

  // Loaded DB lists
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [budgetYears, setBudgetYears] = useState<any[]>([]);
  const [budgetLines, setBudgetLines] = useState<any[]>([]);
  const [alignments, setAlignments] = useState<any[]>([]);

  // Search filter
  const [q, setQ] = useState("");

  // Setup Form States
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form: Pillar
  const [pillarName, setPillarName] = useState("");
  const [pillarDesc, setPillarDesc] = useState("");
  const [pillarStart, setPillarStart] = useState(2026);
  const [pillarEnd, setPillarEnd] = useState(2058);

  // Form: Objective
  const [objPillarId, setObjPillarId] = useState("");
  const [objTitle, setObjTitle] = useState("");
  const [objCode, setObjCode] = useState("");
  const [objDesc, setObjDesc] = useState("");

  // Form: Budget Year
  const [budgetYearVal, setBudgetYearVal] = useState(2026);

  // Form: Budget Line Item
  const [blOrgId, setBlOrgId] = useState("");
  const [blYearId, setBlYearId] = useState("");
  const [blCode, setBlCode] = useState("");
  const [blName, setBlName] = useState("");
  const [blDesc, setBlDesc] = useState("");
  const [blApproved, setBlApproved] = useState("0");

  // Form: Alignment Mapping
  const [alignOrgId, setAlignOrgId] = useState("");
  const [alignSelectedObjectives, setAlignSelectedObjectives] = useState<string[]>([]);

  // Form: Desk Officer Assignment
  const [doOrgId, setDoOrgId] = useState("");
  const [doUserId, setDoUserId] = useState("");

  const loadAllData = async () => {
    setLoading(true);
    

    const [orgs, staff, planData, years, lines, alignData] = await Promise.all([
      getOrganizationsList(),
      getStaffSearchableList(),
      dbGetPillarsAndObjectives(),
      dbGetBudgetYears(),
      dbGetBudgetLineItems({ data: {} }),
      dbGetOrganizationAlignments()
    ]);

    setOrganizations(orgs);
    setStaffList(staff);
    setPillars(planData.pillars);
    setObjectives(planData.objectives);
    setBudgetYears(years);
    setBudgetLines(lines);
    setAlignments(alignData);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSavePillar = async () => {
    if (!pillarName.trim()) return alert("Pillar name is required");
    
    try {
      await dbSavePillar({
        data: {
          id: editingItem?.id,
          name: pillarName,
          description: pillarDesc,
          plan_year_start: pillarStart,
          plan_year_end: pillarEnd
        }
      });
      alert("Pillar saved successfully!");
      setPillarName("");
      setPillarDesc("");
      setEditingItem(null);
      loadAllData();
    } catch (e: any) {
      alert("Error saving pillar: " + e.message);
    }
  };

  const handleSaveObjective = async () => {
    if (!objPillarId) return alert("Pillar selection is required");
    if (!objTitle.trim() || !objCode.trim()) return alert("Objective Title and Code are required");
    
    try {
      await dbSaveObjective({
        data: {
          id: editingItem?.id,
          pillar_id: objPillarId,
          objective_title: objTitle,
          objective_code: objCode,
          description: objDesc
        }
      });
      alert("Strategic Objective saved successfully!");
      setObjTitle("");
      setObjCode("");
      setObjDesc("");
      setEditingItem(null);
      loadAllData();
    } catch (e: any) {
      alert("Error saving objective: " + e.message);
    }
  };

  const handleSaveBudgetYear = async () => {
    
    try {
      await dbSaveBudgetYear({
        data: {
          year: budgetYearVal
        }
      });
      alert("Budget Year saved successfully!");
      loadAllData();
    } catch (e: any) {
      alert("Error saving budget year: " + e.message);
    }
  };

  const handleSaveBudgetLine = async () => {
    if (!blOrgId || !blYearId || !blCode.trim() || !blName.trim()) {
      return alert("Organization, Budget Year, Code, and Name are required");
    }
    
    try {
      await dbSaveBudgetLineItem({
        data: {
          id: editingItem?.id,
          organization_id: blOrgId,
          budget_year_id: blYearId,
          budget_code: blCode,
          line_item_name: blName,
          description: blDesc,
          approved_amount: parseFloat(blApproved) || 0
        }
      });
      alert("Budget Line Item saved successfully!");
      setBlCode("");
      setBlName("");
      setBlDesc("");
      setBlApproved("0");
      setEditingItem(null);
      loadAllData();
    } catch (e: any) {
      alert("Error saving budget line item: " + e.message);
    }
  };

  const handleSaveAlignment = async () => {
    if (!alignOrgId) return alert("Organization is required");
    
    try {
      await dbSaveOrganizationAlignment({
        data: {
          organization_id: alignOrgId,
          strategic_objective_ids: alignSelectedObjectives
        }
      });
      alert("Strategic alignments saved successfully!");
      setAlignOrgId("");
      setAlignSelectedObjectives([]);
      loadAllData();
    } catch (e: any) {
      alert("Error saving alignments: " + e.message);
    }
  };

  const handleSaveDeskOfficer = async () => {
    if (!doOrgId) return alert("Organization is required");
    
    try {
      await dbAssignDeskOfficer({
        data: {
          organizationId: doOrgId,
          userId: doUserId || null
        }
      });
      alert("Desk Officer assigned successfully!");
      setDoOrgId("");
      setDoUserId("");
      loadAllData();
    } catch (e: any) {
      alert("Error assigning desk officer: " + e.message);
    }
  };

  const handleDeleteOrganization = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this organization? This action is irreversible.")) return;
    try {
      const { dbDeleteOrganization } = await import('@/lib/postgres-service');
      await dbDeleteOrganization({ data: { id } });
      alert("Organization deleted successfully!");
      loadAllData();
    } catch (e: any) {
      alert(e.message || "Error deleting organization.");
    }
  };

  const handleEditPillarClick = (p: any) => {
    setEditingItem(p);
    setPillarName(p.name);
    setPillarDesc(p.description || "");
    setPillarStart(p.plan_year_start);
    setPillarEnd(p.plan_year_end);
  };

  const handleEditObjectiveClick = (o: any) => {
    setEditingItem(o);
    setObjPillarId(o.pillar_id);
    setObjTitle(o.objective_title);
    setObjCode(o.objective_code);
    setObjDesc(o.description || "");
  };

  const handleEditBudgetLineClick = (bl: any) => {
    setEditingItem(bl);
    setBlOrgId(bl.organization_id);
    setBlYearId(bl.budget_year_id);
    setBlCode(bl.budget_code);
    setBlName(bl.line_item_name);
    setBlDesc(bl.description || "");
    setBlApproved(bl.approved_amount.toString());
  };

  const handleDeletePillar = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Pillar?")) return;
    
    try {
      await dbDeletePillar({ data: { id } });
      loadAllData();
    } catch (e: any) {
      alert("Error deleting pillar: " + e.message);
    }
  };

  const handleDeleteObjective = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Objective?")) return;
    
    try {
      await dbDeleteObjective({ data: { id } });
      loadAllData();
    } catch (e: any) {
      alert("Error deleting objective: " + e.message);
    }
  };

  const handleDeleteBudgetYear = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Budget Year?")) return;
    
    try {
      await dbDeleteBudgetYear({ data: { id } });
      loadAllData();
    } catch (e: any) {
      alert("Error deleting budget year: " + e.message);
    }
  };

  const handleSetActiveBudgetYear = async (id: string) => {
    
    try {
      await dbSetActiveBudgetYear({ data: { id } });
      loadAllData();
    } catch (e: any) {
      alert("Error setting active budget year: " + e.message);
    }
  };

  const handleDeleteBudgetLine = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Budget Line?")) return;
    
    try {
      await dbDeleteBudgetLineItem({ data: { id } });
      loadAllData();
    } catch (e: any) {
      alert("Error deleting budget line item: " + e.message);
    }
  };

  const handleDeleteAlignment = async (orgId: string, objId: string) => {
    if (!confirm("Are you sure you want to delete this alignment?")) return;
    
    try {
      await dbDeleteSingleOrganizationAlignment({ data: { organization_id: orgId, strategic_objective_id: objId } });
      loadAllData();
    } catch (e: any) {
      alert("Error deleting alignment: " + e.message);
    }
  };

  // Helper to generate Objective Code
  const generateObjectiveCode = (pillarId: string) => {
    const pillar = pillars.find(p => p.id === pillarId);
    if (!pillar) return "";
    
    // Create an abbreviation from the pillar name
    // e.g. "Agriculture & Food Security" -> "AGRIC"
    // Just taking the first word and uppercase it.
    let words = pillar.name.split(' ').filter((w: string) => w.length > 2 && w.toLowerCase() !== 'and');
    let abbrev = words[0] ? words[0].substring(0, 5).toUpperCase() : "OBJ";
    
    // Find the next sequence number
    const pillarObjs = objectives.filter(o => o.pillar_id === pillarId);
    const seq = (pillarObjs.length + 1).toString().padStart(2, '0');
    return `SO-${abbrev}-${seq}`;
  };

  const handlePillarSelectionForObjective = (pillarId: string) => {
    setObjPillarId(pillarId);
    if (!editingItem) {
      setObjCode(generateObjectiveCode(pillarId));
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading Government Setup center...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6 pb-24 text-foreground animate-in fade-in duration-500">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full text-[11px] uppercase tracking-widest text-amber-500 font-bold mb-3 border border-amber-500/20">
          <Shield className="size-3.5" /> Super Admin Center
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-1">Government Setup & Alignment</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Manage unified government hierarchical MDAs, budget codes, development pillars, strategic objective alignments, and desk officers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
        <button 
          onClick={() => { setActiveTab('orgs'); setEditingItem(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'orgs' ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Organizations & Offices
        </button>
        <button 
          onClick={() => { setActiveTab('pillars'); setEditingItem(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'pillars' ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Development Plan
        </button>
        <button 
          onClick={() => { setActiveTab('budgets'); setEditingItem(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'budgets' ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Budget Lines Master
        </button>
        <button 
          onClick={() => { setActiveTab('alignments'); setEditingItem(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'alignments' ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Strategic Alignment
        </button>
        <button 
          onClick={() => { setActiveTab('desk-officers'); setEditingItem(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'desk-officers' ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Desk Officers
        </button>
      </div>

      <div className="space-y-6">
        {/* Tab 1: Orgs & MDAs */}
        {activeTab === 'orgs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Registered Organizations</h3>
                <div className="relative max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input 
                    type="text"
                    placeholder="Search by name..."
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded text-xs focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="border border-border/60 rounded-lg overflow-hidden bg-card divide-y divide-border/40">
                {organizations.filter(o => o.name.toLowerCase().includes(q.toLowerCase())).map(o => (
                  <div key={o.id} className="p-3 flex justify-between items-center text-xs hover:bg-muted/10 transition-colors">
                    <div>
                      <div className="font-bold text-foreground">{o.name}</div>
                      <div className="flex gap-2 items-center text-muted-foreground mt-1">
                        <span className="bg-muted px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[9px]">{o.type}</span>
                        <span>•</span>
                        <span>Code: {o.code || 'None'}</span>
                        <span>•</span>
                        <span className={o.isActive ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                          {o.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteOrganization(o.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                      title="Delete Organization"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Card className="border-border/60 bg-card">
                <CardHeader className="border-b border-border/40 bg-muted/10">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Landmark className="size-4" /> Quick Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-xs text-muted-foreground space-y-2">
                  <p>
                    Organizations comprise all executive offices, ministries, departments, parastatals, and units.
                  </p>
                  <p>
                    To configure new ministries or departments, please use the specific creation menus under the Organization section sidebar (e.g. Create Ministry, Create Agency).
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Development Plan Pillars & Objectives */}
        {activeTab === 'pillars' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pillars Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex justify-between items-center">
                Development Plan Pillars
                <button 
                  onClick={() => { setEditingItem(null); setPillarName(""); setPillarDesc(""); }} 
                  className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded flex items-center gap-1"
                >
                  <Plus className="size-3" /> New
                </button>
              </h3>
              
              <div className="space-y-4">
                {pillars.map(p => (
                  <Card key={p.id} className="border-border/60 bg-card hover:shadow-sm transition-all">
                    <CardHeader className="p-3 border-b border-border/40 flex flex-row justify-between items-center">
                      <div className="font-bold text-sm">{p.name}</div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEditPillarClick(p)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary" title="Edit Pillar"><Edit className="size-4" /></button>
                        <button onClick={() => handleDeletePillar(p.id)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500" title="Delete Pillar"><Trash2 className="size-4" /></button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 text-xs text-muted-foreground">
                      <p className="mb-2">{p.description || 'No description provided'}</p>
                      <div className="flex gap-4">
                        <span>Start: {p.plan_year_start}</span>
                        <span>End: {p.plan_year_end}</span>
                        <span>Status: <span className="font-bold text-foreground">{p.status}</span></span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Form: Add/Edit Pillar */}
              <Card className="border-border/60 bg-card">
                <CardHeader className="p-3 border-b border-border/40">
                  <CardTitle className="text-xs font-bold uppercase">{editingItem ? 'Edit' : 'Create'} Pillar</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold">Pillar Name</label>
                    <input 
                      type="text" 
                      value={pillarName} 
                      onChange={e => setPillarName(e.target.value)}
                      placeholder="e.g. Agriculture Development" 
                      className="w-full p-2 bg-background border border-border rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">Description</label>
                    <textarea 
                      value={pillarDesc} 
                      onChange={e => setPillarDesc(e.target.value)}
                      placeholder="Goal description..." 
                      className="w-full p-2 bg-background border border-border rounded h-20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-semibold">Plan Start Year</label>
                      <input 
                        type="number" 
                        value={pillarStart} 
                        onChange={e => setPillarStart(parseInt(e.target.value))}
                        className="w-full p-2 bg-background border border-border rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold">Plan End Year</label>
                      <input 
                        type="number" 
                        value={pillarEnd} 
                        onChange={e => setPillarEnd(parseInt(e.target.value))}
                        className="w-full p-2 bg-background border border-border rounded"
                      />
                    </div>
                  </div>
                  <button onClick={handleSavePillar} className="w-full py-2 bg-[#C5A059] text-white font-bold rounded flex items-center justify-center gap-1.5">
                    <Save className="size-4" /> Save Pillar
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Objectives Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex justify-between items-center">
                Strategic Objectives
                <button 
                  onClick={() => { setEditingItem(null); setObjTitle(""); setObjCode(""); setObjDesc(""); }}
                  className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded flex items-center gap-1"
                >
                  <Plus className="size-3" /> New
                </button>
              </h3>

              <div className="space-y-4">
                {objectives.map(o => (
                  <Card key={o.id} className="border-border/60 bg-card hover:shadow-sm transition-all">
                    <CardHeader className="p-3 border-b border-border/40 flex flex-row justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded mr-2">
                          {o.objective_code}
                        </span>
                        <span className="font-bold text-sm">{o.objective_title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEditObjectiveClick(o)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary" title="Edit Objective"><Edit className="size-4" /></button>
                        <button onClick={() => handleDeleteObjective(o.id)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500" title="Delete Objective"><Trash2 className="size-4" /></button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 text-xs text-muted-foreground">
                      <p className="mb-2">{o.description}</p>
                      <div>Pillar: <span className="font-bold text-foreground">{o.pillar_name}</span></div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Form: Add/Edit Objective */}
              <Card className="border-border/60 bg-card">
                <CardHeader className="p-3 border-b border-border/40">
                  <CardTitle className="text-xs font-bold uppercase">{editingItem ? 'Edit' : 'Create'} Strategic Objective</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold">Select Parent Pillar</label>
                    <select 
                      value={objPillarId}
                      onChange={e => handlePillarSelectionForObjective(e.target.value)}
                      className="w-full p-2 bg-background border border-border rounded"
                    >
                      <option value="">-- Choose Pillar --</option>
                      {pillars.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-1">
                      <label className="font-semibold">Objective Code</label>
                      <input 
                        type="text" 
                        value={objCode} 
                        onChange={e => setObjCode(e.target.value)}
                        placeholder="e.g. SO-AGRIC-01" 
                        className="w-full p-2 bg-background border border-border rounded"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="font-semibold">Objective Title</label>
                      <input 
                        type="text" 
                        value={objTitle} 
                        onChange={e => setObjTitle(e.target.value)}
                        placeholder="e.g. Local Fertilizer Distribution" 
                        className="w-full p-2 bg-background border border-border rounded"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">Description</label>
                    <textarea 
                      value={objDesc} 
                      onChange={e => setObjDesc(e.target.value)}
                      placeholder="Details of this objective..." 
                      className="w-full p-2 bg-background border border-border rounded h-20"
                    />
                  </div>
                  <button onClick={handleSaveObjective} className="w-full py-2 bg-[#C5A059] text-white font-bold rounded flex items-center justify-center gap-1.5">
                    <Save className="size-4" /> Save Strategic Objective
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Budget Master (Years & Line Items) */}
        {activeTab === 'budgets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold">Budget Line Items (Relational Registry)</h3>
              
              <div className="border border-border/60 rounded-lg overflow-hidden bg-card divide-y divide-border/40">
                {budgetLines.map(bl => (
                  <div key={bl.id} className="p-3 flex justify-between items-center text-xs hover:bg-muted/10 transition-colors">
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        <span className="font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px]">
                          {bl.budget_code}
                        </span>
                        <span className="font-bold text-foreground">{bl.line_item_name}</span>
                      </div>
                      <div className="text-muted-foreground">
                        MDA: {bl.organization_name} • Year: {bl.budget_year}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="font-bold text-foreground">₦{(bl.approved_amount / 1000000).toFixed(1)}M</div>
                        <div className="text-[10px] text-muted-foreground">Bal: ₦{(bl.available_balance / 1000000).toFixed(1)}M</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEditBudgetLineClick(bl)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary" title="Edit Budget Line"><Edit className="size-4" /></button>
                        <button onClick={() => handleDeleteBudgetLine(bl.id)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500" title="Delete Budget Line"><Trash2 className="size-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Form: Add Budget Year */}
              <Card className="border-border/60 bg-card">
                <CardHeader className="p-3 border-b border-border/40 bg-muted/10">
                  <CardTitle className="text-xs font-bold uppercase flex items-center gap-2">
                    <Calendar className="size-4 text-[#C5A059]" /> Register Budget Year
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3 text-xs">
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      value={budgetYearVal}
                      onChange={e => setBudgetYearVal(parseInt(e.target.value))}
                      className="p-2 bg-background border border-border rounded flex-1"
                    />
                    <button onClick={handleSaveBudgetYear} className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded">
                      Add Year
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {budgetYears.map(by => (
                      <div key={by.id} className="flex items-center bg-muted rounded overflow-hidden">
                        <span className={`px-2.5 py-1 text-xs font-bold ${by.is_active ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-foreground'}`}>
                          {by.year} {by.is_active ? '✓' : ''}
                        </span>
                        {!by.is_active && (
                          <button onClick={() => handleSetActiveBudgetYear(by.id)} className="px-2 py-1 text-[10px] hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors" title="Set Active">
                            Set Active
                          </button>
                        )}
                        <button onClick={() => handleDeleteBudgetYear(by.id)} className="px-2 py-1 text-[10px] hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-colors" title="Delete Year">
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Form: Add/Edit Budget Line Item */}
              <Card className="border-border/60 bg-card">
                <CardHeader className="p-3 border-b border-border/40 bg-muted/10">
                  <CardTitle className="text-xs font-bold uppercase flex items-center gap-2">
                    <Wallet className="size-4 text-[#C5A059]" /> Configure Budget Line Item
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold">Supervising MDA / Office</label>
                    <SearchableSelect
                      options={organizations.map(o => ({ id: o.id, name: o.name, subtext: o.type }))}
                      value={blOrgId}
                      onChange={setBlOrgId}
                      placeholder="Select MDA"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold">Budget Year</label>
                    <select 
                      value={blYearId}
                      onChange={e => setBlYearId(e.target.value)}
                      className="w-full p-2 bg-background border border-border rounded"
                    >
                      <option value="">-- Select Year --</option>
                      {budgetYears.map(by => (
                        <option key={by.id} value={by.id}>{by.year}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-semibold">Budget Code</label>
                      <input 
                        type="text" 
                        value={blCode}
                        onChange={e => setBlCode(e.target.value)}
                        placeholder="e.g. MOE-2026-CAP-01"
                        className="w-full p-2 bg-background border border-border rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold">Line Item Name</label>
                      <input 
                        type="text" 
                        value={blName}
                        onChange={e => setBlName(e.target.value)}
                        placeholder="e.g. Primary School Upgrades"
                        className="w-full p-2 bg-background border border-border rounded"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold">Approved Amount (₦)</label>
                    <input 
                      type="text" 
                      value={blApproved}
                      onChange={e => setBlApproved(e.target.value)}
                      className="w-full p-2 bg-background border border-border rounded font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold">Description</label>
                    <textarea 
                      value={blDesc}
                      onChange={e => setBlDesc(e.target.value)}
                      className="w-full p-2 bg-background border border-border rounded h-16"
                    />
                  </div>

                  <button onClick={handleSaveBudgetLine} className="w-full py-2 bg-[#C5A059] text-white font-bold rounded flex items-center justify-center gap-1.5">
                    <Save className="size-4" /> Save Line Item
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 4: Strategic Alignments */}
        {activeTab === 'alignments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Card className="border-border/60 bg-card">
                <CardHeader className="border-b border-border/40 bg-muted/10">
                  <CardTitle className="text-xs font-bold uppercase flex items-center gap-2">
                    <Target className="size-4 text-[#C5A059]" /> Align MDA to Strategic Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold block">Select Ministry / Organization</label>
                    <SearchableSelect
                      options={organizations.map(o => ({ id: o.id, name: o.name, subtext: o.type }))}
                      value={alignOrgId}
                      onChange={setAlignOrgId}
                      placeholder="Select Organization"
                    />
                  </div>

                  {alignOrgId && (
                    <div className="space-y-3 pt-3 border-t border-border/40">
                      <label className="font-semibold block mb-2">Check Aligned Strategic Objectives</label>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto border border-border p-2 rounded bg-muted/5">
                        {objectives.map(o => {
                          const checked = alignSelectedObjectives.includes(o.id);
                          return (
                            <div key={o.id} className="flex items-start gap-2 py-1">
                              <input 
                                type="checkbox"
                                id={`obj-${o.id}`}
                                checked={checked}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setAlignSelectedObjectives([...alignSelectedObjectives, o.id]);
                                  } else {
                                    setAlignSelectedObjectives(alignSelectedObjectives.filter(id => id !== o.id));
                                  }
                                }}
                                className="mt-0.5 rounded text-primary focus:ring-primary"
                              />
                              <label htmlFor={`obj-${o.id}`} className="cursor-pointer">
                                <span className="font-bold text-amber-500 mr-1">[{o.objective_code}]</span>
                                {o.objective_title}
                              </label>
                            </div>
                          );
                        })}
                      </div>

                      <button onClick={handleSaveAlignment} className="w-full py-2 bg-[#C5A059] text-white font-bold rounded flex items-center justify-center gap-1.5 mt-2">
                        <Save className="size-4" /> Save Alignments
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold">Active Organization Alignment Mapping</h3>
              <div className="border border-border/60 rounded-lg overflow-hidden bg-card divide-y divide-border/40">
                {alignments.map((a, idx) => (
                  <div key={idx} className="p-3 text-xs flex justify-between items-start hover:bg-muted/10 transition-colors">
                    <div>
                      <div className="font-bold text-foreground">{a.organization_name}</div>
                      <div className="text-muted-foreground mt-1 flex items-center gap-2">
                        <span className="font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded text-[10px]">
                          {a.objective_code}
                        </span>
                        <span>{a.objective_title}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAlignment(a.organization_id, a.strategic_objective_id)}
                      className="p-1 hover:bg-red-500/10 rounded text-muted-foreground hover:text-red-500 transition-colors"
                      title="Remove Alignment"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Desk Officers Assignment */}
        {activeTab === 'desk-officers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Card className="border-border/60 bg-card">
                <CardHeader className="border-b border-border/40 bg-muted/10">
                  <CardTitle className="text-xs font-bold uppercase flex items-center gap-2">
                    <Users className="size-4 text-[#C5A059]" /> Assign Desk Officer
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold block">Select Organization / MDA</label>
                    <SearchableSelect
                      options={organizations.map(o => ({ id: o.id, name: o.name, subtext: o.type }))}
                      value={doOrgId}
                      onChange={setDoOrgId}
                      placeholder="Select Organization"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold block">Select User / Officer</label>
                    <SearchableSelect
                      options={[
                        { id: '', name: 'No Desk Officer (De-assign)' },
                        ...staffList.map(s => ({
                          id: s.userId,
                          name: s.name,
                          subtext: `${s.staffId} • ${s.mda}`
                        }))
                      ]}
                      value={doUserId}
                      onChange={setDoUserId}
                      placeholder="Select Staff Officer"
                    />
                  </div>

                  <button onClick={handleSaveDeskOfficer} className="w-full py-2 bg-primary text-primary-foreground font-bold rounded flex items-center justify-center gap-1.5">
                    <Save className="size-4" /> Save Assignment
                  </button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold">Desk Officers List</h3>
              <div className="border border-border/60 rounded-lg overflow-hidden bg-card divide-y divide-border/40">
                {organizations.filter(o => o.desk_officer_user_id).map(o => {
                  const matchedUser = staffList.find(s => s.userId === o.desk_officer_user_id);
                  return (
                    <div key={o.id} className="p-3 text-xs flex justify-between items-center hover:bg-muted/10 transition-colors">
                      <div>
                        <div className="font-bold text-foreground">{o.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest">{o.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#C5A059]">{matchedUser?.name || 'Assigned Officer'}</div>
                        <div className="text-[10px] text-muted-foreground">{matchedUser?.email}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
