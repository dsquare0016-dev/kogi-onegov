import { dbGetNotifications, dbMarkNotificationAsRead, dbChangeUserPassword } from '@/lib/postgres-service';
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Building2, Wallet, FolderKanban, Users, ShoppingCart,
  MessageSquare, FileText, Sparkles, BarChart3, Map, Bell, Search, LogOut,
  Shield, Moon, Sun, ChevronDown, Gauge, ClipboardList, ListChecks, AlertTriangle,
  Mail, Newspaper, IdCard, Workflow, Activity, Landmark, Building, Network, Layers, UserCog, UserCheck, Key, FileSignature, 
  Target, Phone, ShieldCheck, Banknote, Receipt, MapPin, BrainCircuit, BellRing, PieChart, Lock, Settings, History, Save, ShieldAlert, BadgeAlert, Calendar, PartyPopper, ChevronRight, Menu, X as XIcon, Clock, Upload, Camera, Wrench, Loader2, Eye, EyeOff
} from "lucide-react";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { Logo } from "./Logo";
import { getSession, signOut, roleById, Role } from "@/lib/auth";
import { safeGetCollection } from "@/lib/firebase";
import { bannerStore, BannerType } from "@/lib/banner-store";
import { ChatbotWidget } from "./ChatbotWidget";
import { workingHoursStore } from "@/lib/working-hours-store";
import { GlobalSearch } from "./GlobalSearch";
import { AIIntelligenceModal } from "./AIIntelligenceModal";
import { attendanceStore } from "@/lib/attendanceStore";
import { useProfileStore } from "@/lib/profileStore";
import { useSettingsStore } from "@/lib/settingsStore";

type NavItemType = {
  to?: string;
  label: string;
  icon?: any;
  action?: string;
  subItems?: { to?: string; label: string; action?: string }[];
};

export const NAV_GROUPS: { label: string; items: NavItemType[] }[] = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Global Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Executive Overview Cards",
    items: [
      { to: "/dashboard/governance", label: "Governance", icon: Landmark },
      { to: "/dashboard/workforce", label: "Workforce", icon: Users },
      { to: "/dashboard/performance-cards", label: "Performance", icon: Activity },
      { to: "/dashboard/financial", label: "Financial", icon: Wallet },
      { to: "/dashboard/delivery-cards", label: "Delivery", icon: LayoutDashboard },
      { to: "/dashboard/intelligence", label: "Intelligence", icon: Sparkles },
    ],
  },
  {
    label: "Organization",
    items: [
      {
        label: "Executive Offices", icon: Landmark,
        subItems: [
          { to: "/dashboard/executive-offices", label: "Offices Directory" },
          { to: "/dashboard/executive-offices/create", label: "Create Office" },
          { to: "/dashboard/executive-offices/edit", label: "Edit Office" },
        ]
      },
      {
        label: "Ministries", icon: Building2,
        subItems: [
          { to: "/dashboard/ministries", label: "Ministries Directory" },
          { to: "/dashboard/ministries/create", label: "Create Ministry" },
          { to: "/dashboard/ministries/edit", label: "Edit Ministry" },
          { to: "/dashboard/ministries/delete", label: "Delete Ministry" },
          { to: "/dashboard/ministries/assign-commissioner", label: "Assign Commissioner" },
          { to: "/dashboard/ministries/assign-ps", label: "Assign Permanent Secretary" },
        ]
      },
      {
        label: "Agencies & Parastatals", icon: Building,
        subItems: [
          { to: "/dashboard/agencies", label: "Agencies Directory" },
          { to: "/dashboard/agencies/create", label: "Create Agency" },
          { to: "/dashboard/agencies/edit", label: "Edit Agency" },
          { to: "/dashboard/agencies/delete", label: "Delete Agency" },
        ]
      },
      {
        label: "Departments", icon: Network,
        subItems: [
          { to: "/dashboard/departments", label: "Departments Directory" },
          { to: "/dashboard/departments/create", label: "Create Department" },
          { to: "/dashboard/departments/edit", label: "Edit Department" },
          { to: "/dashboard/departments/delete", label: "Delete Department" },
        ]
      },
      {
        label: "Units", icon: Layers,
        subItems: [
          { to: "/dashboard/units", label: "Units Directory" },
          { to: "/dashboard/units/create", label: "Create Unit" },
          { to: "/dashboard/units/edit", label: "Edit Unit" },
          { to: "/dashboard/units/delete", label: "Delete Unit" },
        ]
      },
      {
        label: "Positions", icon: UserCog,
        subItems: [
          { to: "/dashboard/positions", label: "Positions Master" },
          { to: "/dashboard/positions/create", label: "Create Position" },
          { to: "/dashboard/positions/edit", label: "Edit Position" },
          { to: "/dashboard/positions/delete", label: "Delete Position" },
        ]
      },
      {
        label: "Cabinet Dashboards", icon: Landmark,
        subItems: [
          { to: "/dashboard/structure/governor", label: "Governor" },
          { to: "/dashboard/structure/deputy-governor", label: "Deputy Governor" },
          { to: "/dashboard/structure/ssg", label: "SSG" },
          { to: "/dashboard/structure/chief-of-staff", label: "Chief of Staff" },
          { to: "/dashboard/structure/deputy-chief-of-staff", label: "Deputy Chief of Staff" },
          { to: "/dashboard/structure/head-of-service", label: "Head of Service" },
          { to: "/dashboard/structure/civil-service-commission", label: "Civil Service Commission" },
          { to: "/dashboard/structure/auditor-general", label: "Auditor General" },
          { to: "/dashboard/structure/accountant-general", label: "Accountant General" },
          { to: "/dashboard/structure/gdu", label: "GDU" },
        ]
      },
    ],
  },
  {
    label: "Development Framework",
    items: [
      {
        label: "32-Year Development Plan", icon: Shield,
        subItems: [
          { to: "/dashboard/dev-plan/pillars", label: "Strategic Pillars" },
          { to: "/dashboard/dev-plan/mdas-mapping", label: "MDAs Mapping" },
          { to: "/dashboard/dev-plan/kpi-framework", label: "KPI Framework" },
          { to: "/dashboard/dev-plan/spi-formula", label: "State Performance Index Formula" },
        ]
      },
      {
        label: "Alignment Engine", icon: Workflow,
        to: "/dashboard/alignment-engine"
      }
    ],
  },
  {
    label: "Budget Control Center",
    items: [
      {
        label: "Hierarchical Budget Control", icon: Landmark,
        subItems: [
          { to: "/dashboard/budget/proposal", label: "Create Budget Proposal" },
          { to: "/dashboard/budget/director-review", label: "Director Budget Review" },
          { to: "/dashboard/budget/allocation", label: "General Budget Allocation" },
          { to: "/dashboard/budget/distribution", label: "Ministry Downstream Distribution" },
          { to: "/dashboard/budget/reports", label: "End-of-Year Reporting & Review" },
        ]
      },
      {
        label: "Budget Framework", icon: Wallet,
        subItems: [
          { to: "/dashboard/budget/annual", label: "Annual Budget" },
          { to: "/dashboard/budget/revised", label: "Revised Budget" },
          { to: "/dashboard/budget/supplementary", label: "Supplementary Budget" },
          { to: "/dashboard/budget/categories", label: "Budget Categories" },
          { to: "/dashboard/budget/templates", label: "Budget Templates" },
          { to: "/dashboard/budget/parameters", label: "Budget Measurement Parameters" },
          { to: "/dashboard/budget/upload", label: "Budget Upload" },
        ]
      },
      {
        label: "Budget Intelligence", icon: BarChart3,
        subItems: [
          { to: "/dashboard/budget/intel/dev-plan", label: "Budget VS Development Plan" },
          { to: "/dashboard/budget/intel/analytics", label: "Budget Performance Analytics" },
          { to: "/dashboard/budget/intel/rankings", label: "MDA Budget Ranking" },
          { to: "/dashboard/budget/intel/governor", label: "Governor Executive Dashboard" },
          { to: "/dashboard/budget/intel/ai", label: "AI Budget Assistant" },
        ]
      }
    ],
  },
  {
    label: "Delivery Management",
    items: [
      {
        label: "Programmes", icon: ClipboardList,
        subItems: [
          { to: "/dashboard/programmes", label: "Programmes Dashboard" },
          { to: "/dashboard/programmes/create", label: "Create" },
          { to: "/dashboard/programmes/edit", label: "Edit" },
          { to: "/dashboard/programmes/approve", label: "Approve" },
          { to: "/dashboard/programmes/suspend", label: "Suspend" },
          { to: "/dashboard/programmes/archive", label: "Archive" },
        ]
      },
      {
        label: "Projects", icon: FolderKanban,
        subItems: [
          { to: "/dashboard/projects/create", label: "Create" },
          { to: "/dashboard/projects/edit", label: "Edit" },
          { to: "/dashboard/projects/assign", label: "Assign" },
          { to: "/dashboard/projects/monitor", label: "Monitor" },
          { to: "/dashboard/projects/verification", label: "Verification Engine" },
        ]
      }
    ],
  },
  {
    label: "Staff Management",
    items: [
      {
        label: "Self-Service Portal", icon: FileSignature,
        subItems: [
          { to: "/dashboard/staff/apply", label: "Apply (Leave/Transfer/Promote)" },
        ]
      },
      {
        label: "Nominal Roll", icon: Users,
        subItems: [
          { to: "/dashboard/staff/nominal-roll", label: "Master Nominal Roll" },
          { to: "/dashboard/staff/upload", label: "Upload / Import Staff" },
        ]
      },
      {
        label: "Special Appointments", icon: ShieldCheck,
        subItems: [
          { to: "/dashboard/staff/political", label: "Political Appointees" },
          { to: "/dashboard/staff/adhoc", label: "Adhoc Staff" },
        ]
      },
      {
        label: "Retirement", icon: PartyPopper,
        subItems: [
          { to: "/dashboard/retiree", label: "Retiree Dashboard" },
        ]
      },
      {
        label: "Attendance", icon: Clock,
        subItems: [
          { to: "/dashboard/attendance", label: "Attendance Dashboard" },
          { to: "/dashboard/attendance/upload", label: "Upload Attendance" },
          { to: "/dashboard/admin/attendance-builder", label: "Register Builder" },
        ]
      },
      {
        label: "Staff Records", icon: FileSignature,
        subItems: [
          { to: "/dashboard/staff/view", label: "View Staff" },
          { to: "/dashboard/staff/edit", label: "Edit Staff" },
          { to: "/dashboard/staff/transfer", label: "Transfer Staff" },
          { to: "/dashboard/staff/promote", label: "Promote Staff" },
          { to: "/dashboard/staff/retire", label: "Retire Staff" },
        ]
      },
      {
        label: "Staff Lifecycle", icon: Activity,
        subItems: [
          { to: "/dashboard/staff/recruitment", label: "Online Recruitment" },
          { to: "/dashboard/staff/verification", label: "Verification" },
          { to: "/dashboard/staff/promote", label: "Promotions" },
          { to: "/dashboard/staff/transfer", label: "Transfers" },
          { to: "/dashboard/staff/retire", label: "Retirement" },
        ]
      },
      {
        label: "Desk Officer Management", icon: IdCard,
        subItems: [
          { to: "/dashboard/desk-officers/assign", label: "Assign Desk Officers" },
          { to: "/dashboard/desk-officers/certification", label: "Certification Status" },
          { to: "/dashboard/desk-officers/training", label: "Training Status" },
          { to: "/dashboard/desk-officers/replacement", label: "Replacement Requests" },
          { to: "/dashboard/desk-officers/redeployment", label: "Redeployment Requests" },
        ]
      }
    ],
  },
  {
    label: "Operations & Management",
    items: [
      {
        label: "Activity Management", icon: Target,
        subItems: [
          { to: "/dashboard/activities/create", label: "Create Activity" },
          { to: "/dashboard/activities/assign", label: "Assign Activity" },
          { to: "/dashboard/activities/monitor", label: "Monitor Activity" },
        ]
      },
      {
        label: "Task Management", icon: ListChecks,
        subItems: [
          { to: "/dashboard/tasks/", label: "Task Dashboard" },
          { to: "/dashboard/tasks/creation", label: "Task Creation" },
          { to: "/dashboard/tasks/assignment", label: "Officer Assignment" },
          { to: "/dashboard/tasks/execution", label: "Task Execution Details" },
          { to: "/dashboard/tasks/evidence", label: "Task Evidence Center" },
          { to: "/dashboard/tasks/approval", label: "Approval Workflow" },
          { to: "/dashboard/tasks/verification", label: "Verification Engine" },
          { to: "/dashboard/tasks/delays", label: "Delay Analysis" },
          { to: "/dashboard/tasks/performance", label: "Performance Engine" },
          { to: "/dashboard/tasks/reports", label: "Task Reports" },
        ]
      },
      {
        label: "Calendar & Holidays", icon: Calendar,
        subItems: [
          { to: "/dashboard/calendar", label: "Global Calendar" }
        ]
      }
    ],
  },
  {
    label: "Command & Control",
    items: [
      {
        label: "Executive Room", icon: ShieldAlert,
        subItems: [
          { to: "/dashboard/executive-room", label: "EXCo Room Dashboard" },
          { to: "/dashboard/executive-room/spi", label: "State Performance Index" },
          { to: "/dashboard/executive-room/commissioners", label: "Commissioner Rankings" },
          { to: "/dashboard/executive-room/ministries", label: "Ministry Rankings" },
          { to: "/dashboard/executive-room/projects", label: "Project Rankings" },
          { to: "/dashboard/executive-room/budgets", label: "Budget Rankings" },
          { to: "/dashboard/executive-room/risks", label: "Risk Rankings" },
        ]
      },
      {
        label: "DG GDU Command Center", icon: BadgeAlert,
        to: "/dashboard/gdu-center/requests"
      }
    ],
  },
  {
    label: "Communications & Workflow",
    items: [
      {
        label: "E-Memo Center", icon: Mail,
        subItems: [
          { to: "/dashboard/memo/draft", label: "Draft Memo" },
          { to: "/dashboard/memo/route", label: "Route Memo" },
          { to: "/dashboard/memo/approve", label: "Approve Memo" },
          { to: "/dashboard/memo/sign", label: "Sign Memo" },
          { to: "/dashboard/memo/track", label: "Track Memo" },
        ]
      },
      {
        label: "Communication Hub", icon: MessageSquare,
        subItems: [
          { to: "/dashboard/communication/direct-messages", label: "Direct Messages" },
          { to: "/dashboard/communication/group-messages", label: "Group Messages" },
          { to: "/dashboard/communication/broadcast", label: "Broadcast Messages" },
          { to: "/dashboard/communication/groups", label: "Groups & Teams" },
        ]
      },
      {
        label: "Notification Center", icon: BellRing,
        subItems: [
          { to: "/dashboard/notifications/alerts", label: "Automated Alerts" },
        ]
      }
    ],
  },
  {
    label: "Intelligence & Analytics",
    items: [
      {
        label: "Reporting Center", icon: FileText,
        subItems: [
          { to: "/dashboard/reports/daily", label: "Daily Reports" },
          { to: "/dashboard/reports/weekly", label: "Weekly Reports" },
          { to: "/dashboard/reports/monthly", label: "Monthly Reports" },
          { to: "/dashboard/reports/quarterly", label: "Quarterly Reports" },
          { to: "/dashboard/reports/annual", label: "Annual Reports" },
        ]
      },
      {
        label: "AI Government Intelligence", icon: BrainCircuit,
        subItems: [
          { to: "/dashboard/reports/ai-studio", label: "AI Assistant" },
        ]
      }
    ],
  },
  {
    label: "Support & Assistance",
    items: [
      {
        label: "Support", icon: MessageSquare,
        subItems: [
          { to: "/dashboard/support", label: "Live Support Desk" },
          { to: "/dashboard/ai/outputs", label: "AI Outputs & Briefs" },
        ]
      }
    ]
  },
  {
    label: "Finance & Audit",
    items: [
      {
        label: "Audit Center", icon: ShieldCheck,
        subItems: [
          { to: "/dashboard/audit/queries", label: "Audit Queries" },
          { to: "/dashboard/audit/compliance", label: "Compliance Reviews" },
          { to: "/dashboard/audit/risk-flags", label: "Risk Flags" },
          { to: "/dashboard/audit/procurement", label: "Procurement Reviews" },
        ]
      },
      {
        label: "Treasury Center", icon: Banknote,
        subItems: [
          { to: "/dashboard/treasury/revenue", label: "Revenue" },
          { to: "/dashboard/treasury/releases", label: "Releases" },
          { to: "/dashboard/treasury/expenditure", label: "Expenditure" },
          { to: "/dashboard/treasury/balance", label: "Treasury Balance" },
          { to: "/dashboard/treasury/cash-flow", label: "Cash Flow" },
        ]
      }
    ],
  },
  {
    label: "GDU CENTER",
    items: [
      {
        label: "Service Request Workflow", icon: Receipt,
        to: "/dashboard/gdu-center/requests"
      }
    ]
  },
  {
    label: "USER MANAGEMENT",
    items: [
      {
        label: "Users", icon: Users,
        subItems: [
          { to: "/dashboard/my-team", label: "My Team & Assistants" },
          { to: "/dashboard/admin/users/create", label: "Create User" },
          { to: "/dashboard/admin/users/edit", label: "Edit User" },
          { to: "/dashboard/admin/users/disable", label: "Disable User" },
          { to: "/dashboard/admin/users/suspend", label: "Suspend User" },
          { to: "/dashboard/admin/users/restore", label: "Restore User" },
        ]
      },
      {
        label: "Permission Engine", icon: Key,
        subItems: [
          { to: "/dashboard/admin/permissions/assign", label: "Assign Permissions" },
        ]
      }
    ]
  },
  {
    label: "System Settings",
    items: [
      {
        label: "System Administration", icon: Settings,
        subItems: [
          { to: "/dashboard/admin", label: "System Dashboard" },
          { to: "/dashboard/admin/configuration", label: "Site Configuration" },
          { to: "/dashboard/admin/security", label: "Security & Access" },
          { to: "/dashboard/admin/infrastructure", label: "Infrastructure & Data" },
          { to: "/dashboard/admin/integrations", label: "Integrations & Comms" },
          { to: "/dashboard/admin/platform", label: "Platform Control" },
          { to: "/dashboard/admin/knowledge-base", label: "AI Knowledge Base" },
          { to: "/dashboard/admin/audit", label: "Audit Logs" },
          { to: "/dashboard/admin/override", label: "Master Override Profile" },
          { to: "/dashboard/admin/recovery", label: "Data Recovery Center" },
          { to: "/dashboard/admin/government-setup", label: "Government Setup" },
        ]
      }
    ]
  }
];

