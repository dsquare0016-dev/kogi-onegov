import { X, Server, Database, Activity, Map as MapIcon, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, BarChart, Bar } from 'recharts';

export interface CardDetailProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string | number;
  dataSource: string;
  status: 'connected' | 'mock' | 'not_connected' | 'error';
  lastUpdated: string;
  moduleRoute: string;
  chartData?: any[];
  breakdown?: { label: string; value: string | number }[];
}

export function CardDetailModal({ 
  isOpen, 
  onClose, 
  title, 
  value, 
  dataSource, 
  status, 
  lastUpdated, 
  moduleRoute,
  chartData,
  breakdown 
}: CardDetailProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-background rounded-xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{title}</h2>
              <div className="text-xs text-muted-foreground">Detailed Metric Breakdown</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Value</div>
              <div className="text-4xl font-black text-foreground">{value}</div>
            </div>
            <div className="text-right">
               <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</div>
               {status === 'connected' && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Live Connected</Badge>}
               {status === 'mock' && <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Using Mock Data</Badge>}
               {status === 'not_connected' && <Badge className="bg-slate-100 text-slate-600 border-slate-200">Not Connected</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-muted/40 border border-border/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Database className="size-3" /> Data Source</div>
              <div className="font-semibold text-sm">{dataSource}</div>
            </div>
            <div className="bg-muted/40 border border-border/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Server className="size-3" /> Last Synced</div>
              <div className="font-semibold text-sm">{lastUpdated}</div>
            </div>
            <div className="bg-muted/40 border border-border/50 rounded-lg p-3 col-span-2 md:col-span-1">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapIcon className="size-3" /> Linked Module</div>
              <a href={moduleRoute} className="font-semibold text-sm text-primary hover:underline block truncate">{moduleRoute}</a>
            </div>
          </div>

          {chartData && (
             <div>
               <h3 className="text-sm font-bold mb-3 border-b border-border/50 pb-2">30-Day Trend</h3>
               <div className="h-[200px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="var(--primary)" fillOpacity={1} fill="url(#colorTrend)" />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
             </div>
          )}

          {breakdown && (
            <div>
               <h3 className="text-sm font-bold mb-3 border-b border-border/50 pb-2 flex items-center gap-2"><Users className="size-4" /> Breakdown</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {breakdown.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between p-2.5 bg-muted/20 border border-border/40 rounded text-sm">
                     <span className="text-muted-foreground">{item.label}</span>
                     <span className="font-bold">{item.value}</span>
                   </div>
                 ))}
               </div>
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
            Close
          </button>
          <a href={moduleRoute} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            Open Module
          </a>
        </div>
      </div>
    </div>
  );
}
