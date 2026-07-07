import { Card } from "@/components/ui-bits";
import { AI_PERFORMANCE_LINES, AIPerformanceLine } from "@/lib/budget-data";
import { Sparkles, TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

export function BudgetAIEngine() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="size-5 text-indigo-500" />
        <h2 className="text-xl font-semibold tracking-tight">AI Budget Performance & Outcomes Engine</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {AI_PERFORMANCE_LINES.map((line, idx) => (
          <AIPerformanceCard key={idx} data={line} />
        ))}
      </div>
    </div>
  );
}

function AIPerformanceCard({ data }: { data: AIPerformanceLine }) {
  const statusColors = {
    "Overperforming": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "On Track": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Underperforming": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Critical": "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const StatusIcon = {
    "Overperforming": TrendingUp,
    "On Track": CheckCircle2,
    "Underperforming": TrendingDown,
    "Critical": AlertCircle,
  }[data.status];

  return (
    <Card className="flex flex-col border border-border/50 shadow-sm relative overflow-hidden group hover:border-border transition-colors">
      <div className="p-5 border-b border-border/50 bg-muted/20">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {data.department}
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {data.budgetLine}
            </h3>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${statusColors[data.status]}`}>
            <StatusIcon className="size-3.5" />
            {data.status}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Approved Budget</div>
            <div className="font-semibold">₦{(data.approvedBudget / 1000000000).toFixed(2)}B</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Amount Released</div>
            <div className="font-semibold text-blue-600">₦{(data.amountReleased / 1000000).toFixed(0)}M</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Amount Spent</div>
            <div className="font-semibold text-amber-600">₦{(data.amountSpent / 1000000).toFixed(0)}M</div>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 bg-background">
        <div className="grid grid-cols-2 gap-6 mb-5">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Expected Outcome</div>
            <div className="text-sm font-medium">{data.expectedOutcome}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Actual Outcome</div>
            <div className="text-sm font-medium">{data.actualOutcome}</div>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-xs">
            <span className="font-medium">Completion Score</span>
            <span className="font-bold">{data.completionPercent}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${data.completionPercent >= 80 ? 'bg-emerald-500' : data.completionPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${data.completionPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Variance: {data.variance}</span>
            <span>{data.projectsCompleted} / {data.projectsCreated} Projects</span>
          </div>
        </div>

        <div className="bg-indigo-50/50 border border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2.5">
            <Sparkles className="size-4 text-indigo-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-0.5">AI Recommendation</div>
              <div className="text-sm text-indigo-900/80 dark:text-indigo-200 leading-relaxed">
                {data.aiRecommendation}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
