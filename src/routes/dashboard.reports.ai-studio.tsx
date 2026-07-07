import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, FileText, Download, CheckCircle2, SlidersHorizontal, BarChart3, Presentation, Briefcase, FileSignature, Layers } from 'lucide-react';
import { useState } from 'react';
import { AIInsightPanel, AIGenerateButton, AIDownloadMenu } from '@/components/ai-components';
import { generateReportDocument } from '@/lib/ai-export-server';
import { getDashboardSummary } from '@/lib/ai-server';
import { logAiAction } from '@/lib/ai-audit';

export const Route = createFileRoute('/dashboard/reports/ai-studio')({
  component: AIReportStudioComponent,
});

function AIReportStudioComponent() {
  const [reportType, setReportType] = useState('Executive Performance Report');
  const [mda, setMda] = useState('State-Wide');
  const [dateRange, setDateRange] = useState('Current Quarter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  const reportTypes = [
    'Executive Performance Report',
    'Budget Performance Report',
    'MDA Performance Report',
    'Project Status Report',
    'Attendance Report',
    'Development Plan Alignment Report',
    'Draft Memo',
    'Draft Circular',
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Connect to backend server function
      const data = await getDashboardSummary({ data: { userRole: 'Admin', mdaId: mda } });
      
      // Log audit
      await logAiAction({ data: { userId: 'USER-1', role: 'Admin', prompt: `Generate ${reportType} for ${mda}`, moduleUsed: 'Report Studio', dataAccessed: 'Dashboard Data', status: 'success' } });
      
      setGeneratedResult({
        title: `${mda} - ${reportType}`,
        summary: data.summary,
        recommendations: data.recommendations,
        dataSources: ['Backend Server API', 'Mock DB'],
        confidence: 'High',
      });
    } catch (e) {
      console.error(e);
      await logAiAction({ data: { userId: 'USER-1', role: 'Admin', prompt: `Generate ${reportType} for ${mda}`, moduleUsed: 'Report Studio', dataAccessed: 'Dashboard Data', status: 'failure' } });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (format: string) => {
    if (format === 'print') {
       window.print();
       return;
    }
    
    try {
      const typedFormat = format as 'pdf' | 'docx' | 'xlsx';
      const result = await generateReportDocument({ data: { format: typedFormat, type: reportType } });
      
      if (result) {
        // Trigger base64 download
        const mimeType = format === 'pdf' ? 'application/pdf' : format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const link = document.createElement('a');
        link.href = `data:${mimeType};base64,${result.fileData}`;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      await logAiAction({ data: { userId: 'USER-1', role: 'Admin', prompt: `Download ${reportType} in ${format}`, moduleUsed: 'Report Studio', dataAccessed: 'Report Export', status: 'success' } });
    } catch (e) {
      console.error(e);
      await logAiAction({ data: { userId: 'USER-1', role: 'Admin', prompt: `Download ${reportType} in ${format}`, moduleUsed: 'Report Studio', dataAccessed: 'Report Export', status: 'failure' } });
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="size-8 text-primary" /> AI Intelligence Report Studio
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Generate comprehensive, data-driven reports, executive briefs, and memos using the statewide intelligence database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Parameter Selection */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="size-5 text-primary" /> Report Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Report Type</label>
                <select 
                  className="w-full p-2.5 bg-muted/50 border border-border rounded-md text-sm focus:ring-1 focus:ring-primary"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  {reportTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Target MDA / Department</label>
                <select 
                  className="w-full p-2.5 bg-muted/50 border border-border rounded-md text-sm focus:ring-1 focus:ring-primary"
                  value={mda}
                  onChange={(e) => setMda(e.target.value)}
                >
                  <option value="State-Wide">State-Wide (All MDAs)</option>
                  <option value="Ministry of Works">Ministry of Works</option>
                  <option value="Ministry of Health">Ministry of Health</option>
                  <option value="Ministry of Education">Ministry of Education</option>
                  <option value="Office of the Governor">Office of the Governor</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Date Range</label>
                <select 
                  className="w-full p-2.5 bg-muted/50 border border-border rounded-md text-sm focus:ring-1 focus:ring-primary"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="Current Month">Current Month</option>
                  <option value="Current Quarter">Current Quarter</option>
                  <option value="Year to Date">Year to Date (YTD)</option>
                  <option value="Last Year">Last Year (Annual)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-border/50 mt-6">
                <h4 className="text-sm font-semibold mb-3">Customization & Formatting</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                    Include AI Recommendations
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                    Include Data Charts (Bar/Pie)
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                    Official Letterhead Header
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                    Add Signature Block
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <AIGenerateButton 
                  onClick={handleGenerate} 
                  isLoading={isGenerating} 
                  label="Generate Full Report" 
                  className="w-full h-11 text-base"
                />
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Col: Output / Preview */}
        <div className="lg:col-span-2 space-y-6">
          {!generatedResult && !isGenerating && (
            <Card className="border-dashed border-2 border-border/60 bg-muted/20 h-[500px] flex items-center justify-center">
              <div className="text-center space-y-4 max-w-sm px-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <FileSignature className="size-8" />
                </div>
                <h3 className="text-lg font-bold">Ready to Generate</h3>
                <p className="text-sm text-muted-foreground">
                  Select your parameters on the left and click generate to invoke the AI Intelligence system. The system will compile data across all authorized modules.
                </p>
              </div>
            </Card>
          )}

          {isGenerating && (
            <Card className="border-border/60 h-[500px] flex flex-col items-center justify-center space-y-6">
              <Sparkles className="size-12 text-primary animate-ping" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold animate-pulse">Analyzing State Records...</h3>
                <p className="text-sm text-muted-foreground">Gathering data from Budget, Projects, and Dev Plan modules.</p>
              </div>
            </Card>
          )}

          {generatedResult && !isGenerating && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold">Generated Output Preview</h2>
                <AIDownloadMenu onDownload={handleDownload} />
              </div>

              <AIInsightPanel 
                title={generatedResult.title}
                summary={generatedResult.summary}
                recommendations={generatedResult.recommendations}
                dataSources={generatedResult.dataSources}
                confidence={generatedResult.confidence}
              />

              <Card className="border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Document Preview Structure</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-8 opacity-80 pointer-events-none select-none">
                    {/* Simulated Document Preview */}
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-4"></div>
                      <h1 className="text-2xl font-black uppercase font-serif tracking-widest">KOGI STATE GOVERNMENT</h1>
                      <h2 className="text-lg font-bold text-muted-foreground uppercase">{reportType}</h2>
                      <p className="text-xs text-muted-foreground font-mono">DATE: {new Date().toLocaleDateString()} | MDA: {mda.toUpperCase()}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-4/5"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                         <BarChart3 className="size-8 text-muted-foreground/30" />
                       </div>
                       <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                         <Presentation className="size-8 text-muted-foreground/30" />
                       </div>
                    </div>

                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
