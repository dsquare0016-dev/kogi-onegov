import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/staff/political')({
  component: PoliticalAppointees,
});

function PoliticalAppointees() {
  const [appointees] = useState([
    { id: 'POL-01', name: 'Alhaji Musa Usman', role: 'Hon. Commissioner', mda: 'Ministry of Works', date: '2024-02-14' },
    { id: 'POL-02', name: 'Dr. Sarah Ibrahim', role: 'Special Adviser', mda: 'Office of the Governor', date: '2024-01-10' },
  ]);

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Political Appointees Registry</h1>
          <p className="text-muted-foreground mt-1">Management of Commissioners, Special Advisers, and Assistants (Bypasses Nominal Roll).</p>
        </div>
        <Link to="/dashboard/admin/users/create" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm">
          <Plus className="size-4" /> Add Appointee
        </Link>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
          <div className="flex justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="size-5 text-indigo-500" /> Active Appointments</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-1.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground uppercase text-xs font-bold border-b border-border/60">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Political Office</th>
                  <th className="px-4 py-3">Attached MDA</th>
                  <th className="px-4 py-3">Date Appointed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {appointees.map((c, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">{c.id}</td>
                    <td className="px-4 py-3 font-bold text-foreground">{c.name}</td>
                    <td className="px-4 py-3 font-semibold text-muted-foreground">{c.role}</td>
                    <td className="px-4 py-3">{c.mda}</td>
                    <td className="px-4 py-3">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
