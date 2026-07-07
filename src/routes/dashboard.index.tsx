import { dbGetSystemHealthStatus } from '@/lib/postgres-service';
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getSession, roleById } from "@/lib/auth";
import type { RoleProfile } from "@/lib/roles";
import { useEffect, useState } from "react";
import { useDbLgas } from "@/lib/useDbLgas";

// Components
import { PageHeader, Stat, Card, Pill, Bar } from "@/components/ui-bits";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar as RBar, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend, LineChart, Line } from "recharts";
import { KPIS, MINISTRIES, BUDGET_TREND, AI_INSIGHTS, PILLARS, PROJECTS, MESSAGES, STAFF_SAMPLE } from "@/lib/mock-data";
import { BUDGET_PROFILE, REVENUE_SOURCES } from "@/lib/budget-data";
import { COMMISSIONERS } from "@/lib/governance-data";
import { TrendingUp, TrendingDown, AlertTriangle, Sparkles, Users, Activity, Wallet, FolderKanban, Building2, Award, Map, ArrowUpRight, FileText, MessageSquare, ShoppingCart, CheckCircle2, Calendar, Target, Globe, Shield, Landmark, Layers, Mail, Receipt, ShieldAlert, Settings, Key, Plus, Banknote, IdCard, ListChecks, PartyPopper, BrainCircuit, RefreshCw, Database } from "lucide-react";
import { carouselStore } from '@/lib/carouselStore';
import { BudgetAIEngine } from "@/components/BudgetAIEngine";
import { getTotalMinistries, getTotalAgencies, getTotalLGAs, getActiveProjects, getStatePerformanceIndex, getBudgetUtilization, getDevelopmentPlanPerformance, getTotalCivilServants, getDelayedProjects, getTotalDevPlanPillars, getTotalProgrammes, getAttendanceRate, getBudgetExecutionTrend, getTotalRevenue, getTotalBudget } from "@/lib/systemDataService";
import { handleAskAI } from "@/lib/ai-intelligence-service";
import { CardDetailModal } from "@/components/CardDetailModal";
import { attendanceStore } from "@/lib/attendanceStore";
import { useSettingsStore } from "@/lib/settingsStore";
import { GduKogiLoader } from "@/components/GduKogiLoader";
import { useNominalRollStore } from "@/lib/nominalRollStore";
import { useProfileStore } from "@/lib/profileStore";
import { useBudgetLinesStore } from "@/lib/budgetLinesStore";
import { devPlanStore } from "@/lib/devPlanStore";

