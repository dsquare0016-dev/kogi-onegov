import { dbGetDeletedRecords, dbRestoreDeletedRecord, dbPurgeDeletedRecord } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, RotateCcw, ShieldAlert, FileText, UserX, FolderKanban, Loader2, RefreshCw, Filter } from 'lucide-react';
import { getSession, roleById } from '@/lib/auth';
import { useState, useEffect, useCallback } from 'react';

export const Route = createFileRoute('/dashboard/admin/recovery')({
  component: AdminRecoveryComponent,
});

function AdminRecoveryComponent() {
  const session = getSession();
  const role = session ? roleById(session.role) : null;
  const isSuperAdmin = role?.id === 'dg_gdu' || role?.id === 'governor' || (session as any)?.role === 'super_admin';

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      
      const data = await dbGetDeletedRecords({ data: { entityType: entityFilter || undefined } });
      setRecords(data);
    } catch (err) {
      console.error('Failed to load deleted records', err);
    }
    setLoading(false);
  }, [entityFilter]);

  useEffect(() => { load(); }, [load]);

  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`Restore "${name}"? It will be reactivated in the system.`)) return;
    setActionLoading(id);
    try {
      
      await dbRestoreDeletedRecord({ data: { id } });
      await load();
      setMsg({ text: `"${name}" restored successfully.`, type: 'success' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' });
    }
    setActionLoading(null);
  };

  const handlePurge = async (id: string, name: string) => {
    if (!confirm(`⚠️ PERMANENTLY DELETE "${name}"? This action CANNOT be undone. All associated data will be removed.`)) return;
    setActionLoading(id);
    try {
      
      await dbPurgeDeletedRecord({ data: { id } });
      await load();
      setMsg({ text: `"${name}" permanently purged from the database.`, type: 'success' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' });
    }
    setActionLoading(null);
  };

  const entityTypes = ['Project', 'Staff', 'User', 'Budget', 'Activity', 'Task', 'Organization', 'Document', 'E-Memo'];

  const iconForType = (type: string) => {
    if (type?.toLowerCase().includes('project')) return FolderKanban;
    if (type?.toLowerCase().includes('staff') || type?.toLowerCase().includes('user')) return UserX;
    return FileText;
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24 text-foreground">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Data Recovery Center</h1>
        <p className="text-muted-foreground mt-1">System-wide recycle bin. Deleted records are soft-deleted and retained in PostgreSQL to prevent accidental data loss.</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex items-start gap-3">
        <ShieldAlert className="size-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Super Admin Protection Enabled</h4>
          <p className="text-xs mt-1">
            All soft-deleted records land here. Only designated Super Administrators (DG GDU or Governor) can permanently purge. Standard admins may only view or restore.
          </p>
        </div>
      </div>

      {msg && (
        <div className={`p-3 border rounded-xl text-xs font-bold flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'}`}>
          {msg.text}
        </div>
      )}

      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="border-b border-border/50 bg-muted/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="font-black">Deleted Items ({records.length})</CardTitle>
              <CardDescription>Review and manage soft-deleted platform records.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-background border border-border rounded-md px-2 h-8">
                <Filter className="size-3.5 text-muted-foreground" />
                <select value={entityFilter} onChange={e => { setEntityFilter(e.target.value); }} className="bg-transparent text-xs outline-none py-1 cursor-pointer">
                  <option value="">All Types</option>
                  {entityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={load} disabled={loading} className="p-1.5 bg-background border border-border rounded-md hover:bg-muted transition-colors">
                <RefreshCw className={`size-4 ${loading ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider border-b border-border font-bold">
                  <tr>
                    <th className="p-4">Record Type & Details</th>
                    <th className="p-4">Deleted By</th>
                    <th className="p-4">Date Deleted</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-muted-foreground text-xs">
                        No deleted records found. All data is intact.
                      </td>
                    </tr>
                  ) : records.map((rec: any) => {
                    const Icon = iconForType(rec.entity_type);
                    const isLoading = actionLoading === rec.id;
                    return (
                      <tr key={rec.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg shrink-0">
                              <Icon className="size-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-bold text-sm">{rec.entity_name || rec.record_name || `Record #${rec.id?.slice(0, 8)}`}</div>
                              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{rec.entity_type || 'Unknown'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs">{rec.deleted_by_email || rec.deleted_by || '—'}</td>
                        <td className="p-4 text-xs text-muted-foreground font-mono">
                          {rec.deleted_at ? new Date(rec.deleted_at).toLocaleString() : '—'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleRestore(rec.id, rec.entity_name || 'record')}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {isLoading ? <Loader2 className="size-3 animate-spin" /> : <RotateCcw className="size-3" />} Restore
                          </button>
                          {isSuperAdmin ? (
                            <button
                              onClick={() => handlePurge(rec.id, rec.entity_name || 'record')}
                              disabled={isLoading || rec.purge_locked}
                              className="px-3 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                              title={rec.purge_locked ? 'This record is locked from purging' : 'Permanently delete'}
                            >
                              {isLoading ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                              {rec.purge_locked ? 'Locked' : 'Purge'}
                            </button>
                          ) : (
                            <button disabled className="px-3 py-1.5 bg-muted text-muted-foreground/50 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 cursor-not-allowed" title="Only Super Admins can purge data">
                              <Trash2 className="size-3 opacity-50" /> Purge (Locked)
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
