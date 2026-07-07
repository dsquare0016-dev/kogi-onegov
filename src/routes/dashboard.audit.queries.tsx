import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ShieldAlert, MessageSquare, Paperclip, Clock, Filter, FileText, Plus, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchAuditQueries, createAuditQuery, resolveAuditQuery } from '@/lib/finance-audit-services';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

export const Route = createFileRoute('/dashboard/audit/queries')({
  component: AuditQueriesComponent,
})

function AuditQueriesComponent() {
  const [queries, setQueries] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeQuery, setActiveQuery] = useState<any>(null);
  
  // Dialog state
  const [isNewQueryOpen, setIsNewQueryOpen] = useState(false);
  const [newMda, setNewMda] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newUrgency, setNewUrgency] = useState('Medium');

  // Load mock data
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchAuditQueries();
      setQueries(data);
      if (data.length > 0) setActiveQuery(data[0]);
    };
    loadData();
  }, []);

  const filtered = queries.filter(q => 
    q.subject.toLowerCase().includes(search.toLowerCase()) || 
    q.mda.toLowerCase().includes(search.toLowerCase()) ||
    q.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleIssueQuery = async () => {
    if (!newMda || !newSubject) return;
    const query = await createAuditQuery({ mda: newMda, subject: newSubject, urgency: newUrgency });
    const updated = await fetchAuditQueries();
    setQueries(updated);
    setActiveQuery(query);
    setIsNewQueryOpen(false);
    setNewMda('');
    setNewSubject('');
  };

  const handleResolve = async () => {
    if (!activeQuery) return;
    const updatedQuery = await resolveAuditQuery(activeQuery.id);
    const updated = await fetchAuditQueries();
    setQueries(updated);
    setActiveQuery(updatedQuery);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-[calc(100vh-172px)] flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <ShieldAlert className="size-5" />
            <span className="font-bold uppercase tracking-wider text-sm">Auditor General's Office</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Queries</h1>
          <p className="text-muted-foreground mt-1">Track, manage, and resolve official audit queries issued to MDAs.</p>
        </div>

        <Dialog open={isNewQueryOpen} onOpenChange={setIsNewQueryOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold shadow-md">
              <Plus className="size-4" /> Issue New Query
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue New Audit Query</DialogTitle>
              <DialogDescription>
                Create a formal query directed at an MDA. This action will trigger notifications to the respective Permanent Secretary.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Target MDA</label>
                <select 
                  className="w-full p-2 border border-border rounded-md bg-background"
                  value={newMda}
                  onChange={e => setNewMda(e.target.value)}
                >
                  <option value="">Select MDA...</option>
                  <option value="Ministry of Works">Ministry of Works</option>
                  <option value="Ministry of Health">Ministry of Health</option>
                  <option value="Ministry of Education">Ministry of Education</option>
                  <option value="Ministry of Agriculture">Ministry of Agriculture</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Subject / Issue</label>
                <Input 
                  placeholder="e.g., Unreconciled Payment Voucher" 
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Urgency Level</label>
                <select 
                  className="w-full p-2 border border-border rounded-md bg-background"
                  value={newUrgency}
                  onChange={e => setNewUrgency(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewQueryOpen(false)}>Cancel</Button>
              <Button onClick={handleIssueQuery}>Issue Query</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Left Side: Ticket Directory */}
        <div className="w-[450px] flex flex-col gap-4">
          <Card className="border-border/60 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/5 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search ID, MDA, or Subject..." 
                    className="pl-10 bg-background" 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="shrink-0"><Filter className="size-4" /></Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-border/50">
              {filtered.map(query => (
                <div 
                  key={query.id}
                  onClick={() => setActiveQuery(query)}
                  className={`p-4 transition-all cursor-pointer hover:bg-muted/10 ${
                    activeQuery?.id === query.id 
                      ? 'bg-primary/5 border-l-4 border-l-primary' 
                      : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-muted-foreground">{query.id}</span>
                    <Badge variant="secondary" className={`text-[10px] font-bold ${
                      query.urgency === 'High' ? 'bg-red-500/10 text-red-600' :
                      query.urgency === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {query.urgency} Priority
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm line-clamp-2 leading-tight mb-2">{query.subject}</h4>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                    <span className="font-semibold">{query.mda}</span>
                    <div className="flex items-center gap-3">
                       <span className="flex items-center gap-1"><MessageSquare className="size-3" /> {query.messages}</span>
                       <span className="flex items-center gap-1"><Clock className="size-3" /> {query.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: Query Details Thread */}
        <div className="flex-1 flex flex-col">
          {activeQuery ? (
            <Card className="flex-1 border-border/60 shadow-sm flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900/20">
              {/* Thread Header */}
              <CardHeader className="bg-background border-b border-border/50 pb-6 shadow-sm z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-muted/50">{activeQuery.id}</Badge>
                    <CardTitle className="text-2xl font-black">{activeQuery.subject}</CardTitle>
                    <CardDescription className="text-sm font-semibold mt-1">Recipient: {activeQuery.mda}</CardDescription>
                  </div>
                  <Badge className={`px-3 py-1 text-xs font-bold ${
                    activeQuery.status === 'Resolved' ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}>
                    {activeQuery.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs"><Paperclip className="size-3 mr-2" /> View Attachments (2)</Button>
                  {activeQuery.status !== 'Resolved' && (
                     <Button size="sm" variant="default" className="text-xs bg-emerald-600 hover:bg-emerald-700" onClick={handleResolve}>
                       <CheckCircle2 className="size-3 mr-2" /> Resolve Query
                     </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30">Escalate</Button>
                </div>
              </CardHeader>
              
              {/* Thread Content */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Initial Query */}
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-md">
                     <ShieldAlert className="size-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">Auditor General's Office</span>
                      <span className="text-xs text-muted-foreground">{activeQuery.date}</span>
                    </div>
                    <div className="p-4 bg-background border border-border/60 shadow-sm rounded-2xl rounded-tl-none text-sm leading-relaxed prose prose-slate dark:prose-invert">
                      <p>Query opened regarding <strong>{activeQuery.subject}</strong>.</p>
                      <p><strong>Required Action:</strong> Please provide formal justification and necessary documentation.</p>
                    </div>
                  </div>
                </div>

                {/* Response (Simulated) */}
                {activeQuery.status !== 'Open' && activeQuery.messages > 0 && (
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0 shadow-sm border border-border/50">
                       <span className="font-bold text-sm text-muted-foreground">MDA</span>
                    </div>
                    <div className="flex-1 space-y-2 flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Recent</span>
                        <span className="font-bold text-sm">Permanent Secretary, {activeQuery.mda}</span>
                      </div>
                      <div className="p-4 bg-primary/10 border border-primary/20 shadow-sm rounded-2xl rounded-tr-none text-sm leading-relaxed max-w-[85%]">
                        <p>Acknowledged. I have attached the requested documents for your immediate review.</p>
                      </div>
                    </div>
                  </div>
                )}

              </CardContent>

              {/* Reply Box */}
              <div className="p-4 bg-background border-t border-border/50">
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="shrink-0"><Paperclip className="size-4" /></Button>
                  <Input placeholder="Type your response or resolution note..." className="flex-1 bg-muted/20" disabled={activeQuery.status === 'Resolved'} />
                  <Button className="shrink-0 px-6 font-bold" disabled={activeQuery.status === 'Resolved'}>Send Reply</Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/60">
              Select a query to view thread.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
