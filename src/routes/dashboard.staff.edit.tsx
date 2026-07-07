import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Save, FileSignature, AlertCircle, UploadCloud } from 'lucide-react';
import { STAFF_SAMPLE } from '@/lib/mock-data';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/staff/edit')({
  component: EditStaffPage,
});

function EditStaffPage() {
  const [psnSearch, setPsnSearch] = useState("");
  const [searchedStaff, setSearchedStaff] = useState<typeof STAFF_SAMPLE[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = () => {
    // Exact match for demo purposes
    const found = STAFF_SAMPLE.find(s => s.id === psnSearch.toUpperCase());
    setSearchedStaff(found || null);
    if (!found) alert("No staff found with that PSN.");
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto pb-24 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Staff Record</h1>
        <p className="text-muted-foreground mt-1">
          Update civil servant biographical records, qualifications, and contact details.
        </p>
      </div>

      {/* Search Engine */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-6">
          <label className="text-sm font-medium mb-2 block">Search by Public Service Number (PSN)</label>
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

      {/* Editing Form */}
      {searchedStaff && (
        <Card className="border-border/60 shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-4">
          <CardHeader className="pb-4 border-b border-border/50 bg-primary/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSignature className="size-5 text-primary" /> Active File: {searchedStaff.name}
              </CardTitle>
              <CardDescription>Editing record for PSN: {searchedStaff.id}</CardDescription>
            </div>
            <div className="text-[10px] text-muted-foreground text-right">
               Last Updated: Oct 12, 2025<br/>
               By: Admin User (HR)
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Bio Data */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-2">
                  Biographical Data
                </h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Full Name (Legal)</label>
                  <input type="text" defaultValue={searchedStaff.name} className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
                    <input type="date" className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Marital Status</label>
                    <select className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Married</option>
                      <option>Single</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Primary Contact Number</label>
                  <input type="tel" placeholder="e.g., +234..." className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Residential Address (Current)</label>
                  <textarea className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm h-20 focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>

              {/* Service Details (Read-only or restricted) */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-2">
                  Service Record (Restricted)
                </h3>
                
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg flex gap-3 text-amber-700 dark:text-amber-400 mb-4">
                  <AlertCircle className="size-5 shrink-0 mt-0.5" />
                  <p className="text-xs">
                    Service records (MDA, Grade Level, Cadre) cannot be manually edited here. You must use the official Transfer or Promotion modules to alter these fields with mandatory document attachments.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Current Ministry / Agency</label>
                  <input type="text" defaultValue={searchedStaff.ministry} disabled className="w-full p-2 bg-muted border border-border rounded-md text-sm text-muted-foreground cursor-not-allowed" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Current Cadre</label>
                    <input type="text" defaultValue={searchedStaff.cadre} disabled className="w-full p-2 bg-muted border border-border rounded-md text-sm text-muted-foreground cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Grade Level</label>
                    <input type="text" defaultValue={searchedStaff.gradeLevel} disabled className="w-full p-2 bg-muted border border-border rounded-md text-sm text-muted-foreground cursor-not-allowed" />
                  </div>
                </div>
              </div>

            </div>

            {/* Next of Kin */}
            <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-2">
                  Next of Kin Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                    <input type="text" className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Relationship</label>
                    <input type="text" className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Contact Number</label>
                    <input type="tel" className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
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
                  onClick={() => {
                    setIsSubmitting(true);
                    setTimeout(() => {
                      setIsSubmitting(false);
                      setSearchedStaff(null);
                      alert("Record Updated Successfully.");
                    }, 1000);
                  }}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
                >
                 <Save className="size-4" /> 
                 {isSubmitting ? 'Saving...' : 'Save Record Updates'}
               </button>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
