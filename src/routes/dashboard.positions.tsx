import { getPositionsList } from '@/lib/postgres-service';
import { createFileRoute, Outlet, useLocation, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Search, Plus, User, Award, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/dashboard/positions')({
  component: PositionsPage,
});

function PositionsPage() {
  const location = useLocation();
  const [q, setQ] = useState("");
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPositions = async () => {
    setLoading(true);
    
    const data = await getPositionsList();
    setPositions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPositions();
  }, []);

  if (location.pathname !== '/dashboard/positions') {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center gap-2 text-foreground">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading Positions...</p>
      </div>
    );
  }

  const filtered = positions.filter(p => 
    p.office_name.toLowerCase().includes(q.toLowerCase()) ||
    p.official_title.toLowerCase().includes(q.toLowerCase()) ||
    (p.organization_name && p.organization_name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6 pb-24 text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full text-[11px] uppercase tracking-widest text-amber-500 font-bold mb-3 border border-amber-500/20">
            <Briefcase className="size-3.5" /> Position Management
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">State Positions registry</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Audit, assign, and manage official state executive titles, office occupants, access controls, and vacancy rates.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/positions/$action" params={{ action: 'create' }} className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm">
            <Plus className="size-4" /> Create Position
          </Link>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search positions, titles, departments..." 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => {
          const isVacant = p.vacancy_status === 'vacant';
          return (
            <Card key={p.id} className="border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="p-4 border-b border-border/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-foreground leading-tight mb-1">{p.office_name}</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {p.official_title}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                    isVacant ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {p.vacancy_status}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-bold">Organization:</span> <span className="text-foreground">{p.organization_name || 'Independent/Direct Report'}</span>
                  </div>
                  <div>
                    <span className="font-bold">Dashboard level:</span> <span className="text-foreground">{p.dashboard || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="font-bold">Access level:</span> <span className="text-foreground uppercase">{p.access_level || 'staff'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <h4 className="text-xs font-bold uppercase text-primary mb-2">Current Occupant</h4>
                  {isVacant ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                      <AlertCircle className="size-4 text-amber-500 shrink-0" />
                      Position is currently vacant
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                        {p.occupant_avatar ? (
                          <img src={p.occupant_avatar} alt={p.occupant_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="size-4 text-primary" />
                        )}
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-foreground">{p.occupant_name}</div>
                        <div className="text-muted-foreground text-[10px]">{p.occupant_email}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-2 text-xs">
                  <Link 
                    to="/dashboard/positions/$action" 
                    params={{ action: 'edit' }}
                    className="px-3 py-1.5 border border-border rounded hover:bg-muted font-semibold transition-colors"
                  >
                    Edit Position
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
