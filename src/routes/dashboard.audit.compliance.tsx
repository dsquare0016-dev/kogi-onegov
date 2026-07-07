import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClipboardCheck, FileX, ShieldCheck, Download, AlertTriangle, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchComplianceScores, updateComplianceScore } from '@/lib/finance-audit-services';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

export const Route = createFileRoute('/dashboard/audit/compliance')({
  component: ComplianceReviewsComponent,
})

const COMMON_FAILURES = [
  { issue: 'Missing Director Signatures on Vouchers', count: 45, severity: 'High' },
  { issue: 'Late Submission of Monthly Reconciliations', count: 32, severity: 'Medium' },
  { issue: 'Incomplete Vendor Tax Clearance Certificates', count: 28, severity: 'High' },
  { issue: 'Budget Overrun without Prior ExCo Approval', count: 12, severity: 'Critical' },
];

function ComplianceReviewsComponent() {
  const [mdaScores, setMdaScores] = useState<any[]>([]);
  
  // Dialog state
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [activeMda, setActiveMda] = useState<any>(null);
  const [newScore, setNewScore] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchComplianceScores();
      setMdaScores(data);
    };
    loadData();
  }, []);

  const handleOpenUpdate = (mda: any) => {
    setActiveMda(mda);
    setNewScore(mda.score.toString());
    setIsUpdateOpen(true);
  };

  const handleSaveScore = async () => {
    if (!activeMda || !newScore) return;
    const numScore = parseInt(newScore, 10);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      toast.error("Please enter a valid score between 0 and 100");
      return;
    }
    
    await updateComplianceScore(activeMda.id, numScore);
    const updated = await fetchComplianceScores();
    setMdaScores(updated);
    setIsUpdateOpen(false);
    toast.success(`${activeMda.name} compliance score updated successfully.`);
  };

  // Calculate average score dynamically
  const averageScore = mdaScores.length > 0 
    ? Math.round(mdaScores.reduce((acc, mda) => acc + mda.score, 0) / mdaScores.length)
    : 0;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <ShieldCheck className="size-5" />
            <span className="font-bold uppercase tracking-wider text-sm">Regulatory Adherence</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Reviews</h1>
          <p className="text-muted-foreground mt-1">Monitor state-wide adherence to procurement laws and financial procedures.</p>
        </div>
        <Button variant="outline" className="gap-2 font-bold bg-background">
          <Download className="size-4" />
          Export Global Compliance Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Overall Score & Failures */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/60 shadow-sm bg-gradient-to-b from-emerald-500/10 to-transparent">
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-sm uppercase tracking-wider font-bold text-muted-foreground">State Average Compliance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative size-40 my-4 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/30" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="12" className="text-emerald-500 transition-all duration-1000" strokeDasharray="276" strokeDashoffset={276 - (276 * averageScore) / 100} strokeLinecap="round" />
                </svg>
                <div className="text-center">
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{averageScore}%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-center text-muted-foreground max-w-[200px]">
                Target: 85%. The state is currently {85 - averageScore > 0 ? `${85 - averageScore} points behind` : `${averageScore - 85} points ahead of`} the annual compliance target.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm border-t-4 border-t-amber-500">
            <CardHeader className="bg-muted/5 border-b border-border/50 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileX className="size-4 text-amber-500" />
                Common Procedural Failures
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {COMMON_FAILURES.map((fail, i) => (
                  <div key={i} className="p-4 flex items-start justify-between gap-4 hover:bg-muted/10 transition-colors">
                    <div>
                      <p className="text-sm font-semibold leading-tight">{fail.issue}</p>
                      <p className="text-xs text-muted-foreground mt-1">{fail.count} instances recorded this month</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 font-bold ${
                      fail.severity === 'Critical' ? 'border-red-500 text-red-600 bg-red-500/10' :
                      fail.severity === 'High' ? 'border-amber-500 text-amber-600 bg-amber-500/10' :
                      'border-blue-500 text-blue-600 bg-blue-500/10'
                    }`}>
                      {fail.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: MDA Scorecard */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-muted/5 border-b border-border/50 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="size-5 text-primary" />
                    MDA Compliance Scorecard
                  </CardTitle>
                  <CardDescription className="mt-1">Ranked by overall procedural adherence score.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="font-bold">View Full Leaderboard</Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1">
              <div className="space-y-6">
                {mdaScores.map((mda, i) => (
                  <div key={mda.id} className="space-y-2 group">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold w-6 text-muted-foreground">{i + 1}.</span>
                        <span className="font-semibold">{mda.name}</span>
                        {mda.status === 'Critical' && (
                          <AlertTriangle className="size-4 text-red-500 animate-pulse" />
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-6 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleOpenUpdate(mda)}
                        >
                          <Edit2 className="size-3 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black">{mda.score}%</span>
                        <span className={`text-xs font-bold ${
                          mda.trend.startsWith('+') ? 'text-emerald-500' : 
                          mda.trend === '0%' ? 'text-muted-foreground' : 'text-red-500'
                        }`}>{mda.trend}</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                      <div className={`h-full rounded-full transition-all duration-700 ${
                        mda.score >= 90 ? 'bg-emerald-500' :
                        mda.score >= 75 ? 'bg-blue-500' :
                        mda.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`} style={{ width: `${mda.score}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-medium text-muted-foreground">ID: {mda.id}</span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{mda.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Update Score Modal */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Compliance Score</DialogTitle>
            <DialogDescription>
              Adjust the compliance score for {activeMda?.name}. This will automatically recalculate their trend and status.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">New Compliance Score (0-100)</label>
              <Input 
                type="number"
                min="0"
                max="100"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveScore}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
