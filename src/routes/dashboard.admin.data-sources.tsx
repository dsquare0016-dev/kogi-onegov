import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Server, FileCode2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getDataSourceStatus } from '@/lib/systemDataService';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/dashboard/admin/data-sources')({
  component: DataSourcesComponent,
})

function DataSourcesComponent() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSources = async () => {
    setLoading(true);
    const res = await getDataSourceStatus();
    if (res.value) {
      setSources(res.value);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="size-5 text-emerald-500" />;
      case 'mock': return <AlertTriangle className="size-5 text-amber-500" />;
      case 'not_connected': return <XCircle className="size-5 text-slate-400" />;
      case 'error': return <XCircle className="size-5 text-red-500" />;
      default: return <Server className="size-5 text-muted-foreground" />;
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'connected': return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">Live Connected</Badge>;
      case 'mock': return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">Using Mock Data</Badge>;
      case 'not_connected': return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200">Not Connected</Badge>;
      case 'error': return <Badge variant="destructive">Connection Error</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Sources & Connections</h1>
          <p className="text-muted-foreground mt-1">Monitor live database connections, service files, and table mappings across the ERP.</p>
        </div>
        <button 
          onClick={fetchSources}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          Test All Connections
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && sources.length === 0 ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48"></CardContent>
            </Card>
          ))
        ) : (
          sources.map((source) => (
            <Card key={source.id} className="border-border/60 hover:border-primary/30 transition-colors shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${source.status === 'connected' ? 'bg-emerald-50' : source.status === 'mock' ? 'bg-amber-50' : 'bg-slate-50'}`}>
                      <Database className={`size-6 ${source.status === 'connected' ? 'text-emerald-500' : source.status === 'mock' ? 'text-amber-500' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{source.name}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-0.5">{source.records.toLocaleString()} records indexed</div>
                    </div>
                  </div>
                  <StatusIcon status={source.status} />
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={source.status} />
                </div>
                
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <FileCode2 className="size-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Service File:</span>
                    <span className="font-mono font-medium">{source.serviceFile}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Server className="size-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Target Table:</span>
                    <span className="font-mono font-medium">{source.expectedTable}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-1.5 text-xs font-semibold border border-input bg-background hover:bg-accent rounded-md transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 px-3 py-1.5 text-xs font-semibold border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 rounded-md transition-colors">
                    Test Connection
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
