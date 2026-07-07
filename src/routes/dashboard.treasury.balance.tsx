import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Shield, Eye, RefreshCcw, Vault, Building } from 'lucide-react';
import { useState, useEffect } from 'react';
import { syncTreasuryBalance } from '@/lib/finance-audit-services';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/treasury/balance')({
  component: TreasuryBalanceComponent,
})

function TreasuryBalanceComponent() {
  const [showBalances, setShowBalances] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [crfBalance, setCrfBalance] = useState('₦14,250,000,000');
  const [lastSynced, setLastSynced] = useState('14 mins ago');
  const [isReconciled, setIsReconciled] = useState(true);

  // We only mock other accounts for presentation since user said:
  // "Do not allow officers to manually edit the Consolidated Revenue Fund balance directly.
  // Instead: The balance should be calculated... Add a simulated Open Banking API Sync button"
  const ACCOUNTS = [
    { name: 'Consolidated Revenue Fund (CRF)', bank: 'Central Bank of Nigeria', type: 'Primary Account', balance: crfBalance },
    { name: 'Capital Development Fund', bank: 'Zenith Bank Plc', type: 'Project Account', balance: '₦8,400,000,000' },
    { name: 'State Payroll Account', bank: 'UBA Plc', type: 'Recurrent Account', balance: '₦3,150,000,000' },
    { name: 'Emergency Reserve Fund', bank: 'Access Bank Plc', type: 'Reserve Account', balance: '₦2,000,000,000' },
  ];

  const handleSyncAPI = async () => {
    setIsSyncing(true);
    try {
      const result = await syncTreasuryBalance();
      setCrfBalance(result.crf);
      setLastSynced(`Just now (${result.lastSynced})`);
      setIsReconciled(result.reconciled);
      toast.success("Treasury balances synchronized via Open Banking API successfully.");
    } catch (error) {
      toast.error("Failed to sync treasury balances.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-12 pb-24">
      {/* Secure Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
        <div>
          <div className="flex items-center gap-2 text-slate-500 mb-3">
            <Lock className="size-5" />
            <span className="font-bold uppercase tracking-widest text-sm">Secure Vault View</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Consolidated Balances</h1>
          <p className="text-lg text-muted-foreground mt-2 font-medium">Restricted view of the state's aggregate liquidity across all recognized financial institutions.</p>
        </div>
        <div className="flex gap-3">
           <Button 
             variant={showBalances ? "outline" : "default"}
             className={`gap-2 font-bold shadow-md ${!showBalances ? 'bg-slate-900 text-white hover:bg-slate-800' : ''}`}
             onClick={() => setShowBalances(!showBalances)}
           >
             <Eye className="size-4" /> {showBalances ? 'Hide Balances' : 'Reveal Balances'}
           </Button>
           <Button 
             variant="outline"
             className="gap-2 font-bold shadow-sm"
             onClick={handleSyncAPI}
             disabled={isSyncing}
           >
             <RefreshCcw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} /> 
             {isSyncing ? 'Syncing...' : 'Open Banking Sync'}
           </Button>
        </div>
      </div>

      <div className="space-y-12">
        {/* Massive Aggregate Card */}
        <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
           {/* Decorative Vault Elements */}
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <Vault className="size-64 -mr-12 -mt-12" />
           </div>
           
           <CardContent className="p-12 md:p-20 relative z-10 flex flex-col items-center text-center">
              <Badge className={`${isReconciled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-amber-500/20 text-amber-400 border-amber-500/50'} mb-8 font-bold px-4 py-1.5 uppercase tracking-widest text-xs gap-2`}>
                 <Shield className="size-3" /> {isReconciled ? 'Fully Reconciled' : 'Pending Reconciliation'}
              </Badge>
              <p className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-4">Total Aggregate Liquidity (CRF)</p>
              
              <div className="flex items-center gap-4">
                 <h2 className="text-6xl md:text-8xl font-black tracking-tighter drop-shadow-lg transition-all duration-300">
                    {showBalances ? crfBalance : '*********'}
                 </h2>
              </div>
              
              <p className="text-sm text-slate-500 mt-8 flex items-center gap-2 font-medium">
                <RefreshCcw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} /> Last synced: {lastSynced}
              </p>
           </CardContent>
        </Card>

        {/* Account Breakdown List */}
        <div className="space-y-4">
           <h3 className="text-xl font-bold border-b border-border/50 pb-4 flex items-center gap-2">
             <Building className="size-5 text-muted-foreground" /> Recognized State Accounts
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACCOUNTS.map((acc, i) => (
                 <Card key={i} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center justify-between">
                       <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{acc.type}</p>
                          <h4 className="font-bold text-lg">{acc.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{acc.bank}</p>
                       </div>
                       <div className="text-right">
                          <h4 className="text-2xl font-black transition-all duration-300">
                             {showBalances ? acc.balance : '***'}
                          </h4>
                       </div>
                    </CardContent>
                 </Card>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
