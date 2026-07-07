import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, GraduationCap, Users, Calendar, Award, BarChart3, ChevronRight } from 'lucide-react';

export const Route = createFileRoute('/dashboard/desk-officers/training')({
  component: TrainingStatusPage,
});

const COHORTS = [
  { id: 'C-26-A', name: 'ERP Fundamentals & Digital Literacy', date: 'Jul 10 - Jul 14, 2026', enrolled: 45, status: 'Upcoming' },
  { id: 'C-26-B', name: 'GDU Reporting Standards & KPI Mapping', date: 'Aug 05 - Aug 09, 2026', enrolled: 120, status: 'Registration Open' },
  { id: 'C-25-D', name: 'Advanced Budget Alignment', date: 'Dec 01 - Dec 05, 2025', enrolled: 88, status: 'Completed' }
];

const DO_PROGRESS = [
  { name: 'Joy Etim', mda: 'Ministry of Health', score: 92, status: 'Exemplary' },
  { name: 'Tunde Olaniyi', mda: 'Ministry of Works', score: 78, status: 'On Track' },
  { name: 'Chika Eze', mda: 'Ministry of Education', score: 45, status: 'Needs Intervention' },
  { name: 'Amaka Okoro', mda: 'Ministry of Finance', score: 0, status: 'Not Started' }
];

function TrainingStatusPage() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto pb-24 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Capacity Building & Training Status</h1>
        <p className="text-muted-foreground mt-1">
          Monitor the training progress and readiness scores of all certified and pending Desk Officers across the state.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/60 shadow-sm bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-primary mb-2">
              <GraduationCap className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">State Readiness Score</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">74%</div>
            <div className="text-xs text-muted-foreground mt-1">Target: 90% by Q4</div>
          </CardContent>
        </Card>
        
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <Award className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Fully Trained Officers</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">88</div>
            <div className="text-xs text-muted-foreground mt-1">Across 32 MDAs</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-amber-600 mb-2">
              <Users className="size-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Pending Training</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">165</div>
            <div className="text-xs text-muted-foreground mt-1">Mandatory modules incomplete</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Cohorts */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
             <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="size-5 text-primary" /> Upcoming & Past Cohorts
              </CardTitle>
              <button className="text-xs font-bold text-primary hover:underline">Manage Cohorts</button>
             </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border/50">
               {COHORTS.map(cohort => (
                 <div key={cohort.id} className="p-4 hover:bg-muted/10 transition-colors cursor-pointer group">
                   <div className="flex justify-between items-start mb-2">
                     <div>
                       <span className="text-xs font-bold text-muted-foreground block mb-1">{cohort.id}</span>
                       <h4 className="font-semibold text-sm">{cohort.name}</h4>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                       cohort.status === 'Completed' ? 'bg-muted text-muted-foreground' :
                       cohort.status === 'Upcoming' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-600'
                     }`}>
                       {cohort.status}
                     </span>
                   </div>
                   <div className="flex justify-between items-center text-xs text-muted-foreground">
                     <span className="flex items-center gap-1.5"><Calendar className="size-3" /> {cohort.date}</span>
                     <span className="flex items-center gap-1.5"><Users className="size-3" /> {cohort.enrolled} Enrolled</span>
                   </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

        {/* DO Progress List */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
             <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" /> Individual Progress Tracker
              </CardTitle>
              <button className="text-xs font-bold text-primary hover:underline">View All</button>
             </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border/50">
               {DO_PROGRESS.map((officer, i) => (
                 <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors cursor-pointer">
                   <div>
                     <h4 className="font-semibold text-sm text-foreground">{officer.name}</h4>
                     <p className="text-xs text-muted-foreground">{officer.mda}</p>
                   </div>
                   <div className="flex items-center gap-6">
                     <div className="flex flex-col items-end">
                       <span className="text-sm font-bold">{officer.score}%</span>
                       <span className={`text-[10px] font-bold uppercase tracking-wider ${
                         officer.status === 'Exemplary' ? 'text-emerald-500' :
                         officer.status === 'On Track' ? 'text-primary' :
                         officer.status === 'Not Started' ? 'text-muted-foreground' : 'text-rose-500'
                       }`}>
                         {officer.status}
                       </span>
                     </div>
                     <ChevronRight className="size-4 text-muted-foreground" />
                   </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
