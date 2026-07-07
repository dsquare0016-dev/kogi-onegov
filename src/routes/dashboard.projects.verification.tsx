import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderKanban, CheckCircle2, XCircle, AlertTriangle, MapPin, FileImage, FileText, Video } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectsStore, ProjectRow } from '@/lib/projectsStore';

export const Route = createFileRoute('/dashboard/projects/verification')({
  component: VerificationEngine,
});

function VerificationEngine() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(null);

  useEffect(() => {
    setProjects(projectsStore.projects);
    const handleUpdate = () => setProjects(projectsStore.projects);
    window.addEventListener('projectsStoreUpdate', handleUpdate);
    return () => window.removeEventListener('projectsStoreUpdate', handleUpdate);
  }, []);

  const pendingVerifications = projects.filter(p => p.status === 'Verification Pending');

  const approveVerification = () => {
    if (selectedProject) {
      const updated = projects.map(p => p.id === selectedProject.id ? { ...p, status: 'Completed', progress: 100 } : p);
      projectsStore.projects = updated;
      setSelectedProject(null);
    }
  };

  const rejectVerification = () => {
    if (selectedProject) {
      const updated = projects.map(p => p.id === selectedProject.id ? { ...p, status: 'Ongoing', progress: 90 } : p);
      projectsStore.projects = updated;
      setSelectedProject(null);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Authenticity & Verification Engine</h1>
        <p className="text-muted-foreground mt-1">Review geo-tagged evidence, site photos, and completion certificates before approving project closure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Awaiting Verification</h3>
          {pendingVerifications.length === 0 && (
            <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground bg-muted/5">No projects awaiting verification</div>
          )}
          {pendingVerifications.map(proj => (
            <Card key={proj.id} className={`border-border/60 shadow-sm cursor-pointer transition-all hover:border-primary/50 ${selectedProject?.id === proj.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`} onClick={() => setSelectedProject(proj)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="font-medium text-sm text-primary">{proj.ministry}</div>
                  <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${proj.risk === 'High Risk' ? 'bg-destructive/10 text-destructive' : proj.risk === 'Medium Risk' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                    {proj.risk}
                  </div>
                </div>
                <div>
                  <div className="font-bold">{proj.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="size-3" /> {proj.lga}</div>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                  <span className="text-muted-foreground">Engr. Abubakar Yusuf</span>
                  <span className="text-muted-foreground">Today</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedProject ? (
            <Card className="border-border/60 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{selectedProject.name}</CardTitle>
                    <CardDescription className="mt-1">{selectedProject.ministry} • Executed by Engr. Abubakar Yusuf</CardDescription>
                  </div>
                  <div className="bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-xs font-bold uppercase border border-amber-500/20">
                    {selectedProject.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div>
                  <h3 className="font-semibold text-sm mb-3 border-b border-border/50 pb-2">Mandatory Evidence Vault</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="aspect-square bg-muted/50 rounded-lg border border-border/50 flex flex-col items-center justify-center p-4 hover:bg-muted transition-colors cursor-pointer group">
                      <FileImage className="size-8 text-primary/70 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-center">Site Photos (4)</span>
                    </div>
                    <div className="aspect-square bg-muted/50 rounded-lg border border-border/50 flex flex-col items-center justify-center p-4 hover:bg-muted transition-colors cursor-pointer group relative overflow-hidden">
                      <div className="absolute top-2 right-2 flex gap-0.5">
                        <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      </div>
                      <MapPin className="size-8 text-emerald-500/70 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-center">Geo-Tagged Evidence</span>
                    </div>
                    <div className="aspect-square bg-muted/50 rounded-lg border border-border/50 flex flex-col items-center justify-center p-4 hover:bg-muted transition-colors cursor-pointer group">
                      <Video className="size-8 text-blue-500/70 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-center">Video Walkthrough</span>
                    </div>
                    <div className="aspect-square bg-muted/50 rounded-lg border border-border/50 flex flex-col items-center justify-center p-4 hover:bg-muted transition-colors cursor-pointer group">
                      <FileText className="size-8 text-amber-500/70 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-center">Completion Cert.</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-3 border-b border-border/50 pb-2">AI Authenticity Analysis</h3>
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      <strong>AI Review Passed:</strong> Geo-metadata matches target LGA coordinates. Image timestamps correlate with reported execution dates. No duplicate images detected across previous submissions.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <h3 className="font-semibold text-sm mb-3">Verification Action</h3>
                  <div className="space-y-4">
                    <textarea className="w-full p-3 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary h-24" placeholder="Enter inspection notes or rejection remarks..."></textarea>
                    <div className="flex items-center gap-4">
                      <Button onClick={approveVerification} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12">
                        <CheckCircle2 className="size-5 mr-2" /> Approve & Close Project
                      </Button>
                      <Button onClick={rejectVerification} variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive/10 font-bold h-12">
                        <XCircle className="size-5 mr-2" /> Reject Verification
                      </Button>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/60 rounded-xl p-8">
              <FolderKanban className="size-12 mb-4 opacity-20" />
              <p>Select a project from the left panel to review its evidence and authenticity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
