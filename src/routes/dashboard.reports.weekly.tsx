import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, TrendingUp, TrendingDown, Minus, Download, BarChart3, Users, Building2 } from 'lucide-react';

export const Route = createFileRoute('/dashboard/reports/weekly')({
  component: WeeklyReportsComponent,
})

const SCORECARD = [
  { metric: 'Overall State Performance Index', current: '82%', previous: '78%', trend: 'up', delta: '+4%' },
  { metric: 'Budget Utilization Pace', current: '95%', previous: '98%', trend: 'down', delta: '-3%' },
  { metric: 'Citizen Feedback Sentiment', current: '68%', previous: '68%', trend: 'neutral', delta: '0%' },
  { metric: 'Active Project Milestones Met', current: '42', previous: '35', trend: 'up', delta: '+7' },
];

const MINISTRY_UPDATES = [
  { name: 'Ministry of Health', status: 'Excellent', update: 'Successfully completed the vaccination drive in 3 LGAs. Lokoja General Hospital expansion is ahead of schedule.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { name: 'Ministry of Works & Housing', status: 'At Risk', update: 'Road construction in Dekina delayed due to heavy rainfall. Requesting extension on timeline.', color: 'text-red-500', bg: 'bg-red-500/10' },
  { name: 'Ministry of Education', status: 'On Track', update: 'Distributed 50,000 new textbooks across secondary schools. Teacher training program ongoing.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Ministry of Agriculture', status: 'On Track', update: 'Fertilizer distribution reached 80% completion. Preparing for the upcoming harvest season reports.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
];

function WeeklyReportsComponent() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <CalendarDays className="size-5" />
            <span className="font-bold uppercase tracking-wider text-sm">Week 42, 2026</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Weekly Tactical Scorecard</h1>
          <p className="text-muted-foreground mt-1">Week-over-week performance comparisons and Ministry standups.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-background">
            Previous Week
          </Button>
          <Button className="gap-2 font-bold">
            <Download className="size-4" />
            Export Scorecard
          </Button>
        </div>
      </div>

      {/* Top Scorecard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SCORECARD.map((item, i) => (
          <Card key={i} className="border-border/60 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${
              item.trend === 'up' ? 'text-emerald-500' : item.trend === 'down' ? 'text-red-500' : 'text-slate-500'
            }`}>
              <BarChart3 className="size-24 -mr-8 -mt-8" />
            </div>
            <CardContent className="p-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider h-8 mb-2 line-clamp-2">{item.metric}</p>
              <div className="flex items-end justify-between mt-2">
                <div>
                  <h3 className="text-3xl font-black">{item.current}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Prev: {item.previous}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-md
                  ${item.trend === 'up' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                    item.trend === 'down' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 
                    'bg-slate-500/10 text-slate-600 dark:text-slate-400'}
                `}>
                  {item.trend === 'up' && <TrendingUp className="size-4" />}
                  {item.trend === 'down' && <TrendingDown className="size-4" />}
                  {item.trend === 'neutral' && <Minus className="size-4" />}
                  {item.delta}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Ministry Updates */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="bg-muted/5 border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="size-5 text-primary" />
                    Ministry Standup Summaries
                  </CardTitle>
                  <CardDescription className="mt-1">Aggregated weekly updates from all active MDAs.</CardDescription>
                </div>
                <Badge variant="outline">18/18 Reported</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {MINISTRY_UPDATES.map((min, i) => (
                  <div key={i} className="p-6 hover:bg-muted/5 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-bold">{min.name}</h4>
                      <Badge variant="secondary" className={`${min.bg} ${min.color} border-none font-bold`}>
                        {min.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed border-l-2 pl-4 border-border/60 ml-1">
                      {min.update}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border/50 text-center">
                <Button variant="ghost" className="w-full text-sm font-semibold">Load All Ministry Updates</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Insights & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/60 shadow-sm bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Governor's Weekly Directive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-primary-foreground/90 italic">
                "Excellent progress on the health sector goals this week. However, we must double down on our infrastructure delays. I want a revised timeline from the Ministry of Works by Monday morning."
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-foreground/70">
                <span>— H.E. Usman Ododo</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="size-4 text-primary" />
                Team Utilization
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-muted-foreground">Desk Officers Active</span>
                  <span className="font-bold">245 / 250</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-muted-foreground">Task Completion Rate</span>
                  <span className="font-bold">76%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '76%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
