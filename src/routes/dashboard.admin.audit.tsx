import { dbGetAuditLogs } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History, Search, Download, Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useCallback } from 'react';

export const Route = createFileRoute('/dashboard/admin/audit')({
  component: AdminAuditLogsComponent,
})

function AdminAuditLogsComponent() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const LIMIT = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      
      const result = await dbGetAuditLogs({ data: { page, search: search || undefined, fromDate: fromDate || undefined, toDate: toDate || undefined } });
      setLogs(result.rows || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs', err);
      setLogs([]);
    }
    setLoading(false);
  }, [page, search, fromDate, toDate]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  const actionColors: Record<string, string> = {
    'CREATE': 'bg-blue-500/10 text-blue-600',
    'UPDATE': 'bg-amber-500/10 text-amber-600',
    'DELETE': 'bg-rose-500/10 text-rose-600',
    'LOGIN': 'bg-emerald-500/10 text-emerald-600',
    'LOGOUT': 'bg-slate-500/10 text-slate-600',
    'TOGGLE': 'bg-purple-500/10 text-purple-600',
    'RESTORE': 'bg-cyan-500/10 text-cyan-600',
    'APPROVE': 'bg-green-500/10 text-green-600',
  };

  const getActionColor = (action: string) => {
    const key = Object.keys(actionColors).find(k => action?.toUpperCase().includes(k));
    return key ? actionColors[key] : 'bg-muted text-foreground';
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24 text-foreground">
      <div>
        <h1 className="text-3xl font-black tracking-tight">System Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Immutable record of all login events, data modifications, approvals, and system actions stored in PostgreSQL.</p>
      </div>

      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="font-black flex items-center gap-2"><History className="size-5 text-primary" /> Master Log History</CardTitle>
              <CardDescription>{total.toLocaleString()} events recorded. Retained for 7 years per government compliance.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} className="p-1.5 bg-background border border-border rounded-md text-xs" />
              <span className="text-xs text-muted-foreground">to</span>
              <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} className="p-1.5 bg-background border border-border rounded-md text-xs" />
              <button onClick={load} disabled={loading} className="p-1.5 bg-background border border-border rounded-md hover:bg-muted transition-colors" title="Refresh">
                <RefreshCw className={`size-4 ${loading ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-xs focus:outline-none focus:border-primary/50"
                placeholder="Search action, user email..."
              />
            </div>
            <button onClick={handleSearch} className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 cursor-pointer">Search</button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-muted-foreground bg-muted/50 uppercase border-b border-border tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Table / Record</th>
                      <th className="px-4 py-3">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {logs.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-xs">No audit logs found for the selected filters.</td></tr>
                    ) : logs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground font-mono">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-bold text-foreground">{log.user_name || log.user_email || log.user_id || 'System'}</div>
                          {log.user_email && log.user_name && <div className="text-[10px] text-muted-foreground">{log.user_email}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getActionColor(log.action)}`}>{log.action}</span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                          {log.table_name || '—'}
                          {log.record_id && <span className="ml-1 opacity-60">#{log.record_id?.slice(0, 8)}</span>}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{log.ip_address || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 text-xs text-muted-foreground">
                  <span>Page {page} of {totalPages} · {total.toLocaleString()} total records</span>
                  <div className="flex items-center gap-1.5">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1 hover:bg-muted rounded disabled:opacity-40 cursor-pointer"><ChevronLeft className="size-4" /></button>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1 hover:bg-muted rounded disabled:opacity-40 cursor-pointer"><ChevronRight className="size-4" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
