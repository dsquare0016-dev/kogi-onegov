import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Database, HardDrive, ServerCrash, Save, Download, RefreshCw, 
  Loader2, CheckCircle2, AlertTriangle, Play, Sparkles, AlertOctagon, HelpCircle 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  getInfrastructureMetrics, getDatabaseBackups, getBackupSettings, 
  updateBackupSettings, optimizeDatabaseTables, DatabaseBackup, 
  InfrastructureMetrics, createDatabaseBackupRecord 
} from '@/lib/systemDataService';

export const Route = createFileRoute('/dashboard/admin/infrastructure')({
  component: AdminInfrastructureComponent,
})

function AdminInfrastructureComponent() {
  const [activeTab, setActiveTab] = useState('database');
  const [metrics, setMetrics] = useState<InfrastructureMetrics | null>(null);
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
  const [backupSettings, setBackupSettings] = useState<{ frequency: string }>({ frequency: 'Daily at 00:00' });
  const [loading, setLoading] = useState(true);

  // Operation states
  const [isExporting, setIsExporting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [optimizationMsg, setOptimizationMsg] = useState<string | null>(null);

  const fetchInfrastructureData = async () => {
    setLoading(true);
    const [metricsRes, backupsRes, settingsRes] = await Promise.all([
      getInfrastructureMetrics(),
      getDatabaseBackups(),
      getBackupSettings()
    ]);
    if (metricsRes.value) setMetrics(metricsRes.value);
    if (backupsRes.value) setBackups(backupsRes.value);
    if (settingsRes.value) setBackupSettings(settingsRes.value);
    setLoading(false);
  };

  useEffect(() => {
    fetchInfrastructureData();
  }, []);

  const handleExportDump = async () => {
    setIsExporting(true);
    try {
      const collectionsToCheck = [
        'users', 'nominal_roll', 'memos', 'tasks', 'lgas', 
        'budget_allocations', 'projects', 'exco_resolutions', 
        'legislative_bills', 'governance_risk_alerts', 'mda_compliance', 
        'ministries', 'departments', 'agencies'
      ];
      const dump: Record<string, any[]> = {};
      const { safeGetCollection } = await import('@/lib/firebase');
      
      for (const colName of collectionsToCheck) {
        dump[colName] = await safeGetCollection(colName, []);
      }
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dump, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `Kogi_OneGov_DB_Dump_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error("Database export failed:", error);
      alert("Failed to export database dump.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptimizeTables = async () => {
    setIsOptimizing(true);
    setOptimizationMsg(null);
    try {
      const res = await optimizeDatabaseTables();
      setOptimizationMsg(res.message);
      
      // refresh metrics
      const metricsRes = await getInfrastructureMetrics();
      if (metricsRes.value) setMetrics(metricsRes.value);
    } catch {
      setOptimizationMsg("Table optimization failed.");
    } finally {
      setIsOptimizing(false);
      setTimeout(() => setOptimizationMsg(null), 5000);
    }
  };

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    try {
      const collectionsToCheck = [
        'users', 'nominal_roll', 'memos', 'tasks', 'lgas', 
        'budget_allocations', 'projects', 'exco_resolutions', 
        'legislative_bills', 'governance_risk_alerts', 'mda_compliance', 
        'ministries', 'departments', 'agencies'
      ];
      let totalCount = 0;
      const payloadData: Record<string, any[]> = {};
      const { safeGetCollection } = await import('@/lib/firebase');
      
      for (const colName of collectionsToCheck) {
        const list = await safeGetCollection(colName, []);
        payloadData[colName] = list;
        totalCount += list.length;
      }
      
      const payloadStr = JSON.stringify(payloadData);
      const sizeMB = (payloadStr.length / (1024 * 1024)).toFixed(2);

      const newBackup: DatabaseBackup = {
        id: `backup-${Date.now()}`,
        name: `Backup_${new Date().toISOString().replace(/T/, '_').substring(0, 19).replace(/:/g, '-')}.json`,
        recordCount: totalCount,
        size: `${sizeMB} MB`,
        timestamp: new Date().toISOString(),
        createdBy: 'Super Admin',
        payload: payloadStr
      };
      
      await createDatabaseBackupRecord(newBackup);
      
      // Refresh list
      const backupsRes = await getDatabaseBackups();
      if (backupsRes.value) setBackups(backupsRes.value);

      // Refresh metrics
      const metricsRes = await getInfrastructureMetrics();
      if (metricsRes.value) setMetrics(metricsRes.value);

      alert(`Backup snapshot successfully created: ${newBackup.name}`);
    } catch (error) {
      console.error("Backup creation failed:", error);
      alert("Failed to create snapshot.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = async (b: DatabaseBackup) => {
    if (!confirm(`Are you sure you want to restore database snapshot "${b.name}"? This will overwrite existing records in all active tables.`)) {
      return;
    }
    setIsRestoring(b.id);
    try {
      if (!b.payload) {
        // Fallback check: if default placeholder backup, build mock payload
        if (b.id === 'backup-1' || b.id === 'backup-2') {
          alert("Default placeholder snapshot contains no real recovery payload.");
          setIsRestoring(null);
          return;
        }
        alert("Restoration failed: Snapshot payload is empty.");
        setIsRestoring(null);
        return;
      }

      const payload = JSON.parse(b.payload);
      const { safeSetDoc } = await import('@/lib/firebase');
      
      for (const colName of Object.keys(payload)) {
        const list = payload[colName];
        if (Array.isArray(list)) {
          for (const docItem of list) {
            const docId = docItem.id || docItem.staffId || docItem.code || null;
            if (docId) {
              await safeSetDoc(colName, docId, docItem);
            }
          }
        }
      }
      
      alert(`Restore successful! Database has been rolled back to snapshot "${b.name}".`);
      
      // Refresh metrics
      const metricsRes = await getInfrastructureMetrics();
      if (metricsRes.value) setMetrics(metricsRes.value);
    } catch (err) {
      console.error("Failed to restore backup snapshot:", err);
      alert("Restoration failed due to schema mismatch or JSON corruption.");
    } finally {
      setIsRestoring(null);
    }
  };

  const handleFrequencyChange = async (frequency: string) => {
    setBackupSettings({ frequency });
    await updateBackupSettings(frequency);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground animate-pulse">
          Loading Infrastructure Services...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24 text-foreground animate-in fade-in zoom-in-95">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Infrastructure & Data
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm max-w-xl">
            Real-time PostgreSQL cluster diagnostics, Firestore table monitors, cloud object storage, and automated recovery centers.
          </p>
        </div>
        <button 
          onClick={fetchInfrastructureData}
          className="flex items-center gap-1.5 px-4 py-2 border border-border bg-card rounded-lg text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
        >
          <RefreshCw className="size-3.5" /> Refresh Diagnostics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <div className="flex flex-col gap-2">
          <TabButton id="database" label="Database Management" icon={Database} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="storage" label="File Storage Limits" icon={HardDrive} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="backup" label="Backup & Recovery" icon={ServerCrash} activeTab={activeTab} onClick={setActiveTab} />
        </div>

        <div className="md:col-span-3">
          
          {activeTab === 'database' && metrics && (
            <div className="space-y-6">
              {optimizationMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="size-4" /> {optimizationMsg}
                </div>
              )}

              <Card className="border-border/60 shadow-md">
                <CardHeader className="border-b border-border/50 bg-muted/10">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="size-5 text-[#C5A059]" /> Database Cluster Status
                  </CardTitle>
                  <CardDescription className="text-xs">Live Postgres metrics compiled from Firestore active collection document registries.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <MetricBox 
                      label="Database Status" 
                      value={metrics.dbStatus} 
                      color={metrics.dbStatus === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'} 
                    />
                    <MetricBox 
                      label="Record Count" 
                      value={metrics.totalRecords.toLocaleString()} 
                    />
                    <MetricBox 
                      label="Storage Allocation" 
                      value={metrics.storageUsed.split(' / ')[0]} 
                    />
                  </div>
                  <div className="pt-4 border-t border-border/50 flex gap-4">
                    <button 
                      onClick={handleExportDump}
                      disabled={isExporting}
                      className="px-4 py-2 border border-border bg-card rounded-md text-xs font-bold hover:bg-muted transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
                    >
                      {isExporting ? <Loader2 className="size-4 animate-spin text-[#C5A059]" /> : <Download className="size-4 text-[#C5A059]" />} 
                      Export DB Dump (.json)
                    </button>
                    <button 
                      onClick={handleOptimizeTables}
                      disabled={isOptimizing}
                      className="px-4 py-2 border border-border bg-card rounded-md text-xs font-bold hover:bg-muted transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
                    >
                      {isOptimizing && <Loader2 className="size-4 animate-spin text-primary" />}
                      Optimize Tables
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'storage' && metrics && (
            <Card className="border-border/60 shadow-md">
              <CardHeader className="border-b border-border/50 bg-muted/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <HardDrive className="size-5 text-[#C5A059]" /> File Storage (GCS/S3 Bucket)
                </CardTitle>
                <CardDescription className="text-xs">Monitor object storage limits, attachment sizes, and static asset directory quotas.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                 <div>
                   <div className="flex justify-between mb-2 text-xs font-bold">
                     <span>Total Storage Used: {metrics.storageUsed.split(' / ')[0]}</span>
                     <span className="text-muted-foreground">Quota Limit: 10 GB</span>
                   </div>
                   <div className="w-full bg-muted rounded-full h-3 overflow-hidden border border-border/40">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(100, (parseFloat(metrics.storageUsed) / 10) * 100)}%` }}
                      ></div>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 border border-border rounded-xl bg-muted/10 space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Evidence Files (Images/Attachments)</div>
                      <div className="text-xl font-extrabold text-foreground">{metrics.evidenceSize}</div>
                    </div>
                    <div className="p-4 border border-border rounded-xl bg-muted/10 space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Generated Reports (PDF/Excel)</div>
                      <div className="text-xl font-extrabold text-foreground">{metrics.reportsSize}</div>
                    </div>
                 </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'backup' && (
            <Card className="border-border/60 shadow-md">
              <CardHeader className="border-b border-border/50 bg-muted/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ServerCrash className="size-5 text-rose-500 animate-pulse" /> Disaster Recovery Center
                    </CardTitle>
                    <CardDescription className="text-xs">Trigger manual database table backups, restore historical snapshots, or change frequency.</CardDescription>
                  </div>
                  <button 
                    onClick={handleManualBackup}
                    disabled={isBackingUp}
                    className="flex items-center gap-1.5 bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-rose-600 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isBackingUp ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />} Trigger Manual Backup Now
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                 <div className="flex items-center gap-4 bg-muted/20 p-4 border border-border rounded-xl">
                    <label className="text-xs font-bold text-foreground">Automated Backup Frequency:</label>
                    <select 
                      value={backupSettings.frequency}
                      onChange={e => handleFrequencyChange(e.target.value)}
                      className="p-2 bg-card border border-border rounded-md text-xs font-bold focus:ring-1 focus:ring-primary/50 outline-none"
                    >
                      <option value="Daily at 00:00">Daily at 00:00</option>
                      <option value="Weekly (Sundays)">Weekly (Sundays)</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                 </div>
                 
                 <div className="p-4 border border-border rounded-xl bg-card space-y-3">
                   <h3 className="text-xs font-black uppercase tracking-widest text-[#C5A059] flex items-center gap-1.5"><Sparkles className="size-3.5" /> Latest Snapshots</h3>
                   <div className="overflow-x-auto border border-border rounded-xl">
                     <table className="w-full text-left border-collapse">
                       <thead>
                         <tr className="bg-muted/30 text-[9px] uppercase font-bold tracking-wider text-muted-foreground border-b border-border">
                           <th className="px-4 py-3">File Name</th>
                           <th className="px-4 py-3 text-right">Size</th>
                           <th className="px-4 py-3 text-right">Records</th>
                           <th className="px-4 py-3 text-center">Timestamp</th>
                           <th className="px-4 py-3 text-center">Action</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-border/60 text-xs font-semibold">
                         {backups.length === 0 ? (
                           <tr>
                             <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                               No historical backup snapshots registered.
                             </td>
                           </tr>
                         ) : (
                           backups.map(b => (
                             <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                               <td className="px-4 py-3 font-mono font-bold text-foreground max-w-[200px] truncate">{b.name}</td>
                               <td className="px-4 py-3 text-right text-muted-foreground font-mono">{b.size}</td>
                               <td className="px-4 py-3 text-right font-mono">{b.recordCount.toLocaleString()}</td>
                               <td className="px-4 py-3 text-center text-muted-foreground font-mono text-[10px]">{new Date(b.timestamp).toLocaleString()}</td>
                               <td className="px-4 py-3 text-center">
                                 <button 
                                   onClick={() => handleRestoreBackup(b)}
                                   disabled={!!isRestoring}
                                   className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 rounded hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-60"
                                 >
                                   {isRestoring === b.id ? <Loader2 className="size-3 animate-spin inline mr-1" /> : null}
                                   Restore
                                 </button>
                               </td>
                             </tr>
                           ))
                         )}
                       </tbody>
                     </table>
                   </div>
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
      ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
    >
      <Icon className={`size-4 ${isActive ? 'text-primary-foreground' : 'text-[#C5A059]'}`} />
      {label}
    </button>
  )
}

function MetricBox({ label, value, color }: { label: string, value: string, color?: string }) {
  return (
    <div className="border border-border p-4 rounded-xl bg-muted/20">
      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-black ${color || 'text-foreground'}`}>{value}</div>
    </div>
  )
}
