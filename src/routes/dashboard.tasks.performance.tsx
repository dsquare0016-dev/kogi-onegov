import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Trophy, Target, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const Route = createFileRoute('/dashboard/tasks/performance')({
  component: TaskPerformanceComponent,
})

function TaskPerformanceComponent() {
  const staffPerformance = [
    { name: "Dr. Aishat (Ministry of Health)", score: 98, completed: 45, rating: "Excellent" },
    { name: "Engr. Musa (Ministry of Works)", score: 85, completed: 32, rating: "Very Good" },
    { name: "Mrs. Bello (Ministry of Education)", score: 72, completed: 18, rating: "Good" },
    { name: "Mr. Yusuf (Ministry of Agriculture)", score: 55, completed: 8, rating: "Fair" },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Performance Engine</h1>
        <p className="text-muted-foreground mt-1">Automated calculations for task completion percentages and delivery scores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/60 shadow-sm bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex flex-col justify-center items-center text-center h-full">
            <Trophy className="size-10 text-primary mb-4" />
            <div className="text-4xl font-bold text-primary mb-1">82.5%</div>
            <div className="text-sm font-medium text-primary/80">Average Statewide Delivery Score</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
             <CardTitle className="text-lg font-bold">Performance Calculation Metrics</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <MetricCard title="Timeliness" weight="40%" score="85%" />
               <MetricCard title="Evidence Quality" weight="30%" score="92%" />
               <MetricCard title="Budget Compliance" weight="20%" score="78%" />
               <MetricCard title="Verification" weight="10%" score="65%" />
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="bg-muted/30 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
           <CardTitle className="text-lg flex items-center gap-2">
            <Star className="size-5 text-amber-500" /> Staff Performance Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Staff Member</th>
                  <th className="px-6 py-4 font-semibold">Tasks Completed</th>
                  <th className="px-6 py-4 font-semibold w-1/3">Delivery Score</th>
                  <th className="px-6 py-4 font-semibold">Performance Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {staffPerformance.map((s, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-semibold">{s.name}</td>
                    <td className="px-6 py-4">{s.completed}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className={`h-2 rounded-full ${s.score >= 90 ? 'bg-emerald-500' : s.score >= 75 ? 'bg-blue-500' : s.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${s.score}%` }}></div>
                        </div>
                        <span className="font-bold w-10 text-right">{s.score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full 
                        ${s.rating === 'Excellent' ? 'bg-emerald-500/10 text-emerald-500' : ''}
                        ${s.rating === 'Very Good' ? 'bg-blue-500/10 text-blue-500' : ''}
                        ${s.rating === 'Good' ? 'bg-amber-500/10 text-amber-500' : ''}
                        ${s.rating === 'Fair' ? 'bg-orange-500/10 text-orange-500' : ''}
                       `}>
                        {s.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

function MetricCard({ title, weight, score }: { title: string, weight: string, score: string }) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{title}</div>
      <div className="text-2xl font-bold">{score}</div>
      <div className="text-xs font-medium text-primary bg-primary/10 inline-block px-2 py-0.5 rounded-md">Weight: {weight}</div>
    </div>
  )
}
