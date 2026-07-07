import { dbGetPublicApplicationStatus } from '@/lib/postgres-service';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { Search, Loader2, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

export const Route = createFileRoute('/recruitment/status')({
  component: RecruitmentStatusPage,
});

function RecruitmentStatusPage() {
  const [appNumber, setAppNumber] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appNumber || !emailOrPhone) {
      alert('Please fill out all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    try {
      
      const res = await dbGetPublicApplicationStatus({
        data: {
          applicationNumber: appNumber,
          emailOrPhone: emailOrPhone
        }
      });
      if (res) {
        setResult(res);
      } else {
        setErrorMsg('No application matches the specified credentials. Please verify your reference ID.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Status inquiry failed.');
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 text-xs font-bold uppercase rounded">Submitted</span>;
      case 'Under Review':
        return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase rounded">Under Review</span>;
      case 'Shortlisted':
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase rounded">Shortlisted</span>;
      case 'Screening':
        return <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold uppercase rounded">Document Screening</span>;
      case 'Interview':
        return <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold uppercase rounded flex items-center gap-1"><Clock className="size-3.5" /> Interview Scheduled</span>;
      case 'Successful':
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase rounded flex items-center gap-1"><ShieldCheck className="size-3.5" /> Approved / Successful</span>;
      case 'Added to Nominal Roll':
        return <span className="px-2.5 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold uppercase rounded flex items-center gap-1"><CheckCircle2 className="size-3.5" /> Added to Nominal Roll</span>;
      default:
        return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase rounded flex items-center gap-1"><AlertTriangle className="size-3.5" /> Unsuccessful</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6">
      <div className="max-w-md w-full mx-auto space-y-6 py-8">
        <div className="flex justify-between items-center border-b border-border/50 pb-4">
          <Logo size={44} withText textClass="text-primary" />
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-bold transition-all">
            <ArrowLeft className="size-3.5" /> Back to Portal
          </Link>
        </div>

        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg uppercase font-black text-primary flex items-center gap-2">
              <Search className="size-5 text-primary" /> Application Tracker
            </CardTitle>
            <CardDescription className="text-xs">Enter your reference credentials to pull real-time campaign status.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheck} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Application ID *</label>
                <input
                  required
                  type="text"
                  value={appNumber}
                  onChange={e => setAppNumber(e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-lg text-center font-mono text-lg tracking-widest text-foreground uppercase outline-none focus:border-primary/50"
                  placeholder="KGR-XXXXXX"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Email or Phone *</label>
                <input
                  required
                  type="text"
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary/50"
                  placeholder="Associated email or mobile number"
                />
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-lg text-center">
                  ⚠️ {errorMsg}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-lg shadow hover:bg-primary/95 transition-colors cursor-pointer flex items-center justify-center gap-2">
                {loading ? <Loader2 className="size-4 animate-spin" /> : 'Inquire Status'}
              </button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-border/60 bg-card/60 backdrop-blur-md overflow-hidden animate-in fade-in">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Inquiry Result</div>
              <CardTitle className="text-sm font-black text-primary">{result.first_name} {result.last_name}</CardTitle>
              <CardDescription className="text-xs font-mono">{result.application_number}</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-1 border-b border-border/40 pb-2.5">
                <span className="text-muted-foreground font-bold">Campaign:</span>
                <span className="col-span-2 text-foreground font-semibold">{result.campaign_title}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 border-b border-border/40 pb-2.5">
                <span className="text-muted-foreground font-bold">Role sought:</span>
                <span className="col-span-2 text-foreground font-semibold">{result.position_applied_for}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 border-b border-border/40 pb-2.5 items-center">
                <span className="text-muted-foreground font-bold">Portal Status:</span>
                <span className="col-span-2">{getStatusBadge(result.application_status)}</span>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground font-bold">Secretariat Remarks:</div>
                <div className="p-3 bg-muted/40 rounded border border-border/60 text-slate-200 leading-relaxed font-sans">
                  {result.remarks || 'Your application profile is awaiting review by the Civil Service Commission board.'}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="text-center text-[10px] text-muted-foreground py-4 border-t border-border/20 max-w-md w-full mx-auto">
        © 2026 Kogi State Civil Service Commission. Unified ERP Recruitment Portal.
      </div>
    </div>
  );
}
