import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Search, FileText, Download, Activity, CheckCircle2, ShieldAlert, BarChart3, Upload } from 'lucide-react';
import { projectsStore, ProjectRow } from '@/lib/projectsStore';

export const Route = createFileRoute('/dashboard/projects/monitor')({
  component: MonitorProjects,
});

function MonitorProjects() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [q, setQ] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingToVerification, setIsSendingToVerification] = useState(false);

  useEffect(() => {
    setProjects(projectsStore.projects);
  }, []);

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.ministry.toLowerCase().includes(q.toLowerCase()));
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleSelect = (proj: ProjectRow) => {
    setSelectedProjectId(proj.id);
    setProgress(proj.progress);
  };

  const saveProgress = () => {
    if (!selectedProject) return;
    const updated = projects.map(p => p.id === selectedProject.id ? { ...p, progress } : p);
    projectsStore.projects = updated;
    setProjects(updated);
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('Status Report PDF Generated & Downloaded!');
    }, 1500);
  };

  const handleSendToVerification = () => {
    setIsSendingToVerification(true);
    setTimeout(() => {
      setIsSendingToVerification(false);
      if (selectedProject) {
        const updated = projects.map(p => p.id === selectedProject.id ? { ...p, status: 'Verification Pending' } : p);
        projectsStore.projects = updated;
        setProjects(updated);
      }
    }, 1000);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Project Monitoring</h1>
          <p className="text-muted-foreground mt-1">Track physical progress, evaluate inspector reports, and generate status documents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Projects List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Search active projects..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          
          <div className="space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
            {filteredProjects.map(proj => (
              <Card 
                key={proj.id} 
                onClick={() => handleSelect(proj)}
                className={`border-border/60 shadow-sm cursor-pointer transition-all ${selectedProjectId === proj.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="font-bold text-sm">{proj.name}</div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Progress</span>
                      <span className={proj.progress >= 90 ? 'text-emerald-500' : proj.progress >= 50 ? 'text-amber-500' : 'text-primary'}>{proj.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                      <div className={`h-full ${proj.progress >= 90 ? 'bg-emerald-500' : proj.progress >= 50 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${proj.progress}%` }} />
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Side: Monitoring Details */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedProject ? (
            <div className="h-[400px] flex flex-col items-center justify-center border border-dashed rounded-lg text-muted-foreground bg-muted/5">
              <Activity className="size-8 mb-3 text-muted-foreground/50" />
              <p>Select a project to view monitoring details</p>
            </div>
          ) : (
            <>
              {/* Progress Update Card */}
              <Card className="border-border/60 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                  <CardTitle className="text-xl">{selectedProject.name}</CardTitle>
                  <CardDescription>Execution tracking for {selectedProject.ministry}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-semibold">Update Physical Progress (%)</label>
                      <span className="text-2xl font-black text-primary">{progress}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={progress} 
                      onChange={e => {
                        setProgress(Number(e.target.value));
                        saveProgress();
                      }}
                      className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div className="p-4 rounded-xl border border-border/60 bg-muted/10 space-y-2">
                      <div className="text-xs font-bold uppercase text-muted-foreground">Assigned Inspector</div>
                      <div className="font-semibold text-sm">Engr. Abubakar Yusuf</div>
                      <div className="text-xs text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 className="size-3" /> Currently On Site</div>
                    </div>
                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                      <div className="text-xs font-bold uppercase text-amber-600">Active Bottlenecks</div>
                      <div className="font-semibold text-sm">Material Supply Delay</div>
                      <div className="text-xs text-muted-foreground">Reported 2 days ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reports & Actions Card */}
              <Card className="border-border/60 shadow-sm animate-in fade-in zoom-in-95 duration-200 delay-100">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2"><FileText className="size-5 text-primary" /> Reports & Actions</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center gap-2 border-primary/20 hover:bg-primary/5" onClick={handleGenerateReport} disabled={isGenerating}>
                      {isGenerating ? <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : <Download className="size-6 text-primary" />}
                      <div className="font-bold">Generate Status Report</div>
                      <div className="text-xs text-muted-foreground font-normal text-center">Export current progress & financial data to PDF</div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className={`h-auto p-4 flex flex-col items-center justify-center gap-2 transition-colors ${progress >= 90 ? 'border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10' : 'border-border/50 opacity-50'}`}
                      disabled={progress < 90 || isSendingToVerification}
                      onClick={handleSendToVerification}
                    >
                      <Upload className={`size-6 ${progress >= 90 ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                      <div className="font-bold">Send to Verification Engine</div>
                      <div className="text-xs text-muted-foreground font-normal text-center">Push to final authenticity verification step</div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
