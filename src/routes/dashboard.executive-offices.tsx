import { getOrganizationsList } from '@/lib/postgres-service';
import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Plus, Shield, Landmark, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/dashboard/executive-offices')({
  component: ExecutiveOfficesPage,
});

function ExecutiveOfficesPage() {
  const location = useLocation();
  const [offices, setOffices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOffices = async () => {
    setLoading(true);
    
    const data = await getOrganizationsList();
    // Filter to executive offices
    const filtered = data.filter((o: any) => o.type === 'executive_office');
    setOffices(filtered);
    setLoading(false);
  };

  useEffect(() => {
    loadOffices();
  }, []);

  if (location.pathname !== '/dashboard/executive-offices') {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading Executive Offices...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6 pb-24 text-foreground animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/10 rounded-full text-[11px] uppercase tracking-widest text-[#C5A059] font-bold mb-3 border border-[#C5A059]/20">
            <Landmark className="size-3.5" /> Cabinet & Administration
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">Executive Offices</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Directory of executive offices, cabinet administrators, and direct reports to His Excellency.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/executive-offices/$action" params={{ action: 'create' }} className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm">
            <Plus className="size-4" /> Create Office
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {offices.map(o => (
          <Card key={o.id} className="border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="p-4 border-b border-border/30">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="size-10 rounded bg-[#C5A059]/10 flex items-center justify-center shrink-0">
                    <Landmark className="size-5 text-[#C5A059]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm leading-tight line-clamp-1">{o.name}</h2>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">
                      {o.shortName || o.code}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-1">
                <div className="text-muted-foreground">Office Holder:</div>
                <div className="font-bold text-foreground">{o.headName || 'Awaiting Appointment'}</div>
              </div>
              <div className="pt-2 border-t border-border/50 flex justify-end gap-2">
                <Link to="/dashboard/executive-offices/$action" params={{ action: 'edit' }} className="px-3 py-1 bg-muted hover:bg-muted/80 rounded font-semibold text-[11px] transition-colors">
                  Configure Office
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