function NavItem({ item, loc }: { item: NavItemType; loc: ReturnType<typeof useLocation> }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon || LayoutDashboard;
  const itemRef = useRef<HTMLDivElement>(null);
  const [memoCount, setMemoCount] = useState(0);

  const isActive = item.to 
    ? item.to === "/dashboard" ? loc.pathname === "/dashboard" : loc.pathname.startsWith(item.to)
    : item.subItems?.some(s => s.to && loc.pathname.startsWith(s.to));

  useEffect(() => {
    if (item.label !== "E-Memo Center") return;
    const handleUpdate = (e: any) => {
      setMemoCount(e.detail || 0);
    };
    window.addEventListener('memoCountUpdate', handleUpdate);
    setMemoCount((window as any).__pendingMemoCount || 0);
    return () => window.removeEventListener('memoCountUpdate', handleUpdate);
  }, [item.label]);

  useEffect(() => {
    if (isActive) {
      setOpen(true);
      setTimeout(() => {
        if (itemRef.current) {
          const navContainer = itemRef.current.closest('nav');
          if (navContainer) {
            const itemRect = itemRef.current.getBoundingClientRect();
            const navRect = navContainer.getBoundingClientRect();
            const itemTopRelative = itemRect.top - navRect.top;
            const itemBottomRelative = itemTopRelative + itemRect.height;

            if (itemTopRelative < 0) {
              navContainer.scrollTop += itemTopRelative - 8;
            } else if (itemBottomRelative > navContainer.clientHeight) {
              navContainer.scrollTop += itemBottomRelative - navContainer.clientHeight + 8;
            }
          }
        }
      }, 150);
    }
  }, [isActive, loc.pathname]);

  if (item.subItems) {
    return (
      <div ref={itemRef} className="space-y-0.5">
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] transition-colors ${
            isActive && !open
              ? "bg-sidebar-accent/50 text-sidebar-foreground"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon className={`size-4 ${isActive ? "text-sidebar-primary" : ""}`} />
            <span className="truncate">{item.label}</span>
            {item.label === "E-Memo Center" && memoCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-black bg-rose-500 text-white rounded-full leading-none animate-pulse">
                {memoCount}
              </span>
            )}
          </div>
          <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="pl-9 pr-2 py-1 space-y-0.5">
            {item.subItems.map(sub => {
              if (sub.action === 'openChatbot') {
                 return (
                    <button
                      key={sub.label}
                      onClick={() => window.dispatchEvent(new Event('openChatbot'))}
                      className="block w-full text-left px-3 py-1.5 rounded-md text-[11.5px] transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    >
                      <span className="truncate">{sub.label}</span>
                    </button>
                 );
              }
              const subActive = sub.to ? loc.pathname.startsWith(sub.to) : false;
              const isActionableSub = item.label === "E-Memo Center" && memoCount > 0 && 
                (sub.label === "Approve Memo" || sub.label === "Sign Memo" || sub.label === "Route Memo");

              return (
                <Link
                  key={sub.to || sub.label}
                  to={sub.to!}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[11.5px] transition-colors ${
                    subActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  }`}
                >
                  <span className="truncate">{sub.label}</span>
                  {isActionableSub && (
                    <span className="px-1.5 py-0.2 text-[8px] font-bold bg-rose-500 text-white rounded-full leading-none">
                      {memoCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={itemRef}>
      <Link
        to={item.to!}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] transition-colors ${
          isActive
            ? "bg-sidebar-accent text-sidebar-primary border border-sidebar-border"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        }`}
      >
        <Icon className={`size-4 ${isActive ? "text-sidebar-primary" : ""}`} />
        <span className="truncate">{item.label}</span>
      </Link>
    </div>
  );
}

function LiveClockWidget() {
  const [now, setNow] = useState(new Date());
  const [statusInfo, setStatusInfo] = useState(() => workingHoursStore.getStatusForDate(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNow(d);
      setStatusInfo(workingHoursStore.getStatusForDate(d));
    }, 1000);

    const handleUpdate = () => {
      setStatusInfo(workingHoursStore.getStatusForDate(new Date()));
    };

    window.addEventListener('workingHoursUpdate', handleUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('workingHoursUpdate', handleUpdate);
    };
  }, []);

  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  let colorClass = 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400';
  if (statusInfo.tone === 'success') {
    colorClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
  } else if (statusInfo.tone === 'warning') {
    colorClass = 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
  } else if (statusInfo.tone === 'info') {
    colorClass = 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400';
  }

  return (
    <div className={`ml-2 px-2 py-1 rounded border shadow-sm flex items-center gap-1.5 text-[10px] font-bold tracking-wide transition-colors ${colorClass}`}>
      {statusInfo.status === 'working' && (
        <span className="flex size-1.5 rounded-full bg-emerald-500 animate-pulse" />
      )}
      {statusInfo.status === 'closed' && (
        <BellRing className="size-3 animate-pulse origin-top" />
      )}
      <span>{statusInfo.label}</span>
      <span className="opacity-50 mx-0.5">•</span>
      <span>{dateString}</span>
      <span className="opacity-50 mx-0.5">•</span>
      <span className="tabular-nums">{timeString}</span>
    </div>
  );
}

function NetworkStrengthIndicator() {
  const [status, setStatus] = useState<'online' | 'offline'>('online');
  const [latency, setLatency] = useState<number | null>(null);
  const [speed, setSpeed] = useState<string>('Excellent');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateStatus = () => {
      setStatus(navigator.onLine ? 'online' : 'offline');
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();

    const pingInterval = setInterval(async () => {
      if (!navigator.onLine) {
        setStatus('offline');
        setSpeed('Offline');
        setLatency(null);
        return;
      }

      const start = Date.now();
      try {
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store', priority: 'low' });
        const rtt = Date.now() - start;
        setLatency(rtt);
        setStatus('online');
        
        if (rtt < 100) {
          setSpeed('Excellent');
        } else if (rtt < 250) {
          setSpeed('Good');
        } else if (rtt < 600) {
          setSpeed('Fair');
        } else {
          setSpeed('Poor');
        }
      } catch (err) {
        setStatus('offline');
        setSpeed('Offline');
        setLatency(null);
      }
    }, 12000);

    const initialCheck = async () => {
      if (!navigator.onLine) return;
      const start = Date.now();
      try {
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store', priority: 'low' });
        const rtt = Date.now() - start;
        setLatency(rtt);
        if (rtt < 100) setSpeed('Excellent');
        else if (rtt < 250) setSpeed('Good');
        else if (rtt < 600) setSpeed('Fair');
        else setSpeed('Poor');
      } catch {
        setStatus('offline');
        setSpeed('Offline');
      }
    };
    initialCheck();

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(pingInterval);
    };
  }, []);

  if (status === 'offline' || speed === 'Offline') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse" title="Offline - Check connection">
        <span className="flex size-1.5 rounded-full bg-rose-500 animate-ping" />
        <span>Offline</span>
      </div>
    );
  }

  const getBarColor = (barIndex: number) => {
    if (speed === 'Excellent') return 'bg-emerald-500';
    if (speed === 'Good') return barIndex <= 3 ? 'bg-emerald-500' : 'bg-muted-foreground/30';
    if (speed === 'Fair') return barIndex <= 2 ? 'bg-amber-500' : 'bg-muted-foreground/30';
    return barIndex <= 1 ? 'bg-rose-500' : 'bg-muted-foreground/30';
  };

  const titleText = `Network Status: ${speed} ${latency ? `(${latency}ms latency)` : ''}`;

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/40 border border-border/50 shadow-sm cursor-help hover:bg-accent transition-colors shrink-0" title={titleText}>
      <div className="flex items-end gap-[2px] h-3 shrink-0">
        <div className={`w-[3px] rounded-t-sm transition-colors ${getBarColor(1)}`} style={{ height: '35%' }} />
        <div className={`w-[3px] rounded-t-sm transition-colors ${getBarColor(2)}`} style={{ height: '55%' }} />
        <div className={`w-[3px] rounded-t-sm transition-colors ${getBarColor(3)}`} style={{ height: '75%' }} />
        <div className={`w-[3px] rounded-t-sm transition-colors ${getBarColor(4)}`} style={{ height: '100%' }} />
      </div>
      <span className="text-[10px] font-bold tracking-wide text-muted-foreground hidden sm:inline-block tabular-nums">
        {latency ? `${latency} ms` : speed}
      </span>
    </div>
  );
}

