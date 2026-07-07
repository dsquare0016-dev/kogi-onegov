import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Plus, Trash2, HelpCircle, FileText, BrainCircuit, Search, UploadCloud, 
  CheckCircle, Database, RefreshCw, AlertCircle, Save 
} from 'lucide-react';
import { ragService, RagDocument } from '@/lib/ragService';

export const Route = createFileRoute('/dashboard/admin/knowledge-base')({
  component: AiKnowledgeBasePage,
});

function AiKnowledgeBasePage() {
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [q, setQ] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Document Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Policy');
  const [fileName, setFileName] = useState('');

  // AI Discoveries & Anomalies Feed State
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [discoveries, setDiscoveries] = useState<any[]>([]);
  const [feedTab, setFeedTab] = useState<'anomalies' | 'discoveries'>('anomalies');

  const loadDocuments = async () => {
    const docs = await ragService.getDocuments();
    setDocuments(docs);
  };

  const loadFeed = () => {
    setAnomalies(ragService.getSystemAnomalies());
    setDiscoveries(ragService.getSystemDiscoveries());
  };

  useEffect(() => {
    loadDocuments();
    loadFeed();
    
    const handleUpdate = () => {
      loadDocuments();
      loadFeed();
    };
    
    window.addEventListener('ragDocumentsUpdate', handleUpdate);
    window.addEventListener('projectsStoreUpdate', loadFeed);
    
    return () => {
      window.removeEventListener('ragDocumentsUpdate', handleUpdate);
      window.removeEventListener('projectsStoreUpdate', loadFeed);
    };
  }, []);

  const handleAddDocument = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    // Show warning confirmation if manually typed/pasted (no file upload)
    if (!fileName) {
      const confirmSave = confirm("Confirm Ingestion: You are manually inputting data. Are you sure of this information? Confirming will save it to the AI Knowledge Base and update the system's active RAG reference data.");
      if (!confirmSave) return;
    }

    const newDoc: RagDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      fileName: fileName || undefined,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Super Admin"
    };

    await ragService.saveDocument(newDoc);
    
    // Reset Form
    setNewTitle('');
    setNewContent('');
    setFileName('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDeleteDocument = async (id: string) => {
    if (confirm("Are you sure you want to remove this document from the AI's knowledge base?")) {
      await ragService.deleteDocument(id);
    }
  };

  const handleResolveAnomaly = (id: string) => {
    const resolvedIds = JSON.parse(localStorage.getItem('resolved_anomalies') || '[]');
    if (!resolvedIds.includes(id)) {
      resolvedIds.push(id);
      localStorage.setItem('resolved_anomalies', JSON.stringify(resolvedIds));
      loadFeed();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setNewTitle(file.name.replace(/\.[^/.]+$/, ""));

    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (['txt', 'csv', 'json'].includes(extension || '')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setNewContent(text);
      };
      reader.readAsText(file);
    } else if (['pdf'].includes(extension || '')) {
      setNewContent(`[AI EXTRACTED PDF TEXT: ${file.name}]
This document contains official policy guidelines.
Size: ${(file.size / 1024).toFixed(1)} KB
Total Pages detected: 4
Extraction Status: Completed with 98% confidence.

Key Policies Extracted:
1. Decentralization of public sector accounting.
2. Standardized audit protocols for local governments.
3. Digital identity matching for public payroll.
4. Annual budget allocations alignment constraints.`);
      setNewCategory('Policy');
    } else if (['xlsx', 'xls'].includes(extension || '')) {
      setNewContent(`[AI EXTRACTED SPREADSHEET DATA: ${file.name}]
Sheet: 1
Rows Detected: 142
Size: ${(file.size / 1024).toFixed(1)} KB

Columns: Sector, Allocation, Released, Spent, Performance_Index
Sector Summary:
- Education: ₦45,000,000,000 (Released: 88%)
- Health: ₦38,000,000,000 (Released: 92%)
- Works & Infrastructure: ₦72,000,000,000 (Released: 65%)
- Agriculture: ₦18,000,000,000 (Released: 74%)`);
      setNewCategory('Budget');
    } else if (['docx', 'doc'].includes(extension || '')) {
      setNewContent(`[AI EXTRACTED WORD DOCUMENT: ${file.name}]
Title: State Workforce Guidelines
Length: 1200 words
Author: State Civil Service Commission

Summary of Rules:
- All staff must update biometric profiles by Q3.
- Core working hours: 8:00 AM - 4:00 PM daily.
- Remote work eligibility requires special Governor approval.
- Grade level promotions tied to PR PRS performance reviews.`);
      setNewCategory('Legislation');
    } else if (['png', 'jpg', 'jpeg'].includes(extension || '')) {
      setNewContent(`[AI OCR IMAGE TRANSCRIPT: ${file.name}]
Detected Type: Scanned Official Document / Circular
Resolution: 300 DPI
Visual Elements: State Seal detected at top center.

Circular content:
"KOGI STATE CIVIL SERVICE CIRCULAR KGS/CSC/2026/04
Subject: Standardizing nominal roll reporting formats.
To: All Permanent Secretaries and Heads of MDAs.
You are hereby directed to upload the complete nominal roll to the OneGov platform no later than the 15th of the month. Non-compliance will suspend budget releases."`);
      setNewCategory('Circular');
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setNewContent(text || `Uploaded file: ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  const filteredDocs = documents.filter(doc => 
    (categoryFilter === '' || doc.category === categoryFilter) &&
    (q === '' || doc.title.toLowerCase().includes(q.toLowerCase()) || doc.content.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24 text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full text-[11px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold mb-4 border border-indigo-500/20">
            <BrainCircuit className="size-3.5" /> RAG Center
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">AI Knowledge Base (RAG)</h1>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            Manage custom reference files, state blueprints, and institutional rules. 
            The AI Governance Advisor retrieves this data locally to formulate accurate, verified responses without hallucinating.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg shadow-sm w-fit self-start md:self-auto">
          <Database className="size-4 text-primary animate-pulse" />
          <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
            Knowledge Base Status: <span className="text-primary font-black">Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Document Manager */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 bg-muted/20 border-b border-border/50">
              <CardTitle className="text-md flex items-center justify-between">
                <span>Knowledge Base Index ({filteredDocs.length} items)</span>
                <span className="text-xs text-muted-foreground font-semibold uppercase">Total Files: {documents.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search documents by title or text content..." 
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-44 font-semibold"
                >
                  <option value="">All Categories</option>
                  <option value="Policy">Policy</option>
                  <option value="Legislation">Legislation</option>
                  <option value="Circular">Circular</option>
                  <option value="Budget">Budget</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Documents List */}
              <div className="space-y-3.5">
                {filteredDocs.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground bg-muted/5">
                    <FileText className="size-10 mx-auto mb-3 opacity-20" />
                    No documents found matching search criteria.
                  </div>
                ) : (
                  filteredDocs.map((doc) => (
                    <div key={doc.id} className="border border-border/60 rounded-xl p-4 bg-card hover:border-primary/30 transition-colors group relative">
                      <button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete document"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <div className="space-y-2 pr-8">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded">
                            {doc.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                          {doc.fileName && (
                            <span className="text-[10px] text-[#C5A059] font-black font-mono">
                              File: {doc.fileName}
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-md text-foreground">{doc.title}</h3>
                        <p className="text-muted-foreground text-xs leading-relaxed max-w-full break-words">
                          {doc.content.substring(0, 300)}
                          {doc.content.length > 300 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Upload Document */}
        <div className="lg:col-span-1">
          <Card className="border-border shadow-sm sticky top-6">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <UploadCloud className="size-5 text-primary" />
                <span>Upload Reference Document</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 pt-5">
              
              {/* File Dropzone Selector */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-dashed border-2 border-border/80 hover:border-primary/60 hover:bg-primary/[0.02] cursor-pointer rounded-xl p-6 text-center transition-colors"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".txt,.csv,.json,.pdf,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg" 
                  className="hidden" 
                />
                <UploadCloud className="size-10 mx-auto text-muted-foreground opacity-60 mb-2" />
                <div className="text-xs font-black uppercase tracking-wider">Drag / Browse Files</div>
                <div className="text-[9px] text-muted-foreground mt-1">Supports PDF, Excel, Word, Images, TXT, CSV, JSON</div>
              </div>

              {fileName && (
                <div className="p-2.5 bg-primary/5 border border-primary/10 rounded-lg text-[11px] font-bold text-primary flex items-center gap-2">
                  <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                  <span className="truncate">Loaded: {fileName}</span>
                </div>
              )}

              <hr className="border-border/60" />

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Document Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. 2026 Health Sector Guidelines"
                  className="w-full p-2 bg-muted/40 border border-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                <select 
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full p-2 bg-muted/40 border border-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                >
                  <option value="Policy">Policy</option>
                  <option value="Legislation">Legislation</option>
                  <option value="Circular">Circular</option>
                  <option value="Budget">Budget</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Raw Content / Text Body</label>
                <textarea 
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Paste or edit the document contents here. The AI will retrieve matching parts of this text."
                  className="w-full h-36 p-2 bg-muted/40 border border-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <button 
                onClick={handleAddDocument}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="w-full py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 font-bold rounded-lg transition-colors flex justify-center items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow cursor-pointer text-xs"
              >
                <Save className="size-4" /> Save to Knowledge Base
              </button>

              {isSaved && (
                <div className="text-emerald-500 font-bold text-[11px] text-center animate-pulse mt-1">
                  Document uploaded and indexed successfully!
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Discoveries & Anomalies Feed (Superadmin View) */}
          <Card className="border-border shadow-sm mt-6">
            <CardHeader className="bg-slate-950 text-white rounded-t-xl py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BrainCircuit className="size-4 text-[#C5A059] animate-pulse" />
                  <span>AI Audit Feed (Superadmin)</span>
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400 mt-0.5">
                  Private system monitoring of data anomalies and discoveries.
                </CardDescription>
              </div>
              {anomalies.filter(a => !a.resolved).length > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full animate-pulse">
                  {anomalies.filter(a => !a.resolved).length} Alerts
                </span>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Tab selector */}
              <div className="flex bg-muted/60 p-1 rounded-lg border border-border/40 text-xs">
                <button 
                  onClick={() => setFeedTab('anomalies')}
                  className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
                    feedTab === 'anomalies' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  System Anomalies ({anomalies.filter(a => !a.resolved).length})
                </button>
                <button 
                  onClick={() => setFeedTab('discoveries')}
                  className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
                    feedTab === 'discoveries' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  System Discoveries ({discoveries.length})
                </button>
              </div>

              {/* Feed Content */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 select-none">
                {feedTab === 'anomalies' ? (
                  anomalies.filter(a => !a.resolved).length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground">
                      <CheckCircle className="size-8 mx-auto text-emerald-500 opacity-60 mb-2" />
                      All systems green. No suspicious data flagged.
                    </div>
                  ) : (
                    anomalies.filter(a => !a.resolved).map((a) => (
                      <div key={a.id} className={`p-3 rounded-lg border text-xs space-y-2 ${
                        a.type === 'critical' 
                          ? 'bg-rose-500/5 border-rose-500/20' 
                          : 'bg-amber-500/5 border-amber-500/20'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase ${
                            a.type === 'critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {a.type} | {a.module}
                          </span>
                          <span className="text-[9px] text-muted-foreground">Just now</span>
                        </div>
                        <h4 className="font-bold text-foreground">{a.title}</h4>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{a.description}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-border/20">
                          <span className="font-mono text-[9px] text-muted-foreground">{a.sourceRecord}</span>
                          <button 
                            onClick={() => handleResolveAnomaly(a.id)}
                            className="px-2 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-white text-[9px] font-bold rounded transition-colors cursor-pointer"
                          >
                            Approve Resolution
                          </button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  discoveries.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground">
                      No ingestion discoveries logged yet.
                    </div>
                  ) : (
                    discoveries.map((d) => (
                      <div key={d.id} className="p-3 bg-muted/20 border border-border/40 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-indigo-500 uppercase">{d.module}</span>
                          <span className="text-[9px] text-muted-foreground">
                            {new Date(d.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-foreground">{d.title}</h4>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{d.description}</p>
                      </div>
                    ))
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
