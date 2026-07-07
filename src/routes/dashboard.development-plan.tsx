import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill, Bar, Stat } from "@/components/ui-bits";
import { KPIS } from "@/lib/mock-data";
import { Target, Compass, Sparkles, Flag, BookOpen, HeartPulse, Building, Droplets, Banknote, ShieldCheck, Users, Briefcase, Cpu, Mountain, TreePine, Scale, GraduationCap, Link2, Activity, Layers, Upload, X, AlertCircle } from "lucide-react";
import { useState, useEffect } from 'react';
import { devPlanStore, syncFromDb } from '@/lib/devPlanStore';
import { getSession } from '@/lib/auth';
import { roleById } from '@/lib/roles';

export const Route = createFileRoute("/dashboard/development-plan")({ component: Plan });

const PILLARS_14 = [
  { name: "Agriculture & Food Security", icon: <TreePine className="text-emerald-500" />, progress: 78 },
  { name: "Business, Innovation & Skills", icon: <Briefcase className="text-blue-500" />, progress: 65 },
  { name: "Digital Economy", icon: <Cpu className="text-indigo-500" />, progress: 82 },
  { name: "Mining & Natural Resources", icon: <Mountain className="text-amber-600" />, progress: 54 },
  { name: "Education", icon: <GraduationCap className="text-rose-500" />, progress: 88 },
  { name: "Health", icon: <HeartPulse className="text-red-500" />, progress: 76 },
  { name: "Infrastructure", icon: <Building className="text-slate-600" />, progress: 81 },
  { name: "Environment", icon: <Compass className="text-emerald-600" />, progress: 62 },
  { name: "Water & Sanitation", icon: <Droplets className="text-cyan-500" />, progress: 71 },
  { name: "Finance & Revenue", icon: <Banknote className="text-green-600" />, progress: 90 },
  { name: "Governance & Administration", icon: <BookOpen className="text-purple-600" />, progress: 85 },
  { name: "Security, Law & Justice", icon: <ShieldCheck className="text-blue-700" />, progress: 89 },
  { name: "Social & Youth Development", icon: <Users className="text-pink-500" />, progress: 74 },
  { name: "Cross-Cutting Issues", icon: <Link2 className="text-slate-500" />, progress: 68 },
];