function getGreeting(name: string) {
  const hour = new Date().getHours();
  const surname = name.split(" ").slice(-1)[0].toUpperCase();
  if (hour < 12) return `Good Morning, ${surname}`;
  if (hour < 17) return `Good Afternoon, ${surname}`;
  return `Good Evening, ${surname}`;
}

export function checkItemVisibility(role: Role, label: string, showAll: boolean, isAttendanceEnabled: boolean, isCommunicationHubEnabled: boolean): boolean {
  if (label === 'Communication Hub' && !isCommunicationHubEnabled) return false;

  if (role === 'retiree') {
    if (label === 'Global Dashboard' || label === 'Retirement' || label === 'Attendance') return true;
    return false;
  }

  if (role === 'super_admin') return true;
  if (showAll) return true;

  if (label === 'Global Dashboard') return true;

  let additional: string[] = [];
  if (typeof window !== 'undefined') {
    const session = getSession();
    if (session) {
      const stored = localStorage.getItem(`gdu_permissions_${session.email}`);
      if (stored) {
        try {
          additional = JSON.parse(stored) as string[];
        } catch {}
      }
    }
  }

  // Check additional permissions override
  if (additional.includes('Nominal Roll (HR)') && label === 'Nominal Roll') return true;
  if (additional.includes('Manage Nominal Roll') && label === 'Nominal Roll') return true;
  if (additional.includes('Approve Leave') && label === 'Nominal Roll') return true;
  if (additional.includes('Manage Attendance') && label === 'Nominal Roll') return true;
  if (additional.includes('Executive Room') && label === 'Executive Room') return true;
  if (additional.includes('Access Executive Room') && label === 'Executive Room') return true;
  if (additional.includes('DG GDU Command Center') && label === 'DG GDU Command Center') return true;
  if (additional.includes('Access Command Center') && label === 'DG GDU Command Center') return true;
  if (additional.includes('Audit Center') && label === 'Audit Center') return true;
  if (additional.includes('Access Audit Center') && label === 'Audit Center') return true;
  if (additional.includes('Treasury Center') && label === 'Treasury Center') return true;
  if (additional.includes('Access Treasury Center') && label === 'Treasury Center') return true;
  if (additional.includes('View Budget Reports') && (label === 'Budget Intelligence' || label === 'Hierarchical Budget Control' || label === 'Budget Framework')) return true;
  if (additional.includes('Upload Project Evidence') && label === 'Projects') return true;
  if (additional.includes('USER MANAGEMENT') && (label === 'Users' || label === 'Permission Engine')) return true;
  if (additional.includes('System Settings') && label === 'System Administration') return true;

  const executives: Role[] = ['governor', 'deputy_governor', 'ssg', 'chief_of_staff', 'deputy_chief_of_staff', 'head_of_service', 'dg_gdu', 'civil_service_commission', 'accountant_general', 'auditor_general'];

  switch (label) {
    case 'Governance':
    case 'Workforce':
    case 'Performance':
    case 'Financial':
    case 'Delivery':
    case 'Intelligence':
      return executives.includes(role);

    case 'Executive Offices':
    case 'Ministries':
    case 'Agencies':
    case 'Departments':
    case 'Units':
      return executives.includes(role);

    case '32-Year Development Plan':
    case 'Alignment Engine':
      return ['governor', 'dg_gdu', 'commissioner', 'perm_secretary', 'director_prs', 'm_and_e_officer', 'director'].includes(role);

    case 'Hierarchical Budget Control':
    case 'Budget Framework':
    case 'Budget Intelligence':
      return ['governor', 'accountant_general', 'auditor_general', 'budget_officer', 'commissioner', 'perm_secretary', 'director_finance'].includes(role);

    case 'Programmes':
    case 'Projects':
      return ['governor', 'deputy_governor', 'ssg', 'dg_gdu', 'commissioner', 'perm_secretary', 'director', 'project_officer', 'm_and_e_officer'].includes(role);

    case 'Nominal Roll':
    case 'Staff Records':
    case 'Staff Lifecycle':
    case 'Desk Officer Management':
      return ['head_of_service', 'hr_officer', 'civil_service_commission', 'director_admin', 'project_officer', 'budget_officer', 'procurement_officer'].includes(role);

    case 'Attendance':
      if (!isAttendanceEnabled) return false;
      return true; // All users can see attendance (sub-items filtered separately)

    case 'Special Appointments':
      return ['governor', 'ssg', 'head_of_service', 'hr_officer'].includes(role);

    case 'Retirement':
      return ['retiree', 'civil_service_commission', 'hr_officer', 'head_of_service'].includes(role);

    case 'Executive Room':
      return ['governor', 'deputy_governor', 'ssg', 'chief_of_staff', 'deputy_chief_of_staff', 'dg_gdu', 'auditor_general', 'accountant_general'].includes(role);

    case 'DG GDU Command Center':
      return ['dg_gdu', 'governor'].includes(role);

    case 'E-Memo Center':
    case 'Communication Hub':
      if (['nysc_member', 'intern', 'consultant'].includes(role)) return false;
      return true;

    case 'Activity Management':
      return [...executives, 'commissioner', 'perm_secretary', 'director', 'director_admin', 'director_finance', 'director_prs'].includes(role);

    case 'Self-Service Portal':
      return true;

    case 'Task Management':
      return true; // All users see it, but sub-items filtered separately

    case 'Reporting Center':
      return [...executives, 'commissioner', 'perm_secretary', 'director', 'director_admin', 'director_finance', 'director_prs'].includes(role);

    case 'Calendar & Holidays':
      return ['governor'].includes(role);
    case 'Support':
      return ['super_admin'].includes(role);

    case 'AI Government Intelligence':
      return ['governor', 'dg_gdu', 'chief_of_staff', 'ssg', 'head_of_service'].includes(role);

    case 'Audit Center':
      return ['auditor_general', 'internal_auditor', 'governor', 'dg_gdu', 'accountant'].includes(role);

    case 'Treasury Center':
      return ['accountant_general', 'director_finance', 'accountant', 'governor', 'dg_gdu'].includes(role);

    case 'Service Request Workflow':
      return ['dg_gdu', 'governor', 'project_officer'].includes(role);

    case 'Users':
      return ['civil_service_commission'].includes(role);
    case 'Permission Engine':
    case 'System Administration':
    case 'Notification Center':
      return false; // Only super_admin handles this

    default:
      return false;
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const loc = useLocation();
  const isAttendanceEnabled = useSettingsStore((s) => s.isAttendanceEnabled);
  const isCommunicationHubEnabled = useSettingsStore((s) => s.isCommunicationHubEnabled);
  const isMaintenanceMode = useSettingsStore((s) => s.isMaintenanceMode);
  const maintenanceMessage = useSettingsStore((s) => s.maintenanceMessage);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState<BannerType>(() => bannerStore.activeBanner);
  const [session, setSession] = useState(() => getSession());
  
  useEffect(() => {
    if (!session) return;
    const userRole = session.role;
    
    const fetchMemoCount = async () => {
      try {
        const memos = await safeGetCollection<any>('memos', []);
        const pending = memos.filter(memo => {
          if (memo.stage === 'Approved') return false;
          
          const stage = memo.stage;
          if (stage === 'Secretary' && userRole === 'secretary_mda') return true;
          if (stage === 'Director' && ['director', 'director_admin', 'director_finance', 'director_prs'].includes(userRole)) return true;
          if (stage === 'Perm. Sec.' && userRole === 'perm_secretary') return true;
          if (stage === 'Commissioner' && userRole === 'commissioner') return true;
          if (stage === 'Governor' && userRole === 'governor') return true;
          
          if (memo.recipientRole === userRole && memo.status !== 'Approved') return true;
          if (memo.to === userRole && memo.status !== 'Approved') return true;
          
          return false;
        });
        
        (window as any).__pendingMemoCount = pending.length;
        window.dispatchEvent(new CustomEvent('memoCountUpdate', { detail: pending.length }));
      } catch (err) {
        console.error('Error fetching pending memos count:', err);
      }
    };
    
    fetchMemoCount();
    const interval = setInterval(fetchMemoCount, 15000);
  }, [session?.role]);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!session?.email) return;
    
    const loadNotifications = async () => {
      try {
        
        const userProfile = roleById(session.role);
        const mdaFilter = session.mda || session.department || userProfile?.ministry;
        const res = await dbGetNotifications({ 
          data: { 
            email: session.email,
            mda: mdaFilter
          } 
        });
        if (Array.isArray(res)) {
          setNotifications(res);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [session?.email, session?.role]);

  const handleMarkAsRead = async (id: string) => {
    try {
      
      await dbMarkNotificationAsRead({ data: { id } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return "just now";
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gdu_theme');
      return stored === 'dark' || stored === null;
    }
    return true;
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAllSidebar, setShowAllSidebar] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gdu_sidebar_show_all') === 'true';
    }
    return false;
  });

  // Profile details modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'view' | 'settings'>('view');
  const [settingsName, setSettingsName] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");
  const [settingsNotifications, setSettingsNotifications] = useState(true);
  const [settings2FA, setSettings2FA] = useState(true);
  const [profileSaved, setProfileSaved] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // Dedicated Password Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [showPassChangeToggle, setShowPassChangeToggle] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [isBirthday, setIsBirthday] = useState(false);

  const userProfileId = (session as any)?.id || session?.email || "default";
  const userProfile = useProfileStore(s => s.getProfile(userProfileId));
  const completionPercent = useProfileStore(s => s.calculateCompletion(userProfileId));
  const updateProfile = useProfileStore(s => s.updateProfile);

  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsAddress, setSettingsAddress] = useState("");
  const [settingsDOB, setSettingsDOB] = useState("");
  const [settingsGender, setSettingsGender] = useState("");
  const [settingsStateOfOrigin, setSettingsStateOfOrigin] = useState("");
  const [settingsNextOfKin, setSettingsNextOfKin] = useState("");
  const [settingsNextOfKinPhone, setSettingsNextOfKinPhone] = useState("");
  
  // Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassToggle, setShowPassToggle] = useState(false);
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile(userProfileId, { photoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const openProfileModal = (tab: 'view' | 'settings') => {
    const currentSession = getSession();
    if (currentSession) {
      setSettingsName(currentSession.name);
      setSettingsEmail(currentSession.email);
      const currentProfile = useProfileStore.getState().getProfile(userProfileId);
      setSettingsPhone(currentProfile.phone || "");
      setSettingsAddress(currentProfile.address || "");
      setSettingsDOB(currentProfile.dateOfBirth || "");
      setSettingsGender(currentProfile.gender || "");
      setSettingsStateOfOrigin(currentProfile.stateOfOrigin || "");
      setSettingsNextOfKin(currentProfile.nextOfKin || "");
      setSettingsNextOfKinPhone(currentProfile.nextOfKinPhone || "");
    }
    setProfileModalTab(tab);
    setShowProfileModal(true);
    setProfileOpen(false);
  };

  const handleSaveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsName.trim()) return;
    
    const current = getSession();
    if (current) {
      // Validate and change password if newPassword is input
      if (newPassword.trim()) {
        if (!oldPassword.trim()) {
          alert("Please enter your old password to proceed.");
          return;
        }
        if (newPassword !== confirmNewPassword) {
          alert("New passwords do not match.");
          return;
        }
        if (newPassword.length < 6) {
          alert("New password must be at least 6 characters.");
          return;
        }

        const { useNominalRollStore } = await import('@/lib/nominalRollStore');
        const nominalRecords = useNominalRollStore.getState().records;
        const { safeGetCollection, safeSetDoc } = await import('@/lib/firebase');
        const customUsers = await safeGetCollection<any>('users', []);

        const matchedRecord = nominalRecords.find(r => r.email === current.email || r.staffId === current.email) ||
                              customUsers.find(r => r.email === current.email || r.staffId === current.email);

        if (matchedRecord) {
          const storedPassword = (matchedRecord as any).password || "password";
          if (oldPassword !== storedPassword) {
            alert("Incorrect old password. Password change failed.");
            return;
          }

          // Save new password
          const updatedRecord = { ...matchedRecord, password: newPassword };
          if (nominalRecords.some(r => r.staffId === matchedRecord.staffId)) {
            await useNominalRollStore.getState().addRecord(updatedRecord as any);
          } else {
            await safeSetDoc('users', matchedRecord.staffId, updatedRecord);
          }
          alert("Password updated successfully.");
        } else {
          // If no custom user found (demo role), we can save it to users collection
          await safeSetDoc('users', current.email, {
            staffId: current.email,
            fullName: current.name,
            email: current.email,
            password: newPassword,
            role: current.role
          });
          alert("Password updated successfully for demo account.");
        }
        
        // Reset password fields
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }

      const updated = {
        ...current,
        name: settingsName,
        email: settingsEmail
      };
      localStorage.setItem('kogi_onegov_session', JSON.stringify(updated));
      setSession(updated);
      
      updateProfile(userProfileId, {
        personalEmail: settingsEmail,
        phone: settingsPhone,
        address: settingsAddress,
        dateOfBirth: settingsDOB,
        gender: settingsGender,
        stateOfOrigin: settingsStateOfOrigin,
        nextOfKin: settingsNextOfKin,
        nextOfKinPhone: settingsNextOfKinPhone
      });

      // Persist to Firestore 'users' collection
      import('@/lib/firebase').then(async ({ safeGetCollection, safeSetDoc }) => {
        const usersList = await safeGetCollection<any>('users', []);
        const matchingUser = usersList.find(u => u.email === current.email || u.staffId === (current as any).staffId);
        if (matchingUser) {
          const updatedUser = {
            ...matchingUser,
            fullName: settingsName,
            email: settingsEmail,
            phone: settingsPhone,
            phoneNumber: settingsPhone,
            address: settingsAddress,
            dateOfBirth: settingsDOB,
            gender: settingsGender,
            sex: settingsGender,
            stateOfOrigin: settingsStateOfOrigin,
            nextOfKin: settingsNextOfKin,
            nextOfKinPhone: settingsNextOfKinPhone
          };
          await safeSetDoc('users', matchingUser.staffId, updatedUser);
        }
      }).catch(err => console.error("Failed to persist profile settings:", err));
    }
    
    setProfileSaved(true);
    setTimeout(() => {
      setProfileSaved(false);
      setShowProfileModal(false);
    }, 1500);
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError("");
    setPasswordChangeSuccess(false);

    if (!oldPasswordInput.trim()) {
      setPasswordChangeError("Old password is required.");
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeError("New passwords do not match.");
      return;
    }
    if (newPasswordInput.length < 6) {
      setPasswordChangeError("Password must be at least 6 characters.");
      return;
    }

    try {
      const current = getSession();
      if (!current) {
        setPasswordChangeError("Session not found. Please log in again.");
        return;
      }

      
      await dbChangeUserPassword({
        data: {
          email: current.email,
          oldPass: oldPasswordInput,
          newPass: newPasswordInput
        }
      });

      setPasswordChangeSuccess(true);
      setOldPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
      setTimeout(() => {
        setPasswordChangeSuccess(false);
        setShowPasswordModal(false);
      }, 1500);
    } catch (err: any) {
      setPasswordChangeError(err.message || "Failed to update password.");
    }
  };

  useEffect(() => {
    const handleSidebarUpdate = () => {
      setShowAllSidebar(localStorage.getItem('gdu_sidebar_show_all') === 'true');
    };
    window.addEventListener('sidebarUpdate', handleSidebarUpdate);
    return () => window.removeEventListener('sidebarUpdate', handleSidebarUpdate);
  }, []);

  useEffect(() => {
    if (!session) return;
    
    const timer = setTimeout(() => {
      const today = new Date();
      const currentYear = today.getFullYear();
      
      let todayIsBirthday = false;
      const dobStr = userProfile.dateOfBirth;
      if (dobStr) {
        const [, month, day] = dobStr.split('-');
        if (month === String(today.getMonth() + 1).padStart(2, '0') && day === String(today.getDate()).padStart(2, '0')) {
          todayIsBirthday = true;
          setIsBirthday(true);
        }
      }
      
      const seenBirthday = sessionStorage.getItem(`seenBirthday_${userProfileId}_${currentYear}`);
      if (todayIsBirthday && !seenBirthday) {
        setShowBirthdayModal(true);
        sessionStorage.setItem(`seenBirthday_${userProfileId}_${currentYear}`, 'true');
        return; // Don't overwhelm user with multiple modals at once
      }

      if (completionPercent === 100) {
        const seen100 = localStorage.getItem(`seen100Percent_${userProfileId}`);
        if (!seen100) {
          setShowCelebrationModal(true);
          localStorage.setItem(`seen100Percent_${userProfileId}`, 'true');
        }
      } else {
        const seenIncomplete = sessionStorage.getItem(`seenIncomplete_${userProfileId}`);
        if (!seenIncomplete) {
          setShowIncompleteModal(true);
          sessionStorage.setItem(`seenIncomplete_${userProfileId}`, 'true');
        }
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [completionPercent, session, userProfileId, userProfile.dateOfBirth]);

  const [activeTheme, setActiveTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gdu_portal_theme') || 'default';
    }
    return 'default';
  });

  const [siteName, setSiteName] = useState("Kogi OneGov");
  const [govName, setGovName] = useState("Kogi State Government");
  const [orgName, setOrgName] = useState("Government Delivery Unit");
  const [copyright, setCopyright] = useState("© 2026 Kogi State Government. All Rights Reserved.");
  const [mainLogo, setMainLogo] = useState("/kogi-logo.png");
  const [gduLogo, setGduLogo] = useState("/gdu-logo.png");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const getStored = () => {
        setSiteName(localStorage.getItem("gdu_site_name") || "Kogi OneGov");
        setGovName(localStorage.getItem("gdu_gov_name") || "Kogi State Government");
        setOrgName(localStorage.getItem("gdu_org_name") || "Government Delivery Unit");
        setCopyright(localStorage.getItem("gdu_copyright") || `© ${new Date().getFullYear()} ${localStorage.getItem("gdu_gov_name") || "Kogi State Government"}. All Rights Reserved.`);
        setMainLogo(localStorage.getItem("gdu_main_logo") || "/kogi-logo.png");
        setGduLogo(localStorage.getItem("gdu_gdu_logo") || "/gdu-logo.png");
      };
      getStored();
      window.addEventListener("siteConfigUpdate", getStored);
      return () => window.removeEventListener("siteConfigUpdate", getStored);
    }
  }, []);

  useEffect(() => {
    const handleThemeUpdate = () => {
      setActiveTheme(localStorage.getItem('gdu_portal_theme') || 'default');
    };
    window.addEventListener('themeUpdate', handleThemeUpdate);
    return () => window.removeEventListener('themeUpdate', handleThemeUpdate);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('theme-default', 'theme-executive', 'theme-public');
      root.classList.add(`theme-${activeTheme}`);
    }
  }, [activeTheme]);

  useEffect(() => {
    const handleUpdate = () => setActiveBanner(bannerStore.activeBanner);
    window.addEventListener('bannerUpdate', handleUpdate);
    return () => window.removeEventListener('bannerUpdate', handleUpdate);
  }, []);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const s = getSession();
    if (!s) nav({ to: "/login" });
    else setSession(s);
  }, [nav]);

  useEffect(() => {
    if (!session?.email) return;
    
    const syncProfile = async () => {
      try {
        const { useNominalRollStore } = await import('@/lib/nominalRollStore');
        const nominalRecord = useNominalRollStore.getState().records.find(
          r => r.email === session.email || r.staffId === (session as any).staffId
        );

        const { safeGetCollection } = await import('@/lib/firebase');
        const usersList = await safeGetCollection<any>('users', []);
        const matchingUser = usersList.find(u => u.email === session.email || u.staffId === (session as any).staffId);
        
        const source = nominalRecord || matchingUser;
        if (source) {
          updateProfile(userProfileId, {
            personalEmail: source.email || session.email || '',
            phone: source.phoneNumber || source.phone || '',
            address: source.address || '',
            dateOfBirth: source.dateOfBirth || '',
            gender: source.sex || source.gender || '',
            stateOfOrigin: source.stateOfOrigin || '',
            nextOfKin: source.nextOfKin || '',
            nextOfKinPhone: source.nextOfKinPhone || '',
            profileOnlyFields: {
              staffId: source.staffId || '',
              psnNumber: source.psnNumber || '',
              staffType: source.staffType || '',
              department: source.department || '',
              mda: source.mda || '',
              gradeLevel: source.gradeLevel || '',
              dateOfFirstAppointment: source.dateOfFirstAppointment || '',
              expectedRetirementDate: source.expectedRetirementDate || '',
              dateOfConfirmation: source.dateOfConfirmation || '',
              presentAppointment: source.presentAppointment || '',
              dateOfAppointment: source.dateOfAppointment || '',
              highestQualification: source.highestQualification || '',
              step: source.step || '',
              status: source.status || 'Active'
            }
          });
        }
      } catch (err) {
        console.error("Failed to sync profile:", err);
      }
    };

    syncProfile();
  }, [session, userProfileId, updateProfile]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  if (!session) return null;
  const profile = roleById(session.role);

  if (isMaintenanceMode && session.role !== 'super_admin') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="size-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <Wrench className="size-10" />
          </div>
          <h1 className="text-3xl font-black text-foreground">System Maintenance</h1>
          <p className="text-muted-foreground">{maintenanceMessage}</p>
          <div className="pt-6 border-t border-border/50 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Check back later
          </div>
          <button onClick={signOut} className="mt-8 px-4 py-2 border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">Sign Out</button>
        </div>
      </div>
    );
  }

  // Filter navigation groups based on current user role and overrides
  const filteredNavGroups = NAV_GROUPS.map(group => {
    const filteredItems = group.items
      .filter(item => checkItemVisibility(session.role, item.label, showAllSidebar, isAttendanceEnabled, isCommunicationHubEnabled))
      .map(item => {
        if (!item.subItems) return item;
        
        let filteredSubItems = item.subItems;
        if (item.label === 'Executive Offices' && !['super_admin', 'governor', 'dg_gdu'].includes(session.role) && !showAllSidebar) {
           const roleMap: Record<string, string> = {
             'deputy_governor': 'Deputy Governor',
             'ssg': 'SSG',
             'chief_of_staff': 'Chief of Staff',
             'deputy_chief_of_staff': 'Deputy Chief of Staff',
             'head_of_service': 'Head of Service',
             'civil_service_commission': 'Civil Service Commission',
             'auditor_general': 'Auditor General',
             'accountant_general': 'Accountant General'
           };
           const visibleLabel = roleMap[session.role];
           if (visibleLabel) {
             filteredSubItems = item.subItems.filter(sub => sub.label === visibleLabel);
           } else {
             filteredSubItems = []; 
           }
        }

        // Only super_admin can see Create/Edit/Delete actions for Ministry, Agency, Department, and Unit
        if (session.role !== 'super_admin') {
           const hiddenAdminLabels = [
             'Create Ministry', 'Edit Ministry', 'Delete Ministry',
             'Create Agency', 'Edit Agency', 'Delete Agency',
             'Create Department', 'Edit Department', 'Delete Department',
             'Create Unit', 'Edit Unit', 'Delete Unit',
             'Assign Commissioner', 'Assign Permanent Secretary'
           ];
           filteredSubItems = filteredSubItems.filter(sub => !hiddenAdminLabels.includes(sub.label));
        }

        const restrictedExecutives = ['governor', 'deputy_governor', 'commissioner', 'director', 'head_of_service', 'civil_service_commission', 'dg_gdu', 'auditor_general', 'accountant_general', 'ssg', 'chief_of_staff', 'deputy_chief_of_staff'];
        
        if (restrictedExecutives.includes(session.role) && !showAllSidebar) {
           filteredSubItems = filteredSubItems.filter(sub => {
              if (item.label === 'Programmes') {
                 if (['Create', 'Edit', 'Archive'].includes(sub.label)) return false;
              }
              if (item.label === 'Projects') {
                 if (['Create', 'Edit'].includes(sub.label)) return false;
              }
              if (sub.label === 'Create Budget Proposal' || sub.label === 'Budget Upload') return false;
              return true;
           });
        }

        // Attendance sub-item filtering
        const executivesAndHeads = [...restrictedExecutives, 'perm_secretary', 'director_admin', 'director_finance', 'director_prs'];
        if (item.label === 'Attendance' && !showAllSidebar) {
           if (session.role === 'super_admin' || session.role === 'governor') {
              // Super admin and governor see everything
           } else if (executivesAndHeads.includes(session.role) || ['head_of_service', 'hr_officer', 'civil_service_commission'].includes(session.role)) {
              // Heads of MDAs see Attendance Dashboard + Upload Attendance, but NOT Register Builder
              filteredSubItems = filteredSubItems.filter(sub => sub.label !== 'Register Builder');
           } else {
              // Regular staff: only see Attendance Dashboard (their own record)
              filteredSubItems = filteredSubItems.filter(sub => sub.label === 'Attendance Dashboard');
           }
        }
        
        if (session.role === 'retiree' && item.label === 'Retirement') {
           filteredSubItems = filteredSubItems.filter(sub => sub.label === 'Retiree Dashboard' || sub.label === 'Service History');
        }

        // Task Management sub-item filtering
        if (item.label === 'Task Management' && !showAllSidebar) {
           if (session.role === 'super_admin' || session.role === 'governor') {
              // Super admin and governor see everything
           } else if (executivesAndHeads.includes(session.role) || ['head_of_service', 'hr_officer', 'civil_service_commission'].includes(session.role)) {
              // Executives/Heads see all task sub-items relevant to their MDA
           } else {
              // Regular staff/civil servants: only see their personal task items
              const staffTaskLabels = ['Task Dashboard', 'Task Execution Details', 'Task Evidence Center'];
              filteredSubItems = filteredSubItems.filter(sub => staffTaskLabels.includes(sub.label));
           }
        }

        const memoApprovers = [...restrictedExecutives, 'perm_secretary'];
        if (!memoApprovers.includes(session.role as any) && session.role !== 'super_admin' && !showAllSidebar) {
           let hasCustomAccess = false;
           if (typeof window !== 'undefined') {
               const stored = localStorage.getItem(`gdu_permissions_${session.email}`);
               if (stored) {
                   try {
                       const additional = JSON.parse(stored) as string[];
                       if (additional.includes('Approve Memo') || additional.includes('Sign Memo')) {
                           hasCustomAccess = true;
                       }
                   } catch {}
               }
           }

           if (!hasCustomAccess) {
              filteredSubItems = filteredSubItems.filter(sub => sub.label !== 'Approve Memo' && sub.label !== 'Sign Memo');
           }
        }

        return {
          ...item,
          subItems: filteredSubItems
        };
      });

    return {
      ...group,
      items: filteredItems
    };
  }).filter(group => group.items.length > 0);

  // Shared sidebar content extracted so it renders in both desktop aside and mobile drawer
  const SidebarContent = (
    <>
      <div className={`p-4 shrink-0 flex items-center justify-between border-b relative z-10 shadow-sm transition-colors duration-300 ${
        activeTheme === 'default'
          ? 'border-[#C5A059]/20 bg-[#0A1142]'
          : activeTheme === 'executive'
            ? 'border-[#D4AF37]/30 bg-[#1E1609]'
            : 'border-[#00B159]/20 bg-[#0F1E3D]'
      }`}>
        <div className="flex items-center gap-3">
           <div className="flex items-center -space-x-2">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center border-2 border-[#C5A059] overflow-hidden shadow-md z-10 relative">
                 <img src={mainLogo} alt={siteName} className="w-full h-full object-cover" />
              </div>
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center border-2 border-[#C5A059] overflow-hidden shadow-md">
                 <img src={gduLogo} alt={orgName} className="w-full h-full object-cover" />
              </div>
           </div>
          <div className="flex flex-col">
            <span className="font-black text-[13px] leading-tight tracking-tight text-white mb-0.5">
              {(() => {
                const parts = siteName.split(" ");
                const firstWord = parts[0] || "Kogi";
                const restOfWords = parts.slice(1).join(" ") || "OneGov";
                return <>{firstWord} <span className="text-[#C5A059]">{restOfWords}</span></>;
              })()}
            </span>
            <span className="text-[8px] text-blue-200/70 tracking-widest font-bold uppercase">{govName}</span>
          </div>
        </div>
        {/* Close button only visible on mobile */}
        <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <XIcon className="size-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-3 custom-scrollbar">
        {filteredNavGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/45">{group.label}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.label} item={item} loc={loc} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto p-3 border-t border-[#C5A059]/20">
        <div className="rounded-xl p-3 bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-widest text-blue-200/50">Signed in as</div>
          <div className="mt-1 text-[13px] font-semibold leading-tight text-white">{session.name}</div>
          <div className="text-[11px] text-blue-200/70 mt-0.5">{profile.title}</div>
          <button
            onClick={() => { signOut(); nav({ to: "/login" }); }}
            className="mt-3 inline-flex items-center gap-2 text-[12px] text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background">

      {/* Mobile backdrop overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile slide-in sidebar drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-all duration-300 ease-in-out md:hidden ${
        activeTheme === 'default' 
          ? 'bg-[#0A1142] text-white border-r border-[#C5A059]/20' 
          : activeTheme === 'executive' 
            ? 'bg-[#1E1609] text-white border-r border-[#D4AF37]/30 shadow-2xl' 
            : 'bg-gradient-to-b from-[#0F1E3D] via-[#2F113D] to-[#0A261D] text-white border-r border-[#00B159]/20 shadow-2xl'
      } ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {SidebarContent}
      </div>

      {/* Desktop static sidebar */}
      <aside className={`hidden md:flex w-64 shrink-0 flex-col transition-all duration-300 ease-in-out relative z-40 h-full overflow-hidden ${
        activeTheme === 'default' 
          ? 'bg-[#0A1142] text-white border-r border-[#C5A059]/20 shadow-2xl' 
          : activeTheme === 'executive' 
            ? 'bg-[#1E1609] text-white border-r border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
            : 'bg-gradient-to-b from-[#0F1E3D] via-[#2F113D] to-[#0A261D] text-white border-r border-[#00B159]/20 shadow-2xl'
      }`}>
        {SidebarContent}
      </aside>

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        {/* Global GDU Watermark */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.04] dark:opacity-[0.06] bg-no-repeat bg-center mix-blend-multiply dark:mix-blend-screen"
          style={{ backgroundImage: "url('/gdu-logo.png')", backgroundSize: "450px" }}
        />
        {/* Global Holiday Notification Banner */}
        {activeBanner && (() => {
          if (activeBanner === 'eid') {
            return (
              <div className="bg-[#0A1142] border-b border-[#C5A059]/20 text-red-400 px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-3 animate-in slide-in-from-top-2 duration-500 shrink-0">
                <PartyPopper className="size-4 animate-bounce text-red-400" />
                Today is Eid al-Fitr (Sallah)! The State Government wishes everyone a joyous celebration.
                <PartyPopper className="size-4 animate-bounce text-red-400" />
              </div>
            );
          }
          if (activeBanner === 'christmas') {
            return (
              <div className="bg-red-900 border-b border-red-500/50 text-white px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-3 animate-in slide-in-from-top-2 duration-500 shrink-0">
                <Sparkles className="size-4 animate-pulse text-yellow-400" />
                Merry Christmas & Happy New Year from H.E. Alhaji Ahmed Usman Ododo!
                <Sparkles className="size-4 animate-pulse text-yellow-400" />
              </div>
            );
          }
          if (activeBanner === 'democracy') {
            return (
              <div className="bg-emerald-800 border-b border-white/20 text-white px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-3 animate-in slide-in-from-top-2 duration-500 shrink-0">
                <PartyPopper className="size-4 animate-bounce text-white" />
                Happy Democracy Day! Celebrating continuous progress and unity in Kogi State.
                <PartyPopper className="size-4 animate-bounce text-white" />
              </div>
            );
          }

          const customBanner = bannerStore.greetings.find(g => g.id === activeBanner);
          if (customBanner) {
            return (
              <div className="bg-primary border-b border-primary-foreground/20 text-primary-foreground px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-3 animate-in slide-in-from-top-2 duration-500 shrink-0">
                <Sparkles className="size-4 animate-pulse opacity-80" />
                {customBanner.title} {customBanner.description ? `— ${customBanner.description}` : ''}
                <Sparkles className="size-4 animate-pulse opacity-80" />
              </div>
            );
          }

          return null;
        })()}

        <header className={`h-[60px] md:h-[72px] border-b backdrop-blur-md flex items-center px-3 md:px-8 gap-3 md:gap-4 transition-all duration-300 shrink-0 relative z-50 ${
          activeTheme === 'default'
            ? 'border-border/60 bg-card/90 text-foreground'
            : activeTheme === 'executive'
              ? 'border-[#D4AF37]/20 bg-[#171004]/90 text-white'
              : 'border-[#00B159]/20 bg-[#0B132B]/90 text-white'
        }`}>
          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg border border-border/60 bg-card text-foreground hover:bg-accent transition-colors"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="md:hidden"><Logo size={28} /></div>
          
          <div className="hidden md:flex items-center gap-2 text-[13px]">
            <span className="font-semibold text-muted-foreground/80">{govName}</span>
            <ChevronRight className="size-3.5 text-muted-foreground/50 mx-1" />
            <span className="font-bold text-foreground px-2.5 py-1 rounded-md bg-accent/50 border border-border/50 shadow-sm">{getGreeting(session.name)}</span>
            <LiveClockWidget />
          </div>

          <div className="ml-auto flex items-center gap-1.5 md:gap-3">
            <div className="hidden md:flex items-center gap-2 h-10 px-3.5 rounded-full bg-accent/40 border border-border/60 focus-within:ring-2 focus-within:ring-[#C5A059]/40 focus-within:border-[#C5A059] transition-all duration-300 w-72 lg:w-80 shadow-sm">
              <Search className="size-4 text-muted-foreground" />
              <input onClick={() => setSearchOpen(true)} readOnly placeholder="Search projects, MDAs, staff, memos…" className="bg-transparent outline-none text-[13px] flex-1 text-foreground placeholder:text-muted-foreground/70 cursor-pointer" />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground shadow-sm">⌘K</kbd>
            </div>
            
            <NetworkStrengthIndicator />
            
            <button onClick={() => {
              const newDark = !dark;
              setDark(newDark);
              localStorage.setItem('gdu_theme', newDark ? 'dark' : 'light');
            }} className="h-9 w-9 md:h-10 md:w-10 rounded-full border border-border/60 bg-card flex items-center justify-center hover:bg-accent hover:scale-105 active:scale-95 transition-all shadow-sm text-foreground/80" aria-label="Toggle theme">
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen((o) => !o)} className="h-10 w-10 rounded-full border border-border/60 bg-card flex items-center justify-center hover:bg-accent hover:scale-105 active:scale-95 transition-all shadow-sm text-foreground/80 relative focus:outline-none" aria-label="Notifications">
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-4 rounded-full text-[10px] bg-[#C5A059] text-white flex items-center justify-center font-bold shadow-md border-2 border-background animate-pulse">{unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-[min(320px,calc(100vw-2rem))] rounded-2xl bg-card shadow-2xl p-2 z-50 border border-border/50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Activity</div>
                  <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-3 py-6 text-center text-xs text-muted-foreground">No notifications found</div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`px-3 py-2.5 rounded-xl hover:bg-accent/60 cursor-pointer transition-all relative ${n.is_read ? 'opacity-60' : 'bg-[#C5A059]/5 border-l-2 border-[#C5A059]'}`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <div className={`text-[13px] text-foreground ${n.is_read ? 'font-medium' : 'font-black'}`}>{n.title}</div>
                            <div className="text-[10px] font-bold text-[#C5A059]">{formatRelativeTime(n.created_at)}</div>
                          </div>
                          <div className="text-[12px] text-muted-foreground leading-snug">{n.message}</div>
                          {!n.is_read && (
                            <span className="absolute right-2 bottom-2 size-1.5 rounded-full bg-[#C5A059]" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Profile</span>
                  <span className={`text-[11px] font-black ${completionPercent === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>{completionPercent}%</span>
                </div>
                <button onClick={() => setProfileOpen((o) => !o)} className={`h-10 pl-1.5 pr-3 rounded-full border border-border/60 bg-card flex items-center gap-2 cursor-pointer hover:bg-accent transition-colors shadow-sm ml-1 group focus:outline-none relative ${isBirthday ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-background animate-pulse' : ''}`}>
                  {isBirthday && (
                    <div className="absolute -inset-1 rounded-full border-2 border-rose-500 border-dashed animate-spin-slow opacity-50 pointer-events-none" />
                  )}
                  <div className="size-7 rounded-full bg-[#C5A059] text-white text-[11px] font-bold flex items-center justify-center shadow-inner ring-2 ring-background shrink-0 overflow-hidden">
                  {userProfile.photoBase64 ? (
                    <img src={userProfile.photoBase64} alt={session.name} className="w-full h-full object-cover" />
                  ) : (
                    session.name.split(" ").slice(-2).map((s) => s[0]).join("")
                  )}
                </div>
                  <span className="hidden sm:block text-[13px] font-bold text-foreground max-w-[120px] truncate group-hover:text-[#C5A059] transition-colors">{session.name}</span>
                  <ChevronDown className={`size-3.5 text-muted-foreground group-hover:text-[#C5A059] transition-transform shrink-0 ${profileOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-[min(224px,calc(100vw-2rem))] rounded-2xl bg-card shadow-2xl p-2 z-50 border border-border/50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">My Account</div>
                  <div className="space-y-1 mt-1">
                    <button 
                      onClick={() => openProfileModal('view')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/60 cursor-pointer transition-colors text-left focus:outline-none"
                    >
                      <UserCog className="size-4 text-muted-foreground" />
                      <span className="text-[13px] font-semibold text-foreground">Profile Details</span>
                    </button>
                    <button 
                      onClick={() => openProfileModal('settings')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/60 cursor-pointer transition-colors text-left focus:outline-none"
                    >
                      <Settings className="size-4 text-muted-foreground" />
                      <span className="text-[13px] font-semibold text-foreground">Account Settings</span>
                    </button>
                    <button 
                      onClick={() => { setShowPasswordModal(true); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/60 cursor-pointer transition-colors text-left focus:outline-none"
                    >
                      <Key className="size-4 text-muted-foreground" />
                      <span className="text-[13px] font-semibold text-foreground">Change Password</span>
                    </button>
                    <div className="h-px bg-border/50 my-1"></div>
                    <button 
                      onClick={() => { signOut(); nav({ to: "/login" }); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 cursor-pointer transition-colors text-left text-red-500 hover:text-red-600 focus:outline-none"
                    >
                      <LogOut className="size-4" />
                      <span className="text-[13px] font-semibold">Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-background flex flex-col">{children}</main>
        <footer className="border-t border-border py-3 px-6 text-[11px] text-muted-foreground flex flex-wrap justify-between gap-2 bg-card/40 shrink-0">
          <div>{copyright}</div>
          <div className="flex items-center gap-2"><Map className="size-3" /> Confluence of Opportunities</div>
        </footer>
        <ChatbotWidget />
      </div>

      {/* Profile Details & Settings Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
            activeTheme === 'default'
              ? 'bg-[#0A1142] border-[#C5A059]/30 text-white'
              : activeTheme === 'executive'
                ? 'bg-[#1E1609] border-[#D4AF37]/30 text-white'
                : 'bg-card border-border text-foreground'
          }`}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-xs tracking-widest uppercase flex items-center gap-2">
                <UserCog className="size-4 text-[#C5A059]" /> Official Profile Control
              </h3>
              <button 
                onClick={() => setShowProfileModal(false)} 
                className="text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                Close
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-white/10 text-xs font-bold uppercase shrink-0">
              <button 
                onClick={() => setProfileModalTab('view')}
                className={`flex-1 py-3 text-center border-b-2 transition-all ${
                  profileModalTab === 'view' 
                    ? 'border-[#C5A059] text-[#C5A059]' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Profile Card
              </button>
              <button 
                onClick={() => setProfileModalTab('settings')}
                className={`flex-1 py-3 text-center border-b-2 transition-all ${
                  profileModalTab === 'settings' 
                    ? 'border-[#C5A059] text-[#C5A059]' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Edit Settings
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh] text-xs">
              {profileSaved && (
                <div className="p-3 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-2 mb-4 animate-in fade-in">
                  <ShieldCheck className="size-4 text-emerald-400" /> Settings updated successfully!
                </div>
              )}
              {profileModalTab === 'view' ? (
                <div className="animate-in fade-in zoom-in-95 duration-300 space-y-4">
                  <div className="flex items-center gap-5 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="relative">
                      <div className="size-16 rounded-2xl bg-gradient-to-br from-[#0A1142] to-[#1E293B] shadow-inner flex items-center justify-center text-white text-xl font-black shrink-0 border border-[#C5A059]/20 overflow-hidden">
                        {userProfile.photoBase64 ? (
                          <img src={userProfile.photoBase64} alt={session.name} className="w-full h-full object-cover" />
                        ) : (
                          session.name.split(" ").slice(-2).map((s) => s[0]).join("")
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 size-5 bg-[#C5A059] rounded-full flex items-center justify-center shadow border border-background">
                        <Shield className="size-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-extrabold truncate text-white">{session.name}</h3>
                      <p className="text-[9px] text-[#C5A059] font-black uppercase tracking-wider mt-0.5">{profile.title}</p>
                      
                      <div className="mt-2 bg-white/10 rounded-full h-1.5 w-full overflow-hidden">
                        <div className="bg-[#C5A059] h-full transition-all" style={{ width: `${completionPercent}%` }} />
                      </div>
                      <p className="text-[9px] text-right mt-1 font-medium text-slate-400">Profile {completionPercent}% Complete</p>
                    </div>
                  </div>

                  {/* Redesigned Groups */}
                  <div className="space-y-3">
                    {(() => {
                      const isCivilServant = !['nysc_member', 'intern', 'consultant', 'adhoc_staff', 'political_appointee', 'retiree', 'governor', 'deputy_governor', 'super_admin'].includes(profile.id);
                      const hash = session.email.length * 7;
                      const staffId = `KGS/${hash.toString().padStart(3, '0')}/18/53`;
                      const psnNumber = `PSN-${(hash * 3).toString().padStart(6, '0')}`;
                      const userId = `USR-${new Date().getFullYear()}-${hash.toString().padStart(4, '0')}`;
                      
                      return (
                        <>
                          {/* Administrative Group */}
                          {/* Administrative Group */}
                          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                            <h4 className="font-bold text-[9px] uppercase tracking-wider text-[#C5A059] border-b border-white/5 pb-1 flex items-center gap-1.5">
                              <ShieldCheck className="size-3.5" /> Administrative Posting & Clearance
                            </h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Staff ID</span><span className="font-bold font-mono text-white">{userProfile.profileOnlyFields?.staffId || (session as any).staffId || "Not Assigned"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">PSN Number</span><span className="font-bold font-mono text-white">{userProfile.profileOnlyFields?.psnNumber || "Not Set"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Staff Type</span><span className="font-bold text-white">{userProfile.profileOnlyFields?.staffType || "Civil Servant"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Clearance Group</span><span className="font-bold text-white">{profile.scope.toUpperCase()}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Ministry / MDA</span><span className="font-bold text-white truncate">{userProfile.profileOnlyFields?.mda || profile.ministry || profile.mda || "State Headquarters"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Department</span><span className="font-bold text-white truncate">{userProfile.profileOnlyFields?.department || "General Administration"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Grade Level & Step</span><span className="font-bold text-white">{userProfile.profileOnlyFields?.gradeLevel ? `${userProfile.profileOnlyFields.gradeLevel}/${userProfile.profileOnlyFields.step || '1'}` : "GL-08"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Highest Qualification</span><span className="font-bold text-white truncate">{userProfile.profileOnlyFields?.highestQualification || "Not Set"}</span></div>
                            </div>
                          </div>

                          {/* Appointment & Retirement Dates */}
                          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                            <h4 className="font-bold text-[9px] uppercase tracking-wider text-[#C5A059] border-b border-white/5 pb-1 flex items-center gap-1.5">
                              <Calendar className="size-3.5" /> Service Career Milestones
                            </h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">First Appointment</span><span className="font-bold text-white font-mono">{userProfile.profileOnlyFields?.dateOfFirstAppointment || "Not Set"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Present Appointment</span><span className="font-bold text-white font-mono">{userProfile.profileOnlyFields?.dateOfAppointment || "Not Set"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Date of Confirmation</span><span className="font-bold text-white font-mono">{userProfile.profileOnlyFields?.dateOfConfirmation || "Not Set"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Expected Retirement</span><span className="font-bold text-amber-400 font-mono">{userProfile.profileOnlyFields?.expectedRetirementDate || "Not Set"}</span></div>
                            </div>
                          </div>

                          {/* Personal Group */}
                          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                            <h4 className="font-bold text-[9px] uppercase tracking-wider text-[#C5A059] border-b border-white/5 pb-1 flex items-center gap-1.5">
                              <UserCog className="size-3.5" /> Personal Records
                            </h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Official Email</span><span className="font-bold text-white truncate">{session.email}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Gender</span><span className="font-bold text-white">{userProfile.gender || "Not Set"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Phone Number</span><span className="font-bold text-white font-mono">{userProfile.phone || "Not Set"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Date of Birth</span><span className="font-bold text-white">{userProfile.dateOfBirth || "Not Set"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">State of Origin</span><span className="font-bold text-white">{userProfile.stateOfOrigin || "Not Set"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Home Address</span><span className="font-bold text-white truncate">{userProfile.address || "Not Set"}</span></div>
                            </div>
                          </div>

                          {/* Next of Kin Group */}
                          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                            <h4 className="font-bold text-[9px] uppercase tracking-wider text-[#C5A059] border-b border-white/5 pb-1 flex items-center gap-1.5">
                              <Users className="size-3.5" /> Emergency Contacts & Next of Kin
                            </h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Next of Kin Name</span><span className="font-bold text-white">{userProfile.nextOfKin || "Not Set"}</span></div>
                              <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-medium">Next of Kin Phone</span><span className="font-bold text-white font-mono">{userProfile.nextOfKinPhone || "Not Set"}</span></div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfileSettings} className="space-y-4 animate-in fade-in zoom-in-95 duration-300 max-h-[50vh] overflow-y-auto pr-1">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-[#C5A059] rounded-lg text-[10px] leading-relaxed font-bold flex gap-2 mb-2">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5 text-[#C5A059]" />
                    <span>Administrative posting, grade level, and career history can only be updated by the Civil Service Commission. Only personal details can be edited below.</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 border border-white/10 rounded-xl bg-white/5">
                    <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                      {userProfile.photoBase64 ? (
                        <img src={userProfile.photoBase64} alt={session.name} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="size-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold block mb-1">Profile Photo</label>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-white/10 file:text-white cursor-pointer" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Display Name</label>
                      <input 
                        type="text"
                        value={settingsName}
                        onChange={(e) => setSettingsName(e.target.value)}
                        className="w-full h-9 px-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                      <input 
                        type="email"
                        value={settingsEmail}
                        onChange={(e) => setSettingsEmail(e.target.value)}
                        className="w-full h-9 px-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                      <input 
                        type="tel"
                        value={settingsPhone}
                        onChange={(e) => setSettingsPhone(e.target.value)}
                        className="w-full h-9 px-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059]"
                        placeholder="+234..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                      <select 
                        value={settingsGender}
                        onChange={(e) => setSettingsGender(e.target.value)}
                        className="w-full h-9 px-3 bg-[#0A1142] border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059]"
                      >
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</label>
                      <input 
                        type="date"
                        value={settingsDOB}
                        onChange={(e) => setSettingsDOB(e.target.value)}
                        className="w-full h-9 px-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">State of Origin</label>
                      <input 
                        type="text"
                        value={settingsStateOfOrigin}
                        onChange={(e) => setSettingsStateOfOrigin(e.target.value)}
                        className="w-full h-9 px-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059]"
                        placeholder="e.g. Kogi"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Home Address</label>
                    <input 
                      type="text"
                      value={settingsAddress}
                      onChange={(e) => setSettingsAddress(e.target.value)}
                      className="w-full h-9 px-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059]"
                      placeholder="Enter full address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Next of Kin Name</label>
                      <input 
                        type="text"
                        value={settingsNextOfKin}
                        onChange={(e) => setSettingsNextOfKin(e.target.value)}
                        className="w-full h-9 px-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059]"
                        placeholder="Next of Kin Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Next of Kin Phone</label>
                      <input 
                        type="tel"
                        value={settingsNextOfKinPhone}
                        onChange={(e) => setSettingsNextOfKinPhone(e.target.value)}
                        className="w-full h-9 px-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059]"
                        placeholder="Next of Kin Phone"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <button 
                      type="button" 
                      onClick={() => setShowPasswordFields(!showPasswordFields)}
                      className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      {showPasswordFields ? "Hide Password Settings" : "Change Password"}
                    </button>
                    {showPasswordFields && (
                      <div className="mt-3 space-y-3 p-3 bg-white/5 border border-white/5 rounded-xl animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Old Password</label>
                          <div className="relative flex items-center">
                            <input 
                              type={showPassToggle ? "text" : "password"}
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              className="w-full h-9 px-3 pr-10 bg-[#0A1142] border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059]"
                              placeholder="Type old password"
                            />
                            <button type="button" onClick={() => setShowPassToggle(!showPassToggle)} className="absolute right-3 text-slate-400 hover:text-white">
                              {showPassToggle ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">New Password</label>
                            <input 
                              type={showPassToggle ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full h-9 px-3 bg-[#0A1142] border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059]"
                              placeholder="New password"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Confirm New Password</label>
                            <input 
                              type={showPassToggle ? "text" : "password"}
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              className="w-full h-9 px-3 bg-[#0A1142] border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059]"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">Real-time Desk Notifications</div>
                        <div className="text-[10px] text-slate-400">Receive push notifications on new memos.</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settingsNotifications}
                        onChange={(e) => setSettingsNotifications(e.target.checked)}
                        className="size-4 accent-[#C5A059]" 
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">Enforce 2-Factor Authentication</div>
                        <div className="text-[10px] text-slate-400">Require OTP security for high-value releases.</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings2FA}
                        onChange={(e) => setSettings2FA(e.target.checked)}
                        className="size-4 accent-[#C5A059]" 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-foreground text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm"
                    >
                      Save Settings
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
            activeTheme === 'default'
              ? 'bg-[#0A1142] border-[#C5A059]/30 text-white'
              : activeTheme === 'executive'
                ? 'bg-[#1E1609] border-[#D4AF37]/30 text-white'
                : 'bg-card border-border text-foreground'
          }`}>
            <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-xs tracking-widest uppercase flex items-center gap-2">
                <Key className="size-4 text-[#C5A059]" /> Change Password
              </h3>
              <button 
                onClick={() => setShowPasswordModal(false)} 
                className="text-muted-foreground hover:text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                Close
              </button>
            </div>
            <form onSubmit={handlePasswordChangeSubmit} className="p-6 space-y-4 text-xs">
              {passwordChangeError && (
                <div className="p-3 border border-rose-500/30 bg-rose-500/10 text-rose-400 rounded-lg text-[11px] font-bold flex items-center gap-2 animate-in fade-in">
                  <ShieldAlert className="size-4 shrink-0 text-rose-400" />
                  <span>{passwordChangeError}</span>
                </div>
              )}
              {passwordChangeSuccess && (
                <div className="p-3 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded-lg text-[11px] font-bold flex items-center gap-2 animate-in fade-in">
                  <ShieldCheck className="size-4 text-emerald-400" />
                  <span>Password updated successfully!</span>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Old Password</label>
                <div className="relative flex items-center">
                  <input 
                    type={showPassChangeToggle ? "text" : "password"}
                    value={oldPasswordInput}
                    onChange={(e) => setOldPasswordInput(e.target.value)}
                    className="w-full h-9 px-3 pr-10 bg-white/5 border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059] placeholder:text-slate-500"
                    placeholder="Type old password"
                    required
                  />
                  <button type="button" onClick={() => setShowPassChangeToggle(!showPassChangeToggle)} className="absolute right-3 text-slate-400 hover:text-white">
                    {showPassChangeToggle ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">New Password</label>
                <input 
                  type={showPassChangeToggle ? "text" : "password"}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full h-9 px-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059] placeholder:text-slate-500"
                  placeholder="New password"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Confirm New Password</label>
                <input 
                  type={showPassChangeToggle ? "text" : "password"}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full h-9 px-3 bg-white/5 border border-white/10 text-white rounded-lg text-xs outline-none focus:border-[#C5A059] placeholder:text-slate-500"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-[#C5A059] text-white hover:bg-[#B38F4B] transition-colors rounded-lg font-bold cursor-pointer text-xs uppercase tracking-wider"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incomplete Profile Modal */}
      {showIncompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-card border shadow-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="size-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <UserCog className="size-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Profile Incomplete</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your profile is currently <span className="font-bold text-amber-500">{completionPercent}%</span> complete. Please fill in your missing details to get the most out of the system.
            </p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setShowIncompleteModal(false)} className="flex-1 py-2 rounded-xl bg-muted font-bold text-xs hover:bg-muted/80">Remind Me Later</button>
              <button onClick={() => { setShowIncompleteModal(false); openProfileModal('settings'); }} className="flex-1 py-2 rounded-xl bg-[#C5A059] text-white font-bold text-xs hover:bg-[#b08e4f]">Update Now</button>
            </div>
          </div>
        </div>
      )}

      {/* 100% Celebration Modal */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-emerald-500/30 shadow-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 relative z-10">
              <ShieldCheck className="size-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-emerald-600 relative z-10">Congratulations!</h3>
            <p className="text-sm text-muted-foreground mb-6 relative z-10">
              Your profile is now 100% complete. Thank you for keeping your records updated!
            </p>
            <button onClick={() => setShowCelebrationModal(false)} className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 shadow-md relative z-10">Awesome</button>
          </div>
        </div>
      )}

      {/* Birthday Celebration Modal */}
      {showBirthdayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-rose-500/10 via-card to-rose-500/5 border border-rose-500/30 shadow-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="size-16 rounded-full bg-rose-500/20 flex items-center justify-center mb-4 relative z-10 animate-bounce">
              <span className="text-3xl">🎂</span>
            </div>
            <h3 className="text-2xl font-black mb-2 text-rose-500 relative z-10">Happy Birthday!</h3>
            <p className="text-sm text-foreground mb-6 relative z-10 font-medium">
              Wishing you a fantastic day from all of us at the Kogi State Government. Have a wonderful celebration!
            </p>
            <button onClick={() => setShowBirthdayModal(false)} className="w-full py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 shadow-md relative z-10">Thank You!</button>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <GlobalSearch open={searchOpen} setOpen={setSearchOpen} />

      {/* Dedicated AI Intelligence Panel */}
      <AIIntelligenceModal />
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-white/5">
      <span className="text-muted-foreground font-bold uppercase tracking-wider text-[9px]">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  );
}