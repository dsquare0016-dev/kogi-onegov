import { getOrganizationsList, dbGetPillarsAndObjectives, dbGetBudgetYears, dbGetOrganizationAlignments, dbGetBudgetLineItems, dbSaveProgramme } from '@/lib/postgres-service';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useMemo } from 'react';
import { Layers, Save, Building, Target, Banknote, AlertCircle, Calendar } from 'lucide-react';
import { programmesStore } from '@/lib/programmesStore';
import { getSession, roleById } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/programmes/create')({
  component: CreateProgramme,
});

function CreateProgramme() {
  const navigate = useNavigate();
  const session = getSession();
  const isSuperAdmin = session?.role === 'super_admin';

  const [isSaved, setIsSaved] = useState(false);

  // State lists from DB
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [budgetYears, setBudgetYears] = useState<any[]>([]);
  const [budgetLines, setBudgetLines] = useState<any[]>([]);
  const [alignments, setAlignments] = useState<any[]>([]);

  // Form selections
  const [name, setName] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [selectedPillarId, setSelectedPillarId] = useState<string>("");
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedBudgetLineId, setSelectedBudgetLineId] = useState<string>("");
  const [budget, setBudget] = useState("");

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

  // Fetch Budget Line Items when organization or year changes
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

  // Filter Pillars & Objectives linked to the organization
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await dbSaveProgramme({
        data: {
          name: name,
          mda: org ? org.name : '',
          budget: Number(budget)
        }
      });
      alert(`Programme "${name}" successfully created.`);
      navigate({ to: '/dashboard/programmes' });
    } catch (e: any) {
      alert("Failed to save programme: " + e.message);
    }
    setIsSaved(false);
  };

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Programme</h1>
        <p className="text-muted-foreground mt-1">Initialize a strategic programme to bundle multiple related projects.</p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2"><Layers className="size-5 text-primary" /> Programme Core Details</CardTitle>
            <CardDescription>A programme acts as an umbrella for tracking large-scale initiatives.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="space-y-2">
                <Label>Executing Ministry / Agency (MDA)</Label>
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
                <Label htmlFor="name">Programme Title</Label>
                <Input id="name" placeholder="e.g. Statewide Healthcare Transformation" value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Proposed Total Budget (₦)</Label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-3 size-4 text-amber-500" />
                  <Input 
                    id="budget" 
                    type="number" 
                    className={`pl-9 ${isOverBudget ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
                    placeholder="e.g. 5000000" 
                    value={budget} 
                    onChange={e => setBudget(e.target.value)} 
                  />
                </div>
                {isOverBudget && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="size-3"/> 
                    Amount exceeds available balance (₦{(Number(selectedBudget?.available_balance || 0)).toLocaleString()})
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground mt-1">This is the umbrella envelope. Individual project budgets will draw from this.</p>
              </div>

              <Button type="submit" className="w-full mt-4 flex items-center gap-2 h-12 text-md" disabled={isSaved || isOverBudget || !name || !selectedBudgetLineId}>
                {isSaved ? (
                  <span className="flex items-center gap-2"><div className="size-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Saving...</span>
                ) : (
                  <span className="flex items-center gap-2"><Save className="size-5" /> Initialize Programme</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
