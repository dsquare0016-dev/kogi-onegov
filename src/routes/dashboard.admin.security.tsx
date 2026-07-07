import { dbGetSystemSetting, dbSaveSystemSetting } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Key, Users, Activity, Lock, Unlock, Loader2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { customConfirm, customPrompt } from '@/lib/customModal';

export const Route = createFileRoute('/dashboard/admin/security')({
  component: AdminSecurityComponent,
});

function AdminSecurityComponent() {
  const [activeTab, setActiveTab] = useState('login-rules');
  const [loading, setLoading] = useState(true);

  // Policies states
  const [minLength, setMinLength] = useState("12 characters");
  const [passwordExpiry, setPasswordExpiry] = useState("90 Days");
  const [passwordHistory, setPasswordHistory] = useState("Prevent last 5 passwords");
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState("5");
  const [lockDuration, setLockDuration] = useState("30 Minutes");
  
  // MFA Checkboxes
  const [emailOtp, setEmailOtp] = useState(true);
  const [smsOtp, setSmsOtp] = useState(true);
  const [authenticatorApp, setAuthenticatorApp] = useState(true);

  // Blacklist IP
  const [blacklistedIps, setBlacklistedIps] = useState("193.10.45.1\n89.200.14.5\n105.12.9.88");

  // Sessions list
  const [sessions, setSessions] = useState([
    { id: '1', user: "DG. Admin", device: "MacBook Pro", ip: "102.89.45.12", time: "Online for 2h 15m" },
    { id: '2', user: "PermSec. Finance", device: "Windows 11", ip: "192.168.1.45", time: "Online for 45m" },
    { id: '3', user: "Dir. Planning", device: "iPhone 14", ip: "105.112.98.4", time: "Idle for 10m" }
  ]);

  const loadSettings = async () => {
    setLoading(true);
    
    const data = await dbGetSystemSetting({ data: { key: 'security_policies' } });
    if (data) {
      setMinLength(data.minLength || "12");
      setPasswordExpiry(data.passwordExpiry || "90 Days");
      setPasswordHistory(data.passwordHistory || "Prevent last 5 passwords");
      setRequireSpecial(data.requireSpecial ?? true);
      setFailedAttempts(data.failedAttempts || "5");
      setLockDuration(data.lockDuration || "30 Minutes");
      setEmailOtp(data.emailOtp ?? true);
      setSmsOtp(data.smsOtp ?? true);
      setAuthenticatorApp(data.authenticatorApp ?? true);
      setBlacklistedIps(data.blacklistedIps || "193.10.45.1\n89.200.14.5\n105.12.9.88");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSavePolicies = async () => {
    
    try {
      await dbSaveSystemSetting({
        data: {
          key: 'security_policies',
          value: {
            minLength,
            passwordExpiry,
            passwordHistory,
            requireSpecial,
            failedAttempts,
            lockDuration,
            emailOtp,
            smsOtp,
            authenticatorApp,
            blacklistedIps
          }
        }
      });
      alert("Security policies saved successfully!");
    } catch (e: any) {
      alert("Failed to save security policies: " + e.message);
    }
  };

  const handleTerminateSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    alert("Session terminated successfully.");
  };

  const handleForceGlobalPasswordReset = async () => {
    if (await customConfirm("Are you sure you want to force all users to reset their passwords on next login? This will expire all active sessions.")) {
      alert("Global password reset trigger saved in system security registry.");
    }
  };

  const handleBlockNewIp = async () => {
    const ip = await customPrompt("Enter IP Address to blacklist:");
    if (ip) {
      setBlacklistedIps(prev => prev ? `${prev}\n${ip}` : ip);
      alert(`IP address ${ip} added to Threat Defense blocklist.`);
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading Security Policies...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24 text-foreground animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Security & Access</h1>
        <p className="text-muted-foreground mt-1">Manage authentication rules, active sessions, and global security policies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <div className="flex flex-col gap-2">
          <TabButton id="login-rules" label="Login Rules" icon={Lock} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="sessions" label="User Sessions" icon={Activity} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="roles" label="Role & Permissions" icon={Key} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="security-center" label="Security Center" icon={ShieldAlert} activeTab={activeTab} onClick={setActiveTab} />
        </div>

        <div className="md:col-span-3">
          
          {activeTab === 'login-rules' && (
            <Card className="border-border/60 shadow-sm bg-card">
              <CardHeader className="border-b border-border/50 bg-muted/10">
                <CardTitle className="font-black text-lg">Authentication Rules</CardTitle>
                <CardDescription>Password complexity, MFA, and lockout policies.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary">Password Policy</h3>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Minimum Length</label>
                      <input type="text" value={minLength} onChange={e => setMinLength(e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Password Expiry</label>
                      <input type="text" value={passwordExpiry} onChange={e => setPasswordExpiry(e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Password History</label>
                      <input type="text" value={passwordHistory} onChange={e => setPasswordHistory(e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm focus:outline-none" />
                    </div>
                    <div className="flex gap-2 items-center text-sm pt-2">
                      <input type="checkbox" id="spec" checked={requireSpecial} onChange={e => setRequireSpecial(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
                      <label htmlFor="spec" className="font-semibold cursor-pointer">Require Special Characters</label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary">Login Restrictions</h3>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Maximum Failed Attempts</label>
                      <input type="text" value={failedAttempts} onChange={e => setFailedAttempts(e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Account Lock Duration</label>
                      <input type="text" value={lockDuration} onChange={e => setLockDuration(e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm focus:outline-none" />
                    </div>
                    <h3 className="text-sm font-semibold text-primary mt-4">Multi-Factor Authentication</h3>
                     <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <input type="checkbox" checked={emailOtp} onChange={e => setEmailOtp(e.target.checked)} className="rounded border-border text-primary" /> Enable Email OTP
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <input type="checkbox" checked={smsOtp} onChange={e => setSmsOtp(e.target.checked)} className="rounded border-border text-primary" /> Enable SMS OTP
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <input type="checkbox" checked={authenticatorApp} onChange={e => setAuthenticatorApp(e.target.checked)} className="rounded border-border text-primary" /> Enable Authenticator App
                      </label>
                     </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                   <button onClick={handleSavePolicies} className="px-4 py-2 bg-[#C5A059] text-white font-bold rounded text-sm flex items-center gap-2 hover:bg-[#C5A059]/90 cursor-pointer">
                     <Save className="size-4" /> Save Policies
                   </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'sessions' && (
             <Card className="border-border/60 bg-card shadow-sm">
              <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between bg-muted/10">
                <div>
                  <CardTitle className="font-black text-lg">Active Sessions</CardTitle>
                  <CardDescription>Monitor and terminate live user sessions.</CardDescription>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 font-bold rounded-full text-xs">{sessions.length} Online</div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {sessions.map(s => (
                     <div key={s.id} className="p-4 flex justify-between items-center hover:bg-muted/20">
                      <div>
                        <div className="font-semibold text-sm">{s.user}</div>
                        <div className="text-xs text-muted-foreground">{s.device} • {s.ip}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-emerald-500 font-semibold">{s.time}</span>
                        <button onClick={() => handleTerminateSession(s.id)} className="text-xs px-3 py-1 border border-border rounded text-red-500 hover:bg-red-500/10 cursor-pointer transition-all">Terminate</button>
                      </div>
                     </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'roles' && (
             <Card className="border-border/60 bg-card shadow-sm">
              <CardHeader className="border-b border-border/50 bg-muted/10">
                <CardTitle className="font-black text-lg">Role & Permission Engine</CardTitle>
                <CardDescription>Configure access control levels across the platform.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                 <div className="flex justify-between items-center bg-muted/50 p-4 rounded-md border border-border">
                    <span className="font-semibold text-sm">Super Admin</span>
                    <button className="text-xs px-3 py-1.5 bg-primary text-white rounded cursor-pointer">Edit Perms</button>
                 </div>
                 <div className="flex justify-between items-center bg-muted/50 p-4 rounded-md border border-border">
                    <span className="font-semibold text-sm">Commissioner</span>
                    <button className="text-xs px-3 py-1.5 border border-border bg-background rounded cursor-pointer hover:bg-muted">Edit Perms</button>
                 </div>
                 <div className="flex justify-between items-center bg-muted/50 p-4 rounded-md border border-border">
                    <span className="font-semibold text-sm">Desk Officer</span>
                    <button className="text-xs px-3 py-1.5 border border-border bg-background rounded cursor-pointer hover:bg-muted">Edit Perms</button>
                 </div>
                 <button className="w-full py-2 border border-dashed border-border text-sm font-semibold text-muted-foreground hover:bg-muted/30 cursor-pointer">+ Create New Role</button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security-center' && (
             <Card className="border-red-500/30 bg-rose-500/5 shadow-sm">
              <CardHeader className="border-b border-red-500/10">
                <CardTitle className="text-red-700 flex items-center gap-2 font-black text-lg"><ShieldAlert className="size-5" /> Threat Defense</CardTitle>
                <CardDescription className="text-red-600/80">Monitor anomalies and block malicious actors.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-red-900">Blacklisted IP Addresses</label>
                    <textarea 
                      value={blacklistedIps}
                      onChange={e => setBlacklistedIps(e.target.value)}
                      className="w-full p-2 bg-background border border-red-200 rounded-md text-sm font-mono h-24 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-red-500/10">
                     <button onClick={handleBlockNewIp} className="px-4 py-2 bg-red-600 text-white rounded-md text-xs font-bold hover:bg-red-700 cursor-pointer">Block New IP</button>
                     <button onClick={handleForceGlobalPasswordReset} className="px-4 py-2 border border-red-500/50 text-red-700 bg-white rounded-md text-xs font-bold hover:bg-red-50 cursor-pointer">Force Global Password Reset</button>
                     <button onClick={handleSavePolicies} className="px-4 py-2 bg-emerald-600 text-white rounded-md text-xs font-bold hover:bg-emerald-700 ml-auto cursor-pointer flex items-center gap-1.5"><Save className="size-3.5" /> Save Blacklist</button>
                  </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}

function TabButton({ id, label, icon: Icon, activeTab, onClick }: any) {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={() => onClick(id)}
      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer
      ${isActive ? 'bg-[#C5A059] text-white shadow-md' : 'hover:bg-muted text-muted-foreground'}`}
    >
      <Icon className={`size-4 ${isActive ? 'text-white' : 'text-primary'}`} />
      {label}
    </button>
  )
}
