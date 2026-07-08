import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Crown, AlertOctagon, Key, ShieldCheck, PowerOff, DatabaseBackup, Plus, Trash2, X, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getSession } from '@/lib/auth';
import { AccessDenied } from '@/components/AccessDenied';
import { useState, useEffect } from 'react';
import { 
  dbGetSystemLock, 
  dbToggleSystemLock, 
  dbChangeMasterPassword, 
  dbGetDelegatedAdmins, 
  dbGetEligibleUsersForDelegation, 
  dbDelegateSuperAdmin, 
  dbRevokeSuperAdmin,
  dbSaveSystemSetting,
  dbGetSystemSetting
} from '@/lib/postgres-service';

export const Route = createFileRoute('/dashboard/admin/override')({
  component: AdminOverrideComponent,
})

function AdminOverrideComponent() {
  const session = getSession();
  const router = useRouter();
  const isAdmin = session?.role === 'super_admin' || session?.role === 'governor' || session?.role === 'dg_gdu';

  if (!isAdmin) {
    return <AccessDenied message="You do not have master administrative privileges to view the override console." />;
  }

  const [isLocked, setIsLocked] = useState(false);
  const [delegates, setDelegates] = useState<any[]>([]);
  const [eligibleUsers, setEligibleUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const lockRes = await dbGetSystemLock();
      setIsLocked(lockRes.isLocked);

      const delegatesRes = await dbGetDelegatedAdmins();
      setDelegates(delegatesRes);

      const eligibleRes = await dbGetEligibleUsersForDelegation();
      setEligibleUsers(eligibleRes);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSystemLockToggle = async () => {
    const confirmLock = confirm(
      isLocked 
        ? "Are you sure you want to UNLOCK the ERP system? This will restore access for all users immediately." 
        : "⚠️ WARNING: You are about to lock the entire ERP system. All active users (except Governor/DG GDU) will be locked out immediately. Continue?"
    );
    if (!confirmLock) return;

    try {
      const targetState = !isLocked;
      await dbToggleSystemLock({ data: { isLocked: targetState, userId: session?.userId } });
      
      // Update site_configuration setting to match
      const currentConfig = await dbGetSystemSetting({ data: { key: 'site_configuration' } }) || {};
      currentConfig.systemLocked = targetState;
      await dbSaveSystemSetting({ data: { key: 'site_configuration', value: currentConfig } });

      setIsLocked(targetState);
      
      // Dispatch site config update event locally
      if (typeof window !== 'undefined') {
        localStorage.setItem('gdu_system_locked', String(targetState));
        window.dispatchEvent(new Event('siteConfigUpdate'));
      }

      alert(`ERP system has been successfully ${targetState ? 'LOCKED' : 'UNLOCKED'}.`);
    } catch (e: any) {
      alert("Failed to toggle system lock: " + e.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    try {
      await dbChangeMasterPassword({ data: { newPass: newPassword } });
      alert("Master Administrator password has been successfully updated in the database.");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
    } catch (e: any) {
      alert("Failed to update password: " + e.message);
    }
  };

  const handleAddDelegate = async () => {
    if (!selectedUserId) {
      alert("Please select a user to delegate.");
      return;
    }
    if (delegates.length >= 5) {
      alert("You have reached the maximum limit of 5 delegated administrators.");
      return;
    }

    try {
      await dbDelegateSuperAdmin({ data: { userId: selectedUserId, delegatedBy: session?.userId } });
      alert("Super Admin permissions delegated successfully.");
      setSelectedUserId("");
      setShowDelegateModal(false);
      await loadData();
    } catch (e: any) {
      alert("Failed to delegate role: " + e.message);
    }
  };

  const handleRevokeDelegate = async (userId: string, name: string) => {
    const confirmRevoke = confirm(`Are you sure you want to revoke Super Admin privileges from ${name}?`);
    if (!confirmRevoke) return;

    try {
      await dbRevokeSuperAdmin({ data: { userId } });
      alert(`Privileges revoked successfully from ${name}.`);
      await loadData();
    } catch (e: any) {
      alert("Failed to revoke privileges: " + e.message);
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24 text-foreground">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-500 flex items-center gap-3">
          <Crown className="size-8 animate-pulse text-red-600" /> DG GDU Master Override
        </h1>
        <p className="text-muted-foreground mt-1">Ultimate operational console. Actions taken here override all other system rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Profile Info */}
        <Card className="border-border/60 shadow-sm md:col-span-1 h-fit">
          <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
             <CardTitle className="text-lg">Master Administrator Profile</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">Full Name</div>
              <div className="font-bold text-foreground">Director General (GDU)</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">Email</div>
              <div className="font-bold text-foreground">dg@kogistate.gov.ng</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">Security Clearance</div>
              <Badge className="bg-red-500 hover:bg-red-600 mt-1">Level 5 (Ultimate)</Badge>
            </div>
            <div className="pt-4 border-t border-border/50">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full px-4 py-2 border border-border bg-background rounded-md text-sm font-semibold hover:bg-muted cursor-pointer transition-colors"
              >
                Change Master Password
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Extreme Powers */}
        <div className="md:col-span-2 space-y-6">
          
          <Card className="border-red-500/30 shadow-sm bg-red-500/5">
            <CardHeader className="border-b border-red-500/10">
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertOctagon className="size-5" /> Executive Destructive Actions
              </CardTitle>
              <CardDescription className="text-red-600/80">These actions bypass all protocols and execute immediately.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              {/* Lock System Action */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-red-500/20 bg-background rounded-lg shadow-sm">
                <div className="flex gap-3">
                  <PowerOff className={`size-5 mt-1 shrink-0 ${isLocked ? 'text-red-500 animate-spin-slow' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="font-bold text-red-900 dark:text-red-400">Lock Entire ERP System</div>
                    <div className="text-xs text-red-800/80 dark:text-red-300/80 max-w-md mt-1">
                      Instantly restricts login access for all users except Master/Super Admins, protecting live state data in operational emergencies.
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleSystemLockToggle}
                  className={`shrink-0 px-4 py-2 text-white font-bold rounded text-xs w-full sm:w-auto cursor-pointer transition-colors shadow-sm ${
                    isLocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isLocked ? "Restore Access (Unlock)" : "Execute System Lock"}
                </button>
              </div>

              {/* Recovery Action */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-red-500/20 bg-background rounded-lg shadow-sm">
                <div className="flex gap-3">
                  <DatabaseBackup className="size-5 text-red-500 mt-1 shrink-0" />
                  <div>
                    <div className="font-bold text-red-900 dark:text-red-400">Restore Deleted Data</div>
                    <div className="text-xs text-red-800/80 dark:text-red-300/80 max-w-md mt-1">
                      Access the raw database tombstone records to resurrect forcefully deleted records from any module.
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => router.navigate({ to: '/dashboard/admin/recovery' })}
                  className="shrink-0 px-4 py-2 bg-red-600 text-white font-bold rounded text-xs hover:bg-red-700 w-full sm:w-auto cursor-pointer transition-colors shadow-sm"
                >
                  Open Tombstone Vault
                </button>
              </div>

            </CardContent>
          </Card>

          {/* Delegation Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                <Key className="size-5 text-indigo-500" /> Delegation Rule Configuration
              </CardTitle>
              <CardDescription>Delegate Master powers to up to 5 trusted technical administrators.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              {loading ? (
                <div className="text-center py-4 text-xs text-muted-foreground">Loading delegated administrators...</div>
              ) : delegates.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-border rounded-lg text-xs text-muted-foreground">
                  No delegates configured. Master powers reside solely with the DG GDU.
                </div>
              ) : (
                <div className="space-y-3">
                  {delegates.map((del) => (
                    <div key={del.user_id} className="flex justify-between items-center bg-muted/50 p-4 rounded-md border border-border">
                      <div>
                        <div className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">{del.display_name}</div>
                        <div className="text-xs text-muted-foreground">{del.email}</div>
                      </div>
                      <button 
                        onClick={() => handleRevokeDelegate(del.user_id, del.display_name)}
                        className="text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded font-bold transition-colors cursor-pointer shadow-sm"
                      >
                        Revoke Super Admin
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={() => setShowDelegateModal(true)}
                disabled={delegates.length >= 5}
                className="w-full py-2.5 border border-dashed border-indigo-500/50 hover:border-indigo-500 text-sm font-medium text-indigo-600 hover:bg-indigo-500/5 rounded-md cursor-pointer transition-colors disabled:opacity-50"
              >
                + Delegate Super Admin ({5 - delegates.length} Slots Remaining)
              </button>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-border/80 shadow-lg">
            <CardHeader className="border-b border-border/50 flex flex-row justify-between items-center bg-muted/10">
              <div>
                <CardTitle>Change Master Password</CardTitle>
                <CardDescription>Update credentials for H.E. DG GDU account.</CardDescription>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-red-500/50"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-red-500/50"
                    placeholder="Re-type password"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                  <button 
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 border border-border hover:bg-muted text-sm font-semibold rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Delegate Modal */}
      {showDelegateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-border/80 shadow-lg">
            <CardHeader className="border-b border-border/50 flex flex-row justify-between items-center bg-muted/10">
              <div>
                <CardTitle>Delegate Master Powers</CardTitle>
                <CardDescription>Assign super admin rights to a trusted technical administrator.</CardDescription>
              </div>
              <button onClick={() => setShowDelegateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Select User Profile</label>
                {eligibleUsers.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic py-2">No active candidates available for delegation.</div>
                ) : (
                  <select 
                    value={selectedUserId} 
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full p-2.5 bg-background border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="">-- Choose User --</option>
                    {eligibleUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.display_name} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <button 
                  onClick={() => setShowDelegateModal(false)}
                  className="px-4 py-2 border border-border hover:bg-muted text-sm font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddDelegate}
                  disabled={!selectedUserId}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded disabled:opacity-50 cursor-pointer"
                >
                  Confirm Delegation
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
