import { dbGetPostgresMemosList, dbSavePostgresMemo } from '@/lib/postgres-service';
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill } from "@/components/ui-bits";
import { MEMOS as DEFAULT_MEMOS, type MemoStage, type Memo } from "@/lib/governance-data";
import { Mail, PenLine, Send, FileSignature, History, Paperclip, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getSession, roleById } from "@/lib/auth";
import { safeGetCollection, safeSetDoc } from "@/lib/firebase";

export const Route = createFileRoute("/dashboard/e-memo")({ component: EMemoPage });

const STAGES: MemoStage[] = ["Drafted", "Secretary", "Director", "Perm. Sec.", "Commissioner", "Governor", "Approved"];

function EMemoPage() {
  const [memos, setMemos] = useState<Memo[]>(DEFAULT_MEMOS);
  const [selectedId, setSelectedId] = useState(DEFAULT_MEMOS[0].id);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Editor states
  const [draftTo, setDraftTo] = useState("Secretary to the State Government");
  const [draftClassification, setDraftClassification] = useState<"Routine" | "Confidential" | "Top Secret">("Routine");
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftLetterhead, setDraftLetterhead] = useState("Official State Letterhead");
  const [attachments, setAttachments] = useState<{ name: string; size: string; url?: string; type?: string }[]>([]);

  // Text formatting stubs
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');

  const session = getSession();
  const profile = session ? roleById(session.role) : null;

  useEffect(() => {
    async function loadMemos() {
      setIsLoading(true);
      try {
        
        const data = await dbGetPostgresMemosList();
        if (data && data.length > 0) {
          const mapped = data.map((m: any) => ({
            ...m,
            stage: m.stage as MemoStage
          }));
          setMemos(mapped);
          setSelectedId(data[0].id);
        } else {
          const fallbackData = await safeGetCollection<Memo>('memos', DEFAULT_MEMOS);
          setMemos(fallbackData);
          if (fallbackData.length > 0) {
            setSelectedId(fallbackData[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load PostgreSQL memos:", err);
        const fallbackData = await safeGetCollection<Memo>('memos', DEFAULT_MEMOS);
        setMemos(fallbackData);
        if (fallbackData.length > 0) {
          setSelectedId(fallbackData[0].id);
        }
      }
      setIsLoading(false);
    }
    loadMemos();
  }, []);

  const memo = memos.find((m) => m.id === selectedId) || DEFAULT_MEMOS[0];
  const stageIdx = STAGES.indexOf(memo.stage as MemoStage);

  // File Attachment simulation
  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAtts = Array.from(files).map(file => ({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        url: URL.createObjectURL(file),
        type: file.type
      }));
      setAttachments([...attachments, ...newAtts]);
    }
  };

  // Submit Draft to Firestore
  const handlePublishMemo = async () => {
    if (!draftSubject.trim() || !draftBody.trim()) return;

    const hash = memos.length + 1;
    const ref = `KGS/${profile?.shortTitle.toUpperCase() || "STAFF"}/2026/${hash.toString().padStart(3, '0')}`;
    const newMemo: Memo = {
      id: `MEM-${hash.toString().padStart(3, '0')}`,
      ref,
      subject: draftSubject,
      from: session?.name || "Official User",
      ministry: profile?.ministry || profile?.mda || "State Government",
      to: draftTo,
      stage: "Secretary",
      classification: draftClassification,
      date: new Date().toISOString().split('T')[0],
      body: draftBody,
      trail: [
        { actor: session?.name || "Anonymous", role: profile?.title || "Officer", action: "Drafted", at: new Date().toISOString().replace('T', ' ').slice(0, 16) }
      ],
      signatures: [
        { name: session?.name || "Anonymous", role: profile?.title || "Officer", signedAt: new Date().toISOString().split('T')[0] }
      ],
      attachments: attachments
    };

    try {
      
      await dbSavePostgresMemo({
        data: {
          ref: newMemo.ref,
          subject: newMemo.subject,
          body: newMemo.body,
          priority: newMemo.classification === 'Confidential' ? 'confidential' : 'normal',
          status: 'draft',
          fromEmail: session?.email,
          toEmail: null,
          trail: newMemo.trail,
          signatures: newMemo.signatures
        }
      });
    } catch (err) {
      console.error("Failed to save published memo to PostgreSQL:", err);
    }

    // Save to Firestore fallback
    await safeSetDoc('memos', newMemo.id, newMemo);

    setMemos([newMemo, ...memos]);
    setSelectedId(newMemo.id);
    setIsDrafting(false);

    // Reset fields
    setDraftSubject("");
    setDraftBody("");
    setAttachments([]);
  };

  // Sign Memo Digitally (sign off)
  const handleSignOffMemo = async () => {
    if (!session) return;
    const alreadySigned = memo.signatures.some(s => s.name === session.name);
    if (alreadySigned) {
      alert("You have already signed this memo.");
      return;
    }

    const updatedSignatures = [
      ...memo.signatures,
      { name: session.name, role: profile?.title || "Clearing Officer", signedAt: new Date().toISOString().split('T')[0] }
    ];

    const currentStageIdx = STAGES.indexOf(memo.stage as MemoStage);
    const nextStage = currentStageIdx < STAGES.length - 1 ? STAGES[currentStageIdx + 1] : "Approved";

    const updatedTrail = [
      ...memo.trail,
      {
        actor: session.name,
        role: profile?.title || "Officer",
        action: `Signed and Routed to ${nextStage}`,
        at: new Date().toISOString().replace('T', ' ').slice(0, 16),
        remark: "Cleared and signed securely via Digital Signature Stamp."
      }
    ];

    const updatedMemo: Memo = {
      ...memo,
      stage: nextStage === "Approved" ? "Approved" : nextStage,
      signatures: updatedSignatures,
      trail: updatedTrail
    };

    try {
      
      await dbSavePostgresMemo({
        data: {
          id: memo.id,
          ref: memo.ref,
          subject: memo.subject,
          body: memo.body,
          priority: memo.classification === 'Confidential' ? 'confidential' : 'normal',
          status: nextStage === 'Approved' ? 'approved' : 'submitted',
          fromEmail: session.email,
          toEmail: null,
          trail: updatedTrail,
          signatures: updatedSignatures
        }
      });
    } catch (err) {
      console.error("Failed to sign off memo to PostgreSQL:", err);
    }

    await safeSetDoc('memos', memo.id, updatedMemo);

    setMemos(memos.map(m => m.id === memo.id ? updatedMemo : m));
    alert("Digital signature stamped and routed successfully!");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Digital Workflow"
        title="E-Memo & Letter Management"
        subtitle="Draft, route, sign, approve and archive — Officer → Secretary → Director → Perm. Sec. → Commissioner → Governor."
        action={
          <button onClick={() => setIsDrafting(true)} className="h-9 px-4 rounded-lg gold-gradient text-gold-foreground text-[12px] font-semibold inline-flex items-center gap-2 cursor-pointer">
            <PenLine className="size-3.5" /> Draft new memo
          </button>
        }
      />
      <div className="px-6 md:px-8 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Inbox" className="lg:col-span-1">
          {isLoading ? (
            <div className="text-center py-8 text-xs text-muted-foreground">Loading inbox...</div>
          ) : (
            <ul className="divide-y divide-border">
              {memos.map((m) => (
                <li key={m.id}>
                  <button onClick={() => setSelectedId(m.id)} className={`w-full text-left p-3 rounded-lg ${m.id === selectedId ? "bg-muted/50 border border-border" : "hover:bg-muted/30"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[11px] text-muted-foreground">{m.ref}</div>
                        <div className="text-[13px] font-semibold leading-tight truncate">{m.subject}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{m.from} · {m.ministry}</div>
                      </div>
                      <Pill tone={m.classification === "Top Secret" ? "bad" : m.classification === "Confidential" ? "warn" : "info"}>{m.classification[0]}</Pill>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10.5px]">
                      <Pill tone={m.stage === "Approved" ? "good" : "gold"}>{m.stage}</Pill>
                      <span className="text-muted-foreground">{m.date}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card title={memo.subject} action={<Pill tone="info">{memo.ref}</Pill>}>
            <div className="text-[12px] text-muted-foreground mb-3">From <strong className="text-foreground">{memo.from}</strong> · To <strong className="text-foreground">{memo.to}</strong> · {memo.date}</div>
            <div className={`text-[13px] leading-relaxed p-4 bg-card border rounded-md whitespace-pre-wrap ${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline' : ''} text-${alignment}`}>
              {memo.body}
            </div>
            {memo.attachments && memo.attachments.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {memo.attachments.map((a) => (
                  <span key={a.name} className="inline-flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded-md bg-muted border border-border">
                    <Paperclip className="size-3 text-muted-foreground" /> {a.name} <span className="text-muted-foreground">· {a.size}</span>
                  </span>
                ))}
              </div>
            )}
          </Card>

          <Card title="Routing Workflow">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {STAGES.map((s, i) => {
                const active = i <= stageIdx;
                return (
                  <div key={s} className="flex items-center gap-2 shrink-0">
                    <div className={`h-8 px-3 rounded-full text-[11.5px] font-semibold inline-flex items-center gap-1.5 border ${active ? "gold-gradient text-gold-foreground border-transparent" : "bg-muted text-muted-foreground border-border"}`}>
                      <span className="size-5 rounded-full bg-black/10 inline-flex items-center justify-center text-[10px]">{i + 1}</span>
                      {s}
                    </div>
                    {i < STAGES.length - 1 && <div className={`w-6 h-px ${i < stageIdx ? "bg-[color:var(--gold)]" : "bg-border"}`} />}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Audit Trail" action={<History className="size-4 text-muted-foreground" />}>
              <ol className="relative border-l-2 border-border ml-2 space-y-3">
                {memo.trail.map((t, i) => (
                  <li key={i} className="ml-4">
                    <div className="absolute -left-[7px] mt-1 size-3 rounded-full gold-gradient" />
                    <div className="text-[12.5px] font-semibold">{t.action} <span className="text-muted-foreground font-normal">by {t.actor} ({t.role})</span></div>
                    <div className="text-[11px] text-muted-foreground">{t.at}{t.remark ? ` · "${t.remark}"` : ""}</div>
                  </li>
                ))}
              </ol>
            </Card>

            <Card title="Digital Signatures" action={<FileSignature className="size-4 text-[color:var(--gold)]" />}>
              <ul className="space-y-2">
                {memo.signatures.map((s, i) => (
                  <li key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted/40">
                    <div className="size-8 rounded-full gold-gradient text-gold-foreground text-[11px] font-bold inline-flex items-center justify-center">
                      {s.name.split(" ").slice(-2).map(p=>p[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-semibold">{s.name}</div>
                      <div className="text-[10.5px] text-muted-foreground">{s.role} · signed {s.signedAt}</div>
                    </div>
                    <Pill tone="good">Verified</Pill>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={handleSignOffMemo} className="h-9 px-3 rounded-lg gold-gradient text-gold-foreground text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer">
                  <ShieldCheck className="size-3.5" /> Sign & Route
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Draft New Memo Modal */}
      {isDrafting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                <PenLine className="size-4 text-[color:var(--gold)]" /> Draft New E-Memo
              </h3>
              <button 
                onClick={() => setIsDrafting(false)} 
                className="text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                Close
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">To (Recipient)</label>
                  <select value={draftTo} onChange={e => setDraftTo(e.target.value)} className="w-full h-9 px-3 bg-card border border-border text-foreground rounded-lg text-xs outline-none focus:border-[color:var(--gold)]">
                    <option value="Secretary to the State Government">Secretary to the State Government</option>
                    <option value="His Excellency, the Governor">His Excellency, the Governor</option>
                    <option value="Honourable Commissioner, Finance">Honourable Commissioner, Finance</option>
                    <option value="Head of Civil Service">Head of Civil Service</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Classification</label>
                  <select value={draftClassification} onChange={e => setDraftClassification(e.target.value as any)} className="w-full h-9 px-3 bg-card border border-border text-foreground rounded-lg text-xs outline-none focus:border-[color:var(--gold)]">
                    <option value="Routine">Routine</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Top Secret">Top Secret</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Letterhead</label>
                  <select value={draftLetterhead} onChange={e => setDraftLetterhead(e.target.value)} className="w-full h-9 px-3 bg-card border border-border text-foreground rounded-lg text-xs outline-none focus:border-[color:var(--gold)]">
                    <option value="Official State Letterhead">Official State Letterhead</option>
                    <option value="Ministry of Health Letterhead">Ministry of Health Letterhead</option>
                    <option value="Ministry of Education Letterhead">Ministry of Education Letterhead</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Subject</label>
                <input 
                  type="text"
                  value={draftSubject}
                  onChange={e => setDraftSubject(e.target.value)}
                  placeholder="Enter memo subject..."
                  className="w-full h-9 px-3 bg-card border border-border text-foreground rounded-lg text-xs outline-none focus:border-[color:var(--gold)]"
                />
              </div>

              {/* MS Word-Style Rich Editor Toolbar */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Body / Content</label>
                <div className="border border-border rounded-lg overflow-hidden flex flex-col bg-card">
                  <div className="flex flex-wrap items-center gap-1 bg-muted/50 p-2 border-b border-border text-muted-foreground">
                    <button type="button" onClick={() => setIsBold(!isBold)} className={`p-1.5 rounded hover:bg-accent hover:text-foreground ${isBold ? 'bg-primary/20 text-primary' : ''}`} title="Bold"><Bold className="size-3.5" /></button>
                    <button type="button" onClick={() => setIsItalic(!isItalic)} className={`p-1.5 rounded hover:bg-accent hover:text-foreground ${isItalic ? 'bg-primary/20 text-primary' : ''}`} title="Italic"><Italic className="size-3.5" /></button>
                    <button type="button" onClick={() => setIsUnderline(!isUnderline)} className={`p-1.5 rounded hover:bg-accent hover:text-foreground ${isUnderline ? 'bg-primary/20 text-primary' : ''}`} title="Underline"><Underline className="size-3.5" /></button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <button type="button" onClick={() => setAlignment('left')} className={`p-1.5 rounded hover:bg-accent hover:text-foreground ${alignment === 'left' ? 'bg-primary/20 text-primary' : ''}`} title="Align Left"><AlignLeft className="size-3.5" /></button>
                    <button type="button" onClick={() => setAlignment('center')} className={`p-1.5 rounded hover:bg-accent hover:text-foreground ${alignment === 'center' ? 'bg-primary/20 text-primary' : ''}`} title="Align Center"><AlignCenter className="size-3.5" /></button>
                    <button type="button" onClick={() => setAlignment('right')} className={`p-1.5 rounded hover:bg-accent hover:text-foreground ${alignment === 'right' ? 'bg-primary/20 text-primary' : ''}`} title="Align Right"><AlignRight className="size-3.5" /></button>
                  </div>
                  <textarea 
                    rows={8}
                    value={draftBody}
                    onChange={e => setDraftBody(e.target.value)}
                    placeholder="Draft your memo content here..."
                    className={`w-full p-3 bg-transparent text-foreground text-[13px] outline-none resize-none ${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline' : ''} text-${alignment}`}
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Attachments</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center bg-muted/20 relative">
                  <input type="file" multiple onChange={handleAttachFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Paperclip className="size-6 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Drag & drop files here, or click to select (PDF, Excel, Word, images)</p>
                </div>
                {attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-4 p-3 bg-muted/30 rounded-lg">
                    {attachments.map((att, i) => (
                      <div key={i} className="flex flex-col items-center p-2 bg-background border border-border rounded-lg max-w-[150px] relative">
                        {att.type?.startsWith('image/') ? (
                          <img src={att.url} alt={att.name} className="h-16 w-auto object-cover rounded mb-1" />
                        ) : (
                          <div className="h-16 w-16 bg-muted/50 rounded flex items-center justify-center mb-1">
                            <Paperclip className="size-6 text-muted-foreground" />
                          </div>
                        )}
                        <span className="text-[9px] font-semibold truncate w-full text-center">{att.name}</span>
                        <span className="text-[8px] text-muted-foreground">{att.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
              <button 
                onClick={() => setIsDrafting(false)}
                className="px-4 py-2 bg-transparent text-foreground border border-border font-bold rounded-lg text-xs hover:bg-muted cursor-pointer"
              >
                Save as Draft
              </button>
              <button 
                onClick={handlePublishMemo}
                disabled={!draftSubject.trim() || !draftBody.trim()}
                className="px-4 py-2 gold-gradient text-gold-foreground font-bold rounded-lg text-xs hover:opacity-90 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="size-3.5" /> Route Memo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
