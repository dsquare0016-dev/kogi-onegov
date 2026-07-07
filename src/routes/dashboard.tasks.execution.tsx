import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Activity, Clock, Filter, FileText, FileSpreadsheet, ChevronDown, ChevronRight, Briefcase, User, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/dashboard/tasks/execution')({
  component: TaskExecutionComponent,
})

function TaskExecutionComponent() {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const executions = [
    { id: "TSK-089", title: "Primary School Renovation", start: "2026-06-01", end: "2026-08-30", location: "Lokoja LGA", type: "Project Site", status: "Ongoing", progress: 45, 
      details: { objective: "Improve education infrastructure", budget: "₦45,000,000", officer: "Engr. Musa", blockers: "Material delays due to rain." } },
    { id: "TSK-092", title: "State Revenue Audit", start: "2026-06-15", end: "2026-07-15", location: "Statewide", type: "Ministry", status: "Delayed", progress: 12,
      details: { objective: "Ensure fiscal transparency", budget: "₦12,000,000", officer: "Mrs. Adeyemi", blockers: "Pending agency submissions." } },
    { id: "TSK-095", title: "Agricultural Seed Distribution", start: "2026-06-10", end: "2026-06-25", location: "Dekina LGA", type: "Agency", status: "Completed", progress: 100,
      details: { objective: "Support local farmers", budget: "₦8,500,000", officer: "Dr. Ojo", blockers: "None. Completed successfully." } },
  ];

  const filteredExecutions = statusFilter === "All" ? executions : executions.filter(e => e.status === statusFilter);

  const toggleRow = (id: string) => {
    setExpandedTaskId(prev => prev === id ? null : id);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Execution Details</h1>
        <p className="text-muted-foreground mt-1">Track timelines, locations, and real-time execution progress of tasks.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
             <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="size-5 text-primary" /> Active Executions
            </CardTitle>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <div className="relative">
                <select 
                  className="appearance-none bg-background border border-border rounded-md pl-8 pr-8 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Completed">Completed</option>
                </select>
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
              
              <div className="flex bg-background border border-border rounded-md overflow-hidden">
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-muted border-r border-border transition-colors">
                  <FileText className="size-4 text-red-500" /> PDF
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                  <FileSpreadsheet className="size-4 text-emerald-500" /> Excel
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Task</th>
                    <th className="px-6 py-4 font-semibold">Timeline</th>
                    <th className="px-6 py-4 font-semibold">Location Focus</th>
                    <th className="px-6 py-4 font-semibold">Progress</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredExecutions.map(t => (
                    <React.Fragment key={t.id}>
                      <tr 
                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => toggleRow(t.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 text-muted-foreground">
                              {expandedTaskId === t.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                            </div>
                            <div>
                              <div className="font-semibold">{t.title}</div>
                              <div className="text-xs text-muted-foreground font-mono mt-1">{t.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs mb-1">
                            <Calendar className="size-3 text-muted-foreground" />
                            <span>Start: {t.start}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="size-3 text-muted-foreground" />
                            <span className="font-medium text-amber-600 dark:text-amber-500">End: {t.end}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                            <MapPin className="size-3 text-primary" />
                            <span className="font-medium">{t.location}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{t.type}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-muted rounded-full h-2.5 mb-1">
                            <div className={`h-2.5 rounded-full ${t.progress === 100 ? 'bg-emerald-500' : t.progress < 20 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${t.progress}%` }}></div>
                          </div>
                          <div className="text-xs text-right font-medium">{t.progress}%</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={`
                            ${t.status === 'Completed' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : ''}
                            ${t.status === 'Ongoing' ? 'text-blue-500 border-blue-500/30 bg-blue-500/10' : ''}
                            ${t.status === 'Delayed' ? 'text-red-500 border-red-500/30 bg-red-500/10' : ''}
                          `}>
                            {t.status}
                          </Badge>
                        </td>
                      </tr>
                      {expandedTaskId === t.id && (
                        <tr className="bg-muted/5 border-b border-border/50">
                          <td colSpan={5} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-background rounded-xl p-6 border border-border shadow-sm">
                              <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2"><Target className="size-4" /> Objective</div>
                                <div className="text-sm font-medium">{t.details.objective}</div>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2"><Briefcase className="size-4" /> Budget Allocated</div>
                                <div className="text-sm font-mono font-bold text-primary">{t.details.budget}</div>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2"><User className="size-4" /> Responsible Officer</div>
                                <div className="text-sm font-medium">{t.details.officer}</div>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2"><Activity className="size-4" /> Latest Update / Blocker</div>
                                <div className="text-sm">{t.details.blockers}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
