import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, TrendingUp, UploadCloud, FileText, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { STAFF_SAMPLE } from '@/lib/mock-data';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/staff/promote')({
  component: PromoteStaffPage,
});

function PromoteStaffPage() {
  const [psnSearch, setPsnSearch] = useState("");
  const [searchedStaff, setSearchedStaff] = useState<typeof STAFF_SAMPLE[0] | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = () => {
    const found = STAFF_SAMPLE.find(s => s.id === psnSearch.toUpperCase());
    setSearchedStaff(found || null);
    if (!found) alert("No staff found with that PSN.");
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto pb-24 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Process Staff Promotion</h1>
        <p className="text-muted-foreground mt-1">
          Execute Grade Level (GL) advancements based on Civil Service rules. Mandatory Civil Service Commission letter required.
        </p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-6">
          <label className="text-sm font-medium mb-2 block">Search Staff for Promotion (PSN)</label>
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
              <TrendingUp className="size-5 text-primary" /> Promotion Protocol for {searchedStaff.name}
            </CardTitle>
            <CardDescription>Cadre: <strong className="text-foreground">{searchedStaff.cadre}</strong> | Current GL: <strong className="text-foreground">{searchedStaff.gradeLevel}</strong></CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Promotion Details */}
              <div className="space-y-6">
                
                {/* Civil Service Rule Check */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex gap-3 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm mb-1">Civil Service Validation Passed</h4>
                    <p className="text-xs">
                      Staff member has spent <strong>3 years and 4 months</strong> on their current Grade Level, satisfying the mandatory minimum requirement for advancement.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">New Grade Level (GL)</label>
                    <select className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>GL 08</option>
                      <option>GL 09</option>
                      <option>GL 10</option>
                      <option>GL 12</option>
                      <option>GL 13</option>
                      <option>GL 14</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">New Step</label>
                    <select className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Step 1</option>
                      <option>Step 2</option>
                      <option>Step 3</option>
                      <option>Step 4</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Effective Date of Promotion</label>
                  <input type="date" className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Promotion Authority / Memo Ref</label>
                  <input type="text" placeholder="e.g., KGS/CSC/PROM/2026/044" className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary uppercase" />
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-lg flex gap-3 text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm mb-1">Mandatory Documentation Required</h4>
                    <p className="text-xs">
                      A promotion action cannot be finalized without an uploaded, signed Civil Service Commission (CSC) Promotion Letter.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Upload Signed CSC Promotion Letter (PDF)</label>
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
                           <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">CSC_Promotion_Letter_Signed.pdf</div>
                           <div className="text-[10px] text-muted-foreground">1.8 MB • Verified</div>
                         </div>
                       </div>
                       <button onClick={() => setFileUploaded(false)} className="text-xs text-red-500 hover:underline font-medium">Remove</button>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border border-border flex items-start gap-3 text-muted-foreground mt-4">
                  <Info className="size-4 shrink-0 mt-0.5" />
                  <p className="text-xs">
                    Once processed, this promotion will automatically update the staff's GL on the Nominal Roll and notify the Payroll system for immediate adjustment.
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
                      setIsSubmitting(false);
                      setSearchedStaff(null);
                      setFileUploaded(false);
                      alert("Promotion Processed. Nominal Roll and Payroll updated.");
                    }, 1000);
                  }}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                 <TrendingUp className="size-4" /> 
                 {isSubmitting ? 'Processing...' : 'Process Promotion to Nominal Roll'}
               </button>
            </div>

          </CardContent>
        </Card>
      )}

    </div>
  );
}
