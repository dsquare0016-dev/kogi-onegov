import { createFileRoute } from '@tanstack/react-router';
import { AlertTriangle, Clock, Users, ArrowRight, ShieldAlert, GitPullRequestDraft } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/command-center/escalation')({
  component: EscalationTrackerPage,
});

const MOCK_ESCALATIONS = [
  { id: 'ESC-204', title: 'Lokoja Flood Defence Barrier Delay', mda: 'Ministry of Environment', severity: 'Critical', daysOpen: 14, status: 'Needs Intervention', officer: 'Dr. Musa Ali' },
  { id: 'ESC-205', title: 'Healthcare Fund Disbursement Block', mda: 'Ministry of Finance', severity: 'High Risk', daysOpen: 8, status: 'In Review', officer: 'Hajia Fatima' },
  { id: 'ESC-208', title: 'Contractor Abandonment: Zone B Roads', mda: 'Ministry of Works', severity: 'Critical', daysOpen: 21, status: 'Needs Intervention', officer: 'Engr. Sam' },
  { id: 'ESC-210', title: 'Smart Schools Tablet Procurement', mda: 'Ministry of Education', severity: 'Warning', daysOpen: 4, status: 'Monitoring', officer: 'Dr. Grace' },
];

function EscalationTrackerPage() {
  const [filter, setFilter] = useState('All');

  const filtered = MOCK_ESCALATIONS.filter(e => filter === 'All' || e.severity === filter);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'High Risk': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'Warning': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 h-[calc(100vh-172px)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-1">
            <GitPullRequestDraft className="size-4" />
            DG GDU Command Center
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Escalation Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Triage and monitor critical bottlenecks blocking state project delivery.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          {['All', 'Critical', 'High Risk', 'Warning'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${filter === f ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {['Needs Intervention', 'In Review', 'Monitoring'].map(column => (
          <div key={column} className="bg-muted/40 rounded-xl border border-border p-4 flex flex-col h-full overflow-hidden">
            <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4 flex items-center justify-between">
              {column}
              <span className="bg-background px-2 py-0.5 rounded text-xs">
                {filtered.filter(e => e.status === column).length}
              </span>
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {filtered.filter(e => e.status === column).map(esc => (
                <div key={esc.id} className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded">{esc.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getSeverityStyle(esc.severity)}`}>
                      {esc.severity}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm leading-tight mb-2">{esc.title}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{esc.mda}</p>
                  
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Clock className="size-3" /> {esc.daysOpen} days
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-primary">
                      <Users className="size-3" /> {esc.officer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
