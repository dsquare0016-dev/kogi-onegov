import { dbFindUserForEdit, dbAdminUpdateUser, dbAdminForceResetPassword } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCog, Save, Search, Key, ShieldAlert, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { ROLES } from '@/lib/roles';
import { getSession } from '@/lib/auth';
import { Lock } from 'lucide-react';

export const Route = createFileRoute('/dashboard/admin/users/edit')({
  component: EditUser,
});

function EditUser() {
  const session = getSession();
  const [searchEmail, setSearchEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Edit Form Fields
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [saving, setSaving] = useState(false);
  
  // Custom Reset Fields
  const [adminTypedPassword, setAdminTypedPassword] = useState('');
  const [settingPassword, setSettingPassword] = useState(false);

  if (session?.role !== 'super_admin' && session?.role !== 'civil_service_commission') {
    return (
      <div className="p-6 max-w-[800px] mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
        <Lock className="size-16 text-rose-500 mb-4 opacity-80" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Restricted</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Only the Civil Service Commission or the Super Admin can edit users on this system.
        </p>
      </div>
    );
  }

  const handleFindUser = async () => {
    if (!searchEmail.trim()) return;
    setLoading(true);
    setUser(null);
    try {
      
      const res = await dbFindUserForEdit({ data: { email: searchEmail } });
      if (!res) {
        alert("User record not found in system database.");
      } else {
        setUser(res);
        setEmail(res.email);
        setRole(res.role);
      }
    } catch (e: any) {
      alert("Search failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setSaving(true);
    try {
      
      await dbAdminUpdateUser({
        data: {
          id: user.id,
          email,
          role
        }
      });
      alert("User profile updated successfully!");
    } catch (e: any) {
      alert("Failed to update user: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleForceResetPassword = async () => {
    if (!user) return;
    if (!adminTypedPassword.trim()) {
      alert("Please enter a new password.");
      return;
    }
    if (adminTypedPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }
    setSettingPassword(true);
    try {
      
      await dbAdminForceResetPassword({
        data: {
          userId: user.id,
          newPass: adminTypedPassword
        }
      });
      alert(`Password updated successfully for ${user.fullName}!`);
      setAdminTypedPassword('');
    } catch (e: any) {
      alert("Failed to reset password: " + e.message);
    } finally {
      setSettingPassword(false);
    }
  };

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-6 pb-24 text-foreground">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Edit User Profile</h1>
        <p className="text-muted-foreground mt-1">Modify an existing user's credentials, roles, or override security access credentials.</p>
      </div>

      {/* User Search Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2"><Search className="size-5 text-primary" /> Lookup User Account</CardTitle>
          <CardDescription>Search by registered email or Staff ID to load their profile.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <input 
              type="text" 
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1 p-2.5 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold" 
              placeholder="e.g. user@kogistate.gov.ng or KGS/CS/000001/10/45" 
            />
            <button 
              onClick={handleFindUser} 
              disabled={loading || !searchEmail}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/95 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Find User"}
            </button>
          </div>
        </CardContent>
      </Card>

      {user && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* User Fields Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2"><UserCog className="size-5 text-primary" /> Update Profile: {user.fullName}</CardTitle>
              <CardDescription>Modify the fields below to update the user account record.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name (Read-Only)</label>
                  <input type="text" readOnly value={user.fullName} className="w-full p-2.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none opacity-80 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Staff ID (Read-Only)</label>
                  <input type="text" readOnly value={user.staffId || 'N/A'} className="w-full p-2.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none opacity-80 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-muted/20 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Access Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 bg-muted/20 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-semibold text-foreground bg-card"
                  >
                    {ROLES.map(r => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-primary/95 transition-colors cursor-pointer"
                >
                  <Save className="size-4" /> {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Superadmin Password Reset Card */}
          <Card className="border-red-500/20 dark:border-red-900/30 border-2 shadow-sm overflow-hidden bg-red-500/5">
            <CardHeader className="border-b border-red-500/10 bg-red-500/10 pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
                <ShieldAlert className="size-5 shrink-0" />
                Administrative Override: Password Force Update
              </CardTitle>
              <CardDescription className="text-red-500/80">
                Directly override the password registry for this user. Enter a custom password to save immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5 max-w-md">
                <label className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Enter New Password</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={adminTypedPassword}
                    onChange={(e) => setAdminTypedPassword(e.target.value)}
                    className="flex-1 p-2.5 bg-muted/20 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                    placeholder="Min. 8 characters password"
                  />
                  <button
                    onClick={handleForceResetPassword}
                    disabled={settingPassword || !adminTypedPassword}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow"
                  >
                    {settingPassword ? <Loader2 className="size-3.5 animate-spin" /> : <Key className="size-4" />}
                    Override & Set
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
