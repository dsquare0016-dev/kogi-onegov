import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Search, Filter, AlertTriangle, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/desk-officers/certification')({
  component: CertificationStatusPage,
});

const PENDING_DO = [
  { id: 'KGS/2024001', name: 'Amaka Okoro', mda: 'Ministry of Finance', assignedDate: 'Jun 22, 2026', status: 'Pending Background Check' },
  { id: 'KGS/2024008', name: 'Tunde Olaniyi', mda: 'Ministry of Works', assignedDate: 'Jun 23, 2026', status: 'Pending Interview' }
];

const CERTIFIED_DO = [
  { id: 'KGS/2024012', name: 'Joy Etim', mda: 'Ministry of Health', certDate: 'Jan 15, 2026', badgeId: 'DO-CERT-884' },
  { id: 'KGS/2024005', name: 'Chika Eze', mda: 'Ministry of Education', certDate: 'Feb 02, 2026', badgeId: 'DO-CERT-885' }
];

function CertificationStatusPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'certified'>('pending');

  return (
    <div className="p-6 max-w-[1200px] mx-auto pb-24 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Certification & Vetting</h1>
        <p className="text-muted-foreground mt-1">
          GDU oversight portal. Ensure all assigned Desk Officers pass required background checks and capability vetting before certification.
        </p>
      </div>

      <div className="flex bg-muted/50 p-1 rounded-lg w-max mb-6">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'pending' ? 'bg-background shadow-sm text-foreground flex items-center gap-2' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {activeTab === 'pending' && <AlertTriangle className="size-4 text-amber-500" />} Pending Vetting ({PENDING_DO.length})
        </button>
        <button 
          onClick={() => setActiveTab('certified')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'certified' ? 'bg-background shadow-sm text-foreground flex items-center gap-2' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {activeTab === 'certified' && <ShieldCheck className="size-4 text-emerald-500" />} Certified Roster
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="size-5 text-amber-500" /> Action Required: Vetting Queue
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Search by name or MDA..." className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Staff Name & ID</th>
                      <th className="px-6 py-4 font-semibold">MDA</th>
                      <th className="px-6 py-4 font-semibold">Assigned Date</th>
                      <th className="px-6 py-4 font-semibold">Current Vetting Stage</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {PENDING_DO.map((doff) => (
                      <tr key={doff.id} className="hover:bg-muted/10 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-primary">{doff.name}</div>
                          <div className="text-xs text-muted-foreground">{doff.id}</div>
                        </td>
                        <td className="px-6 py-4">{doff.mda}</td>
                        <td className="px-6 py-4 text-muted-foreground">{doff.assignedDate}</td>
                        <td className="px-6 py-4">
                           <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                             {doff.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                            Open Vetting Checklist
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </CardContent>
          </Card>

          {/* Vetting Panel Preview (Mock interaction) */}
          <Card className="border-border/60 shadow-sm opacity-50 pointer-events-none">
            <CardHeader className="pb-4 border-b border-border/50 bg-primary/5">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4" /> Vetting Checklist Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div className="space-y-3 max-w-xl">
                 <label className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background">
                   <CheckCircle className="size-5 text-emerald-500" />
                   <span className="text-sm font-medium">Service Record Verification (No disciplinary actions)</span>
                 </label>
                 <label className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background">
                   <CheckCircle className="size-5 text-emerald-500" />
                   <span className="text-sm font-medium">Basic Digital Literacy Assessment Passed</span>
                 </label>
                 <label className="flex items-center gap-3 p-3 border border-amber-500/30 rounded-lg bg-amber-500/5">
                   <div className="size-5 border-2 border-amber-500 rounded-full" />
                   <span className="text-sm font-medium text-amber-700 dark:text-amber-400">GDU Interview & Alignment Check</span>
                 </label>
               </div>
               <div className="flex gap-3 pt-4 border-t border-border max-w-xl">
                 <button className="flex-1 py-2 bg-destructive/10 text-destructive rounded-md text-sm font-bold flex justify-center items-center gap-2"><XCircle className="size-4"/> Reject Assignment</button>
                 <button className="flex-1 py-2 bg-emerald-500 text-white rounded-md text-sm font-bold flex justify-center items-center gap-2"><ShieldCheck className="size-4"/> Issue GDU Certification</button>
               </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'certified' && (
        <Card className="border-border/60 shadow-sm animate-in fade-in duration-500">
           <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="size-5 text-emerald-500" /> Officially Certified Desk Officers
                </CardTitle>
                <div className="flex items-center gap-2">
                   <button className="p-2 border border-border rounded-md hover:bg-muted transition-colors"><Filter className="size-4 text-muted-foreground" /></button>
                </div>
              </div>
            </CardHeader>
             <CardContent className="p-0">
               <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Badge ID</th>
                      <th className="px-6 py-4 font-semibold">Officer Name</th>
                      <th className="px-6 py-4 font-semibold">MDA</th>
                      <th className="px-6 py-4 font-semibold">Certified Date</th>
                      <th className="px-6 py-4 font-semibold text-right">System Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {CERTIFIED_DO.map((doff) => (
                      <tr key={doff.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                             <ShieldCheck className="size-4" /> {doff.badgeId}
                           </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{doff.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{doff.mda}</td>
                        <td className="px-6 py-4 text-muted-foreground">{doff.certDate}</td>
                        <td className="px-6 py-4 text-right">
                           <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600">
                             Full ERP Access
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
