import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gauge, TrendingUp, Sparkles, Activity, PieChart as PieChartIcon, Target, Users, Landmark } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/dashboard/spi")({ component: SPIPage });

function SPIPage() {
  const currentSPI = 84.2;

  const spiComponents = [
    { name: "Development Plan Delivery", weight: 40, value: 86.5, icon: Target, color: "#10b981", desc: "Progress against 32-Year Dev Plan KPIs" },
    { name: "Budget Execution", weight: 30, value: 82.0, icon: Landmark, color: "#3b82f6", desc: "Capital utilization vs Disbursement" },
    { name: "Citizen Satisfaction", weight: 20, value: 78.4, icon: Users, color: "#f59e0b", desc: "Sentiment analysis & grievance resolution" },
    { name: "Gov Initiatives", weight: 10, value: 95.2, icon: Sparkles, color: "#8b5cf6", desc: "Special projects & executive mandates" }
  ];

  // Radar/Polar data for the composition
  const compositionData = spiComponents.map(c => ({
    name: c.name,
    value: c.weight,
    fill: c.color
  }));

  const monthlyTrend = [
    { month: 'Jan', spi: 78.5 },
    { month: 'Feb', spi: 79.2 },
    { month: 'Mar', spi: 80.1 },
    { month: 'Apr', spi: 81.5 },
    { month: 'May', spi: 83.0 },
    { month: 'Jun', spi: 84.2 },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 pb-24">
      <div>
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full text-[11px] uppercase tracking-widest text-gold font-bold mb-4 border border-gold/20">
           <Gauge className="size-3.5" /> Macro-Performance
         </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">State Performance Index (SPI)</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          The ultimate executive metric. A weighted composite score fusing Development Plan Delivery, Budget Execution, Citizen Satisfaction, and Governor's Initiatives into a single verifiable number.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Composite SPI Gauge */}
        <Card className="lg:col-span-1 border-border/60 shadow-sm relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
          <CardHeader className="border-b border-border/50 text-center pb-0">
            <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Composite Score</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="70%" innerRadius="70%" outerRadius="100%" data={[{ name: "SPI", value: currentSPI, fill: "var(--gold)" }]} startAngle={180} endAngle={0}>
                  <RadialBar dataKey="value" background={{fill: 'var(--muted)'}} cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-8 text-center flex flex-col items-center">
                <span className="text-6xl font-black text-foreground tracking-tighter">{currentSPI}</span>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1"><TrendingUp className="size-3"/> +1.2 vs Last Month</span>
              </div>
            </div>
            <div className="text-center mt-4 border-t border-border/50 pt-4">
               <p className="text-sm font-medium text-muted-foreground">Target for FY26: <strong className="text-foreground">85.0</strong></p>
            </div>
          </CardContent>
        </Card>

        {/* SPI Components Weighting & Performance */}
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2"><PieChartIcon className="size-5 text-primary"/> Components Breakdown</CardTitle>
            <CardDescription>The 4 core metrics that calculate the final SPI.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Weighting Pie */}
                <div className="h-64 flex flex-col items-center justify-center relative">
                  <div className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Formula Weights</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={compositionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                        {compositionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value}% Weight`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-[#10b981]"/> 40%</span>
                    <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-[#3b82f6]"/> 30%</span>
                    <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-[#f59e0b]"/> 20%</span>
                    <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-[#8b5cf6]"/> 10%</span>
                  </div>
                </div>

                {/* Sub-scores */}
                <div className="space-y-4">
                   {spiComponents.map((comp, i) => (
                      <div key={i} className="bg-muted/10 p-3 rounded-xl border border-border/50 hover:border-border transition-colors group">
                         <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                               <div className="p-1.5 rounded-lg text-white" style={{backgroundColor: comp.color}}>
                                  <comp.icon className="size-3.5" />
                               </div>
                               <div>
                                  <div className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">{comp.name}</div>
                                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Weight: {comp.weight}%</div>
                               </div>
                            </div>
                            <div className="text-lg font-black font-mono">{comp.value.toFixed(1)}</div>
                         </div>
                         <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
                            <div className="h-full rounded-full" style={{ width: `${comp.value}%`, backgroundColor: comp.color }} />
                         </div>
                      </div>
                   ))}
                </div>

             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2"><Activity className="size-5 text-primary"/> Historical Trend</CardTitle>
            <CardDescription>SPI Trajectory over the current fiscal year.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis domain={[60, 100]} stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip cursor={{fill: 'var(--muted)', opacity: 0.4}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '12px' }} />
                  <Bar dataKey="spi" fill="var(--primary)" radius={[4, 4, 0, 0]} name="SPI Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Executive AI Insights */}
        <Card className="border-border/60 shadow-sm bg-primary/5 border-primary/20">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="text-lg flex items-center gap-2 text-primary"><Sparkles className="size-5"/> Generative Executive Insights</CardTitle>
            <CardDescription>AI-derived strategic actions to improve the SPI.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="bg-background p-4 rounded-xl border border-primary/10 shadow-sm flex gap-3 text-sm">
                <Target className="size-5 text-emerald-500 shrink-0" />
                <div>
                   <span className="font-bold block mb-1">Development Plan Optimization</span>
                   <p className="text-muted-foreground leading-relaxed">The 40% weight of Dev Plan Delivery is underperforming by 2%. Accelerating the Confluence University infrastructure project by 2 weeks will boost the overall SPI by 0.8 points.</p>
                </div>
             </div>
             <div className="bg-background p-4 rounded-xl border border-primary/10 shadow-sm flex gap-3 text-sm">
                <Users className="size-5 text-amber-500 shrink-0" />
                <div>
                   <span className="font-bold block mb-1">Citizen Grievance Resolution</span>
                   <p className="text-muted-foreground leading-relaxed">Citizen Satisfaction is the lowest performing component (78.4). Water scarcity reports in Lokoja Central are suppressing sentiment. Deploy rapid response water tankers immediately.</p>
                </div>
             </div>
             <div className="bg-background p-4 rounded-xl border border-primary/10 shadow-sm flex gap-3 text-sm">
                <Landmark className="size-5 text-blue-500 shrink-0" />
                <div>
                   <span className="font-bold block mb-1">Budget Velocity Check</span>
                   <p className="text-muted-foreground leading-relaxed">Budget Execution is steady at 82.0. However, capital releases for the Ministry of Health are 14 days delayed relative to the approved timeline. Expedite approvals.</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
