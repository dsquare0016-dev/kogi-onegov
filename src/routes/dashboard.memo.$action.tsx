import { dbGetMemos, dbSaveMemo } from '@/lib/postgres-service';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { safeGetCollection } from '@/lib/firebase';
import { MINISTRIES, AGENCIES } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, PenTool, Send, FileSignature, CheckCircle, Clock, Paperclip, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ShieldAlert, ArrowRight, RotateCcw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { safeAddDoc, safeSetDoc } from '@/lib/firebase';
import { ROLES, roleById } from '@/lib/roles';
export const Route = createFileRoute('/dashboard/memo/$action')({
  component: MemoActionPage,
});

function MemoActionPage() {
  const { action } = Route.useParams();
  const session = getSession();
  const isSecretary = session?.role === 'secretary_mda';
  const isSuperAdmin = session?.role === 'super_admin';
  const userRole = session?.role || '';
  const userMda = session?.role ? (roleById(session.role)?.mda || roleById(session.role)?.ministry || 'State Government') : 'State Government';

  const MOCK_MEMOS = [
    {
      id: "MEMO-2026-0892",
      subject: "Implementation of Digital Payroll",
      senderRole: "director_finance",
      senderName: "Director, Finance",
      recipientRole: "perm_secretary",
      recipientName: "Permanent Secretary",
      history: ["secretary_mda", "director_finance"],
      date: "Oct 24, 09:14 AM",
      snippet: "...I humbly submit the proposed framework for the transition to the automated payroll system across all LGAs...",
      status: isSecretary ? 'Pending Secretary Vetting' : 'Pending Review'
    },
    {
      id: "MEMO-2026-0901",
      subject: "Request for Procurement of IT Equipment",
      senderRole: "director_admin",
      senderName: "Director of Administration",
      recipientRole: "commissioner",
      recipientName: "Honourable Commissioner",
      history: ["director_admin", "perm_secretary"],
      date: "Oct 25, 11:30 AM",
      snippet: "...this memo seeks approval for the procurement of 50 new workstations for the incoming desk officers...",
      status: "Approved"
    },
    {
      id: "MEMO-2026-0905",
      subject: "State Exco Meeting Resolutions",
      senderRole: "ssg",
      senderName: "Secretary to the State Government",
      recipientRole: "head_of_service",
      recipientName: "Head of Civil Service",
      history: ["ssg"],
      date: "Oct 26, 08:00 AM",
      snippet: "...attached are the resolutions from the State Executive Council meeting held yesterday...",
      status: "Action Required"
    }
  ];

  const [draftMemos, setDraftMemos] = useState<Array<any>>([]);
  const [dbMemos, setDbMemos] = useState<Array<any>>([]);

  // Load draft memos for the current user role
  useEffect(() => {
    safeGetCollection('draft_memos', []).then(setDraftMemos).catch(console.error);
    
    async function loadDbMemos() {
      try {
        
        const list = await dbGetMemos({
          data: {
            role: session?.role,
            organizationId: session?.organizationId,
            userId: session?.staffId,
            userEmail: session?.email
          }
        });
        if (list && list.length > 0) {
          setDbMemos(list);
        }
      } catch (err) {
        console.error("Failed to load postgres memos:", err);
      }
    }
    loadDbMemos();
  }, []);

  const mergedMemos = dbMemos.length > 0 ? dbMemos.map(m => ({
    id: m.id || m.ref,
    ref: m.ref,
    subject: m.subject,
    senderRole: m.fromUserRole || '',
    senderName: m.fromUserName || m.fromEmail || 'You',
    recipientRole: m.toUserRole || '',
    recipientName: m.toUserName || '',
    history: m.trail?.map((t: any) => t.role) || [],
    date: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '',
    snippet: m.body?.substring(0, 60) + '...',
    status: m.status || 'Pending Review',
    stage: m.stage || 'Drafted',
    trail: m.trail || [],
    signatures: m.signatures || []
  })) : [...MOCK_MEMOS, ...draftMemos.map(m => ({
    id: m.id || 'draft-' + Math.random().toString(36).substr(2, 5),
    ref: m.id,
    subject: m.subject,
    senderRole: session?.role || '',
    senderName: session?.name || 'You',
    recipientRole: m.recipientDesignation || '',
    recipientName: m.recipientDesignation || '',
    history: [] as string[],
    date: new Date(m.createdAt).toLocaleString(),
    snippet: m.content?.substring(0, 60) + '...',
    status: 'Pending Review',
    stage: m.stage || 'Drafted',
    trail: m.trail || [],
    signatures: m.signatures || []
  }))];

  const visibleMemos = mergedMemos.filter(memo => {
    if (isSuperAdmin) return true; // Superadmin sees all
    if (!userRole) return false;
    
    // User can see it if they sent it, receive it, or if it passed through them
    if (memo.senderRole === userRole) return true;
    if (memo.recipientRole === userRole) return true;
    if ((memo.history as string[] | undefined)?.includes(userRole as string)) return true;
    
    return false;
  });
  
  // Duplicate state block removed
  const [routingChannel, setRoutingChannel] = useState<string>('Permanent Secretary');
  const RECIPIENT_OPTIONS = ROLES.filter(r => 
    ["governor", "deputy_governor", "ssg", "chief_of_staff", "head_of_service", "dg_gdu", "commissioner", "perm_secretary", "director", "civil_service_commission", "director_admin", "director_finance", "director_prs"].includes(r.id)
  ).map(r => ({
    id: r.id,
    title: r.title,
    demoName: r.demoName,
    display: `${r.title} (${r.demoName})`
  }));
  const [recipientDesignation, setRecipientDesignation] = useState<string>('governor');
  const [attachments, setAttachments] = useState<Array<any>>([]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
  };

  // Ref for the rich text editor canvas
  const editorRef = useRef<HTMLDivElement>(null);

  // Navigation helper
  const navigate = useNavigate();

  // Attach file handler
  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments = Array.from(files).map(file => {
        const url = URL.createObjectURL(file);
        return {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          url,
          type: file.type
        };
      });
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  // Helper to get stage from routing channel/role
  const getStageFromRouting = (channel: string, toRole: string) => {
    if (channel === "Permanent Secretary") return "Perm. Sec.";
    if (channel === "Director of Administration" || channel === "Director of Finance & Accounts") return "Director";
    if (channel === "Secretary to MDA Head") return "Secretary";
    
    // Direct routing: map toRole to stage
    if (toRole === "governor") return "Governor";
    if (toRole === "commissioner") return "Commissioner";
    if (toRole === "perm_secretary") return "Perm. Sec.";
    if (["director", "director_admin", "director_finance", "director_prs"].includes(toRole)) return "Director";
    if (toRole === "secretary_mda") return "Secretary";
    
    return "Secretary"; // Default fallback
  };

  // Save draft handler
  const handleSaveDraft = async () => {
    try {
      const content = editorRef.current?.innerHTML || '';
      const subjectInput = document.querySelector('input[placeholder="Enter memo subject..."]') as HTMLInputElement;
      const subject = subjectInput?.value || 'Untitled Memo';
      
      const draftId = 'draft-' + Math.random().toString(36).substr(2, 5);
      const newDraft = {
        id: draftId,
        subject,
        body: content.replace(/<[^>]*>/g, ''),
        content,
        routingChannel,
        recipientDesignation,
        stage: "Drafted",
        status: "Draft",
        createdAt: new Date().toISOString(),
        from: session?.name || "Official User",
        ministry: session?.mda || "State Government",
        to: recipientDesignation || "Permanent Secretary",
        date: new Date().toISOString().split('T')[0],
        attachments: attachments.map(a => ({ name: a.name, size: a.size, url: a.url || '' })),
        signatures: [],
        trail: [{ actor: session?.name || "You", role: session?.role || "Officer", action: "Drafted", at: new Date().toISOString().replace('T', ' ').slice(0, 16) }]
      };

      try {
        
        await dbSaveMemo({
          data: {
            id: draftId,
            ref: draftId,
            subject,
            body: content,
            from: session?.email || session?.name,
            to: recipientDesignation,
            classification: 'Routine',
            stage: 'Drafted',
            signatures: [],
            trail: [{ actor: session?.name || "You", role: session?.role || "Officer", action: "Drafted", at: new Date().toISOString() }]
          }
        });
        alert('Draft saved successfully!');
        navigate({ to: '/dashboard/e-memo' });
      } catch (dbErr) {
        console.error("Failed to save draft to PostgreSQL:", dbErr);
        alert('Failed to save draft. See console for details.');
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      alert('Failed to save draft. See console for details.');
    }
  };

  // Route/Send memo handler
  const handleRoute = async () => {
    try {
      const content = editorRef.current?.innerHTML || '';
      const subjectInput = document.querySelector('input[placeholder="Enter memo subject..."]') as HTMLInputElement;
      const subject = subjectInput?.value || 'Untitled Memo';
      
      if (!subjectInput?.value?.trim()) {
        alert('Please enter a subject.');
        return;
      }

      const existingMemos = await safeGetCollection<any>('memos', []);
      const hash = existingMemos.length + 1;
      const memoId = `MEM-${hash.toString().padStart(3, '0')}`;
      const ref = `KGS/${session?.role?.toUpperCase() || "STAFF"}/2026/${hash.toString().padStart(3, '0')}`;
      
      const targetStage = getStageFromRouting(routingChannel, recipientDesignation);

      const newMemo = {
        id: memoId,
        ref,
        subject,
        from: session?.name || "Official User",
        ministry: session?.mda || "State Government",
        to: recipientDesignation || "Permanent Secretary",
        stage: targetStage,
        classification: "Routine",
        date: new Date().toISOString().split('T')[0],
        body: content.replace(/<[^>]*>/g, ''),
        trail: [
          { 
            actor: session?.name || "Anonymous", 
            role: session?.role || "Officer", 
            action: "Drafted & Routed", 
            at: new Date().toISOString()
          }
        ],
        signatures: [
          { name: session?.name || "Anonymous", role: session?.role || "Officer", signedAt: new Date().toISOString() }
        ],
        attachments: attachments.map(a => ({ name: a.name, size: a.size, url: a.url || '' })),
        recipientRole: recipientDesignation,
      };

      try {
        
        await dbSaveMemo({
          data: {
            id: memoId,
            ref: ref,
            subject: subject,
            body: content,
            classification: 'Routine',
            stage: targetStage,
            from: session?.email || session?.name,
            to: recipientDesignation,
            trail: newMemo.trail,
            signatures: newMemo.signatures
          }
        });
        alert(`Memo Routed Successfully! Reference: ${ref}`);
        navigate({ to: '/dashboard/e-memo' });
      } catch (dbErr) {
        console.error("Failed to route memo to PostgreSQL:", dbErr);
        alert('Failed to route memo. See console for details.');
      }
    } catch (err) {
      console.error('Error routing memo:', err);
      alert('Failed to route memo. See console for details.');
    }
  };

  // Queue Action Handlers
  const handlePush = async (memoId: string) => {
    try {
      const memo = mergedMemos.find(m => m.id === memoId);
      if (memo) {
        const nextStage = memo.stage === "Secretary" ? "Director" : memo.stage === "Director" ? "Perm. Sec." : "Commissioner";
        const updatedTrail = [
          ...(memo.trail || []),
          { actor: session?.name || "You", role: session?.role || "Officer", action: `Pushed to ${nextStage}`, at: new Date().toISOString() }
        ];
        try {
          
          await dbSaveMemo({
            data: {
              id: memo.id,
              ref: memo.ref,
              subject: memo.subject,
              body: memo.body,
              classification: 'Routine',
              stage: nextStage,
              from: memo.senderName || memo.fromEmail,
              to: memo.recipientRole,
              trail: updatedTrail,
              signatures: memo.signatures || []
            }
          });
          alert(`Memo pushed to ${nextStage} successfully!`);
          window.dispatchEvent(new CustomEvent('memoCountUpdate'));
          navigate({ to: '/dashboard/e-memo' });
        } catch (dbErr) {
          console.error("Failed to push memo via PostgreSQL:", dbErr);
          alert('Failed to push memo.');
        }
      }
    } catch (e) {
      console.error("Error pushing memo:", e);
    }
  };

  const handleReturn = async (memoId: string) => {
    try {
      const memo = mergedMemos.find(m => m.id === memoId);
      if (memo) {
        const updatedTrail = [
          ...(memo.trail || []),
          { actor: session?.name || "You", role: session?.role || "Officer", action: "Returned to Sender", at: new Date().toISOString(), remark: "Required clarification/edits." }
        ];
        try {
          
          await dbSaveMemo({
            data: {
              id: memo.id,
              ref: memo.ref,
              subject: memo.subject,
              body: memo.body,
              classification: 'Routine',
              stage: 'Drafted',
              from: memo.senderName || memo.fromEmail,
              to: memo.senderRole,
              trail: updatedTrail,
              signatures: memo.signatures || []
            }
          });
          alert("Memo returned to sender.");
          window.dispatchEvent(new CustomEvent('memoCountUpdate'));
          navigate({ to: '/dashboard/e-memo' });
        } catch (dbErr) {
          console.error("Failed to return memo via PostgreSQL:", dbErr);
          alert('Failed to return memo.');
        }
      }
    } catch (e) {
      console.error("Error returning memo:", e);
    }
  };

  const handleApprove = async (memoId: string) => {
    try {
      const memo = mergedMemos.find(m => m.id === memoId);
      if (memo) {
        const updatedTrail = [
          ...(memo.trail || []),
          { actor: session?.name || "You", role: session?.role || "Officer", action: "Approved", at: new Date().toISOString() }
        ];
        const updatedSignatures = [
          ...(memo.signatures || []),
          { name: session?.name || "Anonymous", role: session?.role || "Approver", signedAt: new Date().toISOString() }
        ];
        try {
          
          await dbSaveMemo({
            data: {
              id: memo.id,
              ref: memo.ref,
              subject: memo.subject,
              body: memo.body,
              classification: 'Routine',
              stage: 'approved',
              from: memo.senderName || memo.fromEmail,
              to: memo.recipientRole,
              trail: updatedTrail,
              signatures: updatedSignatures
            }
          });
          alert("Memo approved and signed successfully!");
          window.dispatchEvent(new CustomEvent('memoCountUpdate'));
          navigate({ to: '/dashboard/e-memo' });
        } catch (dbErr) {
          console.error("Failed to approve memo in PostgreSQL:", dbErr);
          alert('Failed to approve memo.');
        }
      }
    } catch (e) {
      console.error("Error approving memo:", e);
    }
  };

  const handleForward = async (memoId: string) => {
    try {
      const memo = mergedMemos.find(m => m.id === memoId);
      if (memo) {
        const nextStage = memo.stage === "Perm. Sec." ? "Commissioner" : "Governor";
        const updatedTrail = [
          ...(memo.trail || []),
          { actor: session?.name || "You", role: session?.role || "Officer", action: "Forwarded", at: new Date().toISOString() }
        ];
        try {
          
          await dbSaveMemo({
            data: {
              id: memo.id,
              ref: memo.ref,
              subject: memo.subject,
              body: memo.body,
              classification: 'Routine',
              stage: nextStage,
              from: memo.senderName || memo.fromEmail,
              to: memo.recipientRole,
              trail: updatedTrail,
              signatures: memo.signatures || []
            }
          });
          alert(`Forwarded to ${nextStage}`);
          window.dispatchEvent(new CustomEvent('memoCountUpdate'));
          navigate({ to: '/dashboard/e-memo' });
        } catch (dbErr) {
          console.error("Failed to forward memo in PostgreSQL:", dbErr);
          alert('Failed to forward memo.');
        }
      }
    } catch (e) {
      console.error("Error forwarding memo:", e);
    }
  };

  const getActionDetails = () => {
    switch (action) {
      case 'draft': return { title: "Draft Electronic Memo", icon: PenTool, desc: "Compose a new official memorandum or letter." };
      case 'route': return { title: "Route / Forward Memo", icon: Send, desc: "Forward memos through the official hierarchical chain." };
      case 'approve': return { title: "Approve Memo", icon: CheckCircle, desc: "Review and approve pending administrative memos." };
      case 'sign': return { title: "Digital Signature", icon: FileSignature, desc: "Apply cryptographic digital signatures to official documents." };
      case 'track': return { title: "Memo Tracking & Audit", icon: Clock, desc: "Track the real-time location and status of circulating memos." };
      default: return { title: "E-Memo System", icon: Mail, desc: "Manage electronic memorandums." };
    }
  };

  const { title, icon: Icon, desc } = getActionDetails();
  const pendingCount = visibleMemos.length;

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title} <span className="ml-2 text-sm font-medium text-muted-foreground">({pendingCount} pending)</span></h1>
        <p className="text-muted-foreground mt-1">{desc}</p>
      </div>

      <Card className="border-border/60 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2"><Icon className="size-5 text-primary" /> {action === 'draft' ? 'Composition Editor' : 'Memo Queue'}</CardTitle>
          <CardDescription>
            {action === 'draft' ? 'All drafted memos are permanently archived and auditable.' : 'Select a memo from your queue to process it.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          
          {action === 'draft' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">To (Recipient Designation)</label>
                  <select 
                    className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={recipientDesignation}
                    onChange={(e) => setRecipientDesignation(e.target.value)}
                  >
                    {RECIPIENT_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.display}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Through (Routing Channel)</label>
                  <select 
                    className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={routingChannel}
                    onChange={(e) => setRoutingChannel(e.target.value)}
                  >
                    <option>Permanent Secretary</option>
                    <option>Director of Administration</option>
                    <option>Direct (Exempted)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Subject</label>
                <input type="text" className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter memo subject..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Body / Content</label>
                
                {/* Advanced Rich Text Editor */}
                <div className="border border-border rounded-xl overflow-hidden bg-muted/10 shadow-sm">
                  {/* Formatting Toolbar */}
                  <div className="border-b border-border bg-muted/80 p-2 flex flex-wrap gap-2 items-center">
                    <select 
                      className="text-xs bg-background border border-border rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                      onChange={(e) => execCommand('fontName', e.target.value)}
                      defaultValue="Times New Roman"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                    <select 
                      className="text-xs bg-background border border-border rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                      onChange={(e) => execCommand('fontSize', e.target.value)}
                      defaultValue="3"
                    >
                      <option value="1">Size 10</option>
                      <option value="2">Size 12</option>
                      <option value="3">Size 14 (Normal)</option>
                      <option value="4">Size 18</option>
                      <option value="5">Size 24</option>
                      <option value="6">Size 32</option>
                    </select>
                    
                    <div className="w-px h-5 bg-border/80 mx-1" />

                    <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} className="p-1.5 text-xs bg-background border border-border rounded hover:bg-muted text-foreground transition-colors"><Bold className="size-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} className="p-1.5 text-xs bg-background border border-border rounded hover:bg-muted text-foreground transition-colors"><Italic className="size-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }} className="p-1.5 text-xs bg-background border border-border rounded hover:bg-muted text-foreground transition-colors"><Underline className="size-4" /></button>
                    
                    <div className="w-px h-5 bg-border/80 mx-1" />
                    
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyLeft'); }} className="p-1.5 text-xs bg-background border border-border rounded hover:bg-muted text-foreground transition-colors"><AlignLeft className="size-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyCenter'); }} className="p-1.5 text-xs bg-background border border-border rounded hover:bg-muted text-foreground transition-colors"><AlignCenter className="size-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyRight'); }} className="p-1.5 text-xs bg-background border border-border rounded hover:bg-muted text-foreground transition-colors"><AlignRight className="size-4" /></button>
                  </div>

                  {/* MS Word Style Canvas Container */}
                  <div className="bg-[#E5E7EB] dark:bg-zinc-900 p-8 overflow-y-auto flex justify-center h-[500px]" ref={editorRef}>
                    {/* The "Paper" */}
                    <div 
                      className="bg-white text-black shadow-xl border border-zinc-200 p-12 w-full max-w-[800px] min-h-full focus:outline-none prose max-w-none"
                      contentEditable
                      suppressContentEditableWarning
                      style={{ fontFamily: 'Times New Roman' }}
                    >
                      <p><em>[Type official memo content here...]</em></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-1.5 pt-2">
                <label className="text-sm font-medium">Supporting Documents</label>
                <label className="border-2 border-dashed border-border/80 rounded-xl p-8 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
                  <Paperclip className="size-6 text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
                  <p className="text-sm font-semibold text-foreground">Click or drag to attach files</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, JPG (Max 25MB per file)</p>
                  <input type="file" className="hidden" multiple onChange={handleAttachFile} />
                </label>
              </div>

              {/* Attachments preview */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">Attachments Preview:</p>
                  <div className="flex flex-wrap gap-4">
                    {attachments.map((att, i) => (
                      <div key={i} className="flex flex-col items-center max-w-xs">
                        {att.type?.startsWith('image/') ? (
                          <img src={att.url} alt={att.name} className="h-24 w-auto object-cover rounded" />
                        ) : (
                          <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            {att.name}
                          </a>
                        )}
                        <span className="text-xs text-muted-foreground mt-1">{att.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                  <button className="px-4 py-2 border border-border rounded-md text-sm font-semibold hover:bg-muted transition-colors" onClick={handleSaveDraft}>Save as Draft</button>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2" onClick={handleRoute}>
                    <Send className="size-4" /> Route to Next Officer
                  </button>
              </div>
            </div>
          ) : action === 'route' || action === 'approve' || action === 'track' ? (
            <div className="space-y-4">
              {visibleMemos.length > 0 ? (
                visibleMemos.map(memo => (
                  <div key={memo.id} className="border border-border/60 rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm">
                    <div className="p-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          <Mail className="size-4 text-primary" /> {memo.id}: {memo.subject}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5">From: {memo.senderName} ({memo.date})</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${memo.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                        {memo.status}
                      </span>
                    </div>
                    <div className="p-4 bg-muted/5">
                      <p className="text-sm text-muted-foreground italic mb-4">
                        {memo.snippet}
                      </p>
                      
                      {isSuperAdmin && (
                        <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-sm text-indigo-800 dark:text-indigo-300">
                          <strong>Super Admin Insight:</strong> This memo originated from <em>{memo.senderRole}</em>, is destined for <em>{memo.recipientRole}</em>, and passed through: {memo.history.join(', ')}.
                        </div>
                      )}

                      {/* Action buttons (only show if it's pending their action, for mock purposes we just show some based on role) */}
                      {isSecretary && memo.status.includes('Vetting') ? (
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                          <button onClick={() => handlePush(memo.id)} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-md transition-colors text-sm flex items-center justify-center gap-2">
                            <ArrowRight className="size-4" /> Push to MDA Head
                          </button>
                          <button onClick={() => handleReturn(memo.id)} className="flex-1 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold rounded-md transition-colors text-sm flex items-center justify-center gap-2">
                            <RotateCcw className="size-4" /> Return to Sender
                          </button>
                        </div>
                      ) : !isSuperAdmin && memo.status.includes('Review') ? (
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                          <button onClick={() => handleApprove(memo.id)} className="flex-1 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-md transition-colors text-sm flex items-center justify-center gap-2">
                            <CheckCircle className="size-4" /> Approve Memo
                          </button>
                          <button onClick={() => handleForward(memo.id)} className="flex-1 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold rounded-md transition-colors text-sm flex items-center justify-center gap-2">
                            <Send className="size-4" /> Minute / Forward
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/60 rounded-xl p-12">
                  <Mail className="size-12 mb-4 opacity-20" />
                  <p className="font-medium">No memos available.</p>
                  <p className="text-sm mt-1">You do not have any memos in your queue that you are a part of.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/60 rounded-xl p-12">
              <Mail className="size-12 mb-4 opacity-20" />
              <p className="font-medium">No pending memos in your {action} queue.</p>
              <p className="text-sm mt-1">When an officer routes a memo to your designation, it will appear here.</p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
