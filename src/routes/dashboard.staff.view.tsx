import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Filter, FileSignature, Download, MoreHorizontal, FileText, CheckCircle2 } from 'lucide-react';
import { STAFF_SAMPLE } from '@/lib/mock-data';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/staff/view')({
  component: ViewStaffPage,
});

function ViewStaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<typeof STAFF_SAMPLE[0] | null>(null);

  const filteredStaff = STAFF_SAMPLE.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    staff.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.ministry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto pb-24 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">View Staff Records</h1>
          <p className="text-muted-foreground mt-1">
            State-wide Nominal Roll Directory. Records automatically sync from the Recruitment & Confirmation pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-border bg-background hover:bg-muted text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2">
            <Filter className="size-4" /> Filter
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Download className="size-4" /> Export Roll
          </button>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by PSN, Name, or Ministry..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/30 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">Staff Member (PSN)</th>
                  <th className="px-6 py-4 font-semibold">Ministry / Agency</th>
                  <th className="px-6 py-4 font-semibold">Cadre & GL</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredStaff.map((staff, idx) => (
                  <tr key={idx} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{staff.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{staff.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-muted-foreground truncate max-w-[250px]">{staff.ministry}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">{staff.cadre}</div>
                      <div className="text-[10px] font-bold text-primary mt-0.5">GL: {staff.gradeLevel}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 w-max mx-auto">
                        <CheckCircle2 className="size-3" /> Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedStaff(staff)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"
                      >
                        <FileSignature className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStaff.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
               No staff records match your search.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick View Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl overflow-hidden shadow-2xl border-border">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">PSN: {selectedStaff.id}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-widest">Active File</span>
                  </div>
                  <CardTitle className="text-2xl mt-2">{selectedStaff.name}</CardTitle>
                  <CardDescription className="text-primary font-medium mt-1">{selectedStaff.ministry}</CardDescription>
                </div>
                <button 
                  onClick={() => setSelectedStaff(null)}
                  className="p-2 bg-background border border-border rounded-md hover:bg-muted transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 <div>
                   <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Cadre</div>
                   <div className="text-sm font-semibold">{selectedStaff.cadre}</div>
                 </div>
                 <div>
                   <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Grade Level</div>
                   <div className="text-sm font-semibold text-primary">{selectedStaff.gradeLevel}</div>
                 </div>
                 <div>
                   <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Recruitment Source</div>
                   <div className="text-sm font-semibold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded w-max">e-Recruitment Pipeline</div>
                 </div>
                 <div>
                   <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Date of First Appt.</div>
                   <div className="text-sm font-semibold">Jan 12, 2018</div>
                 </div>
                 <div>
                   <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Last Promotion</div>
                   <div className="text-sm font-semibold">Mar 05, 2024</div>
                 </div>
                 <div>
                   <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Date of Birth</div>
                   <div className="text-sm font-semibold">Oct 14, 1985</div>
                 </div>
               </div>

               <div className="pt-6 border-t border-border flex justify-end gap-3">
                 <Link to="/dashboard/staff/edit" className="px-4 py-2 border border-border bg-background hover:bg-muted text-sm font-medium rounded-md transition-colors">
                   Edit File
                 </Link>
                 <Link to="/dashboard/staff/transfer" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
                   Process Lifecycle Action
                 </Link>
               </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
