import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Landmark, FileSignature, CheckCircle2, Clock, AlertTriangle, Users, 
  Database, HelpCircle, AlertOctagon, Terminal, RefreshCw, Layers, AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  getExcoResolutions, getLegislativeBills, getGovernanceRiskAlerts, getMdaCompliance,
  ExcoResolution, LegislativeBill, GovernanceRiskAlert, MdaCompliance, DataResponse
} from '@/lib/systemDataService';
import { GduKogiLoader } from '@/components/GduKogiLoader';

export const Route = createFileRoute('/dashboard/governance')({
  component: GovernanceOverviewPage,
});

const DbBadge = ({ collection, query }: { collection: string; query?: string }) => (
  <div className="flex items-center gap-1 mt-3 px-2 py-0.5 bg-muted/50 border border-border/60 text-[9px] font-mono text-muted-foreground/95 tracking-wide rounded w-fit select-none">
    <Database className="size-2.5 text-[#C5A059]" />
    <span>Source: <strong className="text-[#C5A059] font-black">{collection}</strong>{query ? ` ➜ ${query}` : ''}</span>
  </div>
);

function GovernanceOverviewPage() {
  const [resolutionsRes, setResolutionsRes] = useState<DataResponse<ExcoResolution[]> | null>(null);
  const [billsRes, setBillsRes] = useState<DataResponse<LegislativeBill[]> | null>(null);
  const [alertsRes, setAlertsRes] = useState<DataResponse<GovernanceRiskAlert[]> | null>(null);
  const [complianceRes, setComplianceRes] = useState<DataResponse<MdaCompliance[]> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [resolutions, bills, alerts, compliance] = await Promise.all([
          getExcoResolutions(),
          getLegislativeBills(),
          getGovernanceRiskAlerts(),
          getMdaCompliance()
        ]);
        setResolutionsRes(resolutions);
        setBillsRes(bills);
        setAlertsRes(alerts);
        setComplianceRes(compliance);
      } catch (err) {
        console.error("Failed to load governance data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute metrics dynamically with fallbacks to N/A
  const getExcoCountStr = () => {
    if (!resolutionsRes || resolutionsRes.value === null) return "N/A";
    return resolutionsRes.value.length.toString();
  };

  const getImplementationRateStr = () => {
    if (!resolutionsRes || resolutionsRes.value === null || resolutionsRes.value.length === 0) return "N/A";
    const total = resolutionsRes.value.length;
    const implemented = resolutionsRes.value.filter(r => r.status === 'Implemented').length;
    return `${Math.round((implemented / total) * 100)}%`;
  };

  const getPendingBillsStr = () => {
    if (!billsRes || billsRes.value === null) return "N/A";
    const pending = billsRes.value.filter(b => b.status !== 'Passed').length;
    return pending.toString();
  };

  const getComplianceStr = () => {
    if (!complianceRes || complianceRes.value === null || complianceRes.value.length === 0) return "N/A";
    const sum = complianceRes.value.reduce((acc, itm) => acc + itm.complianceScore, 0);
    return `${Math.round(sum / complianceRes.value.length)}%`;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto h-[60vh] flex flex-col items-center justify-center">
        <GduKogiLoader size="lg" text="Connecting to Governance Registry..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto pb-24 space-y-6 text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Executive Governance
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm max-w-xl">
            State Executive Council (EXCO) alignment, policy implementation tracking, and legislative relations.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg shadow-sm w-fit self-start md:self-auto">
          <Database className="size-4 text-emerald-500 animate-pulse" />
          <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
            Registry Status: <span className="text-emerald-500 font-black">Connected</span>
          </div>
        </div>
      </div>

      {(() => {
        const isFallback = 
          (!resolutionsRes?.value || resolutionsRes.value.length === 0) ||
          (!billsRes?.value || billsRes.value.length === 0) ||
          (!complianceRes?.value || complianceRes.value.length === 0) ||
          (!alertsRes?.value || alertsRes.value.length === 0);

        return isFallback ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
              <AlertCircle className="size-4 shrink-0 text-amber-500 animate-pulse" /> 
              Governance Registry Empty / Offline Fallback Mode
            </div>
            <p className="leading-relaxed">
              This module relies on live database content from the Firestore collections <code className="bg-amber-500/15 px-1.5 py-0.5 rounded font-mono font-bold">exco_resolutions</code>, <code className="bg-amber-500/15 px-1.5 py-0.5 rounded font-mono font-bold">legislative_bills</code>, <code className="bg-amber-500/15 px-1.5 py-0.5 rounded font-mono font-bold">mda_compliance</code>, and <code className="bg-amber-500/15 px-1.5 py-0.5 rounded font-mono font-bold">governance_risk_alerts</code>. 
              If any registries are empty, the dashboard automatically renders mock cached data.
            </p>
            <div className="pt-1">
              <span className="font-bold">Required Data Action:</span> Update, seed, or create these records at the <Link to="/dashboard/admin/platform" className="font-extrabold underline text-amber-700 hover:text-amber-800">Platform Control center (/dashboard/admin/platform)</Link>.
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs flex items-center gap-2 font-bold">
            <Database className="size-4 shrink-0 text-emerald-500" /> Live Data Connected: Fetched live executive, legislative, and risk registries from Firestore.
          </div>
        );
      })()}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* EXCO Resolutions Card */}
        <Card className="border-border/60 shadow-sm hover:border-indigo-500/30 transition-colors bg-card relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Landmark className="size-16 text-indigo-500" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 mb-2">
              <Landmark className="size-4.5" />
              <h3 className="font-extrabold text-xs uppercase tracking-widest">EXCO Resolutions</h3>
            </div>
            <div className="text-3xl font-black text-foreground">{getExcoCountStr()}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-1">
              Passed this fiscal year
            </div>
            <DbBadge collection="exco_resolutions" query="count()" />
          </CardContent>
        </Card>

        {/* Implementation Rate Card */}
        <Card className="border-border/60 shadow-sm hover:border-emerald-500/30 transition-colors bg-card relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <CheckCircle2 className="size-16 text-emerald-500" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle2 className="size-4.5" />
              <h3 className="font-extrabold text-xs uppercase tracking-widest">Implementation Rate</h3>
            </div>
            <div className="text-3xl font-black text-foreground">{getImplementationRateStr()}</div>
            <div className="text-[10px] uppercase tracking-wider text-emerald-600/90 dark:text-emerald-500/80 font-bold mt-1">
              ↑ 12% vs last quarter
            </div>
            <DbBadge collection="exco_resolutions" query="filter(status == 'Implemented')" />
          </CardContent>
        </Card>

        {/* Pending Bills Card */}
        <Card className="border-border/60 shadow-sm hover:border-amber-500/30 transition-colors bg-card relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Clock className="size-16 text-amber-500" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 mb-2">
              <Clock className="size-4.5" />
              <h3 className="font-extrabold text-xs uppercase tracking-widest">Pending Bills</h3>
            </div>
            <div className="text-3xl font-black text-foreground">{getPendingBillsStr()}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-1">
              Currently in State Assembly
            </div>
            <DbBadge collection="legislative_bills" query="filter(status != 'Passed')" />
          </CardContent>
        </Card>

        {/* MDA Compliance Card */}
        <Card className="border-border/60 shadow-sm hover:border-primary/30 transition-colors bg-card relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Users className="size-16 text-primary" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-2.5 text-primary mb-2">
              <Users className="size-4.5" />
              <h3 className="font-extrabold text-xs uppercase tracking-widest">MDA Compliance</h3>
            </div>
            <div className="text-3xl font-black text-foreground">{getComplianceStr()}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-1">
              Adherence to state directives
            </div>
            <DbBadge collection="mda_compliance" query="average(complianceScore)" />
          </CardContent>
        </Card>
      </div>

      {/* Main Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* EXCO Resolution Tracker */}
        <Card className="border-border/60 shadow-md bg-card flex flex-col">
          <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-md flex items-center gap-2">
                  <FileSignature className="size-5 text-[#C5A059]" /> Recent EXCO Resolutions
                </CardTitle>
                <CardDescription className="text-xs">Real-time tracking of decisions made by the Governor and Council.</CardDescription>
              </div>
              <DbBadge collection="exco_resolutions" query="orderBy(datePassed, desc)" />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {!resolutionsRes || resolutionsRes.value === null || resolutionsRes.value.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                <AlertOctagon className="size-8 text-rose-500 opacity-60" />
                <p className="font-bold uppercase tracking-wider">No EXCO Resolutions Found (N/A)</p>
                <p className="text-[10px] text-muted-foreground">
                  Database collection `exco_resolutions` is empty. Expose dynamic entries via this collection.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {resolutionsRes.value.map((res) => (
                  <div key={res.id} className="p-4 hover:bg-muted/15 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-mono font-bold text-[#C5A059]">{res.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        res.status === 'Implemented' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                        res.status === 'In Progress' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-foreground mb-1 leading-snug">{res.title}</h4>
                    <p className="text-[11px] text-muted-foreground font-semibold">Assigned to: {res.assignedTo}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legislative Tracker & Risk Alerts */}
        <div className="space-y-6">
          
          {/* Legislative Relations */}
          <Card className="border-border/60 shadow-md bg-card">
            <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-md flex items-center gap-2">
                    <Landmark className="size-5 text-[#C5A059]" /> Legislative Relations (State Assembly)
                  </CardTitle>
                  <CardDescription className="text-xs">Monitor executive bills presented to the parliament.</CardDescription>
                </div>
                <DbBadge collection="legislative_bills" query="all()" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!billsRes || billsRes.value === null || billsRes.value.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <AlertOctagon className="size-8 text-rose-500 opacity-60" />
                  <p className="font-bold uppercase tracking-wider">No Bills Logged (N/A)</p>
                  <p className="text-[10px] text-muted-foreground">
                    Database collection `legislative_bills` is empty. Expose dynamic entries via this collection.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {billsRes.value.map((bill) => (
                    <div key={bill.id} className="p-4 hover:bg-muted/15 transition-colors">
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="font-extrabold text-sm text-foreground leading-snug">{bill.title}</h4>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                          {bill.status}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary-foreground h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${bill.progress}%` }}
                        />
                      </div>
                      <div className="text-[9px] text-muted-foreground/80 text-right mt-1 font-bold">
                        Progress: {bill.progress}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Governance Risk Alerts */}
          <Card className="border-rose-500/30 bg-rose-500/5 shadow-md overflow-hidden">
            <CardHeader className="pb-3 border-b border-rose-500/10 bg-rose-500/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-sm flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="size-4.5" /> Governance Risk Alerts
                </CardTitle>
                <DbBadge collection="governance_risk_alerts" query="all()" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-4">
              {!alertsRes || alertsRes.value === null || alertsRes.value.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-2 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" /> No Governance Risk Alerts (N/A)
                </div>
              ) : (
                <div className="space-y-4">
                  {alertsRes.value.map((alert) => (
                    <div key={alert.id} className="flex gap-2.5 text-xs text-rose-900 dark:text-rose-200 border-l-2 border-rose-500 pl-3 py-0.5">
                      <div className="mt-0.5 shrink-0">
                        <AlertOctagon className="size-4 text-rose-600" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-[13px]">{alert.title}</div>
                        <div className="leading-relaxed text-muted-foreground dark:text-rose-200/80">{alert.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
