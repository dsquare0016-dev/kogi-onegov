import { createFileRoute } from "@tanstack/react-router";
import { Activity, TrendingUp, TrendingDown, Target, Zap, CheckCircle2, ShieldAlert } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const Route = createFileRoute("/dashboard/executive-room/spi")({
  component: StatePerformanceIndexPage,
});

const histData = [
  { month: 'Jan', spi: 72 },
  { month: 'Feb', spi: 75 },
  { month: 'Mar', spi: 76 },
  { month: 'Apr', spi: 79 },
  { month: 'May', spi: 81 },
  { month: 'Jun', spi: 84.2 },
];

function StatePerformanceIndexPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-1">
            <Activity className="size-4" />
            Executive Room
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">State Performance Index</h1>
          <p className="text-muted-foreground mt-1">
            Macro-level tracking of Kogi State's overall health, governance, and institutional efficiency.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="size-4" /> System Nominal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge Section */}
        <div className="lg:col-span-1 bg-[#0A1142] rounded-2xl p-8 border border-primary/20 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          
          <div className="relative z-10 text-center space-y-6">
            <div className="text-primary font-bold tracking-widest uppercase text-sm">Current SPI</div>
            
            {/* Massive Circular Display */}
            <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="283" strokeDashoffset="44.71" className="text-primary" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white tracking-tighter">84.2</span>
                <span className="text-xl font-bold text-white/50">%</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm">
              <TrendingUp className="size-4" /> +3.2% vs Last Quarter
            </div>
          </div>
        </div>

        {/* Historical Trend Section */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" /> 6-Month Growth Trajectory
          </h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={histData}>
                <defs>
                  <linearGradient id="colorSpi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CBA344" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#CBA344" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} className="text-muted-foreground" />
                <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{fontSize: 12}} className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A1142', borderColor: '#CBA344', color: 'white', borderRadius: '8px' }}
                  itemStyle={{ color: '#CBA344', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="spi" stroke="#CBA344" strokeWidth={4} fillOpacity={1} fill="url(#colorSpi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Component Breakdown */}
      <h3 className="text-lg font-bold mt-8 mb-4">Core Structural Pillars</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PillarCard title="Economic Growth" score={88.5} trend="up" icon={TrendingUp} />
        <PillarCard title="Security & Safety" score={92.1} trend="up" icon={ShieldAlert} />
        <PillarCard title="Infrastructure" score={76.4} trend="up" icon={Zap} />
        <PillarCard title="Human Capital" score={81.0} trend="down" icon={Target} />
      </div>
    </div>
  );
}

function PillarCard({ title, score, trend, icon: Icon }: { title: string, score: number, trend: 'up'|'down', icon: any }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
          <Icon className="size-5" />
        </div>
        {trend === 'up' ? (
          <span className="text-emerald-500 flex items-center gap-1 text-xs font-bold"><TrendingUp className="size-3"/> +1.2</span>
        ) : (
          <span className="text-rose-500 flex items-center gap-1 text-xs font-bold"><TrendingDown className="size-3"/> -0.5</span>
        )}
      </div>
      <div className="text-3xl font-black text-foreground mb-1">{score}%</div>
      <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{title}</div>
      <div className="w-full bg-muted h-1.5 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
