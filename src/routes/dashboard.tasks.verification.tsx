import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, XCircle, FileWarning, Search, FileSignature, X, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/dashboard/tasks/verification')({
  component: TaskVerificationComponent,
})

function TaskVerificationComponent() {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const verificationQueue = [
    { id: "TSK-301", title: "Hospital Generator Installation", evidence: true, geoTag: false, budget: true, activity: true, approved: true, status: "Pending Verification" },
    { id: "TSK-302", title: "Teacher Training Workshop", evidence: true, geoTag: true, budget: true, activity: true, approved: true, status: "Verified" },
    { id: "TSK-303", title: "Local Govt IT Setup", evidence: false, geoTag: false, budget: true, activity: false, approved: false, status: "Rejected" },
  ];

  const handleReviewClick = (task: any) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Verification Engine</h1>
        <p className="text-muted-foreground mt-1">Cross-check completed tasks against strict delivery requirements.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
             <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-500" /> Verification Queue
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input type="text" className="w-full pl-9 p-1.5 bg-background border border-border rounded-md text-sm" placeholder="Search tasks..." />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Task Details</th>
                    <th className="px-6 py-4 font-semibold text-center">Evidence</th>
                    <th className="px-6 py-4 font-semibold text-center">Geo-Tag</th>
                    <th className="px-6 py-4 font-semibold text-center">Budget</th>
                    <th className="px-6 py-4 font-semibold text-center">Activity</th>
                    <th className="px-6 py-4 font-semibold text-center">Approval</th>
                    <th className="px-6 py-4 font-semibold">Overall Status</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {verificationQueue.map(t => (
                    <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold">{t.title}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-1">{t.id}</div>
                      </td>
                      <td className="px-6 py-4 text-center"><StatusIcon status={t.evidence} /></td>
                      <td className="px-6 py-4 text-center"><StatusIcon status={t.geoTag} /></td>
                      <td className="px-6 py-4 text-center"><StatusIcon status={t.budget} /></td>
                      <td className="px-6 py-4 text-center"><StatusIcon status={t.activity} /></td>
                      <td className="px-6 py-4 text-center"><StatusIcon status={t.approved} /></td>
                      <td className="px-6 py-4">
                         <Badge variant="outline" className={`
                          ${t.status === 'Verified' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : ''}
                          ${t.status === 'Pending Verification' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : ''}
                          ${t.status === 'Rejected' ? 'text-red-500 border-red-500/30 bg-red-500/10' : ''}
                        `}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                          onClick={() => handleReviewClick(t)}
                        >
                          <FileSignature className="size-3" /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2"><FileSignature className="size-5 text-primary" /> Task Verification Review</h3>
                <p className="text-xs text-muted-foreground">{selectedTask.id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="size-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <h4 className="text-xl font-bold">{selectedTask.title}</h4>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className={selectedTask.status === 'Verified' ? 'text-emerald-500 bg-emerald-500/10' : selectedTask.status === 'Rejected' ? 'text-red-500 bg-red-500/10' : 'text-amber-500 bg-amber-500/10'}>
                    {selectedTask.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 border border-border rounded-lg bg-muted/5 flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Evidence</span>
                     <span className="text-sm">{selectedTask.evidence ? 'Valid Documentation' : 'Missing / Incomplete'}</span>
                   </div>
                   <StatusIcon status={selectedTask.evidence} />
                 </div>
                 <div className="p-4 border border-border rounded-lg bg-muted/5 flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Geo-Tag</span>
                     <span className="text-sm">{selectedTask.geoTag ? 'Location Verified' : 'Invalid Coordinates'}</span>
                   </div>
                   <StatusIcon status={selectedTask.geoTag} />
                 </div>
                 <div className="p-4 border border-border rounded-lg bg-muted/5 flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Budget</span>
                     <span className="text-sm">{selectedTask.budget ? 'Within Limits' : 'Over Limit / Unaligned'}</span>
                   </div>
                   <StatusIcon status={selectedTask.budget} />
                 </div>
                 <div className="p-4 border border-border rounded-lg bg-muted/5 flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Activity Tracking</span>
                     <span className="text-sm">{selectedTask.activity ? 'Milestones Met' : 'Incomplete Tracking'}</span>
                   </div>
                   <StatusIcon status={selectedTask.activity} />
                 </div>
              </div>

              <div className="p-4 border border-border rounded-lg bg-muted/5">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Final Approvals</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{selectedTask.approved ? 'All Sign-offs Completed' : 'Pending Sign-offs'}</span>
                    <StatusIcon status={selectedTask.approved} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
               <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors" onClick={() => setIsModalOpen(false)}>Cancel</button>
               {selectedTask.status === 'Pending Verification' && (
                 <>
                   <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">Reject Task</button>
                   <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">Verify Task</button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: boolean }) {
  return status ? (
    <div className="inline-flex items-center justify-center size-6 rounded-full bg-emerald-500/10 text-emerald-500">
      <ShieldCheck className="size-3.5" />
    </div>
  ) : (
    <div className="inline-flex items-center justify-center size-6 rounded-full bg-red-500/10 text-red-500">
      <XCircle className="size-3.5" />
    </div>
  )
}
