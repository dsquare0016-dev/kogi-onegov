import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Download, Presentation, Target, Wallet, BarChart4 } from 'lucide-react';

export const Route = createFileRoute('/dashboard/reports/monthly')({
  component: MonthlyReportsComponent,
})

function MonthlyReportsComponent() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 pb-24">
      {/* Header / Briefing Cover */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-primary/20 pb-8">
        <div>
          <div className="flex items-center gap-3 text-primary mb-3">
            <FileText className="size-6" />
            <span className="font-black uppercase tracking-[0.2em] text-sm">Official Executive Briefing</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">October 2026</h1>
          <p className="text-xl text-muted-foreground mt-2 font-medium">Monthly Strategic Performance Review</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-background shadow-sm border-border/60">
            <Printer className="size-4" /> Print Brief
          </Button>
          <Button variant="outline" className="gap-2 bg-background shadow-sm border-border/60">
            <Download className="size-4" /> PDF
          </Button>
          <Button className="gap-2 font-bold shadow-md">
            <Presentation className="size-4" /> Present Mode
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Executive Summary */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border/60 shadow-md">
            <CardHeader className="bg-primary/5 border-b border-border/50 pb-5">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-foreground/90 font-medium">
                The month of October saw significant advancements across all three core pillars of the State Development Plan. Budget utilization remained highly efficient at <strong>92%</strong>, allowing for the accelerated completion of 14 critical infrastructure projects, primarily concentrated in the Eastern senatorial district.
              </p>
              <h3 className="text-xl font-bold mt-6 mb-3">Key Milestones Achieved</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Healthcare Expansion:</strong> The Lokoja General Hospital renovation reached 85% completion, tracking two weeks ahead of schedule.</li>
                <li><strong className="text-foreground">Agricultural Subsidy:</strong> 50,000 farmers received mechanized farming equipment, completing Phase 1 of the Agritech initiative.</li>
                <li><strong className="text-foreground">Revenue Generation:</strong> IGR increased by 4.2% compared to September, driven by automated tax collection systems.</li>
              </ul>
              <h3 className="text-xl font-bold mt-6 mb-3">Areas of Concern</h3>
              <p className="text-muted-foreground">
                Road rehabilitation in the central district has faced weather-related delays. The Ministry of Works has submitted a revised timeline requesting a 3-week extension to ensure quality standards are met.
              </p>
            </CardContent>
          </Card>

          {/* Large Chart Placeholder */}
          <Card className="border-border/60 shadow-sm">
             <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart4 className="size-5 text-primary" />
                Monthly Project Completion vs Budget Drawdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] w-full bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center border-t border-border/10">
                 {/* Decorative background grid */}
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                 <BarChart4 className="size-20 text-slate-300 dark:text-slate-700 mb-4" />
                 <h3 className="text-xl font-bold text-slate-400">Data Visualization Render</h3>
                 <p className="text-sm text-slate-500 max-w-sm text-center mt-2">
                   Interactive bar charts comparing expected vs actual budget utilization across all MDAs will render here.
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Strategic Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/60 shadow-sm bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Target className="size-4" /> Month's Target Pacing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-baseline gap-2">
                <h2 className="text-6xl font-black">94<span className="text-3xl text-primary">%</span></h2>
              </div>
              <p className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
                Of all planned milestones for October have been successfully delivered and verified by the GDU.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/5 border-b border-border/50 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Wallet className="size-4 text-emerald-500" /> Financial Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Total Expended (Oct)</p>
                <h4 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₦4.2 Billion</h4>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Budget Variance</p>
                <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400">-1.5% (Under Budget)</h4>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Top Spending Ministry</p>
                <h4 className="text-lg font-bold">Ministry of Works</h4>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
