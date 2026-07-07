import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Map, CheckCircle2, TrendingUp, Award, Download, Building2 } from 'lucide-react';

export const Route = createFileRoute('/dashboard/reports/annual')({
  component: AnnualReportsComponent,
})

const YEAR_IN_REVIEW = [
  { month: 'Q1', title: 'Launch of the State Development Plan', desc: 'The governor officially inaugurated the 3-pillar development strategy.' },
  { month: 'Q2', title: 'Agritech Subsidy Program', desc: 'Over 100,000 farmers received mechanized farming tools and training.' },
  { month: 'Q3', title: 'Healthcare Infrastructure Surge', desc: 'Completion of 12 primary healthcare centers across remote LGAs.' },
  { month: 'Q4', title: 'Civil Service Digitization', desc: 'Full migration of state records to the new secure cloud infrastructure.' },
];

function AnnualReportsComponent() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-12 pb-24 bg-slate-50/50 dark:bg-slate-900/10">
      
      {/* Magazine-style Cover Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888047432-8411516e8125?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity grayscale"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        
        <div className="relative p-12 md:p-20 flex flex-col items-center text-center space-y-6">
          <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-emerald-500/10 px-4 py-1 uppercase tracking-[0.3em] font-bold text-xs">
            Official Publication
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-lg">
            2026
            <span className="block text-3xl md:text-4xl mt-2 font-bold tracking-normal text-slate-300">Annual State Report</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed font-light mt-4">
            A comprehensive review of the Governance Delivery Unit's achievements, financial execution, and strategic milestones over the past fiscal year.
          </p>
          <Button size="lg" className="mt-8 font-bold text-lg px-8 py-6 h-auto bg-white text-slate-900 hover:bg-slate-200 gap-2 rounded-full transition-transform active:scale-95 shadow-xl shadow-white/10">
            <Download className="size-5" /> Download Full Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Governor's Message */}
        <div className="lg:col-span-5 space-y-8">
          <div className="prose prose-lg dark:prose-invert">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="size-8 text-primary" />
              <h2 className="text-3xl font-black m-0">Message from the Governor</h2>
            </div>
            
            <p className="text-xl font-medium leading-relaxed italic text-muted-foreground border-l-4 border-primary pl-6">
              "This year, we have proven that with strict accountability, data-driven governance, and an unwavering commitment to our Development Plan, we can reshape the future of Kogi State."
            </p>
            
            <p>
              Citizens of Kogi State, it brings me immense pride to present this Annual Report. When we launched the Governance Delivery Unit, our goal was simple: to ensure that every promise made is a promise kept.
            </p>
            <p>
              Through our three pillars—Fostering Prosperity, Building Resilience, and Providing Direction—we have executed over 300 infrastructure projects, digitized our civil service, and significantly grown our internal revenue without increasing the tax burden on the common man.
            </p>
            <p>
              The data presented in this report is not just numbers; it represents safer roads, better hospitals, empowered farmers, and a brighter future for our children.
            </p>
            
            <div className="mt-8">
              <h4 className="font-bold text-foreground m-0">His Excellency, Usman Ododo</h4>
              <p className="text-sm text-muted-foreground m-0 uppercase tracking-wider">Executive Governor, Kogi State</p>
            </div>
          </div>
        </div>

        {/* Right Column: Massive Aggregated Stats */}
        <div className="lg:col-span-7 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-primary text-primary-foreground border-none shadow-xl">
              <CardContent className="p-8">
                <CheckCircle2 className="size-10 opacity-50 mb-6" />
                <h3 className="text-5xl font-black mb-2">342</h3>
                <p className="text-sm font-bold uppercase tracking-wider opacity-80">Major Projects Completed</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-600 text-white border-none shadow-xl">
              <CardContent className="p-8">
                <TrendingUp className="size-10 opacity-50 mb-6" />
                <h3 className="text-5xl font-black mb-2">+18.4%</h3>
                <p className="text-sm font-bold uppercase tracking-wider opacity-80">IGR Growth (YoY)</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 text-white border-none shadow-xl">
              <CardContent className="p-8">
                <Building2 className="size-10 opacity-50 mb-6" />
                <h3 className="text-5xl font-black mb-2">50,000+</h3>
                <p className="text-sm font-bold uppercase tracking-wider opacity-80">Jobs Created</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-600 text-white border-none shadow-xl">
              <CardContent className="p-8">
                <Map className="size-10 opacity-50 mb-6" />
                <h3 className="text-5xl font-black mb-2">450km</h3>
                <p className="text-sm font-bold uppercase tracking-wider opacity-80">Rural Roads Constructed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Year in Review Timeline */}
      <div className="pt-12 border-t border-border/50">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">2026 Journey</Badge>
          <h2 className="text-4xl font-black">Year in Review</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {YEAR_IN_REVIEW.map((item, i) => (
            <Card key={i} className="border-border/60 shadow-md relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Award className="size-24 -mr-8 -mt-8" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-primary uppercase tracking-widest">{item.month}</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-bold leading-tight mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
