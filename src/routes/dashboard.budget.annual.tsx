import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Landmark, TrendingUp, PieChart, Activity, DollarSign, ArrowDownRight, Briefcase } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

export const Route = createFileRoute('/dashboard/budget/annual')({
  component: AnnualBudgetPage,
});

function AnnualBudgetPage() {
  const [activeYear, setActiveYear] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('gdu_operational_year') || '2026');
    }
    return 2026;
  });

  useEffect(() => {
    const handleUpdate = () => {
      setActiveYear(Number(localStorage.getItem('gdu_operational_year') || '2026'));
    };
    window.addEventListener('siteConfigUpdate', handleUpdate);
    return () => window.removeEventListener('siteConfigUpdate', handleUpdate);
  }, []);

  const stats = [
    { label: 'Total Budget (Approved)', value: '₦8.459B', icon: Landmark, tone: "text-foreground" },
    { label: 'Total Revenue', value: '₦8.459B', icon: Activity, tone: "text-blue-500" },
    { label: 'Personnel Cost', value: '₦2.666B', icon: Briefcase, tone: "text-indigo-500" },
    { label: 'Overhead Cost', value: '₦1.954B', icon: ArrowDownRight, tone: "text-rose-500" },
    { label: 'Capital Expenditure', value: '₦3.839B', icon: TrendingUp, tone: "text-emerald-500" },
  ];

  // Dummy mock data for charts based on the total values
  const revenueSources = [
    { name: 'FAAC Statutory', value: 4.2 },
    { name: 'Internally Generated', value: 2.5 },
    { name: 'Grants & Aid', value: 1.0 },
    { name: 'Value Added Tax', value: 0.759 }
  ];

  const capitalExpenditure = [
    { name: 'Infrastructure', value: 1.5 },
    { name: 'Education', value: 0.8 },
    { name: 'Health', value: 0.6 },
    { name: 'Agriculture', value: 0.5 },
    { name: 'Others', value: 0.439 }
  ];

  const personnelCost = [
    { name: 'Ministries', value: 1.4 },
    { name: 'Agencies', value: 0.8 },
    { name: 'Judiciary', value: 0.2 },
    { name: 'Legislature', value: 0.266 }
  ];

  const overheadCost = [
    { name: 'Admin & Operations', value: 0.9 },
    { name: 'Maintenance', value: 0.5 },
    { name: 'Travels & Transport', value: 0.3 },
    { name: 'Utilities & Others', value: 0.254 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 pb-24">
      <div>
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-[11px] uppercase tracking-widest text-primary font-bold mb-4 border border-primary/20">
           <DollarSign className="size-3.5" /> Budget Control Center
         </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Annual Budget {activeYear}</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">Main approved state budget showing macroeconomic structure and distribution parameters.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className={`border-border/60 shadow-sm overflow-hidden relative group hover:border-${stat.tone.split('-')[1]}/50 transition-colors`}>
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                <stat.icon className={`size-24 ${stat.tone}`} />
             </div>
             <CardContent className="p-6 flex flex-col justify-center relative z-10">
               <div className="flex justify-between items-start mb-2">
                 <stat.icon className={`size-5 ${stat.tone}`} />
               </div>
               <span className="text-3xl font-black tracking-tight text-foreground">{stat.value}</span>
               <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-2">{stat.label}</span>
             </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Revenue Sources */}
        <Card className="border-border/60 shadow-sm flex flex-col">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
               <Activity className="size-4 text-blue-500" /> Revenue Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col md:flex-row items-center gap-6">
            <div className="h-48 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={revenueSources} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                    {revenueSources.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `₦${value.toFixed(3)}B`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '12px' }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-3">
               {revenueSources.map((item, i) => (
                 <div key={i}>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="text-muted-foreground flex items-center gap-1.5"><div className="size-2 rounded-full" style={{backgroundColor: COLORS[i]}}/>{item.name}</span>
                      <span>₦{item.value.toFixed(3)}B</span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(item.value/8.459)*100}%`, backgroundColor: COLORS[i] }} /></div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Capital Expenditure */}
        <Card className="border-border/60 shadow-sm flex flex-col">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
               <TrendingUp className="size-4 text-emerald-500" /> Capital Expenditure
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col md:flex-row items-center gap-6">
            <div className="h-48 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={capitalExpenditure} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                    {capitalExpenditure.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `₦${value.toFixed(3)}B`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '12px' }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-3">
               {capitalExpenditure.map((item, i) => (
                 <div key={i}>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="text-muted-foreground flex items-center gap-1.5"><div className="size-2 rounded-full" style={{backgroundColor: COLORS[(i+1)%COLORS.length]}}/>{item.name}</span>
                      <span>₦{item.value.toFixed(3)}B</span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(item.value/3.839)*100}%`, backgroundColor: COLORS[(i+1)%COLORS.length] }} /></div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Personnel Cost */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
               <Briefcase className="size-4 text-indigo-500" /> Personnel Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
             <div className="h-56 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={personnelCost} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                   <XAxis type="number" stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(val) => `₦${val}B`} />
                   <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={11} width={80} />
                   <RechartsTooltip formatter={(value: number) => `₦${value.toFixed(3)}B`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '12px' }} cursor={{fill: 'var(--muted)', opacity: 0.4}} />
                   <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24}>
                     {personnelCost.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>

        {/* Overhead Cost */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
               <ArrowDownRight className="size-4 text-rose-500" /> Overhead Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
             <div className="h-56 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={overheadCost} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                   <XAxis type="number" stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(val) => `₦${val}B`} />
                   <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={11} width={120} />
                   <RechartsTooltip formatter={(value: number) => `₦${value.toFixed(3)}B`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '12px' }} cursor={{fill: 'var(--muted)', opacity: 0.4}} />
                   <Bar dataKey="value" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={24}>
                      {overheadCost.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
