import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, BrainCircuit, Activity, AlertTriangle, TrendingUp, TrendingDown, Target, Building2, Map, Briefcase, CheckCircle2, Navigation, Trophy, Leaf, Search, Layers, Filter, CheckSquare, HardHat, HeartPulse, Tractor, BookOpen, Landmark, X } from 'lucide-react';

export const Route = createFileRoute('/dashboard/budget/intel/governor')({
  component: GovernorDashboardPage,
});

function GovernorDashboardPage() {
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedLga, setSelectedLga] = useState<any>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !isZoomed) return;
    
    const rawX = e.clientX - dragStart.x;
    const rawY = e.clientY - dragStart.y;

    const rect = e.currentTarget.getBoundingClientRect();
    // Constrain panning to ~45% of width and ~35% of height to avoid seeing the edges at 1.8x scale
    const maxPanX = rect.width * 0.45;
    const maxPanY = rect.height * 0.35;

    setPan({
      x: Math.max(-maxPanX, Math.min(maxPanX, rawX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, rawY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const stats = [
    { label: 'Total State Budget', value: '₦250B' },
    { label: 'Total Revenue YTD', value: '₦180B' },
    { label: 'Total Expenditure', value: '₦215B' },
    { label: 'Total Active Projects', value: '1,248' },
    { label: 'Completed Projects', value: '452' },
    { label: 'Budget Performance', value: '86%' },
    { label: 'Dev Plan Performance', value: '74%' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6 pb-24">
      {/* Security Banner */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex justify-center items-center gap-2 text-destructive font-bold text-xs uppercase tracking-widest shadow-sm">
         <Shield className="size-4 shrink-0" /> <span className="truncate">Top Secret - Executive Access Only - Governor / Deputy / SSG / CoS / DG-GDU</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Governor Executive Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Ultimate top-level view of Kogi State's fiscal health and project execution.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
           <button className="px-4 py-2 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-md text-xs sm:text-sm font-semibold hover:bg-indigo-500/20 transition-colors flex items-center gap-2 shadow-sm"><BrainCircuit className="size-4 shrink-0"/> Ask Chatbot</button>
        </div>
      </div>

      {/* 1. Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
         {stats.map((stat, i) => (
            <Card key={i} className="border-border/60 shadow-sm bg-muted/5">
               <CardContent className="p-3 sm:p-4 flex flex-col justify-between h-full">
                 <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 leading-snug">{stat.label}</span>
                 <span className="text-xl sm:text-2xl font-mono font-bold text-foreground">{stat.value}</span>
               </CardContent>
            </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* 2. Executive Intelligence AI Panel */}
         <div className="col-span-1 space-y-6">
            <Card className="border-indigo-500/30 shadow-sm bg-indigo-500/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="size-24 text-indigo-500" /></div>
               <CardContent className="p-6 relative z-10 text-center space-y-2 pt-8">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Statewide Budget Health Score</div>
                  <div className="text-6xl font-mono font-bold text-indigo-500">88<span className="text-2xl text-indigo-400/50">/100</span></div>
                  <div className="text-sm font-bold text-emerald-500 flex justify-center items-center gap-1 mt-2"><TrendingUp className="size-4"/> Stable & Growing</div>
               </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
               <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-base text-primary"><BrainCircuit className="size-4"/> Executive AI Intelligence</CardTitle>
               </CardHeader>
               <CardContent className="p-0 divide-y divide-border/30">
                  <div className="p-4 flex gap-4 hover:bg-muted/10 transition-colors">
                     <div className="mt-0.5"><Trophy className="size-4 text-emerald-500"/></div>
                     <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Top Performing MDA</div>
                        <div className="text-sm font-bold text-foreground">Ministry of Works (94%)</div>
                     </div>
                  </div>
                  <div className="p-4 flex gap-4 hover:bg-muted/10 transition-colors">
                     <div className="mt-0.5"><AlertTriangle className="size-4 text-destructive"/></div>
                     <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Worst Performing MDA</div>
                        <div className="text-sm font-bold text-foreground text-destructive">Ministry of Agriculture (42%)</div>
                     </div>
                  </div>
                  <div className="p-4 flex gap-4 hover:bg-muted/10 transition-colors">
                     <div className="mt-0.5"><TrendingUp className="size-4 text-emerald-500"/></div>
                     <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Revenue Forecast</div>
                        <div className="text-sm font-bold text-foreground">IGR projected to exceed Q4 target by 12% (₦5.4B surplus).</div>
                     </div>
                  </div>
                  <div className="p-4 flex gap-4 hover:bg-muted/10 transition-colors">
                     <div className="mt-0.5"><Target className="size-4 text-orange-500"/></div>
                     <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Budget Risk Forecast</div>
                        <div className="text-sm font-bold text-foreground">Overhead depletion rate in Min. of Health warns of a ₦2B deficit by November.</div>
                     </div>
                  </div>
                  <div className="p-4 flex gap-4 hover:bg-muted/10 transition-colors">
                     <div className="mt-0.5"><TrendingDown className="size-4 text-destructive"/></div>
                     <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Project Delay Forecast</div>
                        <div className="text-sm font-bold text-foreground">State Secretariat extension will miss Dec deadline; 300% cost overrun likely.</div>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* 3. Interactive Map View */}
         <Card className="col-span-1 lg:col-span-3 border-border/60 shadow-sm flex flex-col">
            <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="flex items-center gap-2"><Map className="size-5 text-emerald-500"/> Interactive Kogi State Map</CardTitle>
                  <CardDescription>Live geographical tracking of budget execution and capital projects.</CardDescription>
               </div>
               <div className="flex gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="size-3 bg-emerald-500 rounded-sm"/> High Perf</span>
                  <span className="flex items-center gap-1"><div className="size-3 bg-amber-500 rounded-sm"/> Avg Perf</span>
                  <span className="flex items-center gap-1"><div className="size-3 bg-destructive rounded-sm"/> Low Perf</span>
               </div>
            </CardHeader>
            <CardContent 
               className="p-0 flex-1 bg-black relative min-h-[600px] rounded-b-xl overflow-hidden" 
               style={{ 
                  perspective: '1500px',
                  backgroundImage: 'radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)), radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)), radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0))',
                  backgroundRepeat: 'repeat',
                  backgroundSize: '200px 200px'
               }}
            >
               {/* Map Display (Zoomable, Rotatable & Pannable) */}
               <div 
                  className="absolute inset-0 shadow-inner rounded-b-xl transform-gpu select-none transition-all ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                  style={{ 
                     transform: isZoomed ? `scale(1.8) translate(${pan.x / 1.8}px, calc(12% + ${pan.y / 1.8}px)) rotateX(35deg)` : 'scale(1) translate(0px, 0px) rotateX(0)',
                     cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'default',
                     transitionDuration: isZoomed ? (isDragging ? '0ms' : '1500ms') : '1500ms'
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
               >
                  <img src="/kogi-map.jpg" alt="Kogi State Map" draggable={false} className="absolute inset-0 w-full h-full object-cover opacity-100 mix-blend-screen select-none pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/40 pointer-events-none" />

                  {/* Simulated LGA Hotspots (All 21 LGAs) */}
                  {[
                     { name: 'Lokoja', x: '48%', y: '42%', perf: 'amber', budget: 45000, projects: 24, rate: 30, sector: 'Works', icon: HardHat },
                     { name: 'Okene', x: '35%', y: '65%', perf: 'emerald', budget: 32000, projects: 18, rate: 85, sector: 'Health', icon: HeartPulse },
                     { name: 'Dekina', x: '70%', y: '45%', perf: 'emerald', budget: 15000, projects: 8, rate: 70, sector: 'Agriculture', icon: Tractor },
                     { name: 'Kabba/Bunu', x: '25%', y: '45%', perf: 'amber', budget: 12000, projects: 6, rate: 45, sector: 'Education', icon: BookOpen },
                     { name: 'Ankpa', x: '85%', y: '50%', perf: 'destructive', budget: 18000, projects: 12, rate: 12, sector: 'Works', icon: HardHat },
                     { name: 'Yagba West', x: '10%', y: '35%', perf: 'amber', budget: 8500, projects: 4, rate: 55, sector: 'Agriculture', icon: Tractor },
                     { name: 'Idah', x: '60%', y: '75%', perf: 'emerald', budget: 22000, projects: 14, rate: 90, sector: 'Health', icon: HeartPulse },
                     { name: 'Ajaokuta', x: '45%', y: '58%', perf: 'emerald', budget: 52000, projects: 10, rate: 78, sector: 'Infrastructure', icon: Building2 },
                     { name: 'Bassa', x: '65%', y: '30%', perf: 'amber', budget: 9000, projects: 5, rate: 40, sector: 'Agriculture', icon: Tractor },
                     { name: 'Ofu', x: '65%', y: '60%', perf: 'emerald', budget: 14000, projects: 7, rate: 82, sector: 'Health', icon: HeartPulse },
                     { name: 'Olamaboro', x: '80%', y: '65%', perf: 'destructive', budget: 11000, projects: 9, rate: 20, sector: 'Education', icon: BookOpen },
                     // New LGAs with 0 data
                     { name: 'Adavi', x: '40%', y: '62%', perf: 'destructive', budget: 0, projects: 0, rate: 0, sector: 'Unallocated', icon: AlertTriangle },
                     { name: 'Ibaji', x: '62%', y: '90%', perf: 'destructive', budget: 0, projects: 0, rate: 0, sector: 'Unallocated', icon: AlertTriangle },
                     { name: 'Igalamela-Odolu', x: '65%', y: '80%', perf: 'destructive', budget: 0, projects: 0, rate: 0, sector: 'Unallocated', icon: AlertTriangle },
                     { name: 'Ijumu', x: '20%', y: '55%', perf: 'destructive', budget: 0, projects: 0, rate: 0, sector: 'Unallocated', icon: AlertTriangle },
                     { name: 'Kogi', x: '45%', y: '25%', perf: 'destructive', budget: 0, projects: 0, rate: 0, sector: 'Unallocated', icon: AlertTriangle },
                     { name: 'Mopa-Muro', x: '18%', y: '40%', perf: 'destructive', budget: 0, projects: 0, rate: 0, sector: 'Unallocated', icon: AlertTriangle },
                     { name: 'Ogori/Magongo', x: '32%', y: '75%', perf: 'destructive', budget: 0, projects: 0, rate: 0, sector: 'Unallocated', icon: AlertTriangle },
                     { name: 'Okehi', x: '38%', y: '60%', perf: 'destructive', budget: 0, projects: 0, rate: 0, sector: 'Unallocated', icon: AlertTriangle },
                     { name: 'Omala', x: '75%', y: '35%', perf: 'destructive', budget: 0, projects: 0, rate: 0, sector: 'Unallocated', icon: AlertTriangle },
                     { name: 'Yagba East', x: '15%', y: '38%', perf: 'destructive', budget: 0, projects: 0, rate: 0, sector: 'Unallocated', icon: AlertTriangle },
                  ].map((lga, idx) => {
                     const Icon = lga.icon;
                     return (
                     <div key={idx} className="absolute group z-10" style={{ left: lga.x, top: lga.y }}>
                        <div className="relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2">
                           {/* Glass Badge Pin */}
                           <div onClick={() => setSelectedLga(lga)} className={`flex items-center gap-1.5 px-2 py-1 rounded-full backdrop-blur-md bg-background/80 border shadow-lg cursor-pointer transition-all hover:scale-110 hover:-translate-y-1 z-10 ${
                              lga.perf === 'emerald' ? 'border-emerald-500/50 text-emerald-500 shadow-emerald-500/20' :
                              lga.perf === 'amber' ? 'border-amber-500/50 text-amber-500 shadow-amber-500/20' :
                              'border-destructive/50 text-destructive shadow-destructive/20'
                           }`}>
                              <Icon className="size-3" />
                              <span className="text-[10px] font-black">{lga.rate}%</span>
                           </div>
                           
                           {/* LGA Name Label */}
                           <div className="mt-1 text-[8px] font-black text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)] select-none pointer-events-none tracking-wider uppercase">
                              {lga.name}
                           </div>
                           
                           {/* Enhanced Hover Tooltip (Smaller) */}
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 backdrop-blur-xl bg-background/90 border border-white/20 shadow-2xl rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                                <h4 className="font-bold text-sm text-foreground">{lga.name}</h4>
                                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${lga.perf === 'emerald' ? 'bg-emerald-500/20 text-emerald-500' : lga.perf === 'amber' ? 'bg-amber-500/20 text-amber-500' : 'bg-destructive/20 text-destructive'}`}>
                                  {lga.perf === 'emerald' ? 'On Track' : lga.perf === 'amber' ? 'Warning' : 'Critical'}
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                 <div className="flex items-center justify-between text-[10px]">
                                   <span className="text-muted-foreground flex items-center gap-1"><Briefcase className="size-3"/> Active Projects:</span> 
                                   <span className="font-black text-foreground">{lga.projects}</span>
                                 </div>
                                 <div className="flex items-center justify-between text-[10px]">
                                   <span className="text-muted-foreground flex items-center gap-1"><Building2 className="size-3"/> CapEx Budget:</span> 
                                   <span className="font-mono font-bold text-primary">₦{(lga.budget/1000).toFixed(1)}B</span>
                                 </div>
                                 
                                 <div className="mt-2 pt-2 border-t border-white/10 text-[10px]">
                                    <span className="text-muted-foreground mb-1 block">Top Sector</span>
                                    <div className="flex items-center gap-1.5 font-bold text-foreground bg-muted/30 p-1.5 rounded-md">
                                      <Icon className="size-3 text-primary" /> {lga.sector}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  )})}
               </div>
                  {/* Glassmorphic Left Panel overlay */}
                  <div className="absolute top-6 left-6 w-48 backdrop-blur-xl bg-background/60 border border-white/10 rounded-2xl shadow-2xl p-3 flex flex-col gap-4 max-h-[calc(100%-3rem)] overflow-y-auto hidden lg:flex z-20 scrollbar-none">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                      <input type="text" placeholder="Search..." className="w-full bg-background/50 border border-white/10 rounded-full pl-7 pr-3 py-1.5 text-[9px] focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground" />
                    </div>

                    {/* Layers */}
                    <div>
                      <h4 className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Layers className="size-2.5"/> Layers</h4>
                      <div className="space-y-2">
                        {['Infrastructure', 'Procedure', 'Health', 'Agriculture'].map((layer, i) => (
                          <div key={layer} className="flex items-center justify-between text-[9px] font-semibold text-foreground/80 cursor-pointer group">
                            <div className="flex items-center gap-1.5">
                              <div className={`size-3 rounded-sm border flex items-center justify-center transition-colors ${i < 2 ? 'bg-primary/20 border-primary/30' : 'bg-background/40 border-white/10'}`}>
                                {i < 2 && <CheckSquare className="size-2 text-primary" />}
                              </div>
                              <span className="group-hover:text-foreground transition-colors">{layer}</span>
                            </div>
                            <div className={`w-5 h-3 rounded-full relative transition-colors ${i < 2 ? 'bg-primary' : 'bg-muted/50'}`}>
                              <div className={`absolute top-0.5 size-2 rounded-full bg-white transition-all ${i < 2 ? 'right-0.5' : 'left-0.5'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Filters */}
                    <div>
                      <h4 className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Filter className="size-2.5"/> Filters</h4>
                      <div className="space-y-1.5 text-[9px] font-semibold text-foreground/80">
                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors"><div className="size-1.5 rounded-full border border-emerald-500 bg-emerald-500" /> High Perf</div>
                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors"><div className="size-1.5 rounded-full border border-amber-500 bg-amber-500" /> Avg Perf</div>
                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors"><div className="size-1.5 rounded-full border border-destructive bg-destructive/20" /> Low Perf</div>
                      </div>
                    </div>

                    {/* Live Feed */}
                    <div>
                      <h4 className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Activity className="size-2.5"/> Live Feed</h4>
                      <div className="space-y-2">
                        <div className="bg-background/40 hover:bg-background/60 transition-colors border border-white/10 rounded-lg p-2 text-[8px] space-y-1 cursor-pointer">
                            <div className="flex items-center gap-1.5 font-bold text-foreground text-[9px]"><div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><HardHat className="size-2.5 text-primary"/></div> Min. Works</div>
                            <p className="text-foreground/70 leading-tight">State Secretariat extension reached 80% completion.</p>
                        </div>
                        <div className="bg-background/40 hover:bg-background/60 transition-colors border border-white/10 rounded-lg p-2 text-[8px] space-y-1 cursor-pointer">
                            <div className="flex items-center gap-1.5 font-bold text-foreground text-[9px]"><div className="size-4 rounded-full bg-emerald-500/20 flex items-center justify-center"><Tractor className="size-2.5 text-emerald-500"/></div> Min. Agriculture</div>
                            <p className="text-foreground/70 leading-tight">Deployed 50 new tractors across 2 LGAs.</p>
                        </div>
                        <div className="bg-background/40 hover:bg-background/60 transition-colors border border-white/10 rounded-lg p-2 text-[8px] space-y-1 cursor-pointer">
                            <div className="flex items-center gap-1.5 font-bold text-foreground text-[9px]"><div className="size-4 rounded-full bg-destructive/20 flex items-center justify-center"><HeartPulse className="size-2.5 text-destructive"/></div> Min. Health</div>
                            <p className="text-foreground/70 leading-tight text-destructive">Delay flagged: Okene Gen Hospital equipment.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Legend Glass */}
                  <div className="absolute top-6 right-6 backdrop-blur-md bg-background/60 border border-white/10 rounded-full px-4 py-2 shadow-lg z-20 hidden md:flex gap-4 text-[10px] font-bold uppercase tracking-wider text-foreground">
                    <span className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-emerald-500"/> High Perf</span>
                    <span className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-amber-500"/> Avg Perf</span>
                    <span className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-destructive"/> Low Perf</span>
                  </div>

                  {/* Zoom Controls */}
                  <div className="absolute bottom-6 left-6 lg:left-[330px] backdrop-blur-md bg-background/60 border border-white/10 rounded-xl shadow-lg p-3 text-xs flex items-center gap-4 z-20">
                     <div className="flex items-center gap-1.5"><Navigation className="size-4 text-muted-foreground"/> Explore Region</div>
                     <div className="h-4 w-px bg-border"/>
                     <button onClick={() => {
                        setIsZoomed(!isZoomed);
                        if (isZoomed) setPan({ x: 0, y: 0 });
                     }} className="font-bold text-primary hover:underline transition-all">
                        {isZoomed ? 'Reset View' : 'Zoom In'}
                     </button>
                  </div>

                  {/* Selected LGA Detail Panel */}
                  {selectedLga && (
                     <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto w-[calc(100%-2rem)] sm:w-80 backdrop-blur-2xl bg-background/80 border border-white/20 rounded-2xl shadow-2xl p-4 sm:p-5 z-30 animate-in slide-in-from-right-8 fade-in duration-300">
                       <div className="flex justify-between items-start mb-4">
                         <div>
                           <h3 className="text-lg font-black text-foreground">{selectedLga.name} LGA</h3>
                           <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Executive Summary Report</p>
                         </div>
                         <button onClick={() => setSelectedLga(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
                       </div>
                       <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-background/50 p-3 rounded-xl border border-white/5">
                              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Active Projects</div>
                              <div className="font-black text-xl text-foreground">{selectedLga.projects}</div>
                            </div>
                            <div className="bg-background/50 p-3 rounded-xl border border-white/5">
                              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Execution</div>
                              <div className={`font-black text-xl ${selectedLga.perf === 'emerald' ? 'text-emerald-500' : selectedLga.perf === 'amber' ? 'text-amber-500' : 'text-destructive'}`}>{selectedLga.rate}%</div>
                            </div>
                          </div>
                          <div className="bg-background/50 p-3 rounded-xl border border-white/5">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">CapEx Budget Allocation</div>
                            <div className="font-mono font-black text-2xl text-primary">₦{(selectedLga.budget/1000).toFixed(1)}B</div>
                          </div>
                          <div className="bg-background/50 p-3 rounded-xl border border-white/5">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Key Sector Highlight</div>
                            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                              {(() => {
                                const SelectedIcon = selectedLga.icon;
                                return <SelectedIcon className="size-5 text-primary" />;
                              })()}
                              {selectedLga.sector} Development
                            </div>
                          </div>
                          <button className="w-full py-2.5 bg-primary/10 text-primary border border-primary/20 font-bold rounded-xl text-xs hover:bg-primary/20 transition-colors">View Full LGA Report</button>
                       </div>
                     </div>
                  )}
            </CardContent>
         </Card>
      </div>

      {/* 4. Development Plan Contribution */}
      <div className="grid grid-cols-1 mt-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Target className="size-5" /> Development Plan Contribution
            </CardTitle>
            <CardDescription>
              Real-time tracking of budget allocations vs 32-Year Development Plan milestones.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-col md:flex-row">
            
            {/* KPI Details */}
            <div className="flex-1 p-8 space-y-8 border-b md:border-b-0 md:border-r border-border/50">
              
              <div className="flex items-center gap-4 border-b border-border/50 pb-4">
                <div className="size-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <Leaf className="size-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Agriculture & Food Security</div>
                  <div className="font-bold text-lg text-foreground leading-tight">Increase Yield of Cash and Food Crops</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Selected KPI</div>
                  <div className="font-bold text-xl text-primary">Rice Yield</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Dev Plan Target (2033)</div>
                  <div className="font-bold text-xl">5.0 <span className="text-sm font-normal text-muted-foreground">mt/ha</span></div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Current Achievement</div>
                  <div className="font-bold text-xl">4.2 <span className="text-sm font-normal text-muted-foreground">mt/ha</span></div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Achievement Rate</div>
                  <div className="font-bold text-xl text-emerald-600 flex items-center gap-2">84% <TrendingUp className="size-4" /></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Progress to 2033 Milestone</span>
                  <span>84%</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[84%]" />
                </div>
              </div>
              
            </div>

            {/* Budget Impact Metrics */}
            <div className="w-full md:w-96 p-8 bg-muted/5 flex flex-col justify-center space-y-6">
              
              <div className="p-4 bg-background border border-border rounded-xl shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><Briefcase className="size-16" /></div>
                 <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Budget Supporting This KPI</div>
                 <div className="text-3xl font-black text-indigo-600">₦3.2B</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background border border-border rounded-xl shadow-sm text-center">
                  <div className="text-2xl font-black text-foreground">18</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Projects</div>
                </div>
                <div className="p-4 bg-background border border-border rounded-xl shadow-sm text-center">
                  <div className="text-2xl font-black text-foreground">126</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Activities</div>
                </div>
                <div className="p-4 bg-background border border-border rounded-xl shadow-sm text-center col-span-2">
                  <div className="text-2xl font-black text-foreground">2,041</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Tasks</div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
