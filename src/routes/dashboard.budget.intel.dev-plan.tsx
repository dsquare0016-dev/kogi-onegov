import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Sparkles, AlertTriangle, TrendingUp, TrendingDown, ArrowRight, BrainCircuit } from 'lucide-react';

export const Route = createFileRoute('/dashboard/budget/intel/dev-plan')({
  component: BudgetVsDevPlanPage,
});

function BudgetVsDevPlanPage() {
  const PILLARS_DATA = [
    { name: "Agriculture & Food Security", expected: 5.0, actual: 3.0, recommendation: "Increase mechanization and irrigation investments." },
    { name: "Business, Innovation & Skills", expected: 6.0, actual: 5.5, recommendation: "Accelerate startup grants disbursement by 20%." },
    { name: "Digital Economy", expected: 8.0, actual: 8.2, recommendation: "Sustain momentum; scale fiber optic deployment." },
    { name: "Infrastructure", expected: 15.0, actual: 12.5, recommendation: "Address right-of-way delays on Lokoja-Okene axis." },
    { name: "Health", expected: 10.0, actual: 7.0, recommendation: "Fast-track procurement for Reference Hospital upgrade." },
    { name: "Education", expected: 12.0, actual: 11.5, recommendation: "Minor lag in school renovations; deploy additional contractors." },
    { name: "Security, Law & Justice", expected: 8.0, actual: 8.0, recommendation: "Target achieved. Maintain current budget execution velocity." },
    { name: "Water & Sanitation", expected: 4.0, actual: 2.5, recommendation: "Immediate intervention required for Omi Dam irrigation delays." }
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 pb-24">
      <div>
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full text-[11px] uppercase tracking-widest text-gold font-bold mb-4 border border-gold/20">
           <BrainCircuit className="size-3.5" /> Signature Feature
         </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Budget vs Development Plan</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Real-time measurement of how budget execution translates into actual development plan outcomes.
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border shadow-sm rounded-xl p-6 flex flex-col justify-center">
           <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Expected Dev Contribution</div>
           <div className="font-black text-3xl tracking-tight text-foreground">68.0%</div>
           <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Target className="size-3"/> Annual Target</div>
        </div>
        <div className="bg-card border border-border shadow-sm rounded-xl p-6 flex flex-col justify-center border-l-4 border-l-primary">
           <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">Actual Dev Contribution</div>
           <div className="font-black text-3xl tracking-tight text-primary">58.2%</div>
           <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><TrendingUp className="size-3 text-primary"/> Current Run-rate</div>
        </div>
        <div className="bg-rose-500/5 border border-rose-500/20 shadow-sm rounded-xl p-6 flex flex-col justify-center">
           <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">Achievement Gap</div>
           <div className="font-black text-3xl tracking-tight text-rose-600 dark:text-rose-400">9.8%</div>
           <div className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-2 flex items-center gap-1"><TrendingDown className="size-3"/> Underperformance</div>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 shadow-sm rounded-xl p-6 flex flex-col justify-center">
           <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Strategic Achievement Index</div>
           <div className="font-black text-3xl tracking-tight text-emerald-600 dark:text-emerald-400">0.85</div>
           <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-2 flex items-center gap-1"><Sparkles className="size-3"/> Efficiency Ratio</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {PILLARS_DATA.map((pillar, i) => {
            const gap = parseFloat((pillar.expected - pillar.actual).toFixed(1));
            const isUnderperforming = gap > 0;
            const isExceeding = gap < 0;

            return (
              <Card key={i} className={`border-border/60 shadow-sm hover:border-primary/30 transition-colors ${gap >= 2.0 ? 'ring-1 ring-rose-500/20' : ''}`}>
                 <CardHeader className="pb-2">
                    <CardTitle className="text-[15px] font-bold line-clamp-1">{pillar.name}</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                       <div className="flex-1">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Expected</div>
                          <div className="text-xl font-mono">{pillar.expected.toFixed(1)}%</div>
                       </div>
                       <div className="flex-1 border-l border-border/50 pl-4">
                          <div className="text-[10px] text-primary uppercase tracking-widest font-bold mb-1">Actual</div>
                          <div className="text-xl font-mono text-primary">{pillar.actual.toFixed(1)}%</div>
                       </div>
                       <div className="flex-1 border-l border-border/50 pl-4">
                          <div className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${isUnderperforming ? 'text-rose-500' : isExceeding ? 'text-emerald-500' : 'text-slate-500'}`}>Gap</div>
                          <div className={`text-xl font-mono ${isUnderperforming ? 'text-rose-500' : isExceeding ? 'text-emerald-500' : 'text-slate-500'}`}>
                             {gap > 0 ? `-${gap.toFixed(1)}` : gap < 0 ? `+${Math.abs(gap).toFixed(1)}` : '0.0'}%
                          </div>
                       </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                       <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                          gap >= 2.0 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                          gap > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          gap < 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                       }`}>
                          Status: {gap >= 2.0 ? 'Severely Underperforming' : gap > 0 ? 'Underperforming' : gap < 0 ? 'Exceeding Target' : 'On Track'}
                       </span>
                    </div>

                    <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
                       <div className="flex gap-2 text-xs">
                          <Sparkles className="size-3.5 text-gold shrink-0 mt-0.5" />
                          <div className="font-medium text-foreground/90 leading-relaxed">
                             <span className="font-bold text-gold uppercase text-[10px] tracking-widest block mb-0.5">AI Recommendation</span>
                             {pillar.recommendation}
                          </div>
                       </div>
                    </div>
                 </CardContent>
              </Card>
            )
         })}
      </div>
    </div>
  );
}
