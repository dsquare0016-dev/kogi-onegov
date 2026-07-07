import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PieChart, Download, Layers, TrendingUp, AlertTriangle } from 'lucide-react';

export const Route = createFileRoute('/dashboard/reports/quarterly')({
  component: QuarterlyReportsComponent,
})

const PILLARS = [
  { 
    id: 'p1', 
    name: 'Fostering Prosperity', 
    description: 'Economic growth, infrastructure, and revenue generation.',
    score: 85,
    status: 'Exceeding Targets',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-500',
    lightBg: 'bg-emerald-500/10',
    metrics: [
      { name: 'IGR Growth', value: '+12%', target: '+10%' },
      { name: 'Infrastructure Projects Completed', value: '18', target: '15' },
    ]
  },
  { 
    id: 'p2', 
    name: 'Building Resilience', 
    description: 'Healthcare, education, security, and social welfare.',
    score: 72,
    status: 'On Track',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    lightBg: 'bg-blue-500/10',
    metrics: [
      { name: 'Hospital Renovations', value: '4', target: '4' },
      { name: 'School Enrollment Rate', value: '+5%', target: '+8%' },
    ]
  },
  { 
    id: 'p3', 
    name: 'Providing Direction', 
    description: 'Governance, civil service reform, and transparency.',
    score: 58,
    status: 'Needs Attention',
    color: 'bg-amber-500',
    textColor: 'text-amber-500',
    lightBg: 'bg-amber-500/10',
    metrics: [
      { name: 'Digitization of Records', value: '45%', target: '60%' },
      { name: 'Civil Service Training', value: '1,200', target: '2,500' },
    ]
  },
];

function QuarterlyReportsComponent() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
        <div>
          <div className="flex items-center gap-3 text-primary mb-3">
            <PieChart className="size-6" />
            <span className="font-bold uppercase tracking-[0.2em] text-sm">Macro-Economic Review</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Q3 2026 Report</h1>
          <p className="text-lg text-muted-foreground mt-2 font-medium">Performance aligned to the State Development Plan Pillars</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-background border-border/60">
            Compare with Q2
          </Button>
          <Button className="gap-2 font-bold shadow-md">
            <Download className="size-4" /> Export Full Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Overview & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/60 shadow-sm bg-primary/5">
            <CardContent className="p-8 text-center space-y-4">
               <div className="mx-auto size-32 rounded-full border-8 border-primary/20 flex items-center justify-center relative">
                 <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary" strokeDasharray="289" strokeDashoffset={289 - (289 * 76) / 100} strokeLinecap="round" />
                 </svg>
                 <div className="text-center">
                   <span className="text-4xl font-black">76%</span>
                 </div>
               </div>
               <div>
                 <h3 className="font-bold text-lg">Overall Q3 Score</h3>
                 <p className="text-sm text-muted-foreground mt-1 leading-relaxed">The state has achieved 76% of its aggregated targets for the third quarter.</p>
               </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-sm uppercase tracking-wider font-bold">Q3 Highlights</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground"><strong className="text-foreground">Revenue Growth:</strong> IGR exceeded targets by 2% due to new tech implementations.</p>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground"><strong className="text-foreground">Digitization Lag:</strong> Civil service reform targets were missed due to hardware procurement delays.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Pillar Breakdown */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center gap-2 text-xl font-bold border-b border-border/50 pb-4">
            <Layers className="size-5 text-primary" />
            Pillar Performance Breakdown
          </div>
          
          <div className="space-y-6">
            {PILLARS.map(pillar => (
              <Card key={pillar.id} className="border-border/60 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Pillar Info block */}
                  <div className={`md:w-1/3 p-6 ${pillar.lightBg} border-r border-border/50 flex flex-col justify-center`}>
                    <h3 className="text-xl font-black mb-2">{pillar.name}</h3>
                    <p className="text-sm opacity-80 mb-6">{pillar.description}</p>
                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold uppercase tracking-wider">Score</span>
                        <span className={`text-3xl font-black ${pillar.textColor}`}>{pillar.score}%</span>
                      </div>
                      <div className="h-3 w-full bg-background rounded-full overflow-hidden border border-border/50">
                        <div className={`h-full ${pillar.color} rounded-full`} style={{ width: `${pillar.score}%` }}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pillar Metrics block */}
                  <div className="md:w-2/3 p-6 bg-card flex flex-col">
                    <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
                      <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Key Performance Indicators</h4>
                      <Badge variant="outline" className={`${pillar.textColor} border-current bg-transparent font-bold`}>{pillar.status}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                      {pillar.metrics.map((metric, i) => (
                        <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50 flex flex-col justify-center">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{metric.name}</p>
                          <div className="flex items-baseline gap-3">
                            <span className="text-2xl font-black">{metric.value}</span>
                            <span className="text-xs text-muted-foreground font-medium">Target: {metric.target}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
