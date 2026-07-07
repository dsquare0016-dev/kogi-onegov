import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileSearch, Search, SlidersHorizontal, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/dashboard/audit/procurement')({
  component: ProcurementReviewsComponent,
})

const PROCUREMENTS = [
  { id: 'PR-1045', title: 'Lokoja Hospital IT Infrastructure', mda: 'Ministry of Health', value: '₦120M', stage: 'Bidding', flags: 0, status: 'Clear' },
  { id: 'PR-1044', title: 'State Wide Tractor Procurement', mda: 'Ministry of Agriculture', value: '₦450M', stage: 'Award Evaluation', flags: 2, status: 'Flagged' },
  { id: 'PR-1042', title: 'Dekina Road Rehabilitation', mda: 'Ministry of Works', value: '₦850M', stage: 'Execution', flags: 1, status: 'Under Review' },
  { id: 'PR-1039', title: 'Secondary School Desktop PCs', mda: 'Ministry of Education', value: '₦45M', stage: 'Completed', flags: 0, status: 'Clear' },
];

function ProcurementReviewsComponent() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <FileSearch className="size-5" />
            <span className="font-bold uppercase tracking-wider text-sm">Contract Audits</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement Reviews</h1>
          <p className="text-muted-foreground mt-1">Audit state vendor selection, contract values, and bidding compliance.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-64">
             <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
             <Input placeholder="Search contracts..." className="pl-9 bg-background" />
          </div>
          <Button variant="outline" className="gap-2 font-bold bg-background">
            <SlidersHorizontal className="size-4" /> Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left: Summary Cards */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="border-border/60 shadow-sm bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-6 flex flex-col items-center text-center justify-center space-y-2 h-[200px]">
               <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Active Value</p>
               <h2 className="text-4xl font-black text-primary">₦1.4B</h2>
               <p className="text-sm font-semibold text-muted-foreground mt-2">Across 14 active procurements</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase font-bold tracking-wider text-amber-600 dark:text-amber-500">Audit Flags</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
               <h3 className="text-5xl font-black mb-2">3</h3>
               <p className="text-sm text-muted-foreground leading-relaxed">Contracts are currently flagged for insufficient competitive bidding documentation.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Pipeline View */}
        <div className="xl:col-span-3 space-y-6">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="bg-muted/5 border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                Active Procurement Pipeline
              </CardTitle>
              <CardDescription>Track contracts as they move through required auditing stages.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Contract ID & Details</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-center">Bidding Phase</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-center">Award Evaluation</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-center">Execution</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {PROCUREMENTS.map((proc, i) => (
                    <tr key={i} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-base mb-1">{proc.title}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground/80">{proc.id}</span>
                          <span>•</span>
                          <span>{proc.mda}</span>
                          <span>•</span>
                          <span className="font-bold text-primary">{proc.value}</span>
                        </div>
                      </td>
                      
                      {/* Bidding Phase */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className={`size-6 rounded-full flex items-center justify-center mb-1 ${
                            proc.stage === 'Bidding' ? 'bg-blue-500 text-white animate-pulse' :
                            'bg-emerald-500 text-white'
                          }`}>
                            {proc.stage !== 'Bidding' && <CheckCircle2 className="size-4" />}
                          </div>
                          {proc.stage === 'Bidding' && <span className="text-[10px] font-bold text-blue-600">Active</span>}
                        </div>
                      </td>

                      {/* Award Phase */}
                      <td className="px-6 py-4 text-center relative">
                        {proc.stage !== 'Bidding' && (
                          <div className="absolute top-1/2 left-0 -ml-8 w-16 h-0.5 bg-border -mt-2.5 -z-10"></div>
                        )}
                        <div className="flex flex-col items-center z-10">
                          <div className={`size-6 rounded-full flex items-center justify-center mb-1 ${
                            proc.stage === 'Bidding' ? 'bg-muted border border-border' :
                            proc.stage === 'Award Evaluation' ? 'bg-amber-500 text-white animate-pulse' :
                            'bg-emerald-500 text-white'
                          }`}>
                            {proc.stage === 'Execution' || proc.stage === 'Completed' ? <CheckCircle2 className="size-4" /> : null}
                          </div>
                          {proc.stage === 'Award Evaluation' && <span className="text-[10px] font-bold text-amber-600">Active</span>}
                        </div>
                      </td>

                      {/* Execution Phase */}
                      <td className="px-6 py-4 text-center relative">
                        {(proc.stage === 'Execution' || proc.stage === 'Completed') && (
                          <div className="absolute top-1/2 left-0 -ml-8 w-16 h-0.5 bg-border -mt-2.5 -z-10"></div>
                        )}
                        <div className="flex flex-col items-center z-10">
                          <div className={`size-6 rounded-full flex items-center justify-center mb-1 ${
                            proc.stage === 'Completed' ? 'bg-emerald-500 text-white' :
                            proc.stage === 'Execution' ? 'bg-blue-500 text-white animate-pulse' :
                            'bg-muted border border-border'
                          }`}>
                             {proc.stage === 'Completed' && <CheckCircle2 className="size-4" />}
                          </div>
                          {proc.stage === 'Execution' && <span className="text-[10px] font-bold text-blue-600">Active</span>}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className={`font-bold ${
                            proc.status === 'Flagged' ? 'border-red-500 text-red-600 bg-red-500/10' :
                            proc.status === 'Under Review' ? 'border-amber-500 text-amber-600 bg-amber-500/10' :
                            'border-emerald-500 text-emerald-600 bg-emerald-500/10'
                          }`}>
                            {proc.status === 'Flagged' && <AlertCircle className="size-3 mr-1" />}
                            {proc.status}
                          </Badge>
                          {proc.flags > 0 && (
                            <span className="text-[10px] font-bold text-red-600">{proc.flags} Open Query</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
