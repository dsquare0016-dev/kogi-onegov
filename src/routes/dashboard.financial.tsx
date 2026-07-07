import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, PieChart, TrendingUp, DollarSign, Loader2, Database, AlertCircle, Landmark } from 'lucide-react';
import { BUDGET_PROFILE, REVENUE_SOURCES } from '@/lib/budget-data';
import { Cell, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/dashboard/financial')({
  component: RevenueDashboardPage,
});

function RevenueDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [financeData, setFinanceData] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { safeGetCollection } = await import('@/lib/firebase');
      const data = await safeGetCollection('financial_metrics', []);
      if (data.length === 0) {
        setIsFallback(true);
      } else {
        setFinanceData(data[0]);
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
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading financial ledgers...</p>
      </div>
    );
  }

  // Fallbacks
  const totalRev = financeData?.totalRevenue || BUDGET_PROFILE.revenue.total;
  const faacVal = financeData?.faacAllocation || BUDGET_PROFILE.revenue.faac;
  const igrVal = financeData?.independentRevenue || BUDGET_PROFILE.revenue.independent;

  const dynamicRevenueMix = [
    { name: "FAAC Statutory", value: faacVal * 0.5 },
    { name: "VAT Allocation", value: faacVal * 0.4 },
    { name: "Excess Crude", value: faacVal * 0.1 },
    { name: "Independent Revenue", value: igrVal }
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto pb-24 space-y-6 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Revenue Sources Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tracking the 2026 Kogi Local Government Revenue (FAAC vs Independent Revenue sources).
          </p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded-md text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
        >
          <Loader2 className="size-3.5" /> Sync Financials
        </button>
      </div>

      {isFallback && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <AlertCircle className="size-4 shrink-0 text-amber-500 animate-pulse" /> 
            Financial Metric Registry Empty / Offline Fallback Mode
          </div>
          <p className="leading-relaxed">
            This module relies on live database content from the Firestore collection <code className="bg-amber-500/15 px-1.5 py-0.5 rounded font-mono font-bold">financial_metrics</code>. 
            If no records exist, the page displays mock cached budget metrics.
          </p>
          <div className="pt-1">
            <span className="font-bold">Required Data Action:</span> Upload official budget and allocation sheets at the <Link to="/dashboard/budget/upload" className="font-extrabold underline text-amber-700 hover:text-amber-800">Budget Upload panel (/dashboard/budget/upload)</Link>.
          </div>
        </div>
      )}

      {!isFallback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs flex items-center gap-2 font-bold">
          <Database className="size-4 shrink-0 text-emerald-500" /> Live Data Connected: Fetched current fiscal parameters from Firestore.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/60 shadow-sm bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-primary mb-2">
              <Landmark className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Total Revenue</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">₦{(totalRev / 1000000000).toFixed(2)}B</div>
            <div className="text-xs text-muted-foreground mt-1">Approved 2026 Budget</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <Wallet className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">FAAC Allocation</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">₦{(faacVal / 1000000000).toFixed(2)}B</div>
            <div className="text-xs text-muted-foreground mt-1">
              {((faacVal / totalRev) * 100).toFixed(1)}% of total revenue
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
              <TrendingUp className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Independent Revenue</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">₦{(igrVal / 1000000).toFixed(2)}M</div>
            <div className="text-xs text-muted-foreground mt-1">
              Target for 2026 FY
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="size-5 text-primary" /> Revenue Mix Breakdown
            </CardTitle>
            <CardDescription>Visualizing FAAC dependencies vs Independent Sources.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px]">
              <ResponsiveContainer>
                <RechartsPieChart>
                  <Pie data={dynamicRevenueMix} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4} label>
                    {dynamicRevenueMix.map((_, i) => (
                      <Cell key={i} fill={["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-5)"][i % 4]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `₦${(val / 1000000).toFixed(2)}M`} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 12, marginTop: 10 }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm flex flex-col">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="size-5 text-emerald-600" /> Independent Revenue Sources (IGR)
            </CardTitle>
            <CardDescription>Tracked categories for local government collections.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1">
             <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-sm font-semibold mb-1">
                   <span>Direct Assessment & Tax</span>
                   <span>₦{(igrVal * 0.45 / 1000000).toFixed(1)}M</span>
                 </div>
                 <div className="w-full bg-muted rounded-full h-2">
                   <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between text-sm font-semibold mb-1">
                   <span>Licenses & Fees</span>
                   <span>₦{(igrVal * 0.3 / 1000000).toFixed(1)}M</span>
                 </div>
                 <div className="w-full bg-muted rounded-full h-2">
                   <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between text-sm font-semibold mb-1">
                   <span>Fines & Penalties</span>
                   <span>₦{(igrVal * 0.25 / 1000000).toFixed(1)}M</span>
                 </div>
                 <div className="w-full bg-muted rounded-full h-2">
                   <div className="bg-amber-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                 </div>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
