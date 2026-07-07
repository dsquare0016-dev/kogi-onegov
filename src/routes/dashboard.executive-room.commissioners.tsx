import { createFileRoute } from "@tanstack/react-router";
import { Users, ShieldAlert, Award, TrendingUp, TrendingDown, AlertTriangle, ArrowRight } from "lucide-react";
import { COMMISSIONERS } from "@/lib/governance-data";

export const Route = createFileRoute("/dashboard/executive-room/commissioners")({
  component: CommissionerRankingsPage,
});

function CommissionerRankingsPage() {
  const mappedCommissioners = COMMISSIONERS.map(c => ({
    ...c,
    performanceScore: c.score,
    avatar: "/avatars/placeholder.png"
  }));
  const sortedCommissioners = mappedCommissioners.sort((a, b) => b.performanceScore - a.performanceScore);
  const topPerformers = sortedCommissioners.slice(0, 3);
  const bottomPerformers = sortedCommissioners.filter(c => c.performanceScore < 75);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-1">
            <Users className="size-4" />
            Executive Room
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Commissioner Rankings</h1>
          <p className="text-muted-foreground mt-1">
            Real-time performance evaluation of State Executive Council members based on KPI delivery and budget execution.
          </p>
        </div>
      </div>

      {/* Podium - Top 3 Performers */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-emerald-600">
          <Award className="size-5" /> High Performers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Rank 2 */}
          <div className="order-2 md:order-1 transform md:translate-y-4">
            <PodiumCard commissioner={topPerformers[1]} rank={2} color="bg-zinc-300" />
          </div>
          {/* Rank 1 */}
          <div className="order-1 md:order-2">
            <PodiumCard commissioner={topPerformers[0]} rank={1} color="bg-[#CBA344]" isGold />
          </div>
          {/* Rank 3 */}
          <div className="order-3">
            <PodiumCard commissioner={topPerformers[2]} rank={3} color="bg-amber-700" />
          </div>
        </div>
      </div>

      {/* Critical Escalations */}
      {bottomPerformers.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-destructive">
            <ShieldAlert className="size-5" /> Executive Escalations (Underperforming)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bottomPerformers.map(c => (
              <div key={c.name} className="bg-background border border-destructive/20 rounded-xl p-4 flex gap-4 items-center">
                <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center font-bold text-destructive">
                  {c.performanceScore}%
                </div>
                <div>
                  <div className="font-bold">{c.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{c.ministry}</div>
                  <div className="text-xs font-semibold text-destructive mt-1 flex items-center gap-1">
                    <TrendingDown className="size-3" /> Requires Intervention
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div>
        <h2 className="text-lg font-bold mb-4 uppercase tracking-widest">Full EXCO Leaderboard</h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-widest">Rank</th>
                  <th className="px-6 py-4 font-bold tracking-widest">Commissioner</th>
                  <th className="px-6 py-4 font-bold tracking-widest">Ministry</th>
                  <th className="px-6 py-4 font-bold tracking-widest">Score</th>
                  <th className="px-6 py-4 font-bold tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedCommissioners.map((c, idx) => (
                  <tr key={c.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-black text-muted-foreground">#{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={c.avatar} alt={c.name} className="size-8 rounded-full object-cover border border-border" />
                        <span className="font-bold">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{c.ministry}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold ${
                        c.performanceScore >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                        c.performanceScore >= 70 ? 'bg-amber-500/10 text-amber-600' :
                        'bg-rose-500/10 text-rose-600'
                      }`}>
                        {c.performanceScore}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-muted rounded-md text-primary transition-colors">
                        <ArrowRight className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ commissioner, rank, color, isGold = false }: { commissioner: any, rank: number, color: string, isGold?: boolean }) {
  if (!commissioner) return null;
  return (
    <div className={`bg-card border ${isGold ? 'border-[#CBA344] shadow-[0_0_30px_rgba(203,163,68,0.15)]' : 'border-border'} rounded-2xl p-6 relative overflow-hidden flex flex-col items-center text-center transition-transform hover:-translate-y-1`}>
      <div className={`absolute top-0 left-0 w-full h-1.5 ${color}`} />
      
      <div className="relative mb-4">
        <img src={commissioner.avatar} alt={commissioner.name} className={`size-24 rounded-full object-cover border-4 ${isGold ? 'border-[#CBA344]' : 'border-background'} shadow-xl`} />
        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 size-8 rounded-full ${color} text-white flex items-center justify-center font-black shadow-lg border-2 border-background`}>
          {rank}
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-foreground leading-tight">{commissioner.name}</h3>
      <p className="text-xs text-muted-foreground mt-1 mb-4 line-clamp-1">{commissioner.ministry}</p>
      
      <div className="w-full bg-muted/50 rounded-xl p-3 border border-border flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Score</span>
        <span className={`text-xl font-black ${isGold ? 'text-[#CBA344]' : 'text-foreground'}`}>{commissioner.performanceScore}%</span>
      </div>
    </div>
  );
}