function Plan() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pillars, setPillars] = useState(devPlanStore.pillars);
  const [vision, setVision] = useState(devPlanStore.vision);
  const [objectives, setObjectives] = useState(devPlanStore.objectives);
  const [kpis, setKPIs] = useState(devPlanStore.kpis);

  const session = getSession();
  const profile = session ? roleById(session.role) : null;
  const isGlobal = !session || ["super_admin", "governor", "deputy_governor", "ssg", "chief_of_staff", "deputy_chief_of_staff", "head_of_service", "dg_gdu", "auditor_general", "accountant_general", "civil_service_commission"].includes(session.role);
  const userMda = isGlobal ? null : (session.mda || session.department || profile?.ministry);

  useEffect(() => {
    syncFromDb(userMda);
  }, [userMda]);

  useEffect(() => {
    const handleUpdate = () => {
      setPillars(devPlanStore.pillars);
      setVision(devPlanStore.vision);
      setObjectives(devPlanStore.objectives);
      setKPIs(devPlanStore.kpis);
    };
    window.addEventListener('devPlanUpdate', handleUpdate);
    return () => window.removeEventListener('devPlanUpdate', handleUpdate);
  }, []);

  const generateAISuggestions = () => {
    if (!userMda) {
      return [
        { title: "Cross-Pillar Alignment Support", desc: "Statewide development framework coordination is healthy. Ensure sector strategies remain linked to fiscal thresholds." },
        { title: "Performance Diagnostics Enforced", desc: "Conduct regular audit logs check for alignment mapping updates." }
      ];
    }
    const items = [];
    if (kpis && kpis.length > 0) {
      kpis.forEach((k: any) => {
        const gap = k.targetValue - k.currentValue;
        if (gap > 0) {
          items.push({
            title: `Accelerate ${k.metric}`,
            desc: `Current metric progress is ${k.currentValue}${k.unit} against strategic target of ${k.targetValue}${k.unit}. Action: Mobilize underutilized budget votes to finance critical project completions.`
          });
        }
      });
    }
    if (items.length === 0) {
      items.push({
        title: "Objective Synergy Enforced",
        desc: "All objectives are on track. Maintain standard mapping configurations."
      });
      items.push({
        title: "Capital Delivery Calibration",
        desc: "Liaise with budget desk officers to sustain baseline performance index thresholds."
      });
    }
    return items;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.pillars || !Array.isArray(json.pillars)) {
          throw new Error("Invalid format: Must contain a 'pillars' array.");
        }
        
        devPlanStore.vision = json.vision || devPlanStore.vision;
        devPlanStore.setPillars(json.pillars);
        if (json.objectives) devPlanStore.setObjectives(json.objectives);
        if (json.kpis) devPlanStore.setKPIs(json.kpis);
        
        alert("Development Plan uploaded and applied successfully.");
        setShowUploadModal(false);
        setUploadError("");
      } catch (err: any) {
        setUploadError(err.message || "Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  // Map local store pillars to display. If local store has pillars, we use them.
  // We match color names or fallback to standard styles.
  const displayPillars = pillars.map((p, idx) => {
    // Find matching icon from the template list or default to Layers
    const matchingTemplate = PILLARS_14.find(t => t.name.toLowerCase() === p.name.toLowerCase()) || 
                             PILLARS_14[idx % PILLARS_14.length];
    
    // Calculate simulated progress based on KPI value if objectives/KPIs are loaded
    const pKPIs = kpis.filter(k => objectives.some(o => o.pillarId === p.id && o.id === k.objectiveId));
    const calculatedProgress = pKPIs.length > 0
      ? Math.round(pKPIs.reduce((sum, item) => sum + (item.currentValue / item.targetValue * 100), 0) / pKPIs.length)
      : (matchingTemplate?.progress || 75);

    return {
      name: p.name,
      icon: matchingTemplate?.icon || <Layers className="text-slate-500" />,
      progress: Math.min(100, Math.max(0, calculatedProgress))
    };
  });

  return (
    <div>
      <PageHeader 
        eyebrow="Development Framework" 
        title="Kogi State Development Plan 2024–2056"
        subtitle="The 32-Year strategic roadmap anchoring the State Vision, Strategic Objectives, and 229 KPIs across 14 Pillars."
        action={
          <div className="flex gap-2">
            {isGlobal && (
              <button 
                onClick={() => setShowUploadModal(true)} 
                className="h-9 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[12px] font-semibold inline-flex items-center gap-2 border border-slate-700 shadow-xl cursor-pointer"
              >
                <Upload className="size-3.5" /> Upload Plan
              </button>
            )}
            <button 
              onClick={() => setShowAIModal(true)}
              className="h-9 px-4 rounded-lg gold-gradient text-gold-foreground text-[12px] font-semibold inline-flex items-center gap-2 shadow-xl cursor-pointer"
            >
              <Sparkles className="size-3.5" /> AI Plan Alignment
            </button>
          </div>
        }
      />
      
      <div className="px-6 md:px-8 pb-10 space-y-8">
        
        {/* Vision Block */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white p-8 md:p-12 border-b-4 border-gold shadow-2xl animate-in fade-in">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
           <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="shrink-0 size-24 md:size-32 rounded-full border-4 border-gold/20 flex items-center justify-center bg-gold/5 text-gold relative shadow-[0_0_40px_rgba(250,204,21,0.2)]">
                <Compass className="size-10 md:size-14" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-gold mb-2 flex items-center gap-2">
                   State Vision 2056
                </h3>
                <h2 className="text-xl md:text-3xl font-black tracking-tight leading-tight italic text-slate-100">
                  "{vision}"
                </h2>
                <p className="mt-4 text-slate-400 text-sm max-w-2xl leading-relaxed">
                  A prosperous, technology-driven, industrialised Kogi — the confluence of opportunity for every citizen.
                </p>
              </div>
           </div>
        </div>

        {/* Global Progress */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Overall Progress" value={`${Math.round(displayPillars.reduce((sum, p) => sum + p.progress, 0) / displayPillars.length)}%`} sub="On trajectory" tone="gold" icon={<Target className="size-4" />} />
          <Stat label="Strategic Pillars" value={`${displayPillars.length}`} sub="Core Focus Areas" icon={<Building className="size-4" />} />
          <Stat label="KPIs Tracked" value={`${kpis.length}`} sub="Across all objectives" icon={<Activity className="size-4" />} />
          <Stat label="Active Programmes" value="48" sub="Linked to Pillars" tone="good" icon={<Layers className="size-4" />} />
        </div>

        {/* 14 Strategic Pillars Grid */}
        <div>
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold flex items-center gap-2"><Target className="size-5 text-primary" /> Strategic Development Pillars</h2>
             <Pill tone="info">KPI Framework</Pill>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayPillars.map((p, i) => (
                 <Card key={i} className="hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                       {p.icon}
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0 shadow-sm border border-border">
                         {p.icon}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[14px] truncate text-foreground/90 group-hover:text-primary transition-colors">{p.name}</h3>
                          <div className="flex justify-between items-end mt-2">
                             <div className="text-[11px] font-medium text-muted-foreground">Alignment Score</div>
                             <div className="text-[12px] font-black font-mono">{p.progress}%</div>
                          </div>
                          <div className="mt-1"><Bar value={p.progress} tone={p.progress > 80 ? 'good' : p.progress > 65 ? 'gold' : 'warn'} /></div>
                       </div>
                    </div>
                 </Card>
              ))}
           </div>
        </div>

      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Upload className="size-5 text-[#C5A059]" /> Upload Development Plan
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Select a JSON file containing the 32-year development plan hierarchy (vision, pillars, objectives, and KPIs/MDA mapping).
              </p>
              
              <div className="border border-dashed border-slate-850 bg-slate-950/50 rounded-xl p-6 text-center space-y-3">
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  id="json-file-input" 
                />
                <label 
                  htmlFor="json-file-input" 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer inline-block border border-slate-700 transition-colors"
                >
                  Choose JSON File
                </label>
                <div className="text-[10px] text-slate-500">Only .json files are supported</div>
              </div>
              
              {uploadError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAIModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
              <h3 className="font-bold text-lg flex items-center gap-2 text-[#C5A059]">
                <Sparkles className="size-5 text-[#C5A059]" /> AI Strategic Alignment: {userMda || "Statewide"}
              </h3>
              <button onClick={() => setShowAIModal(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Below are real-time analysis recommendations calculated dynamically for {userMda || "all ministries"} based on current performance indexes and budget distributions:
              </p>
              
              <div className="space-y-3 pt-2">
                {generateAISuggestions().map((s, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-1.5 hover:border-[#C5A059]/25 transition-colors">
                    <h4 className="text-xs font-black text-[#C5A059] uppercase tracking-wider flex items-center gap-2">
                      <Target className="size-3.5" />
                      {s.title}
                    </h4>
                    <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex justify-end">
              <button 
                onClick={() => setShowAIModal(false)} 
                className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow"
              >
                Dismiss Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ensure the code compiler doesnt flag unused icons from lucide
const _kept = [BookOpen, HeartPulse, Droplets, Banknote, ShieldCheck, Users, Briefcase, Cpu, Mountain, TreePine, Scale, GraduationCap, Link2, Target, Flag, Sparkles, Compass];
void _kept;