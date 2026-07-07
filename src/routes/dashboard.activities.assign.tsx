import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Filter, CheckCircle2, UserPlus, Target, Search, MoreHorizontal } from 'lucide-react';
import { getSession, roleById } from '@/lib/auth';
import { useNominalRollStore } from '@/lib/nominalRollStore';

export const Route = createFileRoute('/dashboard/activities/assign')({
  component: AssignActivityPage,
});

function AssignActivityPage() {
  const session = getSession();
  const profile = session ? roleById(session.role) : null;
  const [searchTerm, setSearchTerm] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // Derive visible staff based on role scope
  const allStaff = useNominalRollStore(state => state.records);
  
  const visibleStaff = useMemo(() => {
    if (!profile) return [];
    
    // Executive and Command scopes see everyone
    if (['executive', 'command'].includes(profile.scope)) {
      return allStaff;
    }
    
    // Otherwise filter by MDA or Mother Ministry
    return allStaff.filter(staff => {
      // Approximate mapping: in a real app, staff would have explicit MDA / Ministry fields that precisely match
      return staff.department === profile.mda || 
             (profile.motherMinistry && staff.department.includes(profile.motherMinistry));
    });
  }, [profile, allStaff]);

  const filteredStaff = visibleStaff.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.staffType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignClick = (staff: any) => {
    setSelectedStaff(staff);
    setAssignModalOpen(true);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto pb-24 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserPlus className="size-8 text-primary" /> Assign Activity
          </h1>
          <p className="text-muted-foreground mt-1">
            Delegate activities to staff members. 
            {['executive', 'command'].includes(profile?.scope || "") 
              ? " You have state-wide visibility." 
              : " Showing staff within your jurisdiction."}
          </p>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <CardTitle className="text-lg flex items-center gap-2">
               <Users className="size-5 text-primary" /> Available Personnel ({visibleStaff.length})
             </CardTitle>
             <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search by name, ID, or designation..." 
                  className="w-full pl-9 p-2 bg-muted/50 border border-border rounded-md text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Staff Details</th>
                <th className="px-6 py-4 font-semibold">Designation & Dept</th>
                <th className="px-6 py-4 font-semibold">Current Load</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredStaff.length > 0 ? filteredStaff.map((staff) => (
                <tr key={staff.staffId} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {staff.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{staff.fullName}</div>
                        <div className="text-xs text-muted-foreground">{staff.staffId} • Grade: {staff.gradeLevel}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{staff.staffType}</div>
                    <div className="text-xs text-muted-foreground">{staff.department}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="flex -space-x-2">
                          {/* Mock active tasks indicator */}
                          {[1,2,3].slice(0, Math.max(1, staff.fullName.length % 4)).map(i => (
                            <div key={i} className="size-6 rounded-full bg-indigo-500 border-2 border-background flex items-center justify-center">
                              <Target className="size-3 text-white" />
                            </div>
                          ))}
                       </div>
                       <span className="text-xs text-muted-foreground font-medium">
                         {Math.max(1, staff.fullName.length % 4)} Active
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleAssignClick(staff)}
                      className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No staff members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Assignment Modal Mockup */}
      {assignModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-border/50">
               <h3 className="text-lg font-bold">Assign Activity to {selectedStaff.fullName}</h3>
               <p className="text-sm text-muted-foreground">Select an active activity to delegate.</p>
             </div>
             <div className="p-6 space-y-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Select Activity</label>
                 <select className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm">
                   <option>Statewide Malaria Eradication Campaign</option>
                   <option>Lokoja Road Rehabilitation Phase 1</option>
                   <option>Civil Service Audit</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">Assignment Note (Optional)</label>
                 <textarea className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm h-20" placeholder="Instructions..."></textarea>
               </div>
             </div>
             <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
               <button 
                 onClick={() => setAssignModalOpen(false)}
                 className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={() => {
                   setAssignModalOpen(false);
                   // Show toast or something in a real app
                 }}
                 className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
               >
                 Confirm Assignment
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
