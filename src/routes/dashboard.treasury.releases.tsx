import { dbGetFundReleasesList, dbGetBudgetLines, dbSubmitFundReleaseRequest } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollText, FileSignature, Landmark, CheckCircle2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/treasury/releases')({
  component: TreasuryReleasesComponent,
})

const DEFAULT_RELEASES = [
  { id: 'W-2026-402', mda: 'Ministry of Works', project: 'Lokoja Road Phase 1', approved: '₦120,000,000', released: '₦80,000,000', percentage: 66, status: 'Cash Backed', date: '2026-10-15' },
  { id: 'W-2026-401', mda: 'Ministry of Health', project: 'Clinic Renovations (East)', approved: '₦45,000,000', released: '₦45,000,000', percentage: 100, status: 'Fully Released', date: '2026-10-10' },
  { id: 'W-2026-399', mda: 'Ministry of Education', project: 'Teacher Training Q3', approved: '₦15,000,000', released: '₦0', percentage: 0, status: 'Awaiting Cash', date: '2026-10-02' },
  { id: 'W-2026-395', mda: 'Kogi State Water Board', project: 'Okene Pipe Network', approved: '₦210,000,000', released: '₦105,000,000', percentage: 50, status: 'Cash Backed', date: '2026-09-28' },
  { id: 'W-2026-390', mda: 'Ministry of Agriculture', project: 'Fertilizer Subsidy', approved: '₦80,000,000', released: '₦60,000,000', percentage: 75, status: 'Cash Backed', date: '2026-09-15' },
];

