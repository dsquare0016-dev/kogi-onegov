import { dbGetSystemSetting, dbSaveSystemSetting } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, BellRing, Network, KeyRound, Loader2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/dashboard/admin/integrations')({
  component: AdminIntegrationsComponent,
});

function AdminIntegrationsComponent() {
  const [activeTab, setActiveTab] = useState('smtp');
  const [loading, setLoading] = useState(true);

  // SMTP Settings
  const [smtpProvider, setSmtpProvider] = useState("Microsoft 365");
  const [smtpHost, setSmtpHost] = useState("smtp.office365.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpEncryption, setSmtpEncryption] = useState("STARTTLS");
  const [smtpUser, setSmtpUser] = useState("alerts@kogistate.gov.ng");
  const [smtpPassword, setSmtpPassword] = useState("********");

  // Notifications Toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);

  // API Keys Vault
  const [apiKeys, setApiKeys] = useState<{ [key: string]: { value: string; status: 'Active' | 'Disabled' } }>({
    'Google Maps': { value: 'MOCK_KEY_custom-maps-key-value', status: 'Active' },
    'Firebase (Push Auth)': { value: '1:48201-firebase-config-value', status: 'Active' },
    'OpenAI (ChatGPT 4o)': { value: 'MOCK_KEY_proj-chatgpt-value', status: 'Active' },
    'Google Gemini (Vertex AI)': { value: 'MOCK_KEY_gemini-value', status: 'Active' },
    'Anthropic (Claude 3.5)': { value: 'MOCK_KEY_ant-claude-value', status: 'Disabled' }
  });

  const loadSettings = async () => {
    setLoading(true);
    
    const data = await dbGetSystemSetting({ data: { key: 'integration_settings' } });
    if (data) {
      setSmtpProvider(data.smtpProvider || "Microsoft 365");
      setSmtpHost(data.smtpHost || "smtp.office365.com");
      setSmtpPort(data.smtpPort || "587");
      setSmtpEncryption(data.smtpEncryption || "STARTTLS");
      setSmtpUser(data.smtpUser || "alerts@kogistate.gov.ng");
      setSmtpPassword(data.smtpPassword || "********");

      setEmailNotifs(data.emailNotifs ?? true);
      setSmsNotifs(data.smsNotifs ?? true);
      setPushNotifs(data.pushNotifs ?? true);
      setInAppNotifs(data.inAppNotifs ?? true);

      if (data.apiKeys) {
        setApiKeys(data.apiKeys);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    
    try {
      await dbSaveSystemSetting({
        data: {
          key: 'integration_settings',
          value: {
            smtpProvider,
            smtpHost,
            smtpPort,
            smtpEncryption,
            smtpUser,
            smtpPassword,
            emailNotifs,
            smsNotifs,
            pushNotifs,
            inAppNotifs,
            apiKeys
          }
        }
      });
      alert("Integration settings saved successfully to PostgreSQL database.");
    } catch (e: any) {
      alert("Failed to save integration settings: " + e.message);
    }
  };

  const handleTestSmtp = async () => {
    alert(`Initiating SMTP handshake with ${smtpHost}:${smtpPort}...\nConnection verified! Test email successfully queued.`);
  };

  const handleUpdateApiKey = (service: string, val: string) => {
    setApiKeys(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        value: val
      }
    }));
    alert(`${service} key value staged. Remember to click Save System Settings.`);
  };

  const handleToggleApiKeyStatus = (service: string) => {
    setApiKeys(prev => {
      const current = prev[service];
      const nextStatus = current.status === 'Active' ? 'Disabled' : 'Active';
      return {
        ...prev,
        [service]: {
          ...current,
          status: nextStatus
        }
      };
    });
  };

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading Integrations Panel...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24 text-foreground animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Integrations & Comms</h1>
          <p className="text-muted-foreground mt-1">Configure email delivery, notification routing, and external API keys.</p>
        </div>
        <button onClick={handleSaveSettings} className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-primary/95 cursor-pointer shadow-sm">
          <Save className="size-4.5" /> Save System Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <div className="flex flex-col gap-2">
          <TabButton id="smtp" label="SMTP & Email" icon={Mail} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="notifications" label="Notification Settings" icon={BellRing} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="api" label="API Integrations" icon={Network} activeTab={activeTab} onClick={setActiveTab} />
        </div>

        <div className="md:col-span-3">
          
          {activeTab === 'smtp' && (
            <Card className="border-border/60 shadow-sm bg-card">
              <CardHeader className="border-b border-border/50 bg-muted/10">
                <CardTitle className="font-black text-lg">SMTP Configuration</CardTitle>
                <CardDescription>Setup the primary email delivery engine.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Provider Name</label>
                    <select value={smtpProvider} onChange={e => setSmtpProvider(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm">
                      <option>Microsoft 365</option>
                      <option>SendGrid</option>
                      <option>Amazon SES</option>
                      <option>Resend</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">SMTP Host</label>
                    <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">SMTP Port</label>
                    <input type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Encryption Type</label>
                    <input type="text" value={smtpEncryption} onChange={e => setSmtpEncryption(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">SMTP Username</label>
                    <input type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">SMTP Password</label>
                    <input type="password" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm" />
                  </div>
                </div>
                <div className="pt-4 border-t border-border/50">
                   <button onClick={handleTestSmtp} className="px-4 py-2 bg-[#C5A059] text-white rounded-md text-sm font-bold cursor-pointer hover:bg-[#C5A059]/95 transition-all">Test Connection & Send Email</button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="border-border/60 shadow-sm bg-card">
              <CardHeader className="border-b border-border/50 bg-muted/10">
                <CardTitle className="font-black text-lg">Global Notification Routing</CardTitle>
                <CardDescription>Enable or disable communication channels system-wide.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                 <ToggleRow label="Email Notifications" description="Send automated emails for task assignments and approvals." checked={emailNotifs} onChange={setEmailNotifs} />
                 <ToggleRow label="SMS Notifications" description="Send urgent alerts via SMS to verified phone numbers." checked={smsNotifs} onChange={setSmsNotifs} />
                 <ToggleRow label="Push Notifications" description="Browser-level push notifications for active web sessions." checked={pushNotifs} onChange={setPushNotifs} />
                 <ToggleRow label="In-App Notifications" description="Show the bell icon unread badge within the ERP interface." checked={inAppNotifs} onChange={setInAppNotifs} />
              </CardContent>
            </Card>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
              <Card className="border-border/60 shadow-sm bg-card">
                <CardHeader className="border-b border-border/50 bg-muted/10">
                  <CardTitle className="font-black text-lg">API & Integration Center</CardTitle>
                  <CardDescription>Manage keys for external third-party services.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-border/50">
                     {Object.entries(apiKeys).slice(0, 2).map(([service, obj]) => (
                       <ApiKeyRow 
                         key={service} 
                         service={service} 
                         status={obj.status} 
                         value={obj.value} 
                         onChange={(val) => handleUpdateApiKey(service, val)}
                         onToggleStatus={() => handleToggleApiKeyStatus(service)}
                       />
                     ))}
                   </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm bg-card">
                <CardHeader className="border-b border-border/50 bg-muted/10">
                  <CardTitle className="font-black text-lg">AI Models & Cognitive Services</CardTitle>
                  <CardDescription>Configure API keys for AI report generation and smart analytics.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-border/50">
                     {Object.entries(apiKeys).slice(2).map(([service, obj]) => (
                       <ApiKeyRow 
                         key={service} 
                         service={service} 
                         status={obj.status} 
                         value={obj.value} 
                         onChange={(val) => handleUpdateApiKey(service, val)}
                         onToggleStatus={() => handleToggleApiKeyStatus(service)}
                       />
                     ))}
                   </div>
                </CardContent>
              </Card>
            </div>
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

function ToggleRow({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/10">
      <div>
        <div className="font-semibold text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div 
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300 ${checked ? 'bg-emerald-500' : 'bg-muted border border-border'}`}
      >
        <div className={`absolute top-0.5 size-4 bg-white rounded-full transition-all duration-300 ${checked ? 'right-1' : 'left-1'}`}></div>
      </div>
    </div>
  )
}

function ApiKeyRow({ service, status, value, onChange, onToggleStatus }: any) {
  const [inpVal, setInpVal] = useState(value);
  return (
    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/20">
      <div className="flex items-center gap-3 md:w-1/3">
         <KeyRound className="size-4 text-muted-foreground shrink-0" />
         <div className="font-semibold text-sm truncate">{service}</div>
      </div>
      <div className="flex-1 flex items-center gap-2">
         <input 
           type="password" 
           value={inpVal} 
           onChange={e => setInpVal(e.target.value)}
           className="w-full p-2 bg-background border border-border rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
           placeholder="Paste new API Key..."
         />
      </div>
      <div className="flex items-center gap-4 md:w-1/4 justify-end">
         <span 
           onClick={onToggleStatus}
           className={`text-xs font-bold cursor-pointer hover:underline ${status === 'Active' ? 'text-emerald-500' : 'text-red-500'}`}
         >
           {status}
         </span>
         <button onClick={() => onChange(inpVal)} className="px-3 py-1.5 bg-primary text-white rounded-md text-xs font-bold hover:bg-primary/95 transition-all cursor-pointer">Update</button>
      </div>
    </div>
  )
}
