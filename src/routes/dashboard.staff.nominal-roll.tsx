import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Search, Filter, Plus, FileSpreadsheet, ArrowUpRight, CheckCircle2, ShieldAlert, X, Shield, User, Camera, Calendar, Mail, Phone, MapPin, Award, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { useNominalRollStore, NominalRollEntry } from '@/lib/nominalRollStore';
import { getSession, roleById } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/staff/nominal-roll')({
  component: NominalRollMaster,
});

function NominalRollMaster() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPreviewStaff, setSelectedPreviewStaff] = useState<NominalRollEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  
  // Use Zustand store for records
  const records = useNominalRollStore((state) => state.records);

  const session = getSession();
  const profile = session ? roleById(session.role) : null;

  // MDA Filtering Logic
  // Only Super Admin & Civil Service Commission can see ALL staff.
  // Others only see staff belonging to their own MDA.
  const canSeeAll = session?.role === 'super_admin' || session?.role === 'civil_service_commission';
  
  const mdaRecords = records.filter(r => {
    if (canSeeAll) return true;
    return r.mda === profile?.mda || r.mda === profile?.motherMinistry;
  });

  const inactiveStatuses = ['retired', 'resigned', 'dismissed', 'terminated', 'deceased', 'sacked'];

  const tabRecords = mdaRecords.filter(r => {
    const isInactive = inactiveStatuses.includes(String(r.status || '').toLowerCase());
    return activeTab === 'inactive' ? isInactive : !isInactive;
  });

  const filtered = tabRecords.filter(r => 
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r as any).oldStaffId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Master Nominal Roll</h1>
          <p className="text-muted-foreground mt-1">Central database of all verified active Civil Servants in Kogi State.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/staff/create" className="px-4 py-2 bg-card border border-border text-foreground font-bold rounded-lg shadow-sm hover:bg-muted transition-colors flex items-center gap-2 text-sm">Register Single Staff</Link>
          <Link to="/dashboard/staff/upload" className="px-4 py-2 bg-card border border-border text-foreground font-bold rounded-lg shadow-sm hover:bg-muted transition-colors flex items-center gap-2 text-sm">Bulk Ingestion</Link>
          <Link to="/dashboard/admin/users/create" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm">
            <Plus className="size-4" /> Add New Staff
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-600"><Users className="size-6" /></div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Active Staff</p>
              <h4 className="text-2xl font-black text-white">{mdaRecords.length.toLocaleString()}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-600"><CheckCircle2 className="size-6" /></div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Verified Records</p>
              <h4 className="text-2xl font-black text-white">{mdaRecords.filter(r => r.verificationStatus === 'Verified').length}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600"><ShieldAlert className="size-6" /></div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Pending Verification</p>
              <h4 className="text-2xl font-black text-white">{mdaRecords.filter(r => r.verificationStatus === 'Pending').length}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4 space-y-4">
          <div className="flex border-b border-border/50 pb-2 gap-4">
            <button
              onClick={() => { setActiveTab('active'); setSearchTerm(''); }}
              className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'active' 
                  ? 'border-primary text-white' 
                  : 'border-transparent text-muted-foreground hover:text-white'
              }`}
            >
              Active Civil Servants ({mdaRecords.filter(r => !inactiveStatuses.includes(String(r.status || '').toLowerCase())).length})
            </button>
            <button
              onClick={() => { setActiveTab('inactive'); setSearchTerm(''); }}
              className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'inactive' 
                  ? 'border-rose-500 text-rose-400' 
                  : 'border-transparent text-muted-foreground hover:text-rose-400'
              }`}
            >
              Inactive Civil Servants ({mdaRecords.filter(r => inactiveStatuses.includes(String(r.status || '').toLowerCase())).length})
            </button>
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by name, ID, old ID, or MDA..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-white"
              />
            </div>
            <button className="px-4 py-2 bg-card border border-border text-foreground font-bold rounded-lg shadow-sm hover:bg-muted transition-colors flex items-center gap-2 text-sm shrink-0">
              <Filter className="size-4" /> Filter Records
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground uppercase text-xs font-bold border-b border-border/60">
                <tr>
                  <th className="px-4 py-3 w-12">Photo</th>
                  <th className="px-4 py-3">Staff ID</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">MDA / Dept</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Retirement</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((staff, i) => (
                  <tr 
                    key={i} 
                    onClick={() => setSelectedPreviewStaff(staff)}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="size-10 rounded-full border border-border/60 bg-muted/40 overflow-hidden flex items-center justify-center">
                        {staff.passportUrl ? (
                          <img src={staff.passportUrl} alt={staff.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="size-5 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-primary">{staff.staffId}</td>
                    <td className="px-4 py-3 font-semibold text-white">{staff.fullName}</td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-bold text-slate-200">{staff.mda}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{staff.department}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-200">{staff.gradeLevel}{staff.step ? ` / St ${staff.step}` : ''}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                        staff.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">{staff.expectedRetirementDate}</td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => setSelectedPreviewStaff(staff)}
                        className="text-primary hover:underline text-xs font-bold inline-flex items-center gap-1"
                      >
                        Preview <ArrowUpRight className="size-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      No staff records found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Staff Detail Preview Modal */}
      {selectedPreviewStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl rounded-2xl bg-card border border-border shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border/50 pb-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl border-2 border-[#C5A059] bg-muted/40 overflow-hidden shrink-0">
                  {selectedPreviewStaff.passportUrl ? (
                    <img src={selectedPreviewStaff.passportUrl} alt={selectedPreviewStaff.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0A1142] text-[#C5A059] text-xl font-black">
                      {selectedPreviewStaff.fullName.split(' ').slice(-2).map(n => n[0]).join('')}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{selectedPreviewStaff.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold text-primary">{selectedPreviewStaff.staffId}</span>
                    {selectedPreviewStaff.oldStaffId && (
                      <span className="text-xs text-muted-foreground font-mono">(Old ID: {selectedPreviewStaff.oldStaffId})</span>
                    )}
                    <span className="opacity-50 text-white">•</span>
                    <span className="text-xs font-bold text-[#C5A059] uppercase">{selectedPreviewStaff.staffType}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPreviewStaff(null)} 
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content Tabs / Body */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              
              {/* Core Credentials & ID badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-white/5 border border-border/40 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-muted-foreground block">Roll Number</span>
                  <span className="text-xs font-bold font-mono text-white mt-0.5 block">{selectedPreviewStaff.rollNumber || 'N/A'}</span>
                </div>
                <div className="p-3 bg-white/5 border border-border/40 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-muted-foreground block">PSN Number</span>
                  <span className="text-xs font-bold font-mono text-white mt-0.5 block">{selectedPreviewStaff.psnNumber || 'N/A'}</span>
                </div>
                <div className="p-3 bg-white/5 border border-border/40 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-muted-foreground block">NIN</span>
                  <span className="text-xs font-bold font-mono text-white mt-0.5 block">{selectedPreviewStaff.nin || 'N/A'}</span>
                </div>
                <div className="p-3 bg-white/5 border border-border/40 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-muted-foreground block">BVN</span>
                  <span className="text-xs font-bold font-mono text-white mt-0.5 block">{selectedPreviewStaff.bvn || 'N/A'}</span>
                </div>
              </div>

              {/* Administrative Postings */}
              <div className="p-4 border border-border/40 rounded-xl bg-muted/20 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C5A059] border-b border-border/40 pb-1.5 flex items-center gap-1.5">
                  <Shield className="size-3.5" /> Posting &amp; Career Status
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">MDA / Ministry</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.mda}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Department</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.department || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Grade Level &amp; Step</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.gradeLevel}{selectedPreviewStaff.step ? ` / Step ${selectedPreviewStaff.step}` : ''}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Verification Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black mt-1 uppercase border ${
                      selectedPreviewStaff.verificationStatus === 'Verified' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {selectedPreviewStaff.verificationStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Current Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black mt-1 uppercase border ${
                      selectedPreviewStaff.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {selectedPreviewStaff.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inactive Exit Parameters (Only when status is inactive/retired/resigned/dismissed/terminated/sacked/deceased) */}
              {['Retired', 'Resigned', 'Dismissed', 'Terminated', 'Deceased', 'Sacked'].includes(selectedPreviewStaff.status) && (
                <div className="p-4 border border-rose-500/20 rounded-xl bg-rose-500/5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-400 border-b border-rose-500/20 pb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="size-3.5" /> exit &amp; deactivation record
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Exit Status</span>
                      <span className="font-bold text-rose-400 mt-0.5 block">{selectedPreviewStaff.status}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Effective Date</span>
                      <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.inactiveEffectiveDate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Approved By</span>
                      <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.inactiveApprovedBy || 'CSC Secretariat'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block">Reason for Inactive Status</span>
                      <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.inactiveReason || 'Standard career progression exit / administrative posting change.'}</span>
                    </div>
                    {selectedPreviewStaff.inactiveDocumentUrl && (
                      <div>
                        <span className="text-muted-foreground block">Exit Authorization Document</span>
                        <a 
                          href={selectedPreviewStaff.inactiveDocumentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline font-bold mt-1"
                        >
                          Download Clearance Doc <ArrowUpRight className="size-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Personal details */}
              <div className="p-4 border border-border/40 rounded-xl bg-muted/20 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C5A059] border-b border-border/40 pb-1.5 flex items-center gap-1.5">
                  <User className="size-3.5" /> Personal Records
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Sex (Gender)</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.sex || 'Male'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Date of Birth</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Phone Number</span>
                    <span className="font-bold text-white mt-0.5 block font-mono">{selectedPreviewStaff.phoneNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Email Address</span>
                    <span className="font-bold text-white mt-0.5 block font-mono truncate">{selectedPreviewStaff.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">State of Origin</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.stateOfOrigin || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">L.G.A of Origin</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.lgaOfOrigin || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Career Timeline */}
              <div className="p-4 border border-border/40 rounded-xl bg-muted/20 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C5A059] border-b border-border/40 pb-1.5 flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> Career Timeline & Qualifications
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Date of 1st Appointment</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.dateOfFirstAppointment}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Date of Confirmation</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.dateOfConfirmation || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Present Appointment</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.presentAppointment || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Date of Appointment</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.dateOfAppointment || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Highest Qualification</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedPreviewStaff.highestQualification || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Expected Retirement</span>
                    <span className="font-bold text-[#C5A059] mt-0.5 block">{selectedPreviewStaff.expectedRetirementDate}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="border-t border-border/50 pt-4 mt-4 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedPreviewStaff(null)} 
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
