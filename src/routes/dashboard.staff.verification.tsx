import { dbGetApplicants, dbVerifyApplicant } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, FileText, CheckCircle2, XCircle, Search, Eye, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export const Route = createFileRoute('/dashboard/staff/verification')({
  component: StaffVerification,
});

function StaffVerification() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [birthChecked, setBirthChecked] = useState(false);
  const [originChecked, setOriginChecked] = useState(false);
  const [medicalChecked, setMedicalChecked] = useState(false);
  const [degreeChecked, setDegreeChecked] = useState(false);

  const loadCandidates = async () => {
    setLoading(true);
    
    const data = await dbGetApplicants();
    setCandidates(data);
    if (data.length > 0) {
      setSelectedCandidate(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const handleSelectCandidate = (c: any) => {
    setSelectedCandidate(c);
    setBirthChecked(false);
    setOriginChecked(false);
    setMedicalChecked(false);
    setDegreeChecked(false);
  };

  const handleApprove = async () => {
    if (!selectedCandidate) return;
    if (!birthChecked || !originChecked || !medicalChecked || !degreeChecked) {
      alert("Please check all documents before approving candidate.");
      return;
    }
    
    try {
      await dbVerifyApplicant({ data: { id: selectedCandidate.id } });
      alert(`Applicant ${selectedCandidate.name} has been successfully cleared! Active Nominal Roll entry generated.`);
      await loadCandidates();
    } catch (e: any) {
      alert("Failed to verify applicant: " + e.message);
    }
  };

  const handleReject = () => {
    alert("Candidate verification request rejected and sent back to recruitment desk.");
  };

  const filteredCandidates = useMemo(() => {
    if (!search.trim()) return candidates;
    return candidates.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.appId.toLowerCase().includes(search.toLowerCase()));
  }, [candidates, search]);

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading Verification Queue...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24 text-foreground animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Staff Document Verification</h1>
        <p className="text-muted-foreground mt-1">Review applicant documents and clear them for Staff ID generation and Nominal Roll insertion.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 bg-card shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <CardTitle className="text-lg flex items-center gap-2 font-black"><ShieldCheck className="size-5 text-primary" /> Verification Queue</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search applicant..." 
                    className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-foreground" 
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 text-muted-foreground uppercase text-xs font-bold border-b border-border/60">
                    <tr>
                      <th className="px-4 py-3">App ID</th>
                      <th className="px-4 py-3">Name / Role</th>
                      <th className="px-4 py-3">MDA Scope</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredCandidates.map((c, i) => (
                      <tr 
                        key={i} 
                        onClick={() => handleSelectCandidate(c)}
                        className={`cursor-pointer transition-colors hover:bg-muted/10 ${selectedCandidate?.id === c.id ? 'bg-muted/20 font-medium' : ''}`}
                      >
                        <td className="px-4 py-3 font-mono font-bold text-primary">{c.appId}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-foreground">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground">{c.role}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-muted-foreground">{c.mda}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            c.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="px-3 py-1 bg-card border border-border rounded shadow-sm hover:bg-muted text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
                            <Eye className="size-3" /> Select
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredCandidates.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground italic">No candidates awaiting verification.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-card shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/10">
              <CardTitle className="text-lg font-black">Document Checklist</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {selectedCandidate ? (
                <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                  <h4 className="font-bold text-sm text-primary mb-2">{selectedCandidate.name} ({selectedCandidate.appId})</h4>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={birthChecked} onChange={e => setBirthChecked(e.target.checked)} className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" /> Birth Certificate
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={originChecked} onChange={e => setOriginChecked(e.target.checked)} className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" /> State of Origin Cert
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={medicalChecked} onChange={e => setMedicalChecked(e.target.checked)} className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" /> Medical Report
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={degreeChecked} onChange={e => setDegreeChecked(e.target.checked)} className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" /> Degree Certificate
                    </span>
                  </label>

                  <div className="pt-4 mt-2 border-t border-border/50 flex gap-2">
                    <button 
                      onClick={handleApprove}
                      disabled={selectedCandidate.status === 'Verified'}
                      className={`flex-1 py-2 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                        selectedCandidate.status === 'Verified' ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60' : 'bg-emerald-500 hover:bg-emerald-600'
                      }`}
                    >
                      <CheckCircle2 className="size-4" /> Clear & Hire
                    </button>
                    <button 
                      onClick={handleReject}
                      disabled={selectedCandidate.status === 'Verified'}
                      className={`flex-1 py-2 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                        selectedCandidate.status === 'Verified' ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60' : 'bg-rose-500 hover:bg-rose-600'
                      }`}
                    >
                      <XCircle className="size-4" /> Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic text-center py-6">Select an applicant to review documents.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
