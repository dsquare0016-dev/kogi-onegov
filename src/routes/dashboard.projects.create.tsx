import { getOrganizationsList, dbGetPillarsAndObjectives, dbGetBudgetYears, dbGetOrganizationAlignments, dbGetBudgetLineItems, dbSaveProject } from '@/lib/postgres-service';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useMemo } from 'react';
import { FolderKanban, Save, MapPin, Building, Banknote, Calendar, Layers, AlertCircle } from 'lucide-react';
import { projectsStore } from '@/lib/projectsStore';
import { getSession } from '@/lib/auth';
import { useDbLgas } from '@/lib/useDbLgas';

export const Route = createFileRoute('/dashboard/projects/create')({
  component: CreateContent,
});

function CreateContent() {
  const [activeTab, setActiveTab] = useState<'project' | 'category'>('project');

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Projects & Categories</h1>
        <p className="text-muted-foreground mt-1">Initiate a new capital project or create a new development category.</p>
      </div>

      <div className="flex items-center gap-4 border-b border-border/50 pb-4">
        <button 
          onClick={() => setActiveTab('project')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'project' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted/50 text-muted-foreground'}`}
        >
          <FolderKanban className="size-4" /> Create Project
        </button>
        <button 
          onClick={() => setActiveTab('category')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'category' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted/50 text-muted-foreground'}`}
        >
          <Layers className="size-4" /> Create Category
        </button>
      </div>

      {activeTab === 'project' ? <CreateProject /> : <CreateCategory />}
    </div>
  );
}

function CreateCategory() {
  const [catName, setCatName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (!catName) return;
    setIsSaved(true);
    const updated = [...projectsStore.categories, { id: `cat-${Date.now()}`, name: catName, projects: [] }];
    projectsStore.categories = updated;
    setTimeout(() => {
      setIsSaved(false);
      setCatName('');
    }, 1500);
  };

  return (
    <div className="max-w-[600px] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2"><Layers className="size-5 text-primary" /> New Development Category</CardTitle>
          <CardDescription>Create a new overarching category to group related projects.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="catName">Category Name</Label>
            <Input id="catName" placeholder="e.g. Healthcare Infrastructure" value={catName} onChange={e => setCatName(e.target.value)} />
          </div>
          
          <Button className="w-full mt-4 flex items-center gap-2" onClick={handleSave} disabled={isSaved}>
            {isSaved ? <span className="flex items-center gap-2"><div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Saving...</span> : <span className="flex items-center gap-2"><Save className="size-4" /> Save Category</span>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateProject() {
  const navigate = useNavigate();
  const session = getSession();
  const isSuperAdmin = session?.role === 'super_admin';
  
  const [isSaved, setIsSaved] = useState(false);

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [budgetYears, setBudgetYears] = useState<any[]>([]);
  const [budgetLines, setBudgetLines] = useState<any[]>([]);
  const [alignments, setAlignments] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [lga, setLga] = useState('');
  const [budget, setBudget] = useState('');
  
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [selectedPillarId, setSelectedPillarId] = useState<string>("");
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedBudgetLineId, setSelectedBudgetLineId] = useState<string>("");

  const loadInitialData = async () => {
    

    const [orgs, planData, years, alignData] = await Promise.all([
      getOrganizationsList(),
      dbGetPillarsAndObjectives(),
      dbGetBudgetYears(),
      dbGetOrganizationAlignments()
    ]);

    setOrganizations(orgs);
    setPillars(planData.pillars);
    setObjectives(planData.objectives);
    setBudgetYears(years);
    setAlignments(alignData);

    if (session?.mda) {
      const match = orgs.find(o => o.name.toLowerCase().includes(session.mda!.toLowerCase()) || o.shortName?.toLowerCase() === session.mda!.toLowerCase());
      if (match) setSelectedOrgId(match.id);
    }

    const activeYear = years.find(y => y.is_active);
    if (activeYear) setSelectedYearId(activeYear.id);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const fetchBudgetLines = async () => {
      if (!selectedOrgId || !selectedYearId) {
        setBudgetLines([]);
        return;
      }
      
      const lines = await dbGetBudgetLineItems({
        data: {
          organizationId: selectedOrgId,
          budgetYearId: selectedYearId
        }
      });
      setBudgetLines(lines);
    };
    fetchBudgetLines();
  }, [selectedOrgId, selectedYearId]);

  const allowedObjectives = useMemo(() => {
    if (!selectedOrgId) return [];
    if (isSuperAdmin || session?.role === 'governor') return objectives;
    
    const linkedIds = alignments
      .filter(a => a.organization_id === selectedOrgId)
      .map(a => a.strategic_objective_id);
    return objectives.filter(o => linkedIds.includes(o.id));
  }, [selectedOrgId, objectives, alignments, isSuperAdmin]);

  const allowedPillars = useMemo(() => {
    if (isSuperAdmin || session?.role === 'governor') return pillars;
    const allowedPillarIds = allowedObjectives.map(o => o.pillar_id);
    return pillars.filter(p => allowedPillarIds.includes(p.id));
  }, [allowedObjectives, pillars, isSuperAdmin]);

  const filteredObjectives = useMemo(() => {
    if (!selectedPillarId) return allowedObjectives;
    return allowedObjectives.filter(o => o.pillar_id === selectedPillarId);
  }, [selectedPillarId, allowedObjectives]);

  const selectedBudget = useMemo(() => {
    return budgetLines.find(b => b.id === selectedBudgetLineId);
  }, [selectedBudgetLineId, budgetLines]);

  const isOverBudget = useMemo(() => {
    if (!selectedBudget) return false;
    return Number(budget) > Number(selectedBudget.available_balance);
  }, [selectedBudget, budget]);

  const handleSave = async () => {
    if (!name || !selectedOrgId || !selectedBudgetLineId || !selectedPillarId || !selectedObjectiveId || !budget) {
      alert("Please complete all required fields.");
      return;
    }
    if (isOverBudget) {
      alert("Cannot publish: Budget limit exceeded.");
      return;
    }

    setIsSaved(true);
    try {
      
      const org = organizations.find(o => o.id === selectedOrgId);
      await dbSaveProject({
        data: {
          name: name,
          ministry: org ? org.name : '',
          lga: lga,
          budget: Number(budget)
        }
      });
      alert(`Project "${name}" successfully created.`);
      navigate({ to: '/dashboard/projects' });
    } catch (e: any) {
      alert("Failed to save project: " + e.message);
    }
    setIsSaved(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2"><FolderKanban className="size-5 text-primary" /> Basic Project Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Executing Ministry/Agency</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  value={selectedOrgId}
                  onChange={e => setSelectedOrgId(e.target.value)}
                  disabled={!isSuperAdmin && !!session?.mda}
                >
                  <option value="">Select Organization...</option>
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" placeholder="e.g. Construction of 500-bed hospital" value={name} onChange={e => setName(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Development Pillar</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    value={selectedPillarId}
                    onChange={e => {
                      setSelectedPillarId(e.target.value);
                      setSelectedObjectiveId("");
                    }}
                  >
                    <option value="">Select Pillar...</option>
                    {allowedPillars.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Strategic Objective</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    value={selectedObjectiveId}
                    onChange={e => setSelectedObjectiveId(e.target.value)}
                  >
                    <option value="">Select Objective...</option>
                    {filteredObjectives.map(o => (
                      <option key={o.id} value={o.id}>{o.objective_title}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="desc">Project Description & Scope</Label>
                <textarea 
                  id="desc" 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  placeholder="Provide a detailed scope of work..."
                />
              </div>
            </CardContent>
          </Card>

          <LocationCardWithDbLgas lga={lga} setLga={setLga} />
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2"><Banknote className="size-5 text-amber-500" /> Financials</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Budget Year</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  value={selectedYearId}
                  onChange={e => setSelectedYearId(e.target.value)}
                >
                  <option value="">Select Year...</option>
                  {budgetYears.map(y => (
                    <option key={y.id} value={y.id}>{y.year} {y.is_active ? '(Active)' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Budget Line Item</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  value={selectedBudgetLineId}
                  onChange={e => setSelectedBudgetLineId(e.target.value)}
                  disabled={!selectedOrgId || !selectedYearId || budgetLines.length === 0}
                >
                  <option value="">{budgetLines.length === 0 ? (selectedOrgId && selectedYearId ? 'No Budget Lines' : 'Select Budget Line...') : 'Select Budget Line...'}</option>
                  {budgetLines.map(bl => (
                    <option key={bl.id} value={bl.id}>
                      {bl.budget_code} - {bl.line_item_name}
                    </option>
                  ))}
                </select>
                {selectedBudget && (
                  <p className="text-[10px] text-muted-foreground font-medium flex justify-between mt-1">
                    <span>Available: ₦{(Number(selectedBudget.available_balance)).toLocaleString()}</span>
                    <span>Approved: ₦{(Number(selectedBudget.approved_amount)).toLocaleString()}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Total Approved Budget (₦)</Label>
                <Input 
                  id="budget" 
                  type="number" 
                  placeholder="0.00" 
                  value={budget} 
                  onChange={e => setBudget(e.target.value)} 
                  className={isOverBudget ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {isOverBudget && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="size-3"/> 
                    Amount exceeds available balance (₦{(Number(selectedBudget?.available_balance || 0)).toLocaleString()})
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-3">
            <Button className="w-full flex items-center gap-2" onClick={handleSave} disabled={isSaved || isOverBudget || !name || !selectedBudgetLineId}>
              {isSaved ? <span className="flex items-center gap-2"><div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Saving...</span> : <span className="flex items-center gap-2"><Save className="size-4" /> Create Project</span>}
            </Button>
          </div>
        </div>
    </div>
  );
}

/** LGA card that loads from PostgreSQL */
function LocationCardWithDbLgas({ lga, setLga }: { lga: string; setLga: (v: string) => void }) {
  const { lgas, loading } = useDbLgas();
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <CardTitle className="text-lg flex items-center gap-2"><MapPin className="size-5 text-emerald-500" /> Location &amp; Timeline</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lga">Local Government Area (LGA)</Label>
            <select
              id="lga"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              value={lga}
              onChange={e => setLga(e.target.value)}
              disabled={loading}
            >
              <option value="">{loading ? 'Loading LGAs...' : 'Select LGA...'}</option>
              <option value="Statewide">Statewide</option>
              {lgas.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ward">Ward / Specific Community</Label>
            <Input id="ward" placeholder="e.g. Ward A" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start">Expected Start Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input type="date" id="start" className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">Expected Completion Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input type="date" id="end" className="pl-9" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
