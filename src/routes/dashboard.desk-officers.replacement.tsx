import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserMinus, Send, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { MINISTRIES, STAFF_SAMPLE } from '@/lib/mock-data';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/desk-officers/replacement')({
  component: ReplacementRequestsPage,
});

function ReplacementRequestsPage() {
  const [selectedMda, setSelectedMda] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState("");

  const filteredStaff = selectedMda 
    ? STAFF_SAMPLE.filter(s => s.ministry === selectedMda)
    : [];

  return (
    <div className="p-6 max-w-[1200px] mx-auto pb-24 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Replacement Requests</h1>
        <p className="text-muted-foreground mt-1">
          Officially request the GDU to revoke a current Desk Officer's certification due to underperformance, transfer, or retirement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Request Form */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50 bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserMinus className="size-5 text-primary" /> Initiate Replacement Request
            </CardTitle>
            <CardDescription>This will freeze the officer's ERP access pending GDU review.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Requesting Ministry / Agency</label>
              <select 
                value={selectedMda}
                onChange={e => { setSelectedMda(e.target.value); setSelectedOfficer(""); }}
                className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select MDA...</option>
                {MINISTRIES.map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Current Desk Officer to Replace</label>
              <select 
                value={selectedOfficer}
                onChange={e => setSelectedOfficer(e.target.value)}
                className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={!selectedMda}
              >
                <option value="">Select certified officer...</option>
                {filteredStaff.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.name} ({staff.id})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Replacement</label>
              <select className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option>Consistent Underperformance / KPI Failure</option>
                <option>Retirement / Resignation</option>
                <option>Internal Transfer / Redeployment</option>
                <option>Disciplinary Action</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Justification & Handover Notes</label>
              <textarea 
                className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm h-24 focus:outline-none focus:ring-1 focus:ring-primary" 
                placeholder="Provide details. If disciplinary, attach reference numbers..."
              />
            </div>

            <button 
              disabled={!selectedOfficer}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-4"
            >
              <Send className="size-4" /> Submit Request to GDU
            </button>
          </CardContent>
        </Card>

        {/* Status Tracker */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="size-5 text-primary" /> Pending GDU Decisions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border/50">
                <div className="p-4 hover:bg-muted/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">Peter Adamu</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Ministry of Agriculture</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded text-[10px] font-bold uppercase tracking-widest">
                      Under Review
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                    <FileText className="size-3" /> Reason: Internal Transfer
                  </div>
                </div>

                <div className="p-4 hover:bg-muted/10 transition-colors opacity-60">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-sm line-through">Fatima Sani</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Ministry of Environment</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Revoked & Replaced
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                    <FileText className="size-3" /> Reason: Retirement
                  </div>
                </div>
             </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
