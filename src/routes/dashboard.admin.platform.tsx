import { dbGetPlatformSettings, dbSavePlatformSettings, dbGetLgas, dbSaveLga, dbDeactivateLga, dbGetDatabaseDiagnostics, dbGetSystemModules, dbToggleSystemModule, dbGetLoginPageSettings, dbSaveLoginPageSettings, dbGetMaintenanceSettings, dbSaveMaintenanceSettings, dbGetLegalDocuments, dbSaveLegalDocument, dbGetAiSettings, dbSaveAiSettings, dbGetSmtpSettings, dbSaveSmtpSettings, dbTestSmtpConnection } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Monitor, Scale, ShieldAlert, LayoutDashboard, BrainCircuit, Wrench, Database, 
  Save, Loader2, Info, Search, Plus, Edit2, Check, RefreshCw, X, MapPin,
  Server, CheckCircle2, XCircle, AlertTriangle, FileText, Shield, Eye, ShieldCheck,
  ToggleLeft, ToggleRight, Trash2, Mail
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

export const Route = createFileRoute('/dashboard/admin/platform')({
  component: AdminPlatformComponent,
})

function AdminPlatformComponent() {
  const [activeTab, setActiveTab] = useState('system');
  const [showAllSidebar, setShowAllSidebar] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gdu_sidebar_show_all') === 'true';
    }
    return false;
  });

  const toggleShowAllSidebar = () => {
    const nextVal = !showAllSidebar;
    setShowAllSidebar(nextVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gdu_sidebar_show_all', String(nextVal));
      window.dispatchEvent(new Event('sidebarUpdate'));
    }
  };

  const tabs = [
    { id: 'system', label: 'System Information', icon: Info },
    { id: 'lga', label: 'LGA Registry Manager', icon: MapPin },
    { id: 'database', label: 'Database Diagnostics', icon: Database },
    { id: 'modules', label: 'System Features', icon: LayoutDashboard },
    { id: 'login', label: 'Login Page Styling', icon: Monitor },
    { id: 'maintenance', label: 'Site Maintenance', icon: Wrench },
    { id: 'legal', label: 'Privacy & Legal', icon: Scale },
    { id: 'ai', label: 'AI Settings Center', icon: BrainCircuit },
    { id: 'email', label: 'Email & SMTP', icon: Mail },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24 text-foreground">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Platform Control</h1>
        <p className="text-muted-foreground mt-1">Manage module availability, login interfaces, AI, email SMTP, legal policies, and system identity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <div className="flex flex-col gap-1.5">
          {tabs.map(t => (
            <TabButton key={t.id} id={t.id} label={t.label} icon={t.icon} activeTab={activeTab} onClick={setActiveTab} />
          ))}
        </div>

        <div className="md:col-span-3">
          {activeTab === 'system' && <SystemInfoTab />}
          {activeTab === 'lga' && <LgaRegistryTab />}
          {activeTab === 'database' && <DatabaseDiagnosticsTab />}
          {activeTab === 'modules' && <ModulesTab showAllSidebar={showAllSidebar} toggleShowAllSidebar={toggleShowAllSidebar} />}
          {activeTab === 'login' && <LoginPageTab />}
          {activeTab === 'maintenance' && <MaintenanceTab />}
          {activeTab === 'legal' && <LegalTab />}
          {activeTab === 'ai' && <AiSettingsTab />}
          {activeTab === 'email' && <EmailSmtpTab />}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// TAB BUTTON
// =====================================================================
function TabButton({ id, label, icon: Icon, activeTab, onClick }: any) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-3 transition-colors cursor-pointer
      ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
    >
      <Icon className={`size-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-[#C5A059]'}`} />
      {label}
    </button>
  );
}

