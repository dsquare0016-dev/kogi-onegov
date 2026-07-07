import { dbGetUserPermissions, dbSaveUserPermissions } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Save, UserCheck, Key, ShieldAlert, Search, Shield, ChevronRight, Lock, Check } from 'lucide-react';
import { ROLES as AUTH_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/admin/permissions/assign')({
  component: AssignPermissions,
});

const ROLE_MATRIX_NAMES = [
  "DG GDU / Master Super Admin",
  "Super Admin",
  "Governor",
  "Deputy Governor",
  "Secretary to State Government",
  "Chief of Staff",
  "Deputy Chief of Staff",
  "Head of Service",
  "Civil Service Commission",
  "State Auditor General",
  "Accountant General",
  "DG GDU Command Center User",
  "Commissioner",
  "Permanent Secretary",
  "Director",
  "Deputy Director",
  "Assistant Director",
  "Head of Department / Agency",
  "HR Officer",
  "Budget Officer / Accountant",
  "Procurement Officer",
  "ICT / System Administrator",
  "GDU Desk Officer",
  "Project Inspector",
  "Political Appointee",
  "Staff",
  "Helpdesk/User Support Officer",
  "Read-Only Viewer / Auditor Viewer"
];

const PERMISSIONS = [
  "View", "Create", "Edit", "Delete", "Restore", "Approve", "Reject", 
  "Assign", "Upload", "Download", "Export", "Print", "Comment", 
  "Route", "Verify", "Escalate", "Disable", "Manage"
];

const MODULES = [
  "Global Platform Administration",
  "MDAs & Governance Delivery",
  "Budget & Treasury",
  "Projects & Programmes",
  "Tasks & Workflows",
  "Staff & Civil Service HR",
  "Reports, AI & Analytics",
  "Audit & Security Logs"
];

const AVAILABLE_ADDITIONAL_PERMISSIONS = [
  { id: 'Nominal Roll (HR)', label: 'Manage Nominal Roll (HR)', desc: 'Enables access to Nominal Roll staff rosters, confirmation, promotion, redeployment and retirement flows.' },
  { id: 'Manage Attendance', label: 'Manage Attendance', desc: 'Allows the user to view and update civil servant attendance records.' },
  { id: 'Approve Leave', label: 'Approve Leave', desc: 'Allows the user to sign off on leave requests in the nominal roll.' },
  
  { id: 'Executive Room', label: 'Access Executive Room', desc: 'Allows the user to enter the EXCo Room dashboard, view State Performance Index and ranks.' },
  { id: 'DG GDU Command Center', label: 'Access Command Center', desc: 'Enables the DG GDU delivery scorecard, escalations and monitoring dashboard.' },
  
  { id: 'View Budget Reports', label: 'View Budget Reports', desc: 'Grants access to the full budget control center and downstream distribution charts.' },
  { id: 'Upload Project Evidence', label: 'Upload Project Evidence', desc: 'Grants access to the project evidence center to upload verification files.' },
  
  { id: 'Audit Center', label: 'Access Audit Center', desc: 'Enables access to official audit queries, compliance reviews, and risk flags.' },
  { id: 'Treasury Center', label: 'Access Treasury Center', desc: 'Enables the accountant general treasury balance, cash flow, and releases dashboard.' },
  
  { id: 'USER MANAGEMENT', label: 'Access User Management Console', desc: 'Enables access to the User Creation, Editing, Disabling, and Suspension panels.' },
  { id: 'System Settings', label: 'Access System Settings Control', desc: 'Enables access to platform configurations, security settings, sitemaps, and overrides.' }
];

