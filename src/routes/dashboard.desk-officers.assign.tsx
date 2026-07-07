import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MINISTRIES } from '@/lib/mock-data';
import { UserPlus, ShieldAlert, Building2, Search, CheckCircle2, UserCog, Clock, Eye, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNominalRollStore } from '@/lib/nominalRollStore';
import { useDeskOfficersStore } from '@/lib/deskOfficersStore';

export const Route = createFileRoute('/dashboard/desk-officers/assign')({
  component: AssignDeskOfficersPage,
});

function AssignDeskOfficersPage() {
  const [selectedMda, setSelectedMda] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState("DGOS Reporting");

  // Load stores
  const { records: staffRecords } = useNominalRollStore();
  const { deskOfficers, activities, assignDeskOfficer, loadStore } = useDeskOfficersStore();

  useEffect(() => {
    loadStore();
  }, []);

  // Filter staff to only show verified employees from the selected MDA in the Nominal Roll
  const eligibleStaff = selectedMda
    ? staffRecords.filter(s => s.mda === selectedMda && s.verificationStatus === 'Verified')
    : [];

  // Count Desk Officers per MDA to check compliance (Minimum of 2 required)
  const mdaCompliance = MINISTRIES.map(m => {
    const officers = deskOfficers.filter(d => d.ministry === m.name && d.status === 'Active');
    return {
      mdaName: m.name,
      officersCount: officers.length,
      iscompliant: officers.length >= 2
    };
  });

  const nonCompliantMdas = mdaCompliance.filter(c => !c.iscompliant);

  const handleIssueAssignment = async () => {
    if (!selectedStaffId || !selectedMda) return;
    
    const staff = staffRecords.find(s => s.staffId === selectedStaffId);
    if (!staff) return;

    // Enforce that the staff must belong to that MDA
    if (staff.mda !== selectedMda) {
      alert("Error: Selected staff member does not belong to the selected MDA in the Nominal Roll.");
      return;
    }

    await assignDeskOfficer({
      name: staff.fullName,
      ministry: selectedMda,
      assignment: selectedAssignment,
      status: 'Active'
    });

    alert(`Successfully elevated ${staff.fullName} to Desk Officer for ${selectedMda}.`);
    setSelectedStaffId("");
    setSelectedMda("");
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto pb-24 space-y-6 text-foreground">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
          Desk Officer Assignment & Tracking
        </h1>
        <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-relaxed">
          Elevate verified staff members to official MDA Desk Officers. In compliance with state regulations, each MDA is required to have a <strong>minimum of two (2) certified Desk Officers</strong> post-assigned from their respective nominal roll.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Assignment Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4 border-b border-border/50 bg-primary/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="size-5 text-primary" /> Elevation & Nomination Form
              </CardTitle>
              <CardDescription className="text-xs">
                Select a verified employee from the nominal roll list to assign as an MDA compliance link.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Ministry / Agency</label>
                    <select 
                      value={selectedMda}
                      onChange={e => {
                        setSelectedMda(e.target.value);
                        setSelectedStaffId("");
                      }}
                      className="w-full p-2.5 bg-muted/40 border border-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select MDA...</option>
                      {MINISTRIES.map(m => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nominate Staff Member (From Nominal Roll)</label>
                    <div className="relative">
                      <select 
                        value={selectedStaffId}
                        onChange={e => setSelectedStaffId(e.target.value)}
                        className="w-full p-2.5 bg-muted/40 border border-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                        disabled={!selectedMda}
                      >
                        <option value="">Search and select staff...</option>
                        {eligibleStaff.map(staff => (
                          <option key={staff.staffId} value={staff.staffId}>
                            {staff.fullName} ({staff.gradeLevel}) - ID: {staff.staffId}
                          </option>
                        ))}
                      </select>
                    </div>
                    {!selectedMda ? (
                      <p className="text-[10px] text-muted-foreground mt-1">Please select an MDA first to view eligible staff.</p>
                    ) : eligibleStaff.length === 0 ? (
                      <p className="text-[10px] text-amber-500 font-semibold mt-1">⚠️ No verified staff found in nominal roll for this MDA.</p>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reporting Domain (KPI Pillars)</label>
                    <select
                      value={selectedAssignment}
                      onChange={e => setSelectedAssignment(e.target.value)}
                      className="w-full p-2.5 bg-muted/40 border border-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="DGOS Reporting">DGOS Compliance Reporting</option>
                      <option value="Budget Returns">Budget & Expenditure Returns</option>
                      <option value="Procurement Returns">e-Procurement & Tender Logs</option>
                      <option value="Project Verification">Capital Project M&E Inspections</option>
                      <option value="HR Returns">Workforce Lifecycle Verification</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-center bg-muted/10 p-4 rounded-lg text-xs">
                <div className="text-muted-foreground max-w-md">
                  Upon assignment, this staff member will be granted GDU clearance to register staff and upload/update activities for their assigned MDA.
                </div>
                <button 
                  onClick={handleIssueAssignment}
                  disabled={!selectedStaffId || !selectedMda}
                  className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="size-4" /> Issue Assignment
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Desk Officer Activity Logs Dashboard (Superadmin Tracking Section) */}
          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 bg-muted/20 border-b border-border/50">
              <CardTitle className="text-md flex items-center gap-2 text-foreground">
                <Clock className="size-5 text-[#C5A059] animate-pulse" />
                <span>Desk Officer Activity Audit & Tracking</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time tracking of registration and upload activities performed by certified Desk Officers.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3">Desk Officer</th>
                      <th className="px-4 py-3">Assigned MDA</th>
                      <th className="px-4 py-3">Activity Action</th>
                      <th className="px-4 py-3">Activity Detail</th>
                      <th className="px-4 py-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {activities.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          No recent desk officer activities recorded.
                        </td>
                      </tr>
                    ) : (
                      activities.map((act) => (
                        <tr key={act.id} className="hover:bg-muted/5 transition-all">
                          <td className="px-4 py-3 font-bold text-foreground">{act.officerName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{act.mda}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              act.action.includes('Register') ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                            }`}>
                              {act.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-foreground font-medium">{act.detail}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: MDA Compliance Matrix */}
        <div className="space-y-6">
          
          {/* Non-Compliant MDAs Alert box */}
          <Card className="border-red-500/30 bg-red-500/5 shadow-sm">
            <CardHeader className="pb-3 border-b border-red-500/10 py-3.5">
              <CardTitle className="text-sm font-black flex items-center gap-2 text-red-700 dark:text-red-400">
                <ShieldAlert className="size-4.5" /> Non-Compliant MDAs (Required: ≥ 2)
              </CardTitle>
              <CardDescription className="text-red-600/80 text-[10px] mt-0.5">
                MDAs missing the minimum of 2 certified Desk Officers.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {nonCompliantMdas.length === 0 ? (
                <div className="text-center py-4 text-xs text-emerald-600 font-bold flex items-center justify-center gap-1.5">
                  <ShieldCheck className="size-5" /> All MDAs are fully compliant!
                </div>
              ) : (
                nonCompliantMdas.map(c => (
                  <div key={c.mdaName} className="flex items-center justify-between p-3 bg-card border border-red-200 dark:border-red-900 rounded-xl text-xs">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <Building2 className="size-4 text-red-500 opacity-80" /> 
                      <span className="truncate max-w-[180px]">{c.mdaName}</span>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-rose-500 text-white rounded uppercase tracking-wider">
                      {c.officersCount === 0 ? 'Urgent (0/2)' : `Understaffed (${c.officersCount}/2)`}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active Assignments Panel */}
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border/50 py-3.5">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                <UserCog className="size-4 text-primary" /> Active Desk Officers ({deskOfficers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[350px] overflow-y-auto divide-y divide-border/40">
                {deskOfficers.map((d) => (
                  <div key={d.id} className="p-3.5 text-xs hover:bg-muted/5 transition-all">
                    <div className="flex justify-between items-center font-bold text-foreground">
                      <span>{d.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        d.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-[10px] mt-1 flex justify-between">
                      <span>{d.ministry} • {d.assignment}</span>
                      <span className="font-mono text-primary font-bold">{d.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
