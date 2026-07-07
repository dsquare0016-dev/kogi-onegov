import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, Clock, ShieldAlert, Sparkles, UserCheck, UserX } from 'lucide-react';
import { attendanceStore } from '@/lib/attendanceStore';
import { getSession } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/attendance/')({
  component: AttendanceDashboard,
});

function AttendanceDashboard() {
  const session = getSession();
  const isRetiree = session?.role === 'retiree';
  
  let stats = attendanceStore.getMockStats();
  if (isRetiree) {
    stats = {
      ...stats,
      presentDays: 3245,
      absentDays: 14,
      lateDays: 28,
      attendancePercentage: 98,
      trend: "Service Concluded",
      aiSummary: "Your attendance record over your career was exemplary. Thank you for your dedicated service to Kogi State."
    };
  }

  if (!attendanceStore.settings.isModuleEnabled) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <ShieldAlert className="size-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold">Attendance Module Disabled</h2>
        <p className="text-muted-foreground mt-2 max-w-md">The Superadmin has disabled the attendance module globally. Reach out to HR or System Administration for more information.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{isRetiree ? "Historical Attendance Records" : "Attendance & Punctuality Dashboard"}</h1>
        <p className="text-muted-foreground mt-1">{isRetiree ? "Review your lifetime attendance metrics and service punctuality." : "Review your personal attendance metrics, rankings, and AI-driven productivity insights."}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <UserCheck className="size-4" />
              <span className="text-sm font-medium">Present Days</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.presentDays}</div>
            <p className="text-xs text-emerald-500 font-medium">{stats.trend}</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <UserX className="size-4" />
              <span className="text-sm font-medium">Absent Days</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.absentDays}</div>
            <p className="text-xs text-muted-foreground font-medium">Requires approval</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="size-4" />
              <span className="text-sm font-medium">Late Arrivals</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.lateDays}</div>
            <p className="text-xs text-amber-500 font-medium">Warning threshold: 3</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-primary/5">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-primary mb-2">
              <CalendarDays className="size-4" />
              <span className="text-sm font-medium">Attendance Score</span>
            </div>
            <div className="text-3xl font-bold text-primary">{stats.attendancePercentage}%</div>
            <p className="text-xs text-primary/80 font-medium">Department Avg: {stats.departmentAverage}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle>Recent Attendance History</CardTitle>
              <CardDescription>Your log for the current month.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Time In</th>
                      <th className="px-4 py-3">Time Out</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {['Today', 'Yesterday', 'Oct 23, 2026', 'Oct 22, 2026', 'Oct 21, 2026'].map((date, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{isRetiree ? `Final Week Day ${5-i}` : date}</td>
                        <td className="px-4 py-3">{i === 1 && !isRetiree ? '--:--' : '07:54 AM'}</td>
                        <td className="px-4 py-3">{i === 1 && !isRetiree ? '--:--' : (i === 0 && !isRetiree ? 'Active' : '04:12 PM')}</td>
                        <td className="px-4 py-3">
                          {i === 1 && !isRetiree
                            ? <span className="px-2 py-1 bg-red-500/10 text-red-600 rounded text-xs font-bold uppercase">Absent</span>
                            : <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded text-xs font-bold uppercase">Present</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-indigo-500/30 bg-indigo-500/5 shadow-sm h-full">
            <CardHeader className="border-b border-indigo-500/10">
              <CardTitle className="text-indigo-700 flex items-center gap-2"><Sparkles className="size-5" /> AI Attendance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-indigo-900/80 leading-relaxed font-medium">
                {stats.aiSummary}
              </p>
              
              <div className="mt-6 pt-6 border-t border-indigo-500/10">
                <h4 className="text-xs font-bold uppercase text-indigo-700/60 mb-3 tracking-wider">{isRetiree ? "Retirement Status" : "Recommendations"}</h4>
                <ul className="space-y-2 text-sm text-indigo-900/80">
                  <li className="flex items-start gap-2">
                    <div className="size-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    {isRetiree ? "Attendance tracking is disabled for retired staff." : "Maintain current clock-in average of 07:45 AM."}
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="size-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    {isRetiree ? "No further action required." : "Ensure to log out properly to avoid \"Time Out\" tracking errors."}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
