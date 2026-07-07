import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { UserCheck, Search, Users, MapPin, Briefcase } from 'lucide-react';
import { projectsStore, ProjectRow } from '@/lib/projectsStore';

const USERS = [
  { id: '1', name: 'Engr. Abubakar Yusuf', role: 'Inspector' },
  { id: '2', name: 'Hajia Fatima Sani', role: 'Desk Officer' },
  { id: '3', name: 'Dr. John Ojo', role: 'Project Manager' },
  { id: '4', name: 'Arch. Samuel Peter', role: 'Verification Officer' },
];

export const Route = createFileRoute('/dashboard/projects/assign')({
  component: AssignProject,
});

function AssignProject() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [q, setQ] = useState('');
  const [staffQ, setStaffQ] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [assignedStaff, setAssignedStaff] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    setProjects(projectsStore.projects);
  }, []);

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  const filteredStaff = USERS.filter((u: any) => u.name.toLowerCase().includes(staffQ.toLowerCase()) && u.role !== 'super-admin');

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleAssign = () => {
    if (!selectedProjectId || !assignedStaff) return;
    setIsAssigning(true);
    setTimeout(() => {
      setIsAssigning(false);
      setSelectedProjectId(null);
      setAssignedStaff(null);
    }, 1500);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inspector & Desk Officer Assignment</h1>
        <p className="text-muted-foreground mt-1">Deploy verification personnel and project managers to active State projects.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Step 1: Select Project */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><div className="size-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div> Select Target Project</h2>
          <Card className="border-border/60 shadow-sm h-[500px] flex flex-col">
            <div className="p-4 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input placeholder="Search projects..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {filteredProjects.map(proj => (
                <div 
                  key={proj.id} 
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedProjectId === proj.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border/60 hover:bg-muted/30'}`}
                >
                  <div className="font-bold text-sm leading-tight mb-1">{proj.name}</div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span className="flex items-center gap-1"><MapPin className="size-3" /> {proj.lga}</span>
                    <span className="text-amber-600 font-semibold">{proj.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Step 2: Select Personnel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${selectedProjectId ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>2</div> Assign Personnel</h2>
          <Card className={`border-border/60 shadow-sm h-[500px] flex flex-col transition-opacity ${selectedProjectId ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="p-4 border-b border-border/50">
               <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input placeholder="Search staff members by name or role..." className="pl-9" value={staffQ} onChange={(e) => setStaffQ(e.target.value)} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {filteredStaff.map((user: any) => (
                <div 
                  key={user.id} 
                  onClick={() => setAssignedStaff(user.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between ${assignedStaff === user.id ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500' : 'border-border/60 hover:bg-muted/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                      {user.name.split(" ").map((n: string) => n[0]).join("").substring(0,2)}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{user.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{user.role}</div>
                    </div>
                  </div>
                  {assignedStaff === user.id && <UserCheck className="size-5 text-emerald-500" />}
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {/* Confirmation Banner */}
      {selectedProjectId && assignedStaff && (
        <Card className="border-emerald-500/50 bg-emerald-500/5 shadow-md animate-in slide-in-from-bottom-4">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">Ready to Deploy</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You are assigning <strong>{USERS.find((u: any) => u.id === assignedStaff)?.name}</strong> to inspect and monitor the <strong>{selectedProject?.name}</strong> project in {selectedProject?.lga}.
              </p>
            </div>
            <Button size="lg" className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAssign} disabled={isAssigning}>
              {isAssigning ? 'Deploying...' : 'Confirm Assignment'}
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
