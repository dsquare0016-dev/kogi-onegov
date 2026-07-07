import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/staff/adhoc')({
  component: AdhocStaffRegistry,
});

function AdhocStaffRegistry() {
  const [adhoc] = useState([
    { id: 'ADH-2026-91', name: 'Faith Ojo', role: 'Contract Surveyor', mda: 'Ministry of Lands', duration: '6 Months', date: 'Oct 15, 2026' },
  ]);

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adhoc & Contract Staff Registry</h1>
          <p className="text-muted-foreground mt-1">Management of temporary, contract, and adhoc staff (Bypasses Nominal Roll).</p>
        </div>
        <Link to="/dashboard/admin/users/create" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm">
          <Plus className="size-4" /> Add Adhoc Staff
        </Link>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
          <div className="flex justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2"><Users className="size-5 text-amber-500" /> Active Contracts</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-1.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-amber-500" />
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
                  <th className="px-4 py-3">Contract Role</th>
                  <th className="px-4 py-3">Attached MDA</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Start Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {adhoc.map((c, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-amber-600">{c.id}</td>
                    <td className="px-4 py-3 font-bold text-foreground">{c.name}</td>
                    <td className="px-4 py-3 font-semibold text-muted-foreground">{c.role}</td>
                    <td className="px-4 py-3">{c.mda}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-700 rounded text-[10px] font-bold uppercase">{c.duration}</span>
                    </td>
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
