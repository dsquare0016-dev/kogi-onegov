import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Download, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AIInsightPanel({
  title = "AI Executive Insight",
  summary,
  recommendations = [],
  dataSources = [],
  confidence = "High",
  lastUpdated = new Date().toISOString(),
}: {
  title?: string;
  summary: string;
  recommendations?: string[];
  dataSources?: string[];
  confidence?: "High" | "Medium" | "Low";
  lastUpdated?: string;
}) {
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24 text-primary" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary font-bold text-lg">
            <Sparkles className="size-5" /> {title}
          </CardTitle>
          <Badge variant={confidence === 'High' ? 'default' : confidence === 'Medium' ? 'secondary' : 'destructive'}>
            {confidence} Confidence
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground flex items-center gap-1">
          <ShieldAlert className="size-3" /> Data Sources: {dataSources.join(', ') || 'System Records'} • Updated: {new Date(lastUpdated).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        <div className="text-sm leading-relaxed text-foreground/90">
          {summary}
        </div>
        {recommendations.length > 0 && (
          <div className="bg-background/60 p-4 rounded-lg border border-border/50">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-foreground/80">
              <TrendingUp className="size-3" /> Recommended Actions
            </h4>
            <ul className="space-y-2 text-sm">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AIGenerateButton({ onClick, label = "Generate AI Insight", isLoading = false, className = "" }: { onClick?: () => void; label?: string; isLoading?: boolean; className?: string }) {
  return (
    <Button 
      onClick={onClick} 
      disabled={isLoading}
      className={`bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all gap-2 ${className}`}
    >
      <Sparkles className={`size-4 ${isLoading ? 'animate-pulse' : ''}`} />
      {isLoading ? 'Analyzing Data...' : label}
    </Button>
  );
}

export function AIDownloadMenu({ onDownload }: { onDownload: (format: 'pdf' | 'docx' | 'xlsx' | 'print') => void }) {
  // In a real implementation this would use a DropdownMenu component from shadcn/ui.
  // For now, we render a grouped button or simple list if dropdown isn't imported.
  return (
    <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-md shadow-sm">
      <Button variant="ghost" size="sm" onClick={() => onDownload('pdf')} className="text-xs h-7 px-2" title="Download PDF">
        <FileText className="size-3 mr-1 text-red-500" /> PDF
      </Button>
      <div className="w-px h-4 bg-border" />
      <Button variant="ghost" size="sm" onClick={() => onDownload('docx')} className="text-xs h-7 px-2" title="Download Word">
        <FileText className="size-3 mr-1 text-blue-500" /> DOCX
      </Button>
      <div className="w-px h-4 bg-border" />
      <Button variant="ghost" size="sm" onClick={() => onDownload('xlsx')} className="text-xs h-7 px-2" title="Export Excel">
        <BarChart3 className="size-3 mr-1 text-emerald-500" /> XLSX
      </Button>
      <div className="w-px h-4 bg-border" />
      <Button variant="ghost" size="sm" onClick={() => onDownload('print')} className="text-xs h-7 px-2" title="Print Report">
        <Download className="size-3 mr-1" /> Print
      </Button>
    </div>
  );
}