// =====================================================================
// SYSTEM INFORMATION TAB
// =====================================================================
function SystemInfoTab() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      
      const data = await dbGetPlatformSettings();
      setSettings(data || {});
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await dbSavePlatformSettings({ data: settings });
      alert('System settings saved to PostgreSQL database.');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setSaving(false);
  };

  const f = (field: string, label: string, type = 'text') => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        value={settings[field] ?? ''}
        onChange={e => setSettings((s: any) => ({ ...s, [field]: e.target.value }))}
        className="w-full p-2.5 bg-muted/40 border border-border/60 rounded-md text-sm focus:outline-none focus:border-primary/50 transition-colors"
      />
    </div>
  );

  if (loading) return <div className="flex items-center justify-center p-16"><Loader2 className="size-8 animate-spin text-primary" /></div>;

  return (
    <Card className="border-border/60 shadow-sm bg-card">
      <CardHeader className="border-b border-border/50 bg-muted/10">
        <CardTitle className="font-black">System Information Settings</CardTitle>
        <CardDescription>Manage official platform metadata, identity, and branding globally.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {f('platformName', 'Platform Name')}
            {f('shortPlatformName', 'Short Platform Name')}
            {f('governmentName', 'Government Name')}
            {f('stateName', 'State Name')}
            {f('managingInstitution', 'Managing Institution')}
            {f('portalUrl', 'Portal URL', 'url')}
          </div>
          <div className="border-t border-border/50 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {f('currentGovernorName', 'Current Governor Name')}
            {f('deputyGovernorName', 'Deputy Governor Name')}
            {f('dgCoordinatorName', 'DG/Coordinator Name')}
          </div>
          <div className="border-t border-border/50 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {f('defaultReportPreparedBy', 'Default Report Prepared By')}
            {f('defaultReportPreparedFor', 'Default Report Prepared For')}
            {f('developmentPlanPeriod', 'Development Plan Period')}
            {f('defaultCurrency', 'Default Currency')}
          </div>
          <div className="flex justify-end pt-4 border-t border-border/50">
            <button disabled={saving} type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 font-bold text-sm cursor-pointer disabled:opacity-60">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save System Settings
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// =====================================================================
// LGA REGISTRY TAB
// =====================================================================
function LgaRegistryTab() {
  const [lgas, setLgas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    
    const data = await dbGetLgas();
    setLgas(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      
      await dbSaveLga({ data: editing });
      await load();
      setEditing(null);
      setIsNew(false);
      setMsg(isNew ? 'New LGA registered successfully!' : 'LGA updated successfully!');
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setSaving(false);
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Deactivate ${name} LGA? Users will no longer see it in dropdowns.`)) return;
    
    await dbDeactivateLga({ data: { id } });
    await load();
    setMsg(`${name} deactivated.`);
    setTimeout(() => setMsg(null), 3000);
  };

  const filtered = lgas.filter(l => 
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.headquarters?.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "w-full p-2 bg-muted/40 border border-border/60 rounded-md text-xs focus:outline-none focus:border-primary/50";

  if (loading) return <div className="flex items-center justify-center p-16"><Loader2 className="size-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 animate-in fade-in">
      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-2">
          <Check className="size-4" /> {msg}
        </div>
      )}

      {editing ? (
        <Card className="border-border/60 shadow-md bg-card">
          <CardHeader className="border-b border-border/50 bg-muted/10">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <MapPin className="size-5 text-[#C5A059]" />
                {isNew ? 'Register New LGA' : `Edit — ${editing.name}`}
              </CardTitle>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-1.5 hover:bg-muted rounded-full cursor-pointer">
                <X className="size-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['name', 'LGA Name', 'text', true],
                  ['headquarters', 'Headquarters', 'text', false],
                  ['chairman_name', 'Chairman / Administrator', 'text', false],
                  ['senatorial_district', 'Senatorial District', 'text', false],
                  ['population', 'Population Count', 'number', false],
                  ['land_area', 'Land Area (sq km)', 'number', false],
                  ['annual_budget', 'Annual Budget Allocation (₦)', 'number', false],
                  ['contact_email', 'Official Contact Email', 'email', false],
                  ['contact_phone', 'Official Contact Phone', 'text', false],
                ].map(([field, label, type, required]) => (
                  <div key={field as string} className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label as string}</label>
                    <input
                      type={type as string}
                      required={required as boolean}
                      disabled={!isNew && field === 'name'}
                      value={editing[field as string] ?? ''}
                      onChange={e => setEditing((s: any) => ({ ...s, [field as string]: e.target.value }))}
                      className={`${inputCls} ${!isNew && field === 'name' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 border border-border rounded-md text-xs font-bold hover:bg-muted cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2 rounded-md text-xs font-bold hover:bg-primary/90 disabled:opacity-60 cursor-pointer">
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  {isNew ? 'Register LGA' : 'Save Changes'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 shadow-md bg-card">
          <CardHeader className="border-b border-border/50 bg-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="font-black text-base flex items-center gap-2"><MapPin className="size-5 text-[#C5A059]" /> LGA Registry Control Center</CardTitle>
                <CardDescription className="text-xs mt-0.5">{lgas.length} of 21 Kogi LGAs registered. All dropdowns across the ERP fetch from this table.</CardDescription>
              </div>
              <button onClick={() => { setEditing({ name: '', headquarters: '', chairman_name: '', population: 0, land_area: 0, annual_budget: 0, contact_email: '', contact_phone: '', senatorial_district: '' }); setIsNew(true); }} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/90 cursor-pointer self-start sm:self-auto">
                <Plus className="size-4" /> Register New LGA
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-muted/40 border border-border/60 focus-within:ring-1 focus-within:ring-primary/50 max-w-sm">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input type="text" placeholder="Search LGA or headquarters..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none text-xs flex-1" />
              {search && <button onClick={() => setSearch('')} className="p-0.5 hover:bg-muted rounded-full"><X className="size-3" /></button>}
            </div>
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-4 py-3">LGA Name</th>
                    <th className="px-4 py-3">Headquarters</th>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3">Chairman</th>
                    <th className="px-4 py-3 text-right">Population</th>
                    <th className="px-4 py-3 text-right">Budget (₦)</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs font-semibold">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No LGAs found.</td></tr>
                  ) : filtered.map(l => (
                    <tr key={l.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-extrabold text-foreground">{l.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.headquarters}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.senatorial_district || '—'}</td>
                      <td className="px-4 py-3">{l.chairman_name || '—'}</td>
                      <td className="px-4 py-3 text-right font-mono">{Number(l.population || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600">₦{Number(l.annual_budget || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${l.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>{l.status || 'Active'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => { setEditing({ ...l }); setIsNew(false); }} className="inline-flex items-center gap-1 px-2 py-1 hover:bg-muted rounded text-[10px] font-bold text-primary border border-border/40 cursor-pointer">
                            <Edit2 className="size-3" /> Edit
                          </button>
                          {l.status === 'Active' && (
                            <button onClick={() => handleDeactivate(l.id, l.name)} className="inline-flex items-center gap-1 px-2 py-1 hover:bg-rose-500/10 rounded text-[10px] font-bold text-rose-500 border border-rose-200/30 cursor-pointer">
                              <XCircle className="size-3" /> Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =====================================================================
// DATABASE DIAGNOSTICS TAB
// =====================================================================
function DatabaseDiagnosticsTab() {
  const [diag, setDiag] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    
    const data = await dbGetDatabaseDiagnostics();
    setDiag(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <Card className="border-border/60 shadow-md bg-card">
        <CardHeader className="border-b border-border/50 bg-muted/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-black text-base flex items-center gap-2"><Server className="size-5 text-[#C5A059]" /> PostgreSQL Connection Status</CardTitle>
              <CardDescription className="text-xs mt-0.5">Live database health diagnostics for the Kogi OneGov ERP.</CardDescription>
            </div>
            <button onClick={fetch} disabled={loading} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer self-start">
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} /> Test Connection
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-10"><Loader2 className="size-7 animate-spin text-primary" /></div>
          ) : diag ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Status', value: diag.status === 'connected' ? 'Connected' : 'Error', color: diag.status === 'connected' ? 'emerald' : 'rose' },
                  { label: 'Database', value: diag.database, color: 'blue' },
                  { label: 'DB Role', value: diag.role, color: 'purple' },
                  { label: 'Latency', value: `${diag.latencyMs}ms`, color: 'amber' },
                  { label: 'DB Size', value: diag.dbSize, color: 'indigo' },
                  { label: 'Host', value: `${diag.host}:${diag.port}`, color: 'slate' },
                ].map(item => (
                  <div key={item.label} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{item.label}</span>
                    <p className="text-sm font-black">{item.value}</p>
                  </div>
                ))}
              </div>

              {diag.status === 'error' && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="size-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-rose-600">Connection Error</h5>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{diag.error}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-border/50 pt-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Table Health Matrix ({diag.tables.length} tables)</h4>
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30 text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-b border-border">
                        <th className="px-4 py-3">Table Name</th>
                        <th className="px-4 py-3 text-right">Row Count</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-xs font-semibold">
                      {diag.tables.map((t: any) => (
                        <tr key={t.name} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-2 font-mono text-foreground">{t.name}</td>
                          <td className="px-4 py-2 text-right font-mono">{(t.rowCount || 0).toLocaleString()}</td>
                          <td className="px-4 py-2 text-center"><CheckCircle2 className="size-4 text-emerald-500 mx-auto" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================================
// MODULES TAB
// =====================================================================
function ModulesTab({ showAllSidebar, toggleShowAllSidebar }: any) {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    
    const data = await dbGetSystemModules();
    setModules(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (mod: any) => {
    
    await dbToggleSystemModule({ data: { id: mod.id, is_enabled: !mod.is_enabled } });
    setModules(prev => prev.map(m => m.id === mod.id ? { ...m, is_enabled: !m.is_enabled } : m));
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <Card className="border-indigo-500/30 shadow-sm bg-indigo-500/5">
        <CardHeader className="border-b border-indigo-500/10">
          <CardTitle className="text-indigo-700 dark:text-indigo-400 flex items-center gap-2 font-black">System Feature Control</CardTitle>
          <CardDescription className="text-indigo-600/80 text-xs">Enable or disable major ERP modules globally. Changes are saved to PostgreSQL immediately.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center p-10"><Loader2 className="size-7 animate-spin text-indigo-500" /></div>
          ) : modules.map(mod => (
            <div key={mod.id} className="flex items-center justify-between p-3.5 border border-indigo-500/20 bg-background rounded-xl">
              <div>
                <div className="font-bold text-sm text-foreground">{mod.name}</div>
                {mod.description && <div className="text-[11px] text-muted-foreground mt-0.5">{mod.description}</div>}
              </div>
              <button
                onClick={() => toggle(mod)}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ml-4 ${mod.is_enabled ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
              >
                <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${mod.is_enabled ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="font-black">Navigation & Sidebar Access Mode</CardTitle>
          <CardDescription>Toggle between role-restricted menus and fully exposed system menus.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-card/40">
            <div>
              <div className="font-bold text-sm">Bypass Role-Based Menu Filters (Show All Menus)</div>
              <div className="text-xs text-muted-foreground mt-0.5">When enabled, all modules and workspaces are visible to all users regardless of role.</div>
            </div>
            <button onClick={toggleShowAllSidebar} className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ml-4 ${showAllSidebar ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}>
              <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${showAllSidebar ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================================
// LOGIN PAGE TAB
// =====================================================================
function LoginPageTab() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      
      const data = await dbGetLoginPageSettings();
      setSettings(data || { welcome_message: '', footer_text: '', enable_animation: true, enable_captcha: false });
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      await dbSaveLoginPageSettings({
        data: {
          welcomeMessage: settings.welcome_message,
          footerText: settings.footer_text,
          enableAnimation: settings.enable_animation,
          enableCaptcha: settings.enable_captcha,
          backgroundImageUrl: settings.background_image_url,
          logoUrl: settings.logo_url,
          heroText: settings.hero_text,
        }
      });
      alert('Login page settings saved!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center p-16"><Loader2 className="size-8 animate-spin text-primary" /></div>;

  const inp = (field: string, label: string, type = 'text') => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      <input type={type} value={settings[field] ?? ''} onChange={e => setSettings((s: any) => ({ ...s, [field]: e.target.value }))} className="w-full p-2.5 bg-muted/40 border border-border/60 rounded-md text-sm focus:outline-none focus:border-primary/50" />
    </div>
  );

  return (
    <Card className="border-border/60 shadow-sm bg-card">
      <CardHeader className="border-b border-border/50 bg-muted/10">
        <CardTitle className="font-black">Login Page Management</CardTitle>
        <CardDescription>Customize the authentication portal appearance. Changes apply immediately.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {inp('welcome_message', 'Welcome Message')}
        {inp('footer_text', 'Footer Text')}
        {inp('hero_text', 'Hero Subtext')}
        {inp('background_image_url', 'Background Image URL')}
        {inp('logo_url', 'Custom Logo URL')}
        <div className="flex gap-6 pt-4 border-t border-border/50">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={!!settings.enable_animation} onChange={e => setSettings((s: any) => ({ ...s, enable_animation: e.target.checked }))} className="size-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-sm font-medium">Enable Login Animation</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={!!settings.enable_captcha} onChange={e => setSettings((s: any) => ({ ...s, enable_captcha: e.target.checked }))} className="size-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-sm font-medium">Enable CAPTCHA</span>
          </label>
        </div>
        <div className="flex justify-end pt-4 border-t border-border/50">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md font-bold text-sm cursor-pointer disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Login Settings
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================
// MAINTENANCE TAB
// =====================================================================
function MaintenanceTab() {
  const [settings, setSettings] = useState<any>({ maintenance_enabled: false, maintenance_message: 'The system is currently under scheduled maintenance. Please try again later.' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      
      const data = await dbGetMaintenanceSettings();
      if (data) setSettings(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleToggle = async () => {
    const newState = !settings.maintenance_enabled;
    if (newState && !confirm('CAUTION: Activating maintenance mode will block ALL non-super-admin users from accessing the platform. Proceed?')) return;
    setSaving(true);
    
    try {
      await dbSaveMaintenanceSettings({
        data: {
          maintenanceEnabled: newState,
          maintenanceMessage: settings.maintenance_message,
        }
      });
      setSettings((s: any) => ({ ...s, maintenance_enabled: newState }));
      alert(newState ? 'Maintenance mode ACTIVATED. Non-admin users are now blocked.' : 'Maintenance mode deactivated. Site is live.');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setSaving(false);
  };

  const saveMessage = async () => {
    setSaving(true);
    
    await dbSaveMaintenanceSettings({
      data: { maintenanceEnabled: settings.maintenance_enabled, maintenanceMessage: settings.maintenance_message }
    });
    setSaving(false);
    alert('Maintenance message saved.');
  };

  if (loading) return <div className="flex items-center justify-center p-16"><Loader2 className="size-8 animate-spin text-primary" /></div>;

  const isActive = settings.maintenance_enabled;

  return (
    <Card className={`shadow-sm ${isActive ? 'border-rose-500/30 bg-rose-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
      <CardHeader className={`border-b ${isActive ? 'border-rose-500/10' : 'border-amber-500/10'}`}>
        <CardTitle className={`${isActive ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'} flex items-center gap-2 font-black`}>
          <Wrench className="size-5" /> Site Maintenance Center
        </CardTitle>
        <CardDescription className={isActive ? 'text-rose-600/80' : 'text-amber-600/80'}>
          When active, all non-super-admin users are redirected to the maintenance page.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className={`flex items-center justify-between p-4 bg-background border rounded-xl ${isActive ? 'border-rose-500/20' : 'border-amber-500/20'}`}>
          <div>
            <div className={`font-black ${isActive ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
              Maintenance Mode — {isActive ? '🔴 ACTIVE' : '🟢 INACTIVE'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isActive ? 'Users are currently blocked. Only Super Admin can access the portal.' : 'Site is live and accessible to all users.'}
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={saving}
            className={`px-5 py-2 font-black rounded-lg text-sm text-white cursor-pointer disabled:opacity-60 ${isActive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-amber-500 hover:bg-amber-600'}`}
          >
            {saving ? <Loader2 className="size-4 animate-spin inline" /> : isActive ? 'Deactivate' : 'Activate Maintenance'}
          </button>
        </div>
        <div className="space-y-1.5">
          <label className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
            Maintenance Message (visible to blocked users)
          </label>
          <textarea
            value={settings.maintenance_message}
            onChange={e => setSettings((s: any) => ({ ...s, maintenance_message: e.target.value }))}
            className={`w-full p-3 bg-background border rounded-xl text-sm h-28 focus:outline-none ${isActive ? 'border-rose-200' : 'border-amber-200'}`}
          />
          <div className="flex justify-end">
            <button onClick={saveMessage} disabled={saving} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 border border-border cursor-pointer">
              <Save className="size-3.5" /> Save Message
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================
// LEGAL TAB
// =====================================================================
function LegalTab() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const docTypes = [
    { type: 'privacy', label: 'Privacy Policy', icon: Shield, route: '/privacy-policy' },
    { type: 'terms', label: 'Terms & Conditions', icon: FileText, route: '/terms' },
    { type: 'dataprotection', label: 'Data Protection Policy', icon: ShieldAlert, route: '/data-protection' },
    { type: 'cookie', label: 'Cookie Policy', icon: Eye, route: '/cookie-policy' },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    
    const data = await dbGetLegalDocuments();
    setDocs(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const getDoc = (type: string) => docs.find(d => d.document_type === type);

  const handleSave = async (status: 'draft' | 'published') => {
    if (!editing) return;
    setSaving(true);
    try {
      
      await dbSaveLegalDocument({
        data: {
          documentType: editing.type,
          title: editing.title,
          content: editing.content,
          status
        }
      });
      await load();
      setEditing(null);
      setMsg(`Document ${status === 'published' ? 'published' : 'saved as draft'} successfully.`);
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center p-16"><Loader2 className="size-8 animate-spin text-primary" /></div>;

  if (editing) {
    return (
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="border-b border-border/50 bg-muted/10">
          <div className="flex justify-between items-center">
            <CardTitle className="font-black">Editing: {editing.label}</CardTitle>
            <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-muted rounded-full cursor-pointer"><X className="size-4" /></button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Document Title</label>
            <input type="text" value={editing.title} onChange={e => setEditing((s: any) => ({ ...s, title: e.target.value }))} className="w-full p-2.5 bg-muted/40 border border-border/60 rounded-md text-sm focus:outline-none focus:border-primary/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content</label>
            <textarea value={editing.content} onChange={e => setEditing((s: any) => ({ ...s, content: e.target.value }))} className="w-full p-3 bg-muted/40 border border-border/60 rounded-md text-sm h-64 focus:outline-none focus:border-primary/50 font-mono" placeholder="Enter document content..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <button onClick={() => setEditing(null)} className="px-4 py-2 border border-border rounded-md text-xs font-bold hover:bg-muted cursor-pointer">Cancel</button>
            <button onClick={() => handleSave('draft')} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-muted border border-border rounded-md text-xs font-bold cursor-pointer disabled:opacity-60">
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} Save as Draft
            </button>
            <button onClick={() => handleSave('published')} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 text-white rounded-md text-xs font-bold hover:bg-emerald-600 cursor-pointer disabled:opacity-60">
              <ShieldCheck className="size-3.5" /> Publish
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-sm bg-card">
      <CardHeader className="border-b border-border/50 bg-muted/10">
        <CardTitle className="font-black">Privacy & Legal Center</CardTitle>
        <CardDescription>Manage terms of service, privacy policy, and legal documentation. Published versions are shown on public pages.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        {msg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-2">
            <Check className="size-4" /> {msg}
          </div>
        )}
        {docTypes.map(({ type, label, icon: Icon, route }) => {
          const doc = getDoc(type);
          return (
            <div key={type} className="flex justify-between items-center p-4 border border-border/60 rounded-xl hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-3">
                <Icon className="size-4 text-[#C5A059]" />
                <div>
                  <div className="font-bold text-sm">{label}</div>
                  {doc && <div className="text-[11px] text-muted-foreground">v{doc.version || '1.0'} · Last updated: {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : 'Never'}</div>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${doc?.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                  {doc?.status || 'Not Created'}
                </span>
                <button
                  onClick={() => setEditing({ type, label, title: doc?.title || label, content: doc?.content || '' })}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Edit
                </button>
                {doc?.status === 'published' && (
                  <a href={route} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-muted-foreground hover:underline">View</a>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// =====================================================================
// AI SETTINGS TAB
// =====================================================================
function AiSettingsTab() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      
      const data = await dbGetAiSettings();
      setSettings(data || {
        enable_chatbot_globally: true, index_budget_data: true, index_project_data: true,
        index_activity_logs: true, index_generated_reports: true, allow_report_generation: true,
        allow_recommendations: true, allow_dashboard_insights: true
      });
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      await dbSaveAiSettings({
        data: {
          enableChatbotGlobally: settings.enable_chatbot_globally,
          indexBudgetData: settings.index_budget_data,
          indexProjectData: settings.index_project_data,
          indexActivityLogs: settings.index_activity_logs,
          indexGeneratedReports: settings.index_generated_reports,
          allowReportGeneration: settings.allow_report_generation,
          allowRecommendations: settings.allow_recommendations,
          allowDashboardInsights: settings.allow_dashboard_insights,
        }
      });
      alert('AI settings saved!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center p-16"><Loader2 className="size-8 animate-spin text-primary" /></div>;

  const toggle = (field: string) => setSettings((s: any) => ({ ...s, [field]: !s[field] }));

  const toggleRows = [
    ['enable_chatbot_globally', 'Enable AI Chatbot Globally', 'Activate the government intelligence assistant for all dashboard users.'],
    ['allow_report_generation', 'Allow AI Report Generation', 'Enable AI to generate performance reports from ERP data.'],
    ['allow_recommendations', 'Allow AI Recommendations', 'Display strategic insights and spending recommendations.'],
    ['allow_dashboard_insights', 'Allow Dashboard Insights', 'Show AI-driven KPI summaries on main dashboards.'],
  ];
  const indexRows = [
    ['index_budget_data', 'Index Budget Data'],
    ['index_project_data', 'Index Project Data'],
    ['index_activity_logs', 'Index Activity Logs'],
    ['index_generated_reports', 'Index Generated Reports'],
  ];

  return (
    <Card className="border-border/60 shadow-sm bg-card">
      <CardHeader className="border-b border-border/50 bg-muted/10">
        <CardTitle className="font-black">AI Settings Center</CardTitle>
        <CardDescription>Configure the Government Intelligence Assistant. AI only uses authorized ERP database records — no fabricated data.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-3">
          {toggleRows.map(([field, label, desc]) => (
            <div key={field} className="flex items-center justify-between p-4 border border-border/60 rounded-xl bg-card/40">
              <div>
                <div className="font-bold text-sm">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              </div>
              <button onClick={() => toggle(field)} className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ml-4 ${settings[field] ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}>
                <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${settings[field] ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Data Source Indexing</h3>
          <div className="grid grid-cols-2 gap-3">
            {indexRows.map(([field, label]) => (
              <label key={field} className="flex items-center gap-3 p-3 border border-border/60 rounded-xl cursor-pointer hover:bg-muted/20 transition-colors">
                <input type="checkbox" checked={!!settings[field]} onChange={() => toggle(field)} className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-border/50">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md font-bold text-sm cursor-pointer disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save AI Settings
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================
// EMAIL & SMTP CONFIGURATION TAB
// =====================================================================
export function EmailSmtpTab() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('587');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [senderName, setSenderName] = useState('Kogi OneGov ERP');
  const [senderEmail, setSenderEmail] = useState('noreply@kogistate.gov.ng');
  const [encryptionType, setEncryptionType] = useState('STARTTLS');
  const [isEnabled, setIsEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        
        const settings = await dbGetSmtpSettings();
        if (settings) {
          setHost(settings.host || '');
          setPort(String(settings.port || '587'));
          setUsername(settings.username || '');
          setSenderName(settings.sender_name || 'Kogi OneGov ERP');
          setSenderEmail(settings.sender_email || 'noreply@kogistate.gov.ng');
          setEncryptionType(settings.encryption_type || 'STARTTLS');
          setIsEnabled(settings.is_enabled !== false);
          // Set password to placeholder if it exists in DB
          setPassword('');
        }
      } catch (err) {
        console.error('Failed to load SMTP settings:', err);
      }
      setLoading(false);
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host || !port) {
      alert('SMTP Host and Port are required.');
      return;
    }

    setSaving(true);
    try {
      
      await dbSaveSmtpSettings({
        data: {
          host,
          port: Number(port),
          username,
          password: password || undefined, // only send password if user typed a new one
          senderName,
          senderEmail,
          encryptionType,
          isEnabled
        }
      });
      alert('SMTP & Email Automation settings updated and secured successfully.');
      setPassword(''); // clear input field
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
    setSaving(false);
  };

  const handleTestConnection = async () => {
    if (!host || !port) {
      alert('Provide host and port to run verification.');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      
      const res = await dbTestSmtpConnection({
        data: {
          host,
          port: Number(port),
          username,
          password,
          encryptionType
        }
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Handshake failed.' });
    }
    setTesting(false);
  };

  if (loading) {
    return (
      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardContent className="p-12 text-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-xs">Loading secured SMTP keys...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-md">
      <CardHeader className="border-b border-border/50 bg-muted/10">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-black text-primary uppercase">Email &amp; SMTP Configuration</CardTitle>
            <CardDescription className="text-xs">Securely configure outbound mail servers. Super Admin clearance only. All credentials encrypted.</CardDescription>
          </div>
          <button 
            type="button" 
            onClick={() => setIsEnabled(!isEnabled)} 
            className={`px-3 py-1 rounded text-[10px] font-black uppercase border transition-colors cursor-pointer ${
              isEnabled 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}
          >
            {isEnabled ? 'Emails: Enabled' : 'Emails: Disabled'}
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">SMTP Outbound Host *</label>
              <input 
                required 
                type="text" 
                value={host} 
                onChange={e => setHost(e.target.value)} 
                className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground" 
                placeholder="e.g. smtp.mailgun.org or smtp.gmail.com" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Port *</label>
              <input 
                required 
                type="text" 
                value={port} 
                onChange={e => setPort(e.target.value)} 
                className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground font-mono" 
                placeholder="e.g. 587 or 465" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">SMTP Username (Email)</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground" 
                placeholder="e.g. key-abcde@domain.com" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">SMTP Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground" 
                placeholder={password ? '••••••••' : 'Enter new SMTP password to update'} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Sender Display Name</label>
              <input 
                type="text" 
                value={senderName} 
                onChange={e => setSenderName(e.target.value)} 
                className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground" 
                placeholder="Kogi State Government" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Sender Email Address</label>
              <input 
                type="email" 
                value={senderEmail} 
                onChange={e => setSenderEmail(e.target.value)} 
                className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground" 
                placeholder="noreply@kogistate.gov.ng" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Encryption Type</label>
              <select 
                value={encryptionType} 
                onChange={e => setEncryptionType(e.target.value)} 
                className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground cursor-pointer"
              >
                <option value="STARTTLS" className="text-foreground bg-background">STARTTLS (Opportunistic TLS)</option>
                <option value="TLS" className="text-foreground bg-background">SSL / TLS (Forced Secure)</option>
                <option value="NONE" className="text-foreground bg-background">None (Plaintext)</option>
              </select>
            </div>
          </div>

          {testResult && (
            <div className={`p-3.5 rounded-lg border text-xs font-bold text-center ${
              testResult.success 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
            }`}>
              {testResult.success ? '✅' : '❌'} {testResult.message}
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-border/50">
            <button 
              type="button"
              disabled={testing}
              onClick={handleTestConnection}
              className="px-4 py-2 bg-muted hover:bg-accent border border-border text-foreground font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {testing && <Loader2 className="size-3.5 animate-spin" />}
              Test Connection
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-lg shadow hover:bg-primary/95 transition-colors cursor-pointer flex items-center gap-2"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save &amp; Secure SMTP
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

