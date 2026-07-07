import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, LogOut, UploadCloud, FileText, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNominalRollStore, NominalRollEntry } from '@/lib/nominalRollStore';

export const Route = createFileRoute('/dashboard/staff/retire')({
  component: RetireStaffPage,
});

function RetireStaffPage() {
  const [psnSearch, setPsnSearch] = useState("");
  const [searchedStaff, setSearchedStaff] = useState<NominalRollEntry | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const records = useNominalRollStore(s => s.records);
  const updateRecordStatus = useNominalRollStore(s => s.updateRecordStatus);

  const handleSearch = () => {
    const found = records.find(s => s.staffId === psnSearch.toUpperCase() && s.status === 'Active');
    setSearchedStaff(found || null);
    if (!found) alert("No active civil servant found with that Staff ID.");
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto pb-24 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Process Staff Retirement & Exits</h1>
        <p className="text-muted-foreground mt-1">
          Execute staff exits to immediately remove them from the active payroll and transition to the Pensioners database.
        </p>
      </div>

      <Card className="border-border/60 shadow-sm border-indigo-500/20 bg-indigo-500/5">
        <CardHeader className="pb-4 border-b border-indigo-500/10">
          <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
            <Sparkles className="size-5" /> AI Retirement Flagging
          </CardTitle>
          <CardDescription>The system has identified <strong>142 staff members</strong> due for statutory retirement this month based on age (60 years) or length of service (35 years).</CardDescription>
        </CardHeader>
        <CardContent className="p-4 flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 transition-colors">
            View Flagged Staff List
          </button>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-6">
          <label className="text-sm font-medium mb-2 block">Search Staff for Exit Processing (PSN)</label>
          <div className="flex items-center gap-3">
             <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="e.g., KGS-2023-0142" 
                  value={psnSearch}
                  onChange={e => setPsnSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm uppercase"
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
             </div>
             <button 
                onClick={handleSearch}
                className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md shadow-sm hover:bg-primary/90 transition-colors"
             >
               Retrieve File
             </button>
          </div>
        </CardContent>
      </Card>

      {searchedStaff && (
        <Card className="border-border/60 shadow-sm animate-in slide-in-from-bottom-4">
          <CardHeader className="pb-4 border-b border-border/50 bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <LogOut className="size-5 text-primary" /> Exit Protocol for {searchedStaff.fullName}
            </CardTitle>
            <CardDescription>MDA: <strong className="text-foreground">{searchedStaff.mda}</strong> | Current GL: <strong className="text-foreground">{searchedStaff.gradeLevel}</strong></CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Exit Details */}
              <div className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Reason for Exit</label>
                  <select className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option>Statutory Retirement (Age/Service Years)</option>
                    <option>Voluntary Retirement / Resignation</option>
                    <option>Medical Retirement</option>
                    <option>Dismissal / Termination</option>
                    <option>Death in Service</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Official Exit Date</label>
                    <input type="date" className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Pension Transition</label>
                    <select className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Queue for Pension Gratuity</option>
                      <option>Not Eligible (e.g., Dismissal)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Exit Clearance Notes</label>
                  <textarea 
                    className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm h-24 focus:outline-none focus:ring-1 focus:ring-primary" 
                    placeholder="Details regarding handover, clearance of state property, etc..."
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-lg flex gap-3 text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm mb-1">Mandatory Documentation Required</h4>
                    <p className="text-xs">
                      An exit action cannot be finalized without an uploaded, signed Official Discharge / Retirement Notice. This document serves as the legal basis to halt salary payments.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Upload Official Discharge / Retirement Letter (PDF)</label>
                  {!fileUploaded ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer group">
                      <div className="p-3 bg-primary/10 text-primary rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="size-6" />
                      </div>
                      <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF or Scanned JPEG (max. 10MB)</p>
                      <button 
                        onClick={() => setFileUploaded(true)}
                        className="mt-4 px-4 py-1.5 bg-background border border-border shadow-sm rounded-md text-xs font-semibold"
                      >
                        Simulate Upload
                      </button>
                    </div>
                  ) : (
                    <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-emerald-500 text-white rounded-md">
                           <FileText className="size-4" />
                         </div>
                         <div>
                           <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Discharge_Notice_Signed.pdf</div>
                           <div className="text-[10px] text-muted-foreground">3.1 MB • Verified</div>
                         </div>
                       </div>
                       <button onClick={() => setFileUploaded(false)} className="text-xs text-red-500 hover:underline font-medium">Remove</button>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 flex items-start gap-3 text-amber-700 dark:text-amber-400 mt-4">
                  <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                  <p className="text-xs">
                    <strong>Warning:</strong> Finalizing this action will immediately remove the staff member from the active payroll cycle and mark their Nominal Roll status as INACTIVE. This action is irreversible without Head of Service override.
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-border flex justify-end gap-3">
               <button 
                 onClick={() => setSearchedStaff(null)}
                 className="px-6 py-2 border border-border bg-transparent text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors"
               >
                 Cancel
               </button>
               <button 
                  disabled={!fileUploaded}
                  onClick={() => {
                    setIsSubmitting(true);
                    setTimeout(() => {
                      if (searchedStaff) {
                        updateRecordStatus(searchedStaff.staffId, 'Retired');
                        // Optional: Here you could also hook into auth to update their role to 'retiree'
                      }
                      setIsSubmitting(false);
                      setSearchedStaff(null);
                      setFileUploaded(false);
                      alert("Retirement Processed. Staff status updated to Retired and removed from Active Payroll.");
                    }, 1000);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                 <LogOut className="size-4" /> 
                 {isSubmitting ? 'Processing Exit...' : 'Confirm Exit & Halt Payroll'}
               </button>
            </div>

          </CardContent>
        </Card>
      )}

    </div>
  );
}
