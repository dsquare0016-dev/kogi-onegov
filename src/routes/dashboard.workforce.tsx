import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserMinus, ShieldAlert, Activity, UserCheck, Loader2, Database, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getWorkforceOverview, WorkforceOverview } from '@/lib/systemDataService';

export const Route = createFileRoute('/dashboard/workforce')({
  component: WorkforceOverviewPage,
});

function WorkforceOverviewPage() {
  const [dataRes, setDataRes] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkforce = async () => {
    setLoading(true);
    const res = await getWorkforceOverview();
    setDataRes(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkforce();
  }, []);

  if (loading) {
    return (
      <div className="p-6 h-[60vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading Workforce intelligence...</p>
      </div>
    );
  }

  // Fallbacks if database is empty/not connected
  const isFallback = !dataRes || dataRes.status === 'not_connected';
  const metrics: WorkforceOverview = dataRes?.value || {
    totalActive: 34892,
    biometricPercent: 98.4,
    retirementsCount: 845,
    ghostWorkersCount: 124,
    glDistribution: [
      { name: "GL 01 - GL 06 (Junior Staff)", percentage: 42 },
      { name: "GL 07 - GL 10 (Mid-level Staff)", percentage: 35 },
      { name: "GL 12 - GL 14 (Senior Staff)", percentage: 18 },
      { name: "GL 15 - GL 17 (Management / Directorate)", percentage: 5 }
    ],
    mdaRoll: [
      { name: "Ministry of Education (SUBEB & STETSCOM)", count: 14230, pct: 40.7 },
      { name: "Ministry of Health", count: 6840, pct: 19.6 },
      { name: "Ministry of Works & Infrastructure", count: 2150, pct: 6.1 }
    ]
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto pb-24 space-y-6 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Executive Workforce Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Statewide nominal roll, human capital distribution, and civil service health metrics.
          </p>
        </div>
        <button 
          onClick={fetchWorkforce}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded-md text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
        >
          <Loader2 className="size-3.5" /> Refresh Roll
        </button>
      </div>

      {isFallback && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <AlertCircle className="size-4 shrink-0 text-amber-500 animate-pulse" /> 
            Nominal Roll Registry Empty / Offline Fallback Mode
          </div>
          <p className="leading-relaxed">
            This module relies on live database content from the Firestore collection <code className="bg-amber-500/15 px-1.5 py-0.5 rounded font-mono font-bold">nominal_roll</code>. 
            If no records exist or the database is not connected, the page displays mock cached data.
          </p>
          <div className="pt-1">
            <span className="font-bold">Required Data Action:</span> Seed or import workforce records by uploading the official staff sheet at the <Link to="/dashboard/staff/upload" className="font-extrabold underline text-amber-700 hover:text-amber-800">Staff Import Panel (/dashboard/staff/upload)</Link>.
          </div>
        </div>
      )}

      {!isFallback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs flex items-center gap-2 font-bold">
          <Database className="size-4 shrink-0 text-emerald-500" /> Live Data Connected: Fetched {metrics.totalActive.toLocaleString()} active staff profiles from Firestore.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/60 shadow-sm bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-primary mb-2">
              <Users className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Total Active Staff</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">{metrics.totalActive.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Across MDAs & LGAs</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <UserCheck className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Biometric Verified</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">{metrics.biometricPercent}%</div>
            <div className="text-xs text-muted-foreground mt-1">Cleared by verification committee</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-amber-600 mb-2">
              <UserMinus className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Imminent Retirements</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">{metrics.retirementsCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Exiting in the next 12 months</div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <ShieldAlert className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Flagged Ghost Workers</h3>
            </div>
            <div className="text-3xl font-bold text-red-700 dark:text-red-400">{metrics.ghostWorkersCount}</div>
            <div className="text-xs text-red-600/80 mt-1">Salaries frozen pending investigation</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cadre Distribution Chart */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="size-5 text-primary" /> Grade Level (GL) Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {metrics.glDistribution.map((gl, index) => {
                const colors = ["bg-primary", "bg-emerald-500", "bg-amber-500", "bg-indigo-500"];
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{gl.name}</span>
                      <span className="text-muted-foreground">{gl.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full ${colors[index % 4]}`} style={{ width: `${gl.percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Employers MDA */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="size-5 text-primary" /> Highest Nominal Roll by MDA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border/50">
              {metrics.mdaRoll.map((mda, index) => (
                <div key={index} className="p-4 flex justify-between items-center hover:bg-muted/10 transition-colors">
                  <div>
                    <h4 className="font-semibold text-sm">{mda.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Staff Count</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{mda.count.toLocaleString()}</div>
                    <div className="text-[10px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">{mda.pct}% of total</div>
                  </div>
                </div>
              ))}
             </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