function TreasuryReleasesComponent() {
  const [releases, setReleases] = useState<any[]>(DEFAULT_RELEASES);
  const [budgetLines, setBudgetLines] = useState<any[]>([]);
  const [showWarrantForm, setShowWarrantForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [formMda, setFormMda] = useState('');
  const [formBudgetLineId, setFormBudgetLineId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPurpose, setFormPurpose] = useState('');

  const session = getSession();

  const loadData = async () => {
    setLoading(true);
    try {
      
      const dbReleases = await dbGetFundReleasesList();
      if (dbReleases && dbReleases.length > 0) {
        setReleases(dbReleases);
      }
      const dbLines = await dbGetBudgetLines();
      if (dbLines && dbLines.length > 0) {
        setBudgetLines(dbLines);
      }
    } catch (err) {
      console.error("Error loading fund releases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBudgetLines = budgetLines.filter(line => 
    line.mda.toLowerCase() === formMda.toLowerCase()
  );

  const uniqueMdas = Array.from(new Set(budgetLines.map(line => line.mda)));

  const handleIssueWarrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMda || !formBudgetLineId || !formAmount || !formPurpose) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      
      await dbSubmitFundReleaseRequest({
        data: {
          mda: formMda,
          budgetLineId: formBudgetLineId,
          amount: parseFloat(formAmount),
          purpose: formPurpose,
          email: session?.email || 'admin@kogi.gov.ng'
        }
      });
      toast.success("Fund release warrant submitted successfully. Routed for approval.");
      setShowWarrantForm(false);
      
      // Reset form
      setFormMda('');
      setFormBudgetLineId('');
      setFormAmount('');
      setFormPurpose('');
      
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit warrant request.");
    }
  };

  // Calculations
  const totalWarrantsSum = releases.reduce((sum, r) => {
    const val = parseFloat(r.approved?.replace(/[^\d.]/g, '') || '0');
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalReleasedSum = releases.reduce((sum, r) => {
    const val = parseFloat(r.released?.replace(/[^\d.]/g, '') || '0');
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const formatLargeCurrency = (num: number) => {
    if (num >= 1e9) return `₦${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `₦${(num / 1e6).toFixed(2)}M`;
    return `₦${num.toLocaleString()}`;
  };

  const filteredReleases = releases.filter(r => 
    r.mda.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <ScrollText className="size-5" />
            <span className="font-bold uppercase tracking-wider text-sm">Official Ledger</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Fund Releases & Warrants</h1>
          <p className="text-muted-foreground mt-1">Monitor approved budgets versus actual cash disbursed to MDAs.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 font-bold bg-background" onClick={() => setShowWarrantForm(true)}>
            <FileSignature className="size-4" /> Issue New Warrant
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left: Summary Metrics */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="border-border/60 shadow-sm bg-gradient-to-b from-blue-500/10 to-transparent">
            <CardHeader className="pb-2 text-center border-b border-border/50 bg-muted/5">
              <CardTitle className="text-sm uppercase tracking-wider font-bold">Total Warrants Issued (YTD)</CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <Landmark className="size-12 text-blue-500 mx-auto mb-4 opacity-80" />
              <h2 className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-2">
                {formatLargeCurrency(totalWarrantsSum)}
              </h2>
              <Badge variant="outline" className="font-bold border-blue-500 text-blue-600 bg-blue-500/10">
                Across {releases.length} Warrants
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-sm uppercase font-bold tracking-wider">Release Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">Total Cash Released</span>
                  <span className="font-bold text-emerald-600">{formatLargeCurrency(totalReleasedSum)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${totalWarrantsSum > 0 ? (totalReleasedSum / totalWarrantsSum) * 100 : 0}%` }} 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">Outstanding / Pending Cash</span>
                  <span className="font-bold text-amber-600">{formatLargeCurrency(totalWarrantsSum - totalReleasedSum)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${totalWarrantsSum > 0 ? ((totalWarrantsSum - totalReleasedSum) / totalWarrantsSum) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Warrant Ledger */}
        <div className="xl:col-span-3 space-y-6">
          <Card className="border-border/60 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-muted/5 border-b border-border/50 p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg">Recent Fund Releases</CardTitle>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search warrants, MDAs..." 
                      className="pl-9 h-9 bg-background" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0 shrink-0"><Filter className="size-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto flex-1">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Warrant ID & MDA</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Project / Purpose</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-right">Approved Limit</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-right">Cash Released</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredReleases.map((release, i) => (
                    <tr key={i} className="hover:bg-muted/5 transition-colors font-medium">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <ScrollText className="size-4 text-muted-foreground" />
                          <span className="font-bold">{release.id.length > 10 ? `W-${release.id.substring(0, 6).toUpperCase()}` : release.id}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{release.mda}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="mb-1 truncate max-w-md">{release.project}</div>
                        <span className="text-xs text-muted-foreground">Issued: {release.date}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">
                        {release.approved}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-black text-primary mb-1">{release.released}</div>
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden ml-auto">
                          <div className={`h-full rounded-full ${
                            release.percentage === 100 ? 'bg-emerald-500' :
                            release.percentage > 0 ? 'bg-blue-500' : 'bg-amber-500'
                          }`} style={{ width: `${release.percentage}%` }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline" className={`font-bold ${
                          release.status === 'Fully Released' ? 'border-emerald-500 text-emerald-600 bg-emerald-500/10' :
                          release.status === 'Cash Backed' ? 'border-blue-500 text-blue-600 bg-blue-500/10' :
                          'border-amber-500 text-amber-600 bg-amber-500/10'
                        }`}>
                          {release.status === 'Fully Released' && <CheckCircle2 className="size-3 mr-1" />}
                          {release.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Warrant Issue Modal */}
      {showWarrantForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-border/80 shadow-2xl bg-background animate-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="size-5 text-blue-600" />
                Issue Fund Release Warrant
              </CardTitle>
              <CardDescription>Request a cash backing or warrant release from an approved budget line.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleIssueWarrant} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Executing MDA</label>
                  <select 
                    className="w-full p-2 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={formMda}
                    onChange={(e) => {
                      setFormMda(e.target.value);
                      setFormBudgetLineId('');
                    }}
                    required
                  >
                    <option value="">Select Ministry / Agency</option>
                    {uniqueMdas.map((mda, idx) => (
                      <option key={idx} value={mda}>{mda}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Target Budget Line</label>
                  <select 
                    className="w-full p-2 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                    value={formBudgetLineId}
                    onChange={(e) => setFormBudgetLineId(e.target.value)}
                    disabled={!formMda}
                    required
                  >
                    <option value="">Select Budget Line</option>
                    {filteredBudgetLines.map((line) => (
                      <option key={line.id} value={line.id}>
                        {line.description} (Limit: ₦{line.amount.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Release Amount (₦)</label>
                  <Input 
                    type="number"
                    placeholder="Enter amount to release..."
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Purpose / Remarks</label>
                  <textarea 
                    className="w-full p-3 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-24"
                    placeholder="Describe the justification or project milestones..."
                    value={formPurpose}
                    onChange={(e) => setFormPurpose(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border/50">
                  <Button type="button" variant="outline" className="flex-1 font-bold" onClick={() => setShowWarrantForm(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 font-bold bg-blue-600 hover:bg-blue-700 text-white">Issue Warrant</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