function AssignPermissions() {
  const [tab, setTab] = useState<'matrix' | 'delegation'>('delegation');
  
  // Matrix tab state
  const [activeRoleMatrix, setActiveRoleMatrix] = useState(ROLE_MATRIX_NAMES[0]);
  const [searchMatrixQuery, setSearchMatrixQuery] = useState('');
  const filteredMatrixRoles = ROLE_MATRIX_NAMES.filter(r => r.toLowerCase().includes(searchMatrixQuery.toLowerCase()));
  const isMasterMatrix = activeRoleMatrix === "DG GDU / Master Super Admin";

  // Delegation tab state
  const [selectedUser, setSelectedUser] = useState(() => AUTH_ROLES[0]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const filteredUsers = AUTH_ROLES.filter(u => 
    u.demoName.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    u.title.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  // Load selected user's permissions when selectedUser changes
  useEffect(() => {
    async function loadUserPerms() {
      try {
        
        const dbPerms = await dbGetUserPermissions({ data: { email: selectedUser.demoEmail } });
        setUserPermissions(dbPerms);
        
        // Also sync local storage for client-side gates fallback
        localStorage.setItem(`gdu_permissions_${selectedUser.demoEmail}`, JSON.stringify(dbPerms));
      } catch (err) {
        console.error("Failed to load DB permissions:", err);
        // local storage fallback
        const stored = localStorage.getItem(`gdu_permissions_${selectedUser.demoEmail}`);
        if (stored) {
          try {
            setUserPermissions(JSON.parse(stored) as string[]);
          } catch {
            setUserPermissions([]);
          }
        } else {
          setUserPermissions([]);
        }
      }
    }
    loadUserPerms();
  }, [selectedUser]);

  const handleToggleUserPermission = (permId: string) => {
    if (userPermissions.includes(permId)) {
      setUserPermissions(userPermissions.filter(p => p !== permId));
    } else {
      setUserPermissions([...userPermissions, permId]);
    }
  };

  const handleSaveUserPermissions = async () => {
    try {
      
      await dbSaveUserPermissions({
        data: {
          email: selectedUser.demoEmail,
          permissionIdsOrNames: userPermissions
        }
      });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(`gdu_permissions_${selectedUser.demoEmail}`, JSON.stringify(userPermissions));
        window.dispatchEvent(new Event('sidebarUpdate'));
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } catch (err: any) {
      alert("Failed to save permissions to database: " + err.message);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 pb-24">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-3 text-indigo-500 mb-2">
             <Shield className="size-6" />
             <span className="font-black uppercase tracking-[0.2em] text-sm">Security Command</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Permission Engine</h1>
          <p className="text-muted-foreground mt-1 font-medium">Granular access control matrix. Configure module-level capabilities and individual delegations across the ERP.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border/60 gap-4">
        <button 
          onClick={() => setTab('delegation')}
          className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${tab === 'delegation' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Individual User Delegation
        </button>
        <button 
          onClick={() => setTab('matrix')}
          className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${tab === 'matrix' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          System Roles Matrix (Reference)
        </button>
      </div>

      {tab === 'delegation' ? (
        /* 1. INDIVIDUAL USER DELEGATION TAB */
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
          
          {/* User List Sidebar */}
          <div className="col-span-1 h-[70vh] flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search demo users..." 
                value={searchUserQuery}
                onChange={e => setSearchUserQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" 
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {filteredUsers.map(user => {
                const isActive = selectedUser.id === user.id;
                return (
                  <button 
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between border ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-500/10 to-transparent border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm scale-[1.02]' 
                        : 'bg-card border-border/50 hover:border-indigo-500/30 text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold truncate">{user.demoName}</div>
                      <div className="text-[11px] text-muted-foreground truncate font-medium mt-0.5">{user.title}</div>
                    </div>
                    {isActive ? <UserCheck className="size-4 shrink-0 text-indigo-500" /> : <ChevronRight className="size-4 shrink-0 opacity-30" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Permissions Configuration Panel */}
          <Card className="border-border/60 shadow-xl col-span-1 xl:col-span-3 bg-card/50 backdrop-blur-sm relative">
            <CardHeader className="border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between p-6">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Key className="size-5 text-indigo-500" /> 
                  Additional Permissions for: <span className="text-indigo-500">{selectedUser.demoName}</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  Primary Role: <strong className="text-foreground">{selectedUser.title}</strong> • Email: <span className="font-mono text-xs">{selectedUser.demoEmail}</span>
                </CardDescription>
              </div>
              <button 
                onClick={handleSaveUserPermissions}
                className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:shadow-md transition-shadow inline-flex items-center gap-1.5"
              >
                {savedSuccess ? <Check className="size-3.5" /> : <Save className="size-3.5" />}
                {savedSuccess ? 'Saved' : 'Save Changes'}
              </button>
            </CardHeader>
            <CardContent className="p-6">
              {selectedUser.id === 'super_admin' ? (
                <div className="p-6 border border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-start gap-4 shadow-sm">
                  <Shield className="size-6 text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-base mb-1">Super Administrator Account</h4>
                    <p className="text-xs leading-relaxed opacity-95">
                      The Super Admin account has full access rights across all modules, layouts, settings, and workflows. 
                      Additional permission mapping is not required for this account.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Check permissions to activate menu links and features for this user:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AVAILABLE_ADDITIONAL_PERMISSIONS.map(perm => {
                      const isChecked = userPermissions.includes(perm.id);
                      return (
                        <div 
                          key={perm.id}
                          onClick={() => handleToggleUserPermission(perm.id)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-3 select-none ${isChecked ? 'bg-indigo-500/5 border-indigo-500/50 shadow-sm' : 'border-border/60 hover:bg-muted/30 bg-card/30'}`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {}} // Handled by div onClick
                            className="mt-1 size-4 accent-indigo-500 cursor-pointer shrink-0" 
                          />
                          <div>
                            <div className={`text-sm font-bold transition-colors ${isChecked ? 'text-indigo-600 dark:text-indigo-400' : 'text-foreground/80'}`}>{perm.label}</div>
                            <div className="text-xs text-muted-foreground leading-normal mt-1">{perm.desc}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      ) : (
        /* 2. ROLE MATRIX TAB */
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
          
          {/* Matrix Roles Sidebar */}
          <div className="col-span-1 h-[70vh] flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search target roles..." 
                value={searchMatrixQuery}
                onChange={e => setSearchMatrixQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" 
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {filteredMatrixRoles.map(role => {
                const isActive = activeRoleMatrix === role;
                return (
                  <button 
                    key={role}
                    onClick={() => setActiveRoleMatrix(role)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between border ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-500/10 to-transparent border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm scale-[1.02]' 
                        : 'bg-card border-border/50 hover:border-indigo-500/30 text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <span className="truncate pr-2">{role}</span>
                    {isActive ? <UserCheck className="size-4 shrink-0 text-indigo-500" /> : <ChevronRight className="size-4 shrink-0 opacity-30" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Permissions Matrix Table */}
          <Card className="border-border/60 shadow-xl col-span-1 xl:col-span-3 overflow-hidden bg-card/50 backdrop-blur-sm relative">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Key className="size-5 text-indigo-500" /> 
                    Role Template Matrix: <span className="text-indigo-500">{activeRoleMatrix}</span>
                  </CardTitle>
                  <CardDescription className="mt-1">Static matrix mapping for basic module-level role presets.</CardDescription>
                </div>
                {isMasterMatrix && (
                  <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                    <Lock className="size-3" /> System Presets Locked
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto relative min-h-[500px]">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-muted/30 text-xs font-bold uppercase tracking-widest text-muted-foreground sticky top-0 z-20 backdrop-blur-md">
                  <tr>
                    <th className="p-5 border-b border-r border-border/50 sticky left-0 z-30 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)] bg-background/80 backdrop-blur-xl">Modules</th>
                    {PERMISSIONS.map(p => (
                      <th key={p} className="p-5 text-center border-b border-border/50 min-w-[80px]">
                         <div className="font-bold text-[10px]">{p}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {MODULES.map(module => (
                    <tr key={module} className="hover:bg-indigo-500/5 transition-colors group">
                      <td className="p-5 border-r border-border/50 font-semibold bg-background/80 backdrop-blur-xl sticky left-0 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)] text-xs text-foreground/80 group-hover:text-indigo-500 transition-colors">
                        {module}
                      </td>
                      {PERMISSIONS.map(p => {
                        const isSuper = isMasterMatrix || activeRoleMatrix === "Super Admin";
                        let checked = isSuper;
                        
                        if (!checked) {
                          if (p === "View") checked = true;
                          if (p === "Create" && activeRoleMatrix.includes("Officer")) checked = true;
                          if (p === "Approve" && (activeRoleMatrix.includes("Commissioner") || activeRoleMatrix.includes("Director"))) checked = true;
                          if (activeRoleMatrix === "Governor" && p === "View") checked = true;
                          if (activeRoleMatrix === "Governor" && p !== "View") checked = false;
                        }

                        return (
                          <td key={`${module}-${p}`} className="p-5 text-center relative">
                            <label className="flex items-center justify-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                defaultChecked={checked}
                                disabled={isMasterMatrix || activeRoleMatrix === "Super Admin"} 
                                className="peer sr-only" 
                              />
                              <div className={`
                                relative w-9 h-5 rounded-full transition-colors duration-300 ease-in-out
                                peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/50
                                bg-muted/50 border border-border
                                peer-checked:bg-emerald-500 peer-checked:border-emerald-500
                                ${isMasterMatrix || activeRoleMatrix === "Super Admin" ? 'opacity-50 cursor-not-allowed peer-checked:bg-muted-foreground/30 peer-checked:border-transparent' : 'hover:scale-105 cursor-pointer'}
                              `}>
                                 <div className={`
                                   absolute top-[2px] left-[2px] bg-white w-4 h-4 rounded-full transition-all duration-300 shadow-sm
                                   peer-checked:translate-x-full
                                   ${isMasterMatrix || activeRoleMatrix === "Super Admin" ? 'bg-muted' : ''}
                                 `}></div>
                              </div>
                            </label>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {isMasterMatrix && (
                 <div className="absolute inset-x-0 bottom-0 m-6 p-6 bg-amber-500/10 border border-amber-500/30 backdrop-blur-md text-amber-700 dark:text-amber-400 rounded-2xl flex items-start gap-4 shadow-2xl animate-in slide-in-from-bottom-10 z-40">
                   <div className="p-3 bg-amber-500/20 rounded-xl shrink-0 mt-1">
                     <ShieldAlert className="size-6 text-amber-500" />
                   </div>
                   <div>
                     <h3 className="font-bold text-lg mb-1 flex items-center gap-2">System Authority Locked</h3>
                     <p className="text-sm font-medium opacity-90 leading-relaxed max-w-3xl">
                       The <strong className="text-amber-600 dark:text-amber-300">Master Super Admin</strong> role possesses immutable, root-level presets. 
                       Role-level configuration presets are read-only from this view. To assign permissions to a user, use the <strong className="text-indigo-600 dark:text-indigo-400">Individual User Delegation</strong> tab.
                     </p>
                   </div>
                 </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