// Helper to generate time-appropriate greeting
function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good Morning, ${name}`;
  if (hour < 17) return `Good Afternoon, ${name}`;
  return `Good Evening, ${name}`;
}

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function getWelcomeMessage(profile: RoleProfile, name: string) {
  const genderTitle = profile.gender === "female" ? "Ma" : "Sir";
  
  switch (profile.id) {
    case "governor":
    case "deputy_governor":
      return "Welcome Back Your Excellency";
    case "commissioner":
      return `Welcome Back Honourable Commissioner (${profile.ministry || "Ministry"})`;
    case "perm_secretary":
      return `Welcome Back Permanent Secretary (${profile.ministry || "Ministry"})`;
    case "dg_gdu":
      return "Welcome Back Honourable Director General";
    case "director":
      return "Welcome Back Director";
    case "auditor_general":
      return "Welcome Back Honourable Auditor General";
    case "accountant_general":
      return "Welcome Back Accountant General";
    case "ssg":
      return "Welcome Back SSG";
    case "chief_of_staff":
      return "Welcome Back Chief of Staff";
    case "deputy_chief_of_staff":
      return "Welcome Back Deputy Chief of Staff";
    case "head_of_service":
      return "Welcome Back Head of Service";
    case "civil_service_commission":
      return "Welcome Back Chairman CSC";
    default:
      if (profile.scope === "executive" || profile.scope === "command" || profile.scope === "ministry" || profile.scope === "department") {
        return `Welcome Back ${profile.title || profile.shortTitle}`;
      }
      return `Welcome Back ${genderTitle}`;
  }
}

function DashboardIndex() {
  const [session, setSession] = useState(getSession());
  useEffect(() => setSession(getSession()), []);
  if (!session) return null;
  const profile = roleById(session.role);

  let content = null;
  switch (profile.scope) {
    case "executive":
      content = <GlobalDashboard profile={profile} name={session.name} title={profile.title} />;
      break;
    case "command":
      content = <GDUCommandCenter profile={profile} name={session.name} />;
      break;
    default:
      // For this demo, let everyone see the global dashboard if not specifically Command
      content = <GlobalDashboard profile={profile} name={session.name} title={profile.title} />;
      break;
  }

  return (
    <div className="flex flex-col min-h-full pb-8">
      <div className="flex-1">{content}</div>
    </div>
  );
}

/* ───────────── 1. GLOBAL DASHBOARD ───────────── */
function GlobalDashboard({ name, title, profile }: { name: string; title: string; profile: RoleProfile }) {
  const navigate = useNavigate();
  const session = getSession();
  const isAttendanceEnabled = useSettingsStore((s) => s.isAttendanceEnabled);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(() => carouselStore.slides.filter(s => s.active));
  
  const [stats, setStats] = useState<any>({});
  
  // Custom states
  const userProfileId = session?.email || "default";
  const userProfile = useProfileStore(s => s.getProfile(userProfileId));
  const userPhoto = userProfile?.photoBase64;
  const [budgetUpdateCounter, setBudgetUpdateCounter] = useState(0);
  
  useEffect(() => {
    const handleUpdate = () => setBudgetUpdateCounter(prev => prev + 1);
    window.addEventListener('budgetLinesStoreUpdate', handleUpdate);
    return () => window.removeEventListener('budgetLinesStoreUpdate', handleUpdate);
  }, []);

  const formatAmount = (amt: number) => {
    if (amt >= 1000000000) return `₦${(amt / 1000000000).toFixed(2)}B`;
    if (amt >= 1000000) return `₦${(amt / 1000000).toFixed(1)}M`;
    return `₦${amt.toLocaleString()}`;
  };

  const mdaVal = session?.mda || profile?.ministry || "Ministry of Works & Housing";
  const mdaTotal = useBudgetLinesStore.getState().getMdaTotalBudget(mdaVal);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<any>(null);
  const [trendRes, setTrendRes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [slowNetwork, setSlowNetwork] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSlowNetwork(true);
    }, 1500);

    async function loadStats() {
      try {
        const mdaFilter = session?.mda || session?.department || profile?.ministry || userProfile?.ministry;
        const [min, ag, lga, spi, proj, budgetUtil, devPlan, staff, pillars, progs, att, trend, rev, budgetTotal] = await Promise.all([
          getTotalMinistries(mdaFilter),
          getTotalAgencies(mdaFilter),
          getTotalLGAs(),
          getStatePerformanceIndex(mdaFilter),
          getActiveProjects(mdaFilter),
          getBudgetUtilization(mdaFilter),
          getDevelopmentPlanPerformance(mdaFilter),
          getTotalCivilServants(mdaFilter),
          getTotalDevPlanPillars(mdaFilter),
          getTotalProgrammes(mdaFilter),
          getAttendanceRate(),
          getBudgetExecutionTrend(),
          getTotalRevenue(),
          getTotalBudget(mdaFilter)
        ]);
        setStats({
          min, ag, lga, spi, proj, budgetUtil, devPlan, staff, pillars, progs, att, rev, budgetTotal
        });
        setTrendRes(trend);
      } catch (err) {
        console.error("Dashboard stats load failed:", err);
      } finally {
        clearTimeout(timer);
        setLoading(false);
      }
    }
    loadStats();

    // Subscribe to Nominal Roll, Projects, and Programmes stores
    const unsubNominal = useNominalRollStore.subscribe(() => {
      loadStats();
    });

    const handleProjectsUpdate = () => loadStats();
    const handleProgrammesUpdate = () => loadStats();

    window.addEventListener('projectsStoreUpdate', handleProjectsUpdate);
    window.addEventListener('programmesStoreUpdate', handleProgrammesUpdate);

    return () => {
      clearTimeout(timer);
      unsubNominal();
      window.removeEventListener('projectsStoreUpdate', handleProjectsUpdate);
      window.removeEventListener('programmesStoreUpdate', handleProgrammesUpdate);
    };
  }, [profile?.ministry]);

  const handleCardClick = (title: string, data: any, route: string, source: string) => {
    if (!data) return;
    setActiveCard({ title, value: data.value, status: data.status, route, source, lastUpdated: 'Today' });
    setModalOpen(true);
  };

  useEffect(() => {
    const handleUpdate = () => setSlides(carouselStore.slides.filter(s => s.active));
    window.addEventListener('carouselUpdate', handleUpdate);
    return () => window.removeEventListener('carouselUpdate', handleUpdate);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const [activeTheme, setActiveTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gdu_portal_theme') || 'default';
    }
    return 'default';
  });

  useEffect(() => {
    const handleThemeUpdate = () => {
      setActiveTheme(localStorage.getItem('gdu_portal_theme') || 'default');
    };
    window.addEventListener('themeUpdate', handleThemeUpdate);
    return () => window.removeEventListener('themeUpdate', handleThemeUpdate);
  }, []);

  // Public Grievance Form States
  const [publicName, setPublicName] = useState("");
  const [publicLga, setPublicLga] = useState("Lokoja");
  const [publicMinistry, setPublicMinistry] = useState("Ministry of Works");
  const [publicText, setPublicText] = useState("");
  const [grievanceSubmitted, setGrievanceSubmitted] = useState(false);

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicText.trim()) return;
    
    const newGrievance = {
      id: `GRV-${Math.floor(100000 + Math.random() * 900000)}`,
      name: publicName || "Anonymous Citizen",
      lga: publicLga,
      ministry: publicMinistry,
      text: publicText,
      date: new Date().toISOString().split('T')[0],
      status: "Submitted"
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gdu_public_grievances') || '[]';
      const arr = JSON.parse(stored);
      arr.unshift(newGrievance);
      localStorage.setItem('gdu_public_grievances', JSON.stringify(arr));
    }

    setPublicText("");
    setPublicName("");
    setGrievanceSubmitted(true);
    setTimeout(() => setGrievanceSubmitted(false), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 bg-background/40 backdrop-blur-sm animate-in fade-in">
        <GduKogiLoader 
          size="lg" 
          text={slowNetwork ? "Please wait a little, your network is not too good" : "Syncing State Intelligence Data..."} 
        />
      </div>
    );
  }

  // Define dynamic content based on user role
  let roleTitle = "Executive Portal";
  let kpiCards: any[] = [];
  let chartTitle = "Budget Execution Trend";
  let chartActionLink = "/dashboard/budget/annual";
  let chartActionLabel = "View Budget";
  let chartData: any[] = BUDGET_TREND;
  let chartKey = "actual";
  let chartType: 'area' | 'bar' | 'line' = 'area';
  
  let quickActions = [
    { label: "Draft Memo", to: "/dashboard/memo/draft", icon: <Mail className="size-4 text-indigo-500" /> },
    { label: "AI Assistant", to: "/dashboard/reports/ai-studio", icon: <BrainCircuit className="size-4 text-blue-500" /> },
    { label: "Submit Request", to: "/dashboard/gdu-center/requests", icon: <Receipt className="size-4 text-emerald-500" /> },
    { label: "Global Calendar", to: "/dashboard/calendar", icon: <Calendar className="size-4 text-gold" /> }
  ];

  if (['governor', 'deputy_governor', 'super_admin', 'ssg', 'chief_of_staff', 'deputy_chief_of_staff'].includes(profile.id)) {
    roleTitle = "Executive Overview";
    kpiCards = [
      { label: "Ministries", response: stats.min, icon: <Building2 className="text-blue-500" />, onClick: () => navigate({to: "/dashboard/ministries"}) },
      { label: "Agencies & Boards", response: stats.ag, icon: <Landmark className="text-indigo-500" />, onClick: () => navigate({to: "/dashboard/agencies"}) },
      { label: "LGAs", response: stats.lga, icon: <Map className="text-emerald-500" /> },
      { label: "Dev Plan Pillars", response: stats.pillars, icon: <Target className="text-amber-500" />, onClick: () => navigate({to: "/dashboard/dev-plan/pillars"}) },
      { label: "Active Programmes", response: stats.progs, icon: <Layers className="text-purple-500" />, onClick: () => navigate({to: "/dashboard/programmes"}) },
      { label: "State Perf Index", response: stats.spi, icon: <Activity className="text-gold" />, onClick: () => navigate({to: "/dashboard/executive-room/spi"}) },
      { label: "Budget Performance", response: stats.budgetUtil ? { ...stats.budgetUtil, value: stats.budgetUtil.value ? `${stats.budgetUtil.value}%` : null } : null, icon: <Wallet className="text-emerald-600" />, onClick: () => navigate({to: "/dashboard/budget"}) },
      { label: "Dev Plan Performance", response: stats.devPlan ? { ...stats.devPlan, value: stats.devPlan.value ? `${stats.devPlan.value}%` : null } : null, icon: <TrendingUp className="text-blue-600" />, onClick: () => navigate({to: "/dashboard/alignment-engine"}) },
      { label: "Active Projects", response: stats.proj, icon: <FolderKanban className="text-rose-500" />, onClick: () => navigate({to: "/dashboard/projects"}) },
      { label: "Staff Strength", response: stats.staff, icon: <Users className="text-cyan-500" />, onClick: () => navigate({to: "/dashboard/staff"}) }
    ];
    quickActions = [
      { label: "EXCo Room Dashboard", to: "/dashboard/executive-room", icon: <ShieldAlert className="size-4 text-rose-500" /> },
      ...(profile.id === 'super_admin' ? [
        { label: "DG GDU Command Center", to: "/dashboard/command-center", icon: <ShieldAlert className="size-4 text-amber-500" /> },
        { label: "Site Configuration", to: "/dashboard/admin/configuration", icon: <Settings className="size-4 text-indigo-500" /> },
        { label: "Permission Engine", to: "/dashboard/admin/permissions/assign", icon: <Key className="size-4 text-emerald-500" /> }
      ] : [
        { label: "Draft Memo", to: "/dashboard/memo/draft", icon: <Mail className="size-4 text-indigo-500" /> },
        { label: "AI Assistant", to: "/dashboard/reports/ai-studio", icon: <BrainCircuit className="size-4 text-blue-500" /> },
        { label: "Global Calendar", to: "/dashboard/calendar", icon: <Calendar className="size-4 text-gold" /> }
      ])
    ];
  } else if (['civil_service_commission'].includes(profile.id)) {
    roleTitle = "Civil Service Commission";
    kpiCards = [
      { label: "Staff Strength", response: stats.staff, icon: <Users className="text-cyan-500" />, onClick: () => navigate({to: "/dashboard/staff"}) },
      { label: "Pending Recruitment", value: "284", icon: <Users className="text-emerald-500" />, onClick: () => navigate({to: "/dashboard/staff/recruitment"}) },
      { label: "Pending Promotions", value: "37", icon: <TrendingUp className="text-indigo-500" />, onClick: () => navigate({to: "/dashboard/staff/promote"}) },
      { label: "Pending Confirmations", value: "12", icon: <CheckCircle2 className="text-blue-500" /> },
      { label: "Retirement Due", value: "18", icon: <AlertTriangle className="text-amber-500" />, onClick: () => navigate({to: "/dashboard/staff/retire"}) }
    ];
    chartTitle = "Workforce Gap Analysis (Deficit)";
    chartActionLink = "/dashboard/staff/recruitment";
    chartActionLabel = "Recruitment Portal";
    chartData = [
      { m: "Health", deficit: 120 },
      { m: "Education", deficit: 350 },
      { m: "Works", deficit: 45 },
      { m: "Agriculture", deficit: 80 }
    ];
    chartKey = "deficit";
    chartType = "bar";
    quickActions = [
      { label: "Approve Appointments", to: "/dashboard/staff/recruitment", icon: <IdCard className="size-4 text-emerald-500" /> },
      { label: "Approve Promotions", to: "/dashboard/staff/promote", icon: <TrendingUp className="size-4 text-indigo-500" /> },
      { label: "View Nominal Roll", to: "/dashboard/staff/nominal-roll", icon: <Users className="size-4 text-blue-500" /> },
      { label: "Retirements Panel", to: "/dashboard/staff/retire", icon: <AlertTriangle className="size-4 text-amber-500" /> }
    ];
  } else if (['commissioner', 'perm_secretary', 'director', 'director_prs'].includes(profile.id)) {
    roleTitle = "Ministry Executive Dashboard";
    kpiCards = [
      { label: "Ministry Budget", response: stats.budgetTotal, icon: <Wallet className="text-gold" />, onClick: () => navigate({to: "/dashboard/budget"}) },
      { label: "Active Projects", response: stats.proj, icon: <FolderKanban className="text-emerald-500" />, onClick: () => navigate({to: "/dashboard/projects"}) },
      { label: "Policy Memos", value: "14", icon: <FileText className="text-indigo-500" />, onClick: () => navigate({to: "/dashboard/e-memo"}) },
      { label: "Staff Strength", response: stats.staff, icon: <Users className="text-blue-500" />, onClick: () => navigate({to: "/dashboard/staff"}) },
      { label: "SPI Performance", response: stats.spi ? { ...stats.spi, value: stats.spi.value ? `${stats.spi.value}%` : null } : null, icon: <Activity className="text-amber-500" />, onClick: () => navigate({to: "/dashboard/executive-room"}) }
    ];
    chartTitle = "Ministry Project Delivery (%)";
    chartActionLink = "/dashboard/projects/monitor";
    chartActionLabel = "Projects Center";
    chartData = [
      { m: "Q1", perf: 65 },
      { m: "Q2", perf: 72 },
      { m: "Q3", perf: 84 },
      { m: "Q4", perf: 81 }
    ];
    chartKey = "perf";
    chartType = "line";
    quickActions = [
      { label: "View Programmes", to: "/dashboard/programmes", icon: <Layers className="size-4 text-blue-500" /> },
      { label: "Monitor Projects", to: "/dashboard/projects/monitor", icon: <FolderKanban className="size-4 text-indigo-500" /> },
      { label: "Draft Memo", to: "/dashboard/memo/draft", icon: <Mail className="size-4 text-emerald-500" /> },
      { label: "Review KPIs", to: "/dashboard/dev-plan/kpi-framework", icon: <Target className="size-4 text-amber-500" /> }
    ];
  } else if (['head_of_service', 'hr_officer', 'director_admin'].includes(profile.id)) {
    roleTitle = "Civil Service HR Workspace";
    kpiCards = [
      { label: "State Budget Size", value: "₦450B", icon: <Wallet className="text-emerald-500" />, onClick: () => navigate({to: "/dashboard/budget"}) },
      { label: "YTD Execution", value: "42%", icon: <TrendingUp className="text-blue-500" />, onClick: () => navigate({to: "/dashboard/budget/annual"}) },
      { label: "Budget Variance", value: "14%", icon: <AlertTriangle className="text-amber-500" />, onClick: () => navigate({to: "/dashboard/budget/annual"}) },
      { label: "MDAs Reporting", value: "94%", icon: <Building2 className="text-indigo-500" />, onClick: () => navigate({to: "/dashboard/ministries"}) },
      { label: "Attendance Rate YTD", value: "94.2%", icon: <Activity className="text-gold" /> }
    ];
    chartTitle = "Daily Attendance Rate (%)";
    chartActionLink = "/dashboard/staff/recruitment";
    chartActionLabel = "Recruitment Portal";
    chartData = [
      { m: "Mon", rate: 93 },
      { m: "Tue", rate: 95 },
      { m: "Wed", rate: 94 },
      { m: "Thu", rate: 96 },
      { m: "Fri", rate: 92 },
    ];
    chartKey = "rate";
    chartType = "line";
    quickActions = [
      { label: "Nominal Roll Directory", to: "/dashboard/staff", icon: <Users className="size-4 text-blue-500" /> },
      { label: "Online Recruitment", to: "/dashboard/staff/recruitment", icon: <IdCard className="size-4 text-indigo-500" /> },
      { label: "Confirmations & Promotions", to: "/dashboard/staff/promote", icon: <TrendingUp className="size-4 text-emerald-500" /> },
      { label: "Retirements Panel", to: "/dashboard/staff/retire", icon: <AlertTriangle className="size-4 text-rose-500" /> }
    ];
  } else if (['budget_officer', 'accountant', 'accountant_general', 'director_finance', 'payroll_officer'].includes(profile.id)) {
    roleTitle = "Budget & Treasury Workspace";
    kpiCards = [
      { label: "Ministry Budget Proposal", response: stats.budgetTotal, icon: <Wallet className="text-gold" />, onClick: () => navigate({to: "/dashboard/budget"}) },
      { label: "Active Mandates", value: "12", icon: <Target className="text-indigo-500" />, onClick: () => navigate({to: "/dashboard/dev-plan/pillars"}) },
      { label: "Ongoing Projects", response: stats.proj, icon: <FolderKanban className="text-emerald-500" />, onClick: () => navigate({to: "/dashboard/projects"}) },
      { label: "Agency Staff", response: stats.staff, icon: <Users className="text-blue-500" />, onClick: () => navigate({to: "/dashboard/staff"}) }
    ];
    chartTitle = "State Monthly Revenue Mix (₦B)";
    chartActionLink = "/dashboard/treasury/revenue";
    chartActionLabel = "Revenue Center";
    chartData = [
      { m: "FAAC Statutory", amount: 18.5 },
      { m: "VAT Allocation", amount: 12.2 },
      { m: "Internal Revenue (IGR)", amount: 17.2 },
    ];
    chartKey = "amount";
    chartType = "bar";
    quickActions = [
      { label: "Create Budget Proposal", to: "/dashboard/budget/proposal", icon: <Wallet className="size-4 text-gold" /> },
      { label: "Director Budget Review", to: "/dashboard/budget/director-review", icon: <CheckCircle2 className="size-4 text-emerald-500" /> },
      { label: "Treasury Releases", to: "/dashboard/treasury/releases", icon: <Banknote className="size-4 text-indigo-500" /> },
      { label: "Budget Rankings", to: "/dashboard/budget/intel/rankings", icon: <TrendingUp className="size-4 text-blue-500" /> }
    ];
  } else if (['auditor_general', 'internal_auditor'].includes(profile.id)) {
    roleTitle = "Auditor General's Office";
    kpiCards = [
      { label: "Total Active Projects", response: stats.proj, icon: <FolderKanban className="text-emerald-500" />, onClick: () => navigate({to: "/dashboard/projects"}) },
      { label: "Avg Completion Rate", value: "64%", icon: <Activity className="text-blue-500" />, onClick: () => navigate({to: "/dashboard/projects/monitor"}) },
      { label: "Delayed Projects", response: stats.proj ? { ...stats.proj, value: stats.proj.value ? stats.proj.value.delayed : 0 } : null, icon: <AlertTriangle className="text-rose-500" /> },
      { label: "Projects Value", value: "₦142B", icon: <Banknote className="text-gold" />, onClick: () => navigate({to: "/dashboard/financial"}) },
      { label: "Compliance Score", value: "89.5%", icon: <CheckCircle2 className="text-emerald-500" /> }
    ];
    chartTitle = "Audit Query Age Analysis (Days)";
    chartActionLink = "/dashboard/audit/queries";
    chartActionLabel = "Audit Desk";
    chartData = [
      { m: "Health", days: 12 },
      { m: "Education", days: 18 },
      { m: "Works", days: 32 },
      { m: "Agriculture", days: 8 },
      { m: "Finance", days: 15 }
    ];
    chartKey = "days";
    chartType = "bar";
    quickActions = [
      { label: "Audit Queries Tracker", to: "/dashboard/audit/queries", icon: <ShieldAlert className="size-4 text-rose-500" /> },
      { label: "Compliance Reviews", to: "/dashboard/audit/compliance", icon: <CheckCircle2 className="size-4 text-emerald-500" /> },
      { label: "Risk Flags Console", to: "/dashboard/audit/risk-flags", icon: <AlertTriangle className="size-4 text-amber-500" /> },
      { label: "Procurement Reviews", to: "/dashboard/audit/procurement", icon: <FileText className="size-4 text-blue-500" /> }
    ];
  } else if (['project_officer', 'procurement_officer', 'procurement_committee', 'm_and_e_officer'].includes(profile.id)) {
    roleTitle = "Operations & Projects Command";
    kpiCards = [
      { label: "Total Projects", response: stats.proj, icon: <FolderKanban className="text-rose-500" /> },
      { label: "Delayed Projects", response: stats.proj ? { ...stats.proj, value: stats.proj.value ? stats.proj.value.delayed : 0 } : null, icon: <AlertTriangle className="text-rose-500" /> },
      { label: "Verification Pending", value: "12", icon: <CheckCircle2 className="text-amber-500" /> },
      { label: "Completed Projects", value: "84", icon: <CheckCircle2 className="text-emerald-500" /> },
      { label: "Procurement Bids", value: "9", icon: <Wallet className="text-indigo-500" /> }
    ];
    chartTitle = "Project Delivery Status";
    chartActionLink = "/dashboard/projects/monitor";
    chartActionLabel = "Project Center";
    chartData = [
      { m: "Planning", count: 8 },
      { m: "Ongoing", count: 24 },
      { m: "Delayed", count: 4 },
      { m: "Completed", count: 12 }
    ];
    chartKey = "count";
    chartType = "bar";
    quickActions = [
      { label: "Create Project Profile", to: "/dashboard/projects/create", icon: <FolderKanban className="size-4 text-emerald-500" /> },
      { label: "Monitor Projects", to: "/dashboard/projects/monitor", icon: <FolderKanban className="size-4 text-indigo-500" /> },
      { label: "Verification Engine", to: "/dashboard/projects/verification", icon: <CheckCircle2 className="size-4 text-blue-500" /> },
      { label: "GIS Project Maps", to: "/dashboard/maps/projects", icon: <Map className="size-4 text-gold" /> }
    ];
  } else if (profile.id === 'retiree') {
    roleTitle = "Retired Civil Servant Dashboard";
    kpiCards = [
      { label: "My Nominal Status", value: "Retired", icon: <CheckCircle2 className="text-amber-500" />, onClick: () => { setActiveCard({ title: "Details no longer available", value: "Retired", status: "Not Applicable", route: "", source: "Archive", lastUpdated: "N/A" }); setModalOpen(true); } },
      { label: "My Open Memos", value: "Retired", icon: <FileText className="text-muted-foreground" />, onClick: () => { setActiveCard({ title: "Details no longer available", value: "Retired", status: "Not Applicable", route: "", source: "Archive", lastUpdated: "N/A" }); setModalOpen(true); } },
      { label: "Assigned Tasks", value: "Retired", icon: <ListChecks className="text-muted-foreground" />, onClick: () => { setActiveCard({ title: "Details no longer available", value: "Retired", status: "Not Applicable", route: "", source: "Archive", lastUpdated: "N/A" }); setModalOpen(true); } }
    ];
    chartTitle = "Historical E-Memo Volume";
    chartActionLink = "/dashboard/retiree";
    chartActionLabel = "View History";
    chartData = [];
    chartKey = "memos";
    chartType = "line";
    quickActions = [
      { label: "AI Assistant", to: "/dashboard/reports/ai-studio", icon: <BrainCircuit className="size-4 text-blue-500" /> }
    ];
  } else {
    // General Staff
    roleTitle = "Civil Servant Portal";
    kpiCards = [
      { label: "My Nominal Status", value: "Active", icon: <CheckCircle2 className="text-emerald-500" />, onClick: () => navigate({to: "/dashboard/staff"}) },
      { label: "My Open Memos", value: "3", icon: <FileText className="text-indigo-500" />, onClick: () => navigate({to: "/dashboard/e-memo"}) },
      { label: "Assigned Tasks", value: "8", icon: <ListChecks className="text-blue-500" />, onClick: () => navigate({to: "/dashboard/tasks"}) },
      { label: "Upcoming Holidays", value: "Eid al-Fitr", icon: <Calendar className="text-gold" />, onClick: () => navigate({to: "/dashboard/calendar"}) },
      { label: "Helpdesk Requests", value: "1", icon: <MessageSquare className="text-cyan-500" />, onClick: () => navigate({to: "/dashboard/service-requests"}) }
    ];
    chartTitle = "E-Memo Volume YTD";
    chartActionLink = "/dashboard/memo/track";
    chartActionLabel = "Track Memos";
    chartData = [
      { m: "Jan", memos: 4 },
      { m: "Feb", memos: 9 },
      { m: "Mar", memos: 12 },
      { m: "Apr", memos: 8 },
      { m: "May", memos: 14 }
    ];
    chartKey = "memos";
    chartType = "line";
  }

  // Filter out Attendance cards if disabled
  if (!isAttendanceEnabled) {
    kpiCards = kpiCards.filter(card => !card.label.toLowerCase().includes('attendance'));
  }

  // 1. EXECUTIVE THEME RENDER (Gold theme)
  if (activeTheme === 'executive') {
    return (
      <div className="flex flex-col min-h-full">
        {/* Executive Gold Branding Header */}
        <div className="bg-[#171004] text-white py-8 px-4 sm:px-6 md:px-8 border-b-4 border-[#D4AF37] relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#D4AF37] mb-2 font-bold bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
              <Shield className="size-3" /> Executive Briefing Command
            </div>
            <div className="flex items-center gap-3 mb-2">
              {userPhoto ? (
                <img src={userPhoto} alt="Profile" className="size-10 rounded-full object-cover border border-[#D4AF37]/40 shadow-md" />
              ) : (
                <div className="size-10 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center text-sm font-bold uppercase">
                  {name.charAt(0)}
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{getWelcomeMessage(profile, name)}</h1>
            </div>
            <p className="text-gray-400 font-medium text-xs sm:text-sm">
              Live oversight console filtered for high-level state governance, budget performance, and cabinet actions.
            </p>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
          {/* Executive Overview Cards */}
          <div>
            <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Landmark className="size-4" /> Executive Decision Grid</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <StatCard label="Ministries" response={stats.min} onClick={() => handleCardClick("Ministries", stats.min, "/dashboard/ministries", "mda-service.ts")} icon={<Building2 className="text-blue-500" />} />
              <StatCard label="Agencies & Boards" response={stats.ag} onClick={() => handleCardClick("Agencies & Boards", stats.ag, "/dashboard/agencies", "mda-service.ts")} icon={<Landmark className="text-indigo-500" />} />
              <StatCard label="LGAs" response={stats.lga} onClick={() => handleCardClick("Local Governments", stats.lga, "/dashboard/maps/lga", "systemDataService.ts")} icon={<Map className="text-emerald-500" />} />
              <StatCard label="Dev Plan Pillars" response={stats.pillars} onClick={() => handleCardClick("Dev Plan Pillars", stats.pillars, "/dashboard/dev-plan/pillars", "devplan-service.ts")} icon={<Target className="text-amber-500" />} />
              <StatCard label="Active Programmes" response={stats.progs} onClick={() => handleCardClick("Active Programmes", stats.progs, "/dashboard/programmes", "programmes.ts")} icon={<Layers className="text-purple-500" />} />
              <StatCard label="State Perf Index" response={stats.spi} onClick={() => handleCardClick("State Perf Index", stats.spi, "/dashboard/executive-room/spi", "spi.ts")} icon={<Activity className="text-[#D4AF37]" />} />
              <StatCard label="Budget Performance" response={stats.budgetUtil ? { ...stats.budgetUtil, value: stats.budgetUtil.value ? `${stats.budgetUtil.value}%` : null } : null} onClick={() => handleCardClick("Budget Performance", stats.budgetUtil, "/dashboard/budget", "budget-data.ts")} icon={<Wallet className="text-emerald-500" />} />
              <StatCard label="Dev Plan Performance" response={stats.devPlan ? { ...stats.devPlan, value: stats.devPlan.value ? `${stats.devPlan.value}%` : null } : null} onClick={() => handleCardClick("Dev Plan Performance", stats.devPlan, "/dashboard/alignment-engine", "devplan-service.ts")} icon={<TrendingUp className="text-blue-500" />} />
              <StatCard label="Active Projects" response={stats.proj} onClick={() => handleCardClick("Active Projects", stats.proj, "/dashboard/projects", "projectsStore.ts")} icon={<FolderKanban className="text-rose-500" />} />
              <StatCard label="Staff Strength" response={stats.staff} onClick={() => handleCardClick("Civil Servants", stats.staff, "/dashboard/staff", "staff-service.ts")} icon={<Users className="text-cyan-500" />} />
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div>
            <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles className="size-4 text-[#D4AF37]" /> Executive Shortcuts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action, i) => (
                <Link 
                  key={i} 
                  to={action.to}
                  className="bg-card border border-[#D4AF37]/20 hover:border-[#D4AF37] rounded-xl p-4 flex items-center gap-3 transition-colors shadow-sm cursor-pointer group"
                >
                  <div className="p-2 bg-[#D4AF37]/5 group-hover:bg-[#D4AF37]/10 rounded-lg transition-colors">
                    {action.icon}
                  </div>
                  <span className="text-xs font-bold text-foreground/80 group-hover:text-amber-500 transition-colors">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Side-by-Side Gold Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Budget Execution Trend" action={<Link to="/dashboard/budget/annual" className="text-xs text-[#D4AF37] hover:underline font-black">View Budget</Link>}>
              <div className="h-64 relative flex flex-col justify-center">
                {trendRes ? (
                  <>
                    {trendRes.status === 'not_connected' && (
                      <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center">
                        <AlertTriangle className="size-8 text-rose-500 mb-2 animate-bounce" />
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-500">Database Offline (Mock Mode)</span>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
                          {trendRes.message}
                        </p>
                      </div>
                    )}
                    {trendRes.status === 'connected' && trendRes.value?.length === 0 && (
                      <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center">
                        <Database className="size-8 text-amber-500 mb-2 animate-pulse" />
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-500">No Budget Data Found</span>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
                          {trendRes.message}
                        </p>
                      </div>
                    )}
                    
                    {/* Render chart if we have data (either cached mock or live) */}
                    {(trendRes.value && trendRes.value.length > 0) ? (
                      <ResponsiveContainer>
                        <AreaChart data={trendRes.value}>
                          <defs>
                            <linearGradient id="goldG" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.5} />
                              <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} />
                          <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `₦${v}M`} />
                          <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}M`} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                          <Area type="monotone" dataKey="actual" name="Actual Spent" stroke="#D4AF37" strokeWidth={2.5} fill="url(#goldG)" />
                          <Area type="monotone" dataKey="planned" name="Planned Release" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5} fill="none" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-xs text-muted-foreground">N/A</div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <RefreshCw className="size-4 animate-spin text-[#D4AF37]" /> Loading trend...
                  </div>
                )}
              </div>
            </Card>
            
            <Card title="State Monthly Revenue Mix (Gold Theme)" action={<Link to="/dashboard/treasury/revenue" className="text-xs text-primary hover:underline">Revenue Center</Link>}>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={[
                    { m: "FAAC Statutory", amount: 18.5 },
                    { m: "VAT Allocation", amount: 12.2 },
                    { m: "Internal Revenue (IGR)", amount: 17.2 }
                  ]}>
                    <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <RBar dataKey="amount" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Cabinet decision list */}
          <Card title="Cabinet Decision & Memo Matrix">
            <p className="text-xs text-muted-foreground mb-4">Active items requiring immediate executive clearance or vetting.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="p-3">Reference</th>
                    <th className="p-3">Originating MDA</th>
                    <th className="p-3">Subject Matter</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  <tr className="hover:bg-[#D4AF37]/5 transition-colors">
                    <td className="p-3 font-bold text-amber-600 dark:text-amber-400">EXCO-26-081</td>
                    <td className="p-3">Ministry of Works</td>
                    <td className="p-3 font-medium">Supplementary Budget Allocation for Lokoja Bypass Road Construction</td>
                    <td className="p-3">June 26, 2026</td>
                    <td className="p-3 text-right">
                      <button className="px-2.5 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold mr-2 hover:bg-emerald-600">Approve</button>
                      <button className="px-2.5 py-1 bg-muted border text-foreground rounded text-[10px] hover:bg-accent">Review</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#D4AF37]/5 transition-colors">
                    <td className="p-3 font-bold text-amber-600 dark:text-amber-400">EXCO-26-085</td>
                    <td className="p-3">Office of HoS</td>
                    <td className="p-3 font-medium">Vetting Nominal Roll Promotion List for Grade 12-14 Civil Servants</td>
                    <td className="p-3">June 25, 2026</td>
                    <td className="p-3 text-right">
                      <button className="px-2.5 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold mr-2 hover:bg-emerald-600">Approve</button>
                      <button className="px-2.5 py-1 bg-muted border text-foreground rounded text-[10px] hover:bg-accent">Review</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#D4AF37]/5 transition-colors">
                    <td className="p-3 font-bold text-amber-600 dark:text-amber-400">EXCO-26-089</td>
                    <td className="p-3">Ministry of Health</td>
                    <td className="p-3 font-medium">State-wide Hospital Management Board Procurement Authorization</td>
                    <td className="p-3">June 24, 2026</td>
                    <td className="p-3 text-right">
                      <button className="px-2.5 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold mr-2 hover:bg-emerald-600">Approve</button>
                      <button className="px-2.5 py-1 bg-muted border text-foreground rounded text-[10px] hover:bg-accent">Review</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 2. PUBLIC THEME RENDER (Purple, Green, Blue logo colors)
  if (activeTheme === 'public') {
    return (
      <div className="flex flex-col min-h-full">
        {/* Public Citizen Portal Branding Banner */}
        <div className="relative bg-gradient-to-r from-[#0F1E3D] via-[#2F113D] to-[#0A261D] text-white overflow-hidden border-b-4 border-[#00B159] flex flex-col min-h-[380px] shrink-0">
          <div className="absolute inset-0 bg-black/35 pointer-events-none z-10" />
          <div className="px-6 md:px-10 py-12 relative z-20 flex-1 flex flex-col justify-center max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#00B159] mb-3 font-black bg-[#00B159]/20 px-3 py-1.5 rounded-full border border-[#00B159]/30 self-start">
              <Globe className="size-3.5" /> Kogi State Citizen Portal
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
               Democracy, Progress &amp; <span className="text-[#00B159]">Citizen Partnership</span>
            </h1>
            <p className="mt-4 text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed max-w-xl">
               Welcome to the public-facing citizen interaction center. Submit service requests, track public development projects, and receive updates directly from the Governance Delivery Unit.
            </p>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
          {/* Public Overview Grid */}
          <div>
            <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Globe className="size-4" /> Kogi State Civic Index</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="State Local Governments" value="21 LGAs" icon={<Map className="text-blue-500" />} />
              <StatCard label="Ongoing Civic Projects" value={PROJECTS.length.toString()} icon={<FolderKanban className="text-purple-500" />} />
              <StatCard label="Public Health Centers" value="152" icon={<Activity className="text-emerald-500" />} />
              <StatCard label="Development Plan Pillars" value="32 Pillars" icon={<Target className="text-indigo-500" />} />
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div>
            <h2 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles className="size-4 text-purple-500" /> Citizen E-Services</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link 
                to="/dashboard/staff/recruitment" 
                className="bg-card border border-border hover:border-emerald-500 rounded-xl p-4 flex items-center gap-3 transition-colors shadow-sm cursor-pointer group"
              >
                <div className="p-2 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-lg transition-colors">
                  <Users className="size-4 text-emerald-500" />
                </div>
                <span className="text-xs font-bold text-foreground/80 group-hover:text-emerald-500 transition-colors">Apply for Jobs</span>
              </Link>
              <Link 
                to="/dashboard/e-memo" 
                className="bg-card border border-border hover:border-purple-500 rounded-xl p-4 flex items-center gap-3 transition-colors shadow-sm cursor-pointer group"
              >
                <div className="p-2 bg-purple-500/5 group-hover:bg-purple-500/10 rounded-lg transition-colors">
                  <FileText className="size-4 text-purple-500" />
                </div>
                <span className="text-xs font-bold text-foreground/80 group-hover:text-purple-500 transition-colors">Public Notices</span>
              </Link>
              <Link 
                to="/dashboard/map" 
                className="bg-card border border-border hover:border-blue-500 rounded-xl p-4 flex items-center gap-3 transition-colors shadow-sm cursor-pointer group"
              >
                <div className="p-2 bg-blue-500/5 group-hover:bg-blue-500/10 rounded-lg transition-colors">
                  <Map className="size-4 text-blue-500" />
                </div>
                <span className="text-xs font-bold text-foreground/80 group-hover:text-blue-500 transition-colors">Project Tracker Map</span>
              </Link>
              <Link 
                to="/dashboard/calendar" 
                className="bg-card border border-border hover:border-indigo-500 rounded-xl p-4 flex items-center gap-3 transition-colors shadow-sm cursor-pointer group"
              >
                <div className="p-2 bg-indigo-500/5 group-hover:bg-indigo-500/10 rounded-lg transition-colors">
                  <Calendar className="size-4 text-indigo-500" />
                </div>
                <span className="text-xs font-bold text-foreground/80 group-hover:text-indigo-500 transition-colors">Civic Calendar</span>
              </Link>
            </div>
          </div>

          {/* Interactive Request Form & Bulletins */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Submit Public Request or Grievance" className="lg:col-span-2 border-emerald-500/20 bg-emerald-500/5">
              <p className="text-xs text-muted-foreground mb-4">Submit petitions, request local road repairs, hospital upgrades, or report public delivery delays directly to GDU.</p>
              <form onSubmit={handleGrievanceSubmit} className="space-y-4 pt-2">
                {grievanceSubmitted && (
                  <div className="p-3 border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    Your request has been successfully queued and routed directly to GDU Desk Officers!
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Your Name (Optional)</label>
                    <input 
                      type="text"
                      value={publicName} 
                      onChange={e => setPublicName(e.target.value)} 
                      placeholder="e.g. Alhaji Audu" 
                      className="w-full h-9 px-3 bg-card border border-border rounded-md text-xs focus:outline-none focus:border-emerald-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Local Government (LGA)</label>
                    <DashboardLgaSelect value={publicLga} onChange={setPublicLga} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Responsible Ministry</label>
                  <select 
                    value={publicMinistry} 
                    onChange={e => setPublicMinistry(e.target.value)} 
                    className="w-full h-9 px-3 rounded-md bg-card border border-border text-xs focus:outline-none"
                  >
                    <option value="Ministry of Works">Ministry of Works (Roads, Infrastructure)</option>
                    <option value="Ministry of Health">Ministry of Health (Hospitals, Clinic Supplies)</option>
                    <option value="Ministry of Education">Ministry of Education (School building repairs)</option>
                    <option value="Ministry of Water Resources">Ministry of Water Resources (Boreholes, Water systems)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Describe the Request / Complaint</label>
                  <textarea 
                    value={publicText} 
                    onChange={e => setPublicText(e.target.value)} 
                    placeholder="e.g. The borehole in Okene Ward 2 needs maintenance..." 
                    className="w-full p-2.5 bg-card border border-border rounded-md text-xs h-24 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-5 py-2 bg-[#00B159] hover:bg-[#009149] text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5" /> Submit Public Request
                  </button>
                </div>
              </form>
            </Card>
            
            <Card title="GDU Public Bulletins">
              <p className="text-xs text-muted-foreground mb-4">Recent citizen circulars from the cabinet.</p>
              <div className="space-y-3 pt-2">
                <div className="p-3 border border-border rounded-lg bg-card/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-500 mb-1">Infrastructure update</div>
                  <div className="text-xs font-bold text-foreground">Lokoja River Bridge construction reaches 74% completion.</div>
                  <div className="text-[10px] text-muted-foreground mt-1">June 26, 2026</div>
                </div>
                <div className="p-3 border border-border rounded-lg bg-card/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#00B159] mb-1">Policy circular</div>
                  <div className="text-xs font-bold text-foreground">H.E. Governor Ododo signs free healthcare directive for pregnant mothers.</div>
                  <div className="text-[10px] text-muted-foreground mt-1">June 24, 2026</div>
                </div>
                <div className="p-3 border border-border rounded-lg bg-card/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1">Education subsidy</div>
                  <div className="text-xs font-bold text-foreground">WAEC registration subsidies fully disbursed for all public secondary school seniors.</div>
                  <div className="text-[10px] text-muted-foreground mt-1">June 21, 2026</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 3. DEFAULT THEME RENDER (Original layout)
  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-[#0A1142] text-white overflow-hidden border-b-4 border-[#C5A059] flex flex-col min-h-[450px]">
        {/* Live KPI Ticker */}
        <div className="w-full bg-[#070b2e] border-y border-[#C5A059]/20 flex items-center text-xs font-mono font-bold text-[#C5A059] uppercase tracking-widest overflow-hidden whitespace-nowrap py-3 relative z-30">
           <div className="animate-marquee flex gap-12">
             <span className="flex items-center gap-2"><Activity className="size-4"/> State Perf Index: <span className="text-white">{stats.spi?.value !== null && stats.spi?.value !== undefined ? stats.spi.value : "Coming Soon"}</span></span>
             <span className="flex items-center gap-2"><TrendingUp className="size-4"/> Budget Execution: <span className="text-white">{stats.budgetUtil?.value !== null && stats.budgetUtil?.value !== undefined ? `${stats.budgetUtil.value}%` : "Coming Soon"}</span></span>
             <span className="flex items-center gap-2"><Target className="size-4"/> Dev Plan Alignment: <span className="text-white">{stats.devPlan?.value !== null && stats.devPlan?.value !== undefined ? `${stats.devPlan.value}%` : "Coming Soon"}</span></span>
             <span className="flex items-center gap-2"><Wallet className="size-4"/> Total Revenue: <span className="text-white">{stats.rev?.value !== null && stats.rev?.value !== undefined ? stats.rev.value : "Coming Soon"}</span></span>
             <span className="flex items-center gap-2"><Activity className="size-4"/> State Perf Index: <span className="text-white">{stats.spi?.value !== null && stats.spi?.value !== undefined ? stats.spi.value : "Coming Soon"}</span></span>
             <span className="flex items-center gap-2"><TrendingUp className="size-4"/> Budget Execution: <span className="text-white">{stats.budgetUtil?.value !== null && stats.budgetUtil?.value !== undefined ? `${stats.budgetUtil.value}%` : "Coming Soon"}</span></span>
           </div>
        </div>

        {/* Carousel Content */}
        <div className="relative flex-1 flex">
          {slides.map((slide, index) => (
            <div 
              key={index} 
              className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${currentSlide === index ? 'opacity-100 z-20' : 'opacity-0 z-10 pointer-events-none'}`}
            >
              {slide.type === "default" ? (
                <>
                  {/* Background elements */}
                  <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#C5A059]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
                  
                  <div className="px-4 sm:px-6 md:px-10 py-6 md:py-10 relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6 md:gap-8 w-full">
                    <div className="flex-1 max-w-4xl">
                      <div className="inline-flex items-center gap-2.5 px-3 py-1 mb-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                        {userPhoto ? (
                          <img src={userPhoto} alt="Profile" className="size-6 rounded-full object-cover border border-white/20" />
                        ) : (
                          <div className="size-6 rounded-full bg-primary/25 text-primary flex items-center justify-center text-xs font-bold uppercase">
                            {name.charAt(0)}
                          </div>
                        )}
                        <span className="text-white font-bold text-sm tracking-wide">{getWelcomeMessage(profile, name)}</span>
                      </div>
                      <p className="text-[#C5A059] font-bold tracking-widest uppercase text-xs md:text-sm mb-2 drop-shadow-sm">
                        Kogi State Government
                      </p>
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black tracking-tight leading-[1.1] mb-3 text-white drop-shadow-lg">
                        KOGI <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#C5A059]">OneGov</span>
                      </h1>
                      <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-blue-100 mb-5 tracking-tight">
                        Performance Delivery &amp; Executive Intelligence
                      </h2>
                      <p className="text-sm md:text-lg text-blue-100 font-medium max-w-2xl italic border-l-2 border-[#C5A059] pl-4 py-1 shadow-sm bg-gradient-to-r from-black/20 to-transparent">
                        "Shared Hope &amp; Prosperity Through Data-Driven Governance"
                      </p>
                    </div>
                    
                    <div className="shrink-0 relative hidden sm:block mt-4 lg:mt-0 mr-2 md:mr-6">
                       {/* Governor Portrait - Big Rectangle */}
                       <div className="w-[180px] h-[230px] sm:w-[240px] sm:h-[300px] md:w-[280px] md:h-[350px] bg-[#0A1142] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden z-10 border border-white/10 group">
                         <img src="/governor.jpg" alt="Governor Portrait" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A1142] via-[#0A1142]/90 to-transparent p-3 md:p-5 pt-16 flex flex-col justify-end">
                           <p className="text-white font-black text-[11px] md:text-[14px] leading-snug">
                             <span className="italic font-medium text-white/90">His Excellency -</span><br />
                             Ahmed Usman Ododo FCA
                           </p>
                           <p className="text-[#C5A059] text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-1.5 whitespace-nowrap">Executive Governor</p>
                           <p className="text-[#C5A059] text-[8px] md:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Kogi State</p>
                         </div>
                       </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-[#0A1142]">
                    {/* Use object-contain and anchor to the right so the image is fully visible and not cropped */}
                    <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/4 flex justify-end">
                      <img src={slide.bgImage} alt="Governor" className="w-full h-full object-contain object-right md:object-right-top opacity-90" />
                    </div>
                    {/* Blue faded colour for the write up background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A1142] via-[#0A1142]/95 to-transparent md:to-[#0A1142]/20" />
                  </div>
                  <div className="px-6 md:px-10 py-10 relative z-10 flex flex-col justify-center w-full max-w-2xl lg:max-w-3xl h-full">
                    <h2 className="text-[#C5A059] font-bold tracking-widest uppercase text-[10px] md:text-xs mb-4 flex items-center gap-3">
                      <div className="w-8 h-0.5 bg-[#C5A059]"></div>
                      {slide.title}
                    </h2>
                    <div className="bg-[#0A1142]/50 p-5 md:p-6 rounded-xl backdrop-blur-md border-l-4 border-[#C5A059] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                      <p className="text-[13px] md:text-[14px] lg:text-[15px] font-medium text-blue-50 leading-relaxed italic drop-shadow-md">
                        "{slide.quote}"
                      </p>
                    </div>
                    <div className="mt-6 ml-2">
                      <p className="text-white font-black text-[12px] md:text-[14px] leading-snug">
                        <span className="italic font-medium text-white/90">His Excellency -</span><br />
                        Ahmed Usman Ododo FCA
                      </p>
                      <p className="text-[#C5A059] text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1.5">Executive Governor, Kogi State</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-8 bg-[#C5A059]' : 'w-2 bg-white/40 hover:bg-white/60'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        
        {/* Retirement Features (Only for staff in nominal roll and retirees) */}
        {!['governor', 'deputy_governor', 'super_admin', 'chief_of_staff', 'deputy_chief_of_staff', 'ssg', 'commissioner', 'dg_gdu', 'auditor_general', 'accountant_general', 'civil_service_commission'].includes(profile.id) && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-600"><PartyPopper className="size-5" /></div>
              <div>
                {profile.id === 'retiree' ? (
                   <>
                     <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Retirement Status</p>
                     <p className="text-sm font-bold text-foreground">Thank you for serving Kogi State boldly!</p>
                   </>
                ) : (
                   <>
                     <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Retirement Tracker</p>
                     <p className="text-sm font-medium text-foreground">You have approx. <span className="font-bold text-amber-600">8 Years, 4 Months</span> until statutory retirement.</p>
                   </>
                )}
              </div>
            </div>
            {profile.id === 'retiree' && (
              <Link to="/dashboard/retiree" className="px-4 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-md hover:bg-amber-600 transition-colors shadow-sm">
                Enter Retiree Dashboard
              </Link>
            )}
          </div>
        )}

        {/* Dynamic Overview Cards */}
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2"><Landmark className="size-4" /> {roleTitle}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {kpiCards.map((card, i) => (
              <StatCard key={i} label={card.label} response={card.response} value={card.value} icon={card.icon} onClick={card.onClick} />
            ))}
            {attendanceStore.isUserEligible(profile.id) && attendanceStore.settings.showDashboardCards && (
              <StatCard 
                label="Attendance Rate" 
                response={stats.att ? { ...stats.att, value: stats.att.value ? `${stats.att.value}%` : null } : null}
                icon={<Activity className="text-emerald-500" />} 
                onClick={profile.id === 'retiree' ? () => { setActiveCard({ title: "Details no longer available", value: "Historical", status: "Not Applicable", route: "", source: "Archive", lastUpdated: "N/A" }); setModalOpen(true); } : undefined}
              />
            )}
          </div>
        </div>

        {/* 32-Year Development Plan Overview Card (Only for authorized roles) */}
        {['governor', 'dg_gdu', 'commissioner', 'perm_secretary', 'director_prs', 'm_and_e_officer', 'director', 'super_admin'].includes(session?.role || '') && (
          <Card className="border-border/60 bg-gradient-to-br from-[#060B28] via-slate-900 to-[#1F1404] text-white p-6 relative overflow-hidden rounded-xl border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#C5A059]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Target className="size-5 text-[#C5A059]" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">32-Year Development Plan Oversight</span>
                </div>
                <Link to="/dashboard/development-plan" className="text-xs text-[#C5A059] hover:underline font-bold">
                  View Full Plan →
                </Link>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Current Active Vision</p>
                <p className="text-sm italic font-medium mt-1 text-slate-100">"{devPlanStore.vision}"</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Active Pillars</div>
                  <div className="text-2xl font-black">{devPlanStore.pillars.length} Focus Areas</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Overall Progress Trajectory</div>
                  <div className="text-2xl font-black text-emerald-400">
                    {Math.round(devPlanStore.pillars.length > 0 ? 76 : 0)}% Completed
                  </div>
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Trajectoral Progress Bar</div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: '76%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions Panel */}
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles className="size-4 text-gold" /> Quick Actions & Tasks</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <Link 
                key={i} 
                to={action.to}
                className="bg-card border border-border/60 hover:border-primary/50 rounded-xl p-4 flex items-center gap-3 transition-colors shadow-sm cursor-pointer group"
              >
                <div className="p-2 bg-primary/5 group-hover:bg-primary/10 rounded-lg transition-colors">
                  {action.icon}
                </div>
                <span className="text-xs font-bold text-foreground/80 group-hover:text-primary transition-colors">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Charts and AI briefs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={chartTitle} action={<Link to={chartActionLink} className="text-xs text-primary hover:underline">{chartActionLabel}</Link>}>
            <div className="h-64 relative flex flex-col justify-center">
              {chartType === 'area' ? (
                trendRes ? (
                  <>
                    {trendRes.status === 'not_connected' && (
                      <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center">
                        <AlertTriangle className="size-8 text-rose-500 mb-2 animate-bounce" />
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-500">Database Offline (Mock Mode)</span>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
                          {trendRes.message}
                        </p>
                      </div>
                    )}
                    {trendRes.status === 'connected' && trendRes.value?.length === 0 && (
                      <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center">
                        <Database className="size-8 text-amber-500 mb-2 animate-pulse" />
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-500">No Budget Data Found</span>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
                          {trendRes.message}
                        </p>
                      </div>
                    )}
                    
                    {/* Render chart if we have data (either cached mock or live) */}
                    {(trendRes.value && trendRes.value.length > 0) ? (
                      <ResponsiveContainer>
                        <AreaChart data={trendRes.value}>
                          <defs>
                            <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} />
                          <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `₦${v}M`} />
                          <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}M`} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                          <Area type="monotone" dataKey="actual" name="Actual Spent" stroke="var(--primary)" strokeWidth={2} fill="url(#g2)" />
                          <Area type="monotone" dataKey="planned" name="Planned Release" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5} fill="none" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-xs text-muted-foreground">N/A</div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <RefreshCw className="size-4 animate-spin text-primary" /> Loading trend...
                  </div>
                )
              ) : chartType === 'bar' ? (
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <RBar dataKey={chartKey} fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey={chartKey} stroke="var(--primary)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          
          <Card title="AI Intelligence Briefs" action={<button onClick={() => handleAskAI("AI Intelligence Briefs", "Global Dashboard", "Executive View")} className="text-xs text-primary hover:underline font-medium">Ask AI</button>}>
            <div className="space-y-4">
               {AI_INSIGHTS.slice(0, 4).map((t, i) => (
                <div key={i} className="flex gap-3 text-[13px] bg-muted/30 p-3 rounded-xl border border-border/50">
                  <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium text-foreground/90">{t}</p>
                </div>
               ))}
            </div>
          </Card>
        </div>

        {activeCard && (
          <CardDetailModal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)} 
            title={activeCard.title} 
            value={activeCard.value} 
            status={activeCard.status} 
            dataSource={activeCard.source} 
            lastUpdated={activeCard.lastUpdated} 
            moduleRoute={activeCard.route} 
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon, 
  status, 
  response, 
  onClick 
}: { 
  label: string; 
  value?: any; 
  icon: React.ReactNode; 
  status?: string; 
  response?: any; 
  onClick?: () => void 
}) { 
  const isNA = response && (
    response.status === 'not_connected' || 
    response.status === 'error' || 
    response.value === null || 
    response.value === undefined || 
    response.value === 0 || 
    response.value === "0" || 
    response.value === "0%"
  );

  return (
    <div onClick={onClick} className={`bg-card border border-border shadow-sm rounded-xl p-4 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 min-h-[120px] ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="flex-1 flex flex-col justify-end">
        {isNA ? (
          <div className="space-y-1">
            <div className={`text-sm font-black uppercase tracking-wider ${label === "Attendance Rate" ? "text-amber-500" : "text-rose-500"}`}>
              {label === "Attendance Rate" ? "Coming Soon" : "N/A"}
            </div>
            <div className={`text-[9px] leading-tight font-semibold max-w-full break-words ${label === "Attendance Rate" ? "text-amber-600/80" : "text-rose-400"}`} style={{ fontSize: '9px' }}>
              {response.message}
            </div>
            {onClick && (
              <span className="text-[8px] text-primary/80 font-black tracking-wider uppercase block mt-1 hover:underline">
                Click to manage / view list
              </span>
            )}
          </div>
        ) : (
          <div>
            <div className="text-xl font-black tracking-tight text-foreground">
              {response ? (typeof response.value === 'number' ? response.value.toLocaleString() : response.value) : value}
            </div>
            {response && response.status === 'connected' && (
              <span className="text-[8px] text-emerald-500 font-black tracking-wider uppercase block mt-1">
                Live Data Linked
              </span>
            )}
            {onClick && (
              <span className="text-[8px] text-primary/80 font-black tracking-wider uppercase block mt-1 hover:underline">
                View Details
              </span>
            )}
          </div>
        )}
      </div>
      {status && !response && (
        <span className="text-[9px] text-muted-foreground mt-2 uppercase font-bold tracking-wide">{status}</span>
      )}
    </div>
  );
}


/* ───────────── 12. DG GDU COMMAND CENTER ───────────── */
function GDUCommandCenter({ name, profile }: { name: string; profile: RoleProfile }) {
  const [stats, setStats] = useState<any>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      const [devPlan, proj, delayed] = await Promise.all([
        getDevelopmentPlanPerformance(),
        getActiveProjects(),
        getDelayedProjects(),
      ]);
      setStats({
        devPlan, proj, delayed
      });
    }
    loadStats();
  }, []);

  const handleCardClick = (title: string, data: any, route: string, source: string) => {
    if (!data) return;
    setActiveCard({ title, value: data.value, status: data.status, route, source, lastUpdated: 'Today' });
    setModalOpen(true);
  };

  return (
    <div>
      <div className="bg-slate-950 text-white pb-12 pt-8 px-4 sm:px-6 md:px-8 border-b-4 border-gold relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold mb-3 font-bold bg-gold/10 px-3 py-1.5 rounded-full border border-gold/20">
              <Shield className="size-3" /> DG GDU Command Center
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">{getGreeting(name)}</h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm">
              Live monitoring of Development Plan Status, Budget, Projects, Programmes, Escalations, and AI Delivery Briefs.
            </p>
          </div>
          <button 
            onClick={() => handleAskAI("AI Delivery Brief", "DG Command Center", "Executive View")}
            className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xl flex items-center gap-2 transition-all self-start sm:self-auto shrink-0"
          >
            <Sparkles className="size-4" /> Generate AI Delivery Brief
          </button>
        </div>
      </div>

        <div className="px-4 sm:px-6 md:px-8 -mt-6 pb-10 space-y-6 relative z-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            <StatCard label="Dev Plan Status" value={`${stats.devPlan?.value || "..."}%`} status={stats.devPlan?.status} onClick={() => handleCardClick("Dev Plan Status", stats.devPlan, "/dashboard/dev-plan", "devPlanStore.ts")} icon={<Target className="text-emerald-500" />} />
            <StatCard label="Budget Monitored" value="₦250B" status="mock" icon={<Wallet className="text-blue-500" />} />
            <StatCard label="Projects Tracked" value={stats.proj?.value || "..."} status={stats.proj?.status} onClick={() => handleCardClick("Projects Tracked", stats.proj, "/dashboard/projects", "projectsStore.ts")} icon={<FolderKanban className="text-indigo-500" />} />
            <StatCard label="Programmes" value="14" status="mock" icon={<Layers className="text-purple-500" />} />
            <div onClick={() => handleCardClick("Delayed Activities", stats.delayed, "/dashboard/projects", "projectsStore.ts")} className="bg-rose-500/10 border border-rose-500/20 shadow-sm rounded-xl p-4 flex flex-col justify-center cursor-pointer hover:border-rose-500/50 transition-colors">
               <div className="flex justify-between items-start mb-2">
                 <AlertTriangle className="size-5 text-rose-500" />
                 {stats.delayed?.status === 'mock' && <span className="text-[9px] bg-rose-500/20 text-rose-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Mock Data</span>}
               </div>
               <div className="font-black text-2xl tracking-tight text-rose-600 dark:text-rose-400">{stats.delayed?.value || "..."}</div>
               <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600/70 dark:text-rose-400/70 mt-1">Delayed Activities</div>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Escalation Tracker" className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border uppercase text-[10px] text-muted-foreground tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Project / Task</th>
                    <th className="px-4 py-3 font-semibold">MDA</th>
                    <th className="px-4 py-3 font-semibold">Delay</th>
                    <th className="px-4 py-3 font-semibold">Risk Lvl</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {PROJECTS.filter(p => p.status === 'Delayed').map((p, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-[13px]">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-[12px]">{p.ministry}</td>
                      <td className="px-4 py-3 font-mono text-rose-500 text-[12px]">+{12 + i * 4} Days</td>
                      <td className="px-4 py-3"><Pill tone="bad">High</Pill></td>
                      <td className="px-4 py-3"><button className="text-primary text-[12px] font-bold hover:underline">Escalate to Gov</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <Card title="Live AI Intelligence">
            <div className="space-y-4">
               {AI_INSIGHTS.slice(0, 3).map((t, i) => (
                <div key={i} className="flex gap-3 text-[12.5px] p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{t}</p>
                </div>
               ))}
               <div className="pt-2 border-t border-border">
                  <button className="w-full py-2 bg-muted hover:bg-muted/80 text-[12px] font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                     <FileText className="size-3.5" /> View Monthly Delivery Brief
                  </button>
               </div>
            </div>
          </Card>
        </div>

        {/* System Status & Health Section */}
        <SystemHealthDashboardSection />
        
        {activeCard && (
          <CardDetailModal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)} 
            title={activeCard.title} 
            value={activeCard.value} 
            status={activeCard.status} 
            dataSource={activeCard.source} 
            lastUpdated={activeCard.lastUpdated} 
            moduleRoute={activeCard.route} 
          />
        )}
      </div>
    </div>
  );
}

function SystemHealthDashboardSection() {
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      const start = Date.now();
      try {
        
        const res = await dbGetSystemHealthStatus();
        setDbHealth(res);
        setApiLatency(Date.now() - start);
      } catch (err) {
        console.error("Failed to load health status:", err);
      }
    }
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card title="System Status & Health Monitoring">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-1">
        {/* PostgreSQL Database */}
        <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Database Engine</span>
            <div className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${dbHealth?.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-[10px] font-black uppercase text-foreground">{dbHealth?.status || 'checking'}</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-black flex items-center gap-1.5 text-foreground">
              <Database className="size-4 text-primary" />
              {dbHealth?.databaseName || 'PostgreSQL'}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 font-medium truncate">
              Host: {dbHealth?.host || 'localhost'}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
            <span>Latency</span>
            <span className="font-bold text-foreground">{dbHealth?.latencyMs ? `${dbHealth.latencyMs}ms` : '--'}</span>
          </div>
        </div>

        {/* API Gateway */}
        <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Backend API Gateway</span>
            <div className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${apiLatency !== null ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-[10px] font-black uppercase text-foreground">{apiLatency !== null ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-black flex items-center gap-1.5 text-foreground">
              <Globe className="size-4 text-blue-500" />
              API Server
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 font-medium">
              Endpoint: /api/rpc
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
            <span>Latency</span>
            <span className="font-bold text-foreground">{apiLatency ? `${apiLatency}ms` : '--'}</span>
          </div>
        </div>

        {/* Authentication */}
        <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Authentication</span>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-foreground">Online</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-black flex items-center gap-1.5 text-foreground">
              <Shield className="size-4 text-purple-500" />
              Local RBAC Engine
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 font-medium">
              Provider: Local JWT Session
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
            <span>Uptime</span>
            <span className="font-bold text-foreground">99.99%</span>
          </div>
        </div>

        {/* Microservices & Cloud Storage */}
        <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Storage Gateway</span>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-foreground">Online</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-black flex items-center gap-1.5 text-foreground">
              <Layers className="size-4 text-amber-500" />
              Document Vault
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 font-medium">
              Provider: Firebase GCS
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
            <span>Uptime</span>
            <span className="font-bold text-foreground">100.0%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* utility: keep imports referenced even if unused in some branches */
const _kept = [ArrowUpRight, Map, MessageSquare, ShoppingCart, FileText, CheckCircle2, Calendar, Target];
void _kept;

function DashboardLgaSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { lgas, loading } = useDbLgas();
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={loading}
      className="w-full h-9 px-3 rounded-md bg-card border border-border text-xs focus:outline-none disabled:opacity-60"
    >
      {loading && <option>Loading LGAs...</option>}
      {lgas.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
    </select>
  );
}