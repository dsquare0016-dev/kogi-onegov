import { dbVerifyResetUser, dbSendResetCode, dbVerifyResetCode, dbResetPasswordWithCode, dbGetLoginPageSettings, dbAuthenticateUser } from '@/lib/postgres-service';
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { ROLES, signIn } from "@/lib/auth";
import { Shield, Sparkles, Lock, KeyRound, Mail, Smartphone, Fingerprint, Eye, EyeOff, X } from "lucide-react";
import { customPrompt } from "@/lib/customModal";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in" }] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [role, setRole] = useState(ROLES[0].id);
  const [email, setEmail] = useState(ROLES[0].demoEmail);
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [loginSettings, setLoginSettings] = useState<any>(null);
  const [siteName, setSiteName] = useState("Kogi OneGov");
  const [loginBg, setLoginBg] = useState("/login-bg.jpg");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const getStored = () => {
        setSiteName(localStorage.getItem("gdu_site_name") || "Kogi OneGov");
        setLoginBg(localStorage.getItem("gdu_login_bg") || "/login-bg.jpg");
        const storedTitle = localStorage.getItem("gdu_site_title") || "Kogi OneGov Enterprise ERP";
        document.title = `Sign in · ${storedTitle}`;
      };
      getStored();
      window.addEventListener("siteConfigUpdate", getStored);
      return () => window.removeEventListener("siteConfigUpdate", getStored);
    }
  }, []);

  // Forgot password modal states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmailOrId, setResetEmailOrId] = useState("");
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const [isVerifyingUser, setIsVerifyingUser] = useState(false);
  const [isCodeRequested, setIsCodeRequested] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);
  const [isConfirmingCode, setIsConfirmingCode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleVerifyUser = async () => {
    if (!resetEmailOrId.trim()) return;
    setIsVerifyingUser(true);
    try {
      
      const res = await dbVerifyResetUser({ data: { emailOrStaffId: resetEmailOrId } });
      setVerifiedUser(res);
    } catch (err: any) {
      alert(err.message || "Failed to verify user.");
    } finally {
      setIsVerifyingUser(false);
    }
  };

  const handleSendCode = async () => {
    if (!verifiedUser?.email) return;
    setIsSendingCode(true);
    try {
      await dbSendResetCode({ data: { email: verifiedUser.email } });
      setIsCodeRequested(true);
      alert("Verification code sent to registered email/phone.");
    } catch (err: any) {
      alert(err.message || "Failed to send reset code.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || !verifiedUser?.email) return;
    setIsConfirmingCode(true);
    try {
      const res = await dbVerifyResetCode({ data: { email: verifiedUser.email, code: verificationCode } });
      if (res.valid) {
        setIsCodeConfirmed(true);
      } else {
        alert("Invalid or expired verification code.");
      }
    } catch (err: any) {
      alert(err.message || "Code verification failed.");
    } finally {
      setIsConfirmingCode(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!verifiedUser?.email) return;
    setIsResettingPassword(true);
    try {
      await dbResetPasswordWithCode({ data: { email: verifiedUser.email, newPassword } });
      alert("Password has been reset successfully. Please log in with your new password.");
      setIsResetModalOpen(false);
      // Reset state
      setResetEmailOrId("");
      setVerifiedUser(null);
      setIsCodeRequested(false);
      setVerificationCode("");
      setIsCodeConfirmed(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      alert(err.message || "Password reset failed.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  useEffect(() => {
    // Dynamic load of login settings from database
    const loadSettings = async () => {
      try {
        
        const settings = await dbGetLoginPageSettings();
        if (settings) {
          setLoginSettings(settings);
        }
      } catch (err) {
        console.error('Failed to load login page settings:', err);
      }
    };
    loadSettings();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      
      const authResult = await dbAuthenticateUser({ data: { email, pass: password } });
      
      if (authResult.found) {
        if (!authResult.valid) {
          alert("Invalid credentials. Please type the password correctly.");
          return;
        }
        
        const sessionStore = await import('@/lib/auth');
        sessionStore.signIn(authResult.roleId, {
          name: authResult.name,
          email: authResult.email,
          role: authResult.roleName,
          staffId: authResult.staffId,
          mda: authResult.mda
        });
        
        nav({ to: "/dashboard" });
        return;
      }
    } catch (err: any) {
      console.error("Database auth failed, falling back to mock roles:", err);
    }

    // Default demo login fallback
    const matchedRole = ROLES.find(r => r.demoEmail === email);
    if (matchedRole) {
      signIn(matchedRole.id);
      nav({ to: "/dashboard" });
      return;
    }

    alert("User credentials not found. Please contact the administrator.");
  };

  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-background relative text-foreground">
      <div 
        className="relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden"
        style={{
          backgroundImage: loginBg ? `linear-gradient(to bottom, rgba(10, 17, 66, 0.85), rgba(10, 17, 66, 0.95)), url(${loginBg})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#0A1142'
        }}
      >
        <div className="absolute -top-20 -right-20 size-[480px] rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 size-[420px] rounded-full bg-info/20 blur-3xl" />
        <div className="relative z-10">
          <Logo size={56} withText textClass="text-white" />
        </div>
        <div className="relative z-10 max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold">
            <Sparkles className="size-3.5" /> Digital Governance Operating System
          </div>
          <h1 className="text-4xl font-black leading-tight text-white uppercase">
            {loginSettings?.hero_text || "One platform for every governance decision in Kogi State."}
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            From the Executive Council to LGAs, MDAs, and frontline civil servants — unified planning, budgeting, delivery, performance management, and AI-powered oversight, in real time.
          </p>
        </div>
        <div className="relative z-10 text-[11px] text-white/50">Secured by GDU · 2FA · Audit-trail enforced · ISO-aligned</div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <form onSubmit={submit} className="w-full max-w-md space-y-6">
          <div className="lg:hidden mb-8"><Logo size={48} withText textClass="text-foreground" /></div>
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <Shield className="size-3.5 text-gold" /> Government Portal
            </div>
            <h2 className="text-3xl font-black tracking-tight uppercase text-primary">Login to {siteName}</h2>
            <p className="text-xs text-muted-foreground">
              {loginSettings?.welcome_message || "Use your authorized staff credentials to log in. Audit logging is active."}
            </p>
          </div>

          <div className="space-y-4">
            <Field icon={<Mail className="size-4" />} label="Email or Staff ID">
              <input 
                type="text"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-transparent outline-none text-sm text-foreground" 
                placeholder="e.g. davidson@kogistate.gov.ng or KGS/CS/000001/10/45" 
              />
            </Field>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Password</label>
                <button 
                  type="button" 
                  onClick={() => setIsResetModalOpen(true)} 
                  className="text-[10px] text-primary hover:underline font-bold font-sans"
                >
                  Forgot password?
                </button>
              </div>
              <div className="h-11 px-3 rounded-lg bg-card border border-input flex items-center gap-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                <span className="text-muted-foreground"><Lock className="size-4" /></span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-transparent outline-none text-sm text-foreground font-sans" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Clearance Role (Demo Mode)</label>
              <select
                value={role}
                onChange={(e) => {
                  const id = e.target.value;
                  setRole(id as any);
                  const r = ROLES.find((x) => x.id === id)!;
                  setEmail(r.demoEmail);
                }}
                className="w-full h-11 px-3 rounded-lg bg-card border border-input text-xs outline-none focus:ring-1 focus:ring-primary cursor-pointer text-foreground bg-card"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id} className="text-foreground bg-card">{r.title}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full h-11 mt-2 rounded-lg gold-gradient text-gold-foreground font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              Sign in securely
            </button>
          </div>

          <div className="text-center text-[10px] text-muted-foreground pt-4">
            {loginSettings?.footer_text || "© 2026 Kogi State Government. Enforced system audit trails."}
          </div>
        </form>
      </div>
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 relative flex flex-col gap-4 text-foreground animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setIsResetModalOpen(false);
                setResetEmailOrId("");
                setVerifiedUser(null);
                setIsCodeRequested(false);
                setVerificationCode("");
                setIsCodeConfirmed(false);
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3">
              <KeyRound className="size-6 text-primary shrink-0" />
              <h3 className="text-sm font-black uppercase tracking-wider text-primary">
                Secure Password Reset
              </h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
              Verify your identity using your registered government email or Staff ID to request an access code.
            </p>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Email or Staff ID</label>
                <div className="h-11 px-3 rounded-lg bg-card border border-input flex items-center gap-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                  <Mail className="size-4 text-muted-foreground" />
                  <input
                    type="text"
                    disabled={verifiedUser !== null}
                    value={resetEmailOrId}
                    onChange={(e) => setResetEmailOrId(e.target.value)}
                    className={`w-full bg-transparent outline-none text-sm font-semibold ${
                      verifiedUser ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-foreground'
                    }`}
                    placeholder="Enter email or staff ID..."
                  />
                </div>
                
                {verifiedUser && (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/20 animate-in slide-in-from-top-2 duration-200">
                    Verified User: {verifiedUser.name} ({verifiedUser.staffId})
                  </div>
                )}

                {!verifiedUser && (
                  <button
                    type="button"
                    onClick={handleVerifyUser}
                    disabled={isVerifyingUser || !resetEmailOrId}
                    className="w-full h-10 mt-1 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifyingUser ? "Verifying..." : "Verify Email or Staff ID"}
                  </button>
                )}
              </div>

              {verifiedUser && (
                <div className="space-y-3 border-t border-border/40 pt-3 animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isSendingCode || isCodeRequested}
                    className={`w-full h-10 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isCodeRequested 
                        ? 'bg-emerald-600 text-white opacity-85'
                        : 'bg-primary hover:bg-primary/95 text-primary-foreground'
                    }`}
                  >
                    {isSendingCode ? "Sending Code..." : isCodeRequested ? "✓ Code Dispatched" : "Request for Code"}
                  </button>

                  {isCodeRequested && !isCodeConfirmed && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">6-Digit Access Code</label>
                      <div className="h-11 px-3 rounded-lg bg-card border border-input flex items-center gap-2">
                        <Lock className="size-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="w-full bg-transparent outline-none text-sm text-foreground font-mono font-bold tracking-wider"
                          placeholder="e.g. 123456"
                          maxLength={6}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={isConfirmingCode || !verificationCode}
                        className="w-full h-10 bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        {isConfirmingCode ? "Verifying Code..." : "Confirm Code"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isCodeConfirmed && (
                <div className="space-y-3 border-t border-border/40 pt-3 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">New Password</label>
                    <div className="h-11 px-3 rounded-lg bg-card border border-input flex items-center gap-2">
                      <Lock className="size-4 text-muted-foreground" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm text-foreground"
                        placeholder="Min. 8 characters"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Confirm New Password</label>
                    <div className="h-11 px-3 rounded-lg bg-card border border-input flex items-center gap-2">
                      <Lock className="size-4 text-muted-foreground" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm text-foreground"
                        placeholder="Re-type password"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isResettingPassword || !newPassword || !confirmPassword}
                    className="w-full h-11 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors shadow-md cursor-pointer"
                  >
                    {isResettingPassword ? "Saving..." : "Submit New Password"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold block">{label}</label>
      <div className="h-11 px-3 rounded-lg bg-card border border-input flex items-center gap-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </div>
    </div>
  );
}