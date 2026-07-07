import React, { useState } from 'react';
import { Search, Layers, Filter, Activity, Navigation, ZoomIn, Building2, Tractor, Stethoscope, Briefcase, BookOpen, AlertTriangle } from 'lucide-react';

export interface StateGISMapProps {
  title?: string;
  defaultLayer?: string;
}

export function StateGISMap({ title = "Kogi State Geospatial Analysis", defaultLayer = "Infrastructure" }: StateGISMapProps) {
  const [activeLayer, setActiveLayer] = useState(defaultLayer);
  
  // Dummy data representing the markers in the image
  const markers = [
    { id: 1, name: "Yagba East", top: "20%", left: "35%", status: "avg", value: "40%", icon: Tractor },
    { id: 2, name: "Kogi", top: "25%", left: "45%", status: "low", value: "0%", icon: AlertTriangle },
    { id: 3, name: "Lokoja", top: "40%", left: "48%", status: "avg", value: "30%", icon: Building2 },
    { id: 4, name: "Bassa", top: "32%", left: "65%", status: "avg", value: "40%", icon: Tractor },
    { id: 5, name: "Omala", top: "35%", left: "75%", status: "low", value: "0%", icon: AlertTriangle },
    { id: 6, name: "Dekina", top: "45%", left: "68%", status: "high", value: "70%", icon: Tractor },
    { id: 7, name: "Okene", top: "62%", left: "38%", status: "high", value: "85%", icon: Stethoscope },
    { id: 8, name: "Ajaokuta", top: "58%", left: "45%", status: "high", value: "78%", icon: Building2 },
    { id: 9, name: "Ofu", top: "60%", left: "62%", status: "high", value: "82%", icon: Stethoscope },
    { id: 10, name: "Idah", top: "75%", left: "58%", status: "high", value: "90%", icon: Stethoscope },
    { id: 11, name: "Igalamela-Odolu", top: "78%", left: "65%", status: "low", value: "0%", icon: AlertTriangle },
    { id: 12, name: "Ibaji", top: "88%", left: "60%", status: "low", value: "0%", icon: AlertTriangle },
    { id: 13, name: "Olamaboro", top: "65%", left: "80%", status: "low", value: "20%", icon: BookOpen },
    { id: 14, name: "Ankpa", top: "50%", left: "85%", status: "low", value: "12%", icon: Briefcase },
    { id: 15, name: "Ogori/Magongo", top: "75%", left: "30%", status: "low", value: "0%", icon: AlertTriangle },
  ];

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-hidden bg-slate-950 font-sans">
      {/* Map Background (Placeholder using the globe image style) */}
      <div className="absolute inset-0 bg-[url('/kogi_gis_globe.png')] bg-cover bg-center opacity-80" />
      
      {/* Overlay to darken background slightly for contrast */}
      <div className="absolute inset-0 bg-slate-900/40" />

      {/* Map Content Wrapper */}
      <div className="absolute inset-0 p-4 md:p-6 pointer-events-none flex">
        
        {/* Left Sidebar (Glassmorphism) */}
        <div className="w-80 h-full max-h-[800px] flex flex-col gap-6 pointer-events-auto">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl p-4 shadow-2xl flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border-transparent focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>

            {/* Layers */}
            <div className="mb-6 space-y-3">
              <h3 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <Layers className="size-3" /> Layers
              </h3>
              <div className="space-y-2">
                {[
                  { id: 'infrastructure', label: 'Infrastructure', active: true },
                  { id: 'procedure', label: 'Procedure', active: true },
                  { id: 'health', label: 'Health', active: false },
                  { id: 'agriculture', label: 'Agriculture', active: false },
                ].map(layer => (
                  <label key={layer.id} className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300 cursor-pointer group">
                    <span className="flex items-center gap-2">
                      <div className={`size-5 rounded-full flex items-center justify-center ${layer.active ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                        {layer.active && <div className="size-2 bg-white rounded-full" />}
                      </div>
                      {layer.label}
                    </span>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${layer.active ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${layer.active ? 'left-4.5 right-0.5' : 'left-0.5'}`} style={{ left: layer.active ? '1.125rem' : '0.125rem' }} />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-3">
              <h3 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <Filter className="size-3" /> Filters
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="size-2 rounded-full bg-emerald-500" /> High Perf
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="size-2 rounded-full bg-amber-500" /> Avg Perf
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="size-2 rounded-full bg-rose-500" /> Low Perf
                </label>
              </div>
            </div>

            {/* Live Feed */}
            <div className="space-y-3 flex-1">
              <h3 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <Activity className="size-3" /> Live Feed
              </h3>
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1 rounded-md bg-slate-200 dark:bg-slate-700"><Building2 className="size-3 text-slate-600 dark:text-slate-300" /></div>
                    <span className="text-xs font-bold">Min. Works</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">State Secretariat extension reached 80% completion.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30"><Tractor className="size-3 text-emerald-600 dark:text-emerald-400" /></div>
                    <span className="text-xs font-bold">Min. Agriculture</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Deployed 50 new tractors across 2 LGAs.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1 rounded-md bg-rose-100 dark:bg-rose-900/30"><Stethoscope className="size-3 text-rose-600 dark:text-rose-400" /></div>
                    <span className="text-xs font-bold">Min. Health</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Delay flagged: Okene Gen Hospital equipment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Right Legend */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 pointer-events-auto">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/20 dark:border-slate-700/50 shadow-xl flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              <div className="size-2 rounded-full bg-emerald-500" /> High Perf
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              <div className="size-2 rounded-full bg-amber-500" /> Avg Perf
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              <div className="size-2 rounded-full bg-rose-500" /> Low Perf
            </span>
          </div>
        </div>

        {/* Map Markers Overlay */}
        {markers.map(m => {
          let bgColor = "bg-emerald-50 dark:bg-emerald-500/10";
          let textColor = "text-emerald-600 dark:text-emerald-400";
          let borderColor = "border-emerald-200 dark:border-emerald-500/30";
          let iconColor = "text-emerald-500";
          
          if (m.status === 'avg') {
            bgColor = "bg-amber-50 dark:bg-amber-500/10";
            textColor = "text-amber-600 dark:text-amber-400";
            borderColor = "border-amber-200 dark:border-amber-500/30";
            iconColor = "text-amber-500";
          } else if (m.status === 'low') {
            bgColor = "bg-rose-50 dark:bg-rose-500/10";
            textColor = "text-rose-600 dark:text-rose-400";
            borderColor = "border-rose-200 dark:border-rose-500/30";
            iconColor = "text-rose-500";
          }

          return (
            <div key={m.id} className="absolute flex flex-col items-center gap-1 pointer-events-auto cursor-pointer group" style={{ top: m.top, left: m.left, transform: 'translate(-50%, -50%)' }}>
              <div className={`px-2.5 py-1 rounded-full ${bgColor} border ${borderColor} shadow-sm backdrop-blur-md flex items-center gap-1.5 transition-transform group-hover:scale-110`}>
                <m.icon className={`size-3 ${iconColor}`} />
                <span className={`text-[10px] font-bold ${textColor}`}>{m.value}</span>
              </div>
              <div className="text-[11px] font-bold text-white drop-shadow-md opacity-80 group-hover:opacity-100 uppercase tracking-wide">
                {m.name}
              </div>
            </div>
          )
        })}

        {/* Bottom Control Bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:bottom-8 pointer-events-auto">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-1.5 py-1.5 rounded-full border border-white/20 dark:border-slate-700/50 shadow-2xl flex items-center gap-1">
            <button className="px-5 py-2 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Navigation className="size-4" /> Explore Region
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
            <button className="px-5 py-2 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
              <ZoomIn className="size-4" /> Zoom In
            </button>
          </div>
        </div>

        {/* Bottom Right Title */}
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 pointer-events-auto text-right">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 drop-shadow-md">
            Anti-Gravity AI • {title}
          </div>
          <div className="flex justify-end mt-2">
            <div className="h-4 w-32 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30" />
          </div>
        </div>

      </div>
    </div>
  );
}
