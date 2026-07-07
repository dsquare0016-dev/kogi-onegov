import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileSpreadsheet, Upload, Copy, Save, FileOutput, FileInput } from 'lucide-react';

export const Route = createFileRoute('/dashboard/budget/templates')({
  component: BudgetTemplatesPage,
});

const TEMPLATES = [
  { name: 'Ministry Budget Template', type: 'Excel (.xlsx)', size: '2.4 MB', desc: 'Standard matrix for all mother ministries to submit their annual proposals.' },
  { name: 'Agency Budget Template', type: 'Excel (.xlsx)', size: '1.8 MB', desc: 'Customized matrix for sub-agencies with internally generated revenue fields.' },
  { name: 'Department Budget Template', type: 'Excel (.xlsx)', size: '1.2 MB', desc: 'Departmental breakdown sheets for internal ministry distribution.' },
  { name: 'Local Government Template', type: 'Excel (.xlsx)', size: '3.1 MB', desc: 'Comprehensive fiscal template for the 21 LGAs of Kogi State.' },
  { name: 'Capital Project Template', type: 'Excel (.xlsx)', size: '4.5 MB', desc: 'Detailed cost breakdown, timeline, and milestone template for new capital projects.' },
  { name: 'Programme Template', type: 'Excel (.xlsx)', size: '2.1 MB', desc: 'Template for recurrent social programmes and interventions.' },
];

function BudgetTemplatesPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Standardized Templates</h1>
          <p className="text-muted-foreground mt-1">
            Download the official GBO templates required for all financial submissions.
          </p>
        </div>
        <div className="flex gap-2">
           <button className="px-3 py-1.5 bg-muted text-foreground border border-border rounded text-sm font-semibold hover:bg-muted/80 transition-colors flex items-center gap-1 shadow-sm"><FileInput className="size-4"/> Import Template</button>
           <button className="px-3 py-1.5 bg-muted text-foreground border border-border rounded text-sm font-semibold hover:bg-muted/80 transition-colors flex items-center gap-1 shadow-sm"><FileOutput className="size-4"/> Export Library</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((tpl, i) => (
          <Card key={i} className="border-border/60 shadow-sm hover:border-primary/50 transition-colors group flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <FileSpreadsheet className="size-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight mb-1">{tpl.name}</h3>
                  <span className="text-[10px] font-mono font-medium text-muted-foreground">{tpl.type} • {tpl.size}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-6 flex-1">{tpl.desc}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                <div className="flex gap-2">
                   <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Save Template"><Save className="size-4"/></button>
                   <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Duplicate Template"><Copy className="size-4"/></button>
                </div>
                <button className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline bg-primary/10 px-3 py-1.5 rounded">
                  <Download className="size-3" /> Download
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-2 border-border bg-muted/10 mt-8">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-background rounded-full border border-border shadow-sm mb-4">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-lg mb-2">Upload Custom Template (Admins Only)</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            General Budget Office administrators can deploy new standardized templates here. These will immediately become mandatory for all downstream MDAs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
