import { getOrganizationsList, getStaffSearchableList, dbGetPillarsAndObjectives, dbGetBudgetYears, dbGetOrganizationAlignments, dbGetBudgetLineItems, dbSaveTask } from '@/lib/postgres-service';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Network, Activity, AlignLeft, Calendar as CalendarIcon, UserPlus, FileUp, ShieldCheck, Wallet, Loader2 } from 'lucide-react';
import { getSession, roleById } from '@/lib/auth';
import { LGAS } from '@/lib/mock-data';
import { SearchableSelect } from '@/components/SearchableSelect';

export const Route = createFileRoute('/dashboard/tasks/creation')({
  component: TaskCreationComponent,
});

function TaskCreationComponent() {
  const navigate = useNavigate();
  const session = getSession();
  const profile = session ? roleById(session.role) : null;
  const isSuperAdmin = session?.role === 'super_admin';

  // State lists from DB
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [budgetYears, setBudgetYears] = useState<any[]>([]);
  const [budgetLines, setBudgetLines] = useState<any[]>([]);
  const [alignments, setAlignments] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form selections
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskObjective, setTaskObjective] = useState("");
  const [taskOutcome, setTaskOutcome] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetLga, setTargetLga] = useState("statewide");
  
  // Relational Form selections
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [selectedPillarId, setSelectedPillarId] = useState<string>("");
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedBudgetLineId, setSelectedBudgetLineId] = useState<string>("");
  const [taskBudget, setTaskBudget] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState("");

  const [activeSection, setActiveSection] = useState('basic');

  const loadInitialData = async () => {
    setLoading(true);
    

    const [orgs, staff, planData, years, alignData] = await Promise.all([
      getOrganizationsList(),
      getStaffSearchableList(),
      dbGetPillarsAndObjectives(),
      dbGetBudgetYears(),
      dbGetOrganizationAlignments()
    ]);

    setOrganizations(orgs);
    setStaffList(staff);
    setPillars(planData.pillars);
    setObjectives(planData.objectives);
    setBudgetYears(years);
    setAlignments(alignData);

    // Auto-select user's organization if not super admin
    if (session?.mda) {
      const match = orgs.find(o => o.name.toLowerCase().includes(session.mda!.toLowerCase()) || o.shortName?.toLowerCase() === session.mda!.toLowerCase());
      if (match) setSelectedOrgId(match.id);
    }

    // Default to active year
    const activeYear = years.find(y => y.is_active);
    if (activeYear) setSelectedYearId(activeYear.id);

    setLoading(false);
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
    // If Super Admin/Governor, show all objectives
    if (isSuperAdmin || session?.role === 'governor') return objectives;
    
    // Filter to objectives linked in organization_strategic_objectives
    const linkedIds = alignments
      .filter(a => a.organization_id === selectedOrgId)
      .map(a => a.strategic_objective_id);
    return objectives.filter(o => linkedIds.includes(o.id));
  }, [selectedOrgId, objectives, alignments, isSuperAdmin]);

  // Filter pillars derived from allowed objectives
  const allowedPillars = useMemo(() => {
    if (isSuperAdmin || session?.role === 'governor') return pillars;
    const allowedPillarIds = allowedObjectives.map(o => o.pillar_id);
    return pillars.filter(p => allowedPillarIds.includes(p.id));
  }, [allowedObjectives, pillars, isSuperAdmin]);

  // Filter objectives belonging to selected pillar
  const filteredObjectives = useMemo(() => {
    if (!selectedPillarId) return allowedObjectives;
    return allowedObjectives.filter(o => o.pillar_id === selectedPillarId);
  }, [selectedPillarId, allowedObjectives]);

  // Selected budget line metadata
  const selectedBudget = useMemo(() => {
    return budgetLines.find(b => b.id === selectedBudgetLineId);
  }, [selectedBudgetLineId, budgetLines]);

  const isOverBudget = useMemo(() => {
    if (!selectedBudget) return false;
    return Number(taskBudget) > Number(selectedBudget.available_balance);
  }, [selectedBudget, taskBudget]);

  // Strategic Alignment Validation Status
  const isAligned = useMemo(() => {
    if (!selectedPillarId || !selectedObjectiveId || !selectedYearId || !selectedBudgetLineId) {
      return false;
    }
    // Check if the selected strategic objective is linked to the selected organization
    const hasOrgObjective = alignments.some(a => 
      a.organization_id === selectedOrgId && a.strategic_objective_id === selectedObjectiveId
    );
    // If Super Admin/Governor, bypass strict link check, just require selections
    if (isSuperAdmin || session?.role === 'governor') {
      return true;
    }
    return hasOrgObjective;
  }, [selectedOrgId, selectedPillarId, selectedObjectiveId, selectedYearId, selectedBudgetLineId, alignments, isSuperAdmin]);

  const handleScrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handlePublishTask = async () => {
    if (!taskTitle.trim() || !taskDescription.trim() || !selectedOrgId || !selectedBudgetLineId || !selectedPillarId || !selectedObjectiveId) {
      alert("Please complete all required fields, including Strategic Alignment.");
      return;
    }
    if (isOverBudget) {
      alert("Cannot publish: Budget limit exceeded.");
      return;
    }

    
    try {
      await dbSaveTask({
        data: {
          organization_id: selectedOrgId,
          fiscal_year_id: selectedYearId,
          budget_line_id: selectedBudgetLineId,
          development_goal_id: selectedPillarId, // In table tasks: development_goal_id is the pillar ID
          strategic_objective_id: selectedObjectiveId,
          assigned_to_name: selectedOfficer,
          title: taskTitle,
          description: taskDescription,
          estimated_amount: parseFloat(taskBudget) || 0,
          due_date: endDate || null,
          start_date: startDate || null,
          priority: taskPriority
        }
      });
      alert(`Task "${taskTitle}" successfully published and saved to PostgreSQL.`);
      navigate({ to: '/dashboard/tasks' });
    } catch (e: any) {
      alert("Failed to save task: " + e.message);
    }
  };

  const isPublishEnabled = taskTitle.trim() && taskDescription.trim() && isAligned && !isOverBudget;

  return (
    <div className="p-6 max-w-[1200px] mx-auto pb-24 space-y-6 text-foreground animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Create New Task</h1>
        <p className="text-muted-foreground mt-1">
          Strictly enforce strategic alignment, budget tracking, and relational evidence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Navigation for the Form */}
        <div className="hidden lg:flex flex-col gap-2 sticky top-24">
           <button onClick={() => handleScrollTo('basic')} className={`p-2.5 rounded-lg text-left text-xs font-bold transition-all flex items-center gap-2 ${activeSection === 'basic' ? 'bg-[#C5A059] text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}><AlignLeft className="size-4" /> Basic Information</button>
           <button onClick={() => handleScrollTo('strategic')} className={`p-2.5 rounded-lg text-left text-xs font-bold transition-all flex items-center gap-2 ${activeSection === 'strategic' ? 'bg-[#C5A059] text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'} ${!isAligned ? 'border border-dashed border-rose-500/50' : ''}`}><Network className="size-4" /> Strategic Alignment</button>
           <button onClick={() => handleScrollTo('ownership')} className={`p-2.5 rounded-lg text-left text-xs font-bold transition-all flex items-center gap-2 ${activeSection === 'ownership' ? 'bg-[#C5A059] text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}><UserPlus className="size-4" /> Task Ownership</button>
           <button onClick={() => handleScrollTo('execution')} className={`p-2.5 rounded-lg text-left text-xs font-bold transition-all flex items-center gap-2 ${activeSection === 'execution' ? 'bg-[#C5A059] text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}><CalendarIcon className="size-4" /> Execution Details</button>
           <button onClick={() => handleScrollTo('budget')} className={`p-2.5 rounded-lg text-left text-xs font-bold transition-all flex items-center gap-2 ${activeSection === 'budget' ? 'bg-[#C5A059] text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'} ${isOverBudget ? 'border border-dashed border-rose-500/50' : ''}`}><Wallet className="size-4" /> Budget Information</button>
        </div>

        {/* Form Sections */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Section 1: Basic Info */}
          <div id="basic" onFocusCapture={() => setActiveSection('basic')} onMouseEnter={() => setActiveSection('basic')}>
            <Card className="border-border/60 bg-card shadow-sm hover:border-primary/50 transition-all duration-300">
              <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlignLeft className="size-5 text-primary" /> Task Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {isSuperAdmin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reporting Ministry / MDA</label>
                    <SearchableSelect
                      options={organizations.map(o => ({ id: o.id, name: o.name, subtext: o.type }))}
                      value={selectedOrgId}
                      onChange={setSelectedOrgId}
                      placeholder="Select Ministry/MDA"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Task Title</label>
                  <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Renovation of Lokoja General Hospital Ward B" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Task Description</label>
                  <textarea value={taskDescription} onChange={e => setTaskDescription(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm h-24 focus:outline-none" placeholder="Provide detailed scope of work..."></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Objective</label>
                    <input type="text" value={taskObjective} onChange={e => setTaskObjective(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none" placeholder="Task objective" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expected Outcome</label>
                    <input type="text" value={taskOutcome} onChange={e => setTaskOutcome(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none" placeholder="Expected outcome" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority Level</label>
                  <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm">
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Strategic Alignment */}
          <div id="strategic" onFocusCapture={() => setActiveSection('strategic')} onMouseEnter={() => setActiveSection('strategic')}>
            <Card className={`border-dashed border-2 shadow-sm relative overflow-hidden transition-all duration-300 ${
              isAligned ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
            }`}>
              <div className={`absolute top-0 right-0 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg ${
                isAligned ? 'bg-emerald-500' : 'bg-rose-500'
              }`}>
                {isAligned ? 'Aligned' : 'Not Aligned'}
              </div>
              <CardHeader className="pb-4 border-b border-border/10">
                <CardTitle className={`text-lg flex items-center gap-2 ${isAligned ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                  <Network className="size-5" /> Strategic Alignment
                </CardTitle>
                <CardDescription>Link the task to your Ministry alignments in the Development Plan and Budget.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Development Plan Pillar</label>
                    <select 
                      value={selectedPillarId} 
                      onChange={e => setSelectedPillarId(e.target.value)} 
                      className="w-full p-2 bg-background border border-border rounded-md text-sm"
                    >
                      <option value="">Select Pillar...</option>
                      {allowedPillars.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Strategic Objective</label>
                    <select 
                      value={selectedObjectiveId} 
                      onChange={e => setSelectedObjectiveId(e.target.value)} 
                      className="w-full p-2 bg-background border border-border rounded-md text-sm"
                    >
                      <option value="">Select Objective...</option>
                      {filteredObjectives.map(o => (
                        <option key={o.id} value={o.id}>[{o.objective_code}] {o.objective_title}</option>
                      ))}
                    </select>
                  </div>
                   <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Budget Year</label>
                    <select 
                      className="w-full p-2 bg-background border border-border rounded-md text-sm"
                      value={selectedYearId}
                      onChange={e => setSelectedYearId(e.target.value)}
                    >
                      <option value="">Select Budget Year...</option>
                      {budgetYears.map(by => (
                        <option key={by.id} value={by.id}>{by.year}</option>
                      ))}
                    </select>
                  </div>
                   <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Budget Code & Line Item</label>
                    <select 
                      className="w-full p-2 bg-background border border-border rounded-md text-sm"
                      value={selectedBudgetLineId}
                      onChange={(e) => setSelectedBudgetLineId(e.target.value)}
                    >
                      <option value="">Link to Budget Line...</option>
                      {budgetLines.map(b => (
                        <option key={b.id} value={b.id}>{b.budget_code} - {b.line_item_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 3: Task Ownership */}
          <div id="ownership" onFocusCapture={() => setActiveSection('ownership')} onMouseEnter={() => setActiveSection('ownership')}>
            <Card className="border-border/60 bg-card shadow-sm hover:border-primary/50 transition-all duration-300">
              <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="size-5 text-primary" /> Task Ownership
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Responsible Officer (Staff List)</label>
                  <SearchableSelect
                    options={staffList.map(s => ({ id: s.name, name: s.name, subtext: `${s.staffId} • ${s.mda}` }))}
                    value={selectedOfficer}
                    onChange={setSelectedOfficer}
                    placeholder="Assign to staff officer"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 4: Execution Details */}
          <div id="execution" onFocusCapture={() => setActiveSection('execution')} onMouseEnter={() => setActiveSection('execution')}>
            <Card className="border-border/60 bg-card shadow-sm hover:border-primary/50 transition-all duration-300">
              <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="size-5 text-primary" /> Execution Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expected Completion Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Location / LGA</label>
                  <select value={targetLga} onChange={e => setTargetLga(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm">
                    <option value="statewide">Statewide</option>
                    {LGAS.map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 5: Budget Information */}
          <div id="budget" onFocusCapture={() => setActiveSection('budget')} onMouseEnter={() => setActiveSection('budget')}>
            <Card className="border-border/60 bg-card shadow-sm hover:border-primary/50 transition-all duration-300">
              <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="size-5 text-primary" /> Budget Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Approved Task Budget Limit (₦)</label>
                    <input 
                      type="number" 
                      className={`w-full p-2 bg-background border rounded-md text-sm ${isOverBudget ? 'border-red-500 focus:ring-red-500' : 'border-border'}`} 
                      placeholder="e.g. 5000000" 
                      value={taskBudget}
                      onChange={(e) => setTaskBudget(e.target.value)}
                    />
                    {selectedBudget && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Available Balance: <span className="font-bold text-[#C5A059]">₦{Number(selectedBudget.available_balance).toLocaleString()}</span>
                      </div>
                    )}
                    {isOverBudget && (
                      <div className="text-xs text-red-500 font-medium mt-1 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-200 dark:border-red-800">
                        You have exceeded the available balance for this Budget Line Item.
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Tranche Model</label>
                    <select className="w-full p-2 bg-background border border-border rounded-md text-sm">
                      <option>Single Payment (100% on completion)</option>
                      <option>Milestone Based (e.g. 30%, 40%, 30%)</option>
                      <option>Continuous / Operational Drawdown</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Trigger */}
          <div className="flex justify-end gap-3">
            <button onClick={() => navigate({ to: '/dashboard/tasks' })} className="px-5 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors cursor-pointer">Cancel</button>
            <button 
              onClick={handlePublishTask}
              disabled={!isPublishEnabled}
              className={`px-6 py-2 rounded-lg text-sm font-bold text-white shadow-sm flex items-center gap-2 cursor-pointer ${
                isPublishEnabled ? 'bg-primary hover:bg-primary/95' : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
              }`}
            >
              Publish Task
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
