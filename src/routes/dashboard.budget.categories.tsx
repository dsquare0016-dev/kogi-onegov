import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tags, Plus, Search, Filter } from 'lucide-react';

export const Route = createFileRoute('/dashboard/budget/categories')({
  component: BudgetCategoriesPage,
});

const CATEGORIES = [
  // Recurrent
  { code: 'REC-001', name: 'Salaries', type: 'Recurrent', mdaCount: 45, active: true },
  { code: 'REC-002', name: 'Allowances', type: 'Recurrent', mdaCount: 45, active: true },
  { code: 'REC-003', name: 'Pensions', type: 'Recurrent', mdaCount: 1, active: true },
  { code: 'REC-004', name: 'Operations', type: 'Recurrent', mdaCount: 45, active: true },
  { code: 'REC-005', name: 'Utilities', type: 'Recurrent', mdaCount: 45, active: true },
  
  // Capital
  { code: 'CAP-001', name: 'Roads & Bridges', type: 'Capital', mdaCount: 4, active: true },
  { code: 'CAP-002', name: 'Health Facilities', type: 'Capital', mdaCount: 2, active: true },
  { code: 'CAP-003', name: 'Schools & Education', type: 'Capital', mdaCount: 3, active: true },
  { code: 'CAP-004', name: 'ICT Infrastructure', type: 'Capital', mdaCount: 5, active: true },
  { code: 'CAP-005', name: 'Agriculture & Tractors', type: 'Capital', mdaCount: 1, active: true },
  { code: 'CAP-006', name: 'Water Projects', type: 'Capital', mdaCount: 2, active: true },
  { code: 'CAP-007', name: 'Housing & Urban Dev', type: 'Capital', mdaCount: 2, active: true },
  { code: 'CAP-008', name: 'Security Apparatus', type: 'Capital', mdaCount: 3, active: true },

  // Revenue
  { code: 'REV-001', name: 'FAAC Allocation', type: 'Revenue', mdaCount: 1, active: true },
  { code: 'REV-002', name: 'Value Added Tax (VAT)', type: 'Revenue', mdaCount: 1, active: true },
  { code: 'REV-003', name: 'State Taxes', type: 'Revenue', mdaCount: 1, active: true },
  { code: 'REV-004', name: 'Administrative Fees', type: 'Revenue', mdaCount: 28, active: true },
  { code: 'REV-005', name: 'Licenses & Permits', type: 'Revenue', mdaCount: 15, active: true },
  { code: 'REV-006', name: 'Foreign Grants', type: 'Revenue', mdaCount: 4, active: true },
];

function BudgetCategoriesPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Economic Classifications & Categories</h1>
          <p className="text-muted-foreground mt-1">
            Standardized chart of accounts for uniform budget reporting across all MDAs.
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="size-4"/> New Category Code
        </button>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
               <Tags className="size-5 text-primary" />
               <div>
                  <CardTitle>Master Chart of Accounts</CardTitle>
                  <CardDescription>All valid line-item codes for the current fiscal year.</CardDescription>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <div className="relative">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="Search codes..." className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64" />
               </div>
               <button className="p-2 border border-border rounded-md hover:bg-muted transition-colors"><Filter className="size-4 text-muted-foreground" /></button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-muted/30 border-b border-border/50 uppercase text-[10px] text-muted-foreground tracking-wider">
                 <tr>
                   <th className="px-6 py-4 font-semibold">Classification Code</th>
                   <th className="px-6 py-4 font-semibold">Description</th>
                   <th className="px-6 py-4 font-semibold">Type</th>
                   <th className="px-6 py-4 font-semibold text-center">MDAs Using Code</th>
                   <th className="px-6 py-4 font-semibold text-right">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/30">
                 {CATEGORIES.map((cat, idx) => (
                   <tr key={idx} className="hover:bg-muted/10 transition-colors group">
                     <td className="px-6 py-4 font-mono font-bold text-primary">{cat.code}</td>
                     <td className="px-6 py-4 font-medium">{cat.name}</td>
                     <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded ${
                           cat.type === 'Capital' ? 'bg-emerald-500/10 text-emerald-600' :
                           cat.type === 'Recurrent' ? 'bg-amber-500/10 text-amber-600' :
                           'bg-blue-500/10 text-blue-600'
                        }`}>{cat.type}</span>
                     </td>
                     <td className="px-6 py-4 text-center font-mono text-muted-foreground">{cat.mdaCount}</td>
                     <td className="px-6 py-4 text-right">
                       <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${cat.active ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                         <div className={`size-2 rounded-full ${cat.active ? 'bg-emerald-500' : 'bg-muted-foreground'}`}></div>
                         {cat.active ? 'Active' : 'Archived'}
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
