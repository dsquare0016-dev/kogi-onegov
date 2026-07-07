import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Activity, AlertTriangle, Lightbulb, Clock, BrainCircuit, Loader2, Database, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/dashboard/intelligence')({
  component: IntelligenceOverviewPage,
});

function IntelligenceOverviewPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const { safeGetCollection } = await import('@/lib/firebase');
      const data = await safeGetCollection('governance_risk_alerts', []);
      if (data.length === 0) {
        setIsFallback(true);
      } else {
        setAlerts(data);
        setIsFallback(false);
      }
    } catch (e) {
      console.error(e);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 h-[60vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading AI intelligence models...</p>
      </div>
    );
  }

  // Fallbacks
  const displayedAlerts = isFallback ? [
    {
      id: "alert-1",
      title: "Projected Budget Shortfall (Q3)",
      description: "Analysis of current expenditure rates in the Ministry of Works suggests a 15% budget exhaustion before Q4 if current spending on road rehabilitation continues at this velocity.",
      level: "Critical",
      source: "Expenditure Model"
    },
    {
      id: "alert-2",
      title: "Procurement Bottleneck Detected",
      description: "Average turnaround time for contractor clearance in the Due Process Office has increased by 4.2 days over the last month, potentially delaying 12 active infrastructure projects.",
      level: "Warning",
      source: "Procurement Audit"
    }
  ] : alerts.map(a => ({
    id: a.id,
    title: a.title,
    description: a.description,
    level: a.level || 'Warning',
    source: a.source || 'AI Audits'
  }));

  const criticalCount = displayedAlerts.filter(a => a.level === 'Critical').length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto pb-24 space-y-6 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Intelligence & Forecasting</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Predictive analytics, AI-driven risk alerts, and sentiment analysis for proactive governance.
          </p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded-md text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
        >
          <Loader2 className="size-3.5" /> Sync AI Models
        </button>
      </div>

      {isFallback && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <AlertCircle className="size-4 shrink-0 text-amber-500 animate-pulse" /> 
            AI Intelligence Risk Alerts Empty / Offline Fallback Mode
          </div>
          <p className="leading-relaxed">
            This module relies on live database content from the Firestore collection <code className="bg-amber-500/15 px-1.5 py-0.5 rounded font-mono font-bold">governance_risk_alerts</code>. 
            If no records exist, the page displays mock cached risk assessments.
          </p>
          <div className="pt-1">
            <span className="font-bold">Required Data Action:</span> Run simulations, write risk briefs, or trigger alerts inside the <Link to="/dashboard/reports/ai-studio" className="font-extrabold underline text-amber-700 hover:text-amber-800">AI Governance Studio (/dashboard/reports/ai-studio)</Link>.
          </div>
        </div>
      )}

      {!isFallback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs flex items-center gap-2 font-bold">
          <Database className="size-4 shrink-0 text-emerald-500" /> Live Data Connected: Fetched {alerts.length} live AI risk alerts from Firestore.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-indigo-500/30 shadow-sm bg-indigo-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
              <BrainCircuit className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Predictive Engine Status</h3>
            </div>
            <div className="text-xl font-bold text-foreground mt-4 text-indigo-700 dark:text-indigo-400">
              Online & Analyzing
            </div>
            <div className="text-xs text-muted-foreground mt-1">Scanning 42,000+ data points daily</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-amber-600 mb-2">
              <AlertTriangle className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Critical AI Forecasts</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">{criticalCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Actionable alerts generated this week</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <Activity className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Citizen Sentiment</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">Positive (62%)</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Based on processed grievance reports & feedback
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* AI Risk Alerts */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="size-5 text-indigo-600" /> AI-Generated Risk Forecasts
            </CardTitle>
            <CardDescription>Predictive models highlighting potential bottlenecks before they occur.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border/50">
               {displayedAlerts.map((a, i) => {
                 const isCrit = a.level === 'Critical';
                 return (
                   <div key={i} className={`p-5 hover:bg-muted/10 transition-colors ${isCrit ? 'bg-red-500/5' : 'bg-amber-500/5'}`}>
                     <div className="flex gap-4">
                       <div className="mt-1">
                         <AlertTriangle className={`size-5 ${isCrit ? 'text-red-500' : 'text-amber-500'}`} />
                       </div>
                       <div>
                         <h4 className={`font-bold text-sm mb-1 ${isCrit ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                           {a.title}
                         </h4>
                         <p className="text-sm text-muted-foreground">{a.description}</p>
                         <span className="text-[10px] uppercase font-bold text-muted-foreground mt-2 block">Source: {a.source}</span>
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
