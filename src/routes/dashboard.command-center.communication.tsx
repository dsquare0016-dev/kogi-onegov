import { createFileRoute } from '@tanstack/react-router';
import { useAlertStore } from '@/lib/alert-store';
import { RadioTower, MessageSquare, Megaphone, Eye, Users, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const Route = createFileRoute('/dashboard/command-center/communication')({
  component: CommunicationMonitoringPage,
});

function CommunicationMonitoringPage() {
  const { alerts } = useAlertStore();
  const publishedAlerts = alerts.filter(a => a.status === 'Published');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-1">
            <RadioTower className="size-4" />
            DG GDU Command Center
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Communication Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Track engagement and reach of statewide executive memos and broadcast alerts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Active Broadcasts</p>
                <h3 className="text-4xl font-black text-primary">{publishedAlerts.length}</h3>
              </div>
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Megaphone className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Reach</p>
                <h3 className="text-4xl font-black text-emerald-600">4,281</h3>
              </div>
              <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Users className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Avg. Read Rate</p>
                <h3 className="text-4xl font-black text-blue-600">89%</h3>
              </div>
              <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Eye className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
          <MessageSquare className="size-5" /> Recent Global Broadcasts
        </h2>
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden divide-y divide-border">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
               <AlertCircle className="size-10 mb-2 opacity-20" />
               <p>No broadcasts found in the system.</p>
            </div>
          ) : (
            alerts.map(a => (
              <div key={a.id} className="p-6 hover:bg-muted/30 transition-colors flex flex-col md:flex-row gap-6 md:items-center">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${a.status === 'Published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                       {a.status}
                     </span>
                     <span className="px-2 py-1 bg-muted rounded text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                       {a.severity}
                     </span>
                   </div>
                   <h3 className="text-lg font-bold text-foreground mb-1">{a.title}</h3>
                   <p className="text-sm text-muted-foreground line-clamp-2">{a.message}</p>
                </div>
                <div className="shrink-0 flex items-center gap-6">
                   <div className="text-center">
                      <div className="text-xl font-black text-foreground">92%</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Delivery</div>
                   </div>
                   <div className="text-center">
                      <div className="text-xl font-black text-emerald-600">84%</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Read</div>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
