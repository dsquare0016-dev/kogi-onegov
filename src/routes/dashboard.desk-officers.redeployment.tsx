import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRightLeft, FileUp, ShieldCheck, Activity } from 'lucide-react';
import { MINISTRIES, STAFF_SAMPLE } from '@/lib/mock-data';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/desk-officers/redeployment')({
  component: RedeploymentRequestsPage,
});

function RedeploymentRequestsPage() {
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [targetMda, setTargetMda] = useState("");

  const officerDetails = STAFF_SAMPLE.find(s => s.id === selectedOfficer);

  return (
    <div className="p-6 max-w-[1200px] mx-auto pb-24 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Redeployment Engine</h1>
        <p className="text-muted-foreground mt-1">
          Transfer a certified Desk Officer to a new MDA without losing their GDU certification or training progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Redeployment Form */}
        <Card className="border-border/60 shadow-sm relative overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/50 bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRightLeft className="size-5 text-primary" /> Transfer Initiation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Certified Officer</label>
              <select 
                value={selectedOfficer}
                onChange={e => setSelectedOfficer(e.target.value)}
                className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select officer...</option>
                {STAFF_SAMPLE.slice(0, 5).map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.name} ({staff.ministry})</option>
                ))}
              </select>
            </div>

            {officerDetails && (
               <div className="p-4 bg-muted/30 border border-border rounded-lg flex items-center justify-between">
                 <div>
                   <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Posting</div>
                   <div className="font-semibold text-sm">{officerDetails.ministry}</div>
                   <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1"><ShieldCheck className="size-3"/> Certification Active</div>
                 </div>
                 <ArrowRightLeft className="size-5 text-muted-foreground/50" />
               </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Target MDA</label>
              <select 
                value={targetMda}
                onChange={e => setTargetMda(e.target.value)}
                className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select destination MDA...</option>
                {MINISTRIES.map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            {targetMda && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Handover Dossier (Required)</label>
                <div className="w-full border border-dashed border-border/80 rounded-lg p-4 flex flex-col items-center justify-center bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer text-center">
                  <FileUp className="size-5 text-muted-foreground mb-2" />
                  <span className="text-xs font-semibold">Upload Handover Report</span>
                  <span className="text-[10px] text-muted-foreground mt-1">PDF max 10MB</span>
                </div>
              </div>
            )}

            <button 
              disabled={!selectedOfficer || !targetMda}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-4"
            >
              <Activity className="size-4" /> Execute System Redeployment
            </button>
          </CardContent>
        </Card>

        {/* Audit Log / History */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="size-5 text-primary" /> Recent Transfer Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border/50">
                <div className="p-4 hover:bg-muted/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">Ibrahim Suleiman</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        Min. of Works <ArrowRightLeft className="size-3" /> Min. of Transport
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-widest">
                      Completed
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-2">Executed 3 days ago by GDU Admin</div>
                </div>
             </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
