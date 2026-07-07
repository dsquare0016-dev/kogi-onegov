import { dbGetPostgresMemosList } from '@/lib/postgres-service';
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill, Stat } from "@/components/ui-bits";
import { FileText, Search, Plus, FilePenLine, FileSignature, Archive } from "lucide-react";

export const Route = createFileRoute("/dashboard/documents")({ component: Docs });

const DOCS = [
  { ref: "MEMO/2026/0014", title: "Q3 Capital Release Approval", from: "DG, GDU", to: "Hon. Comm. Finance", stage: "Awaiting Signature", tone: "warn" as const },
  { ref: "CIRC/2026/0048", title: "FY27 Budget Call Circular", from: "SSG", to: "All MDAs", stage: "Published", tone: "good" as const },
  { ref: "MEMO/2026/0089", title: "Lokoja Flyover Variation Order", from: "Permanent Secretary, Works", to: "DG, GDU", stage: "Under Review", tone: "info" as const },
  { ref: "POL/2026/0003", title: "Open Data Policy v1.2", from: "Information & Comms.", to: "EXCO", stage: "Approved", tone: "good" as const },
  { ref: "MEMO/2026/0102", title: "Smart Schools Tablet Procurement Plan", from: "Min. of Education", to: "BPP", stage: "Routed", tone: "info" as const },
  { ref: "MEMO/2026/0118", title: "Cassava Value Chain Grant Award", from: "Min. of Agriculture", to: "Finance", stage: "Awaiting Signature", tone: "warn" as const },
];

import { useState, useEffect } from "react";

function Docs() {
  const [docs, setDocs] = useState<any[]>(DOCS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadDocs() {
      setLoading(true);
      try {
        
        const dbMemos = await dbGetPostgresMemosList();
        if (dbMemos && dbMemos.length > 0) {
          const mapped = dbMemos.map((m: any) => ({
            ref: m.ref || m.id,
            title: m.subject,
            from: m.fromUserName || m.fromEmail || 'You',
            to: m.toUserName || 'Permanent Secretary',
            stage: m.stage || 'Drafted',
            tone: m.stage === 'Approved' ? 'good' as const : (m.stage === 'Confidential' ? 'warn' : 'info' as const)
          }));
          setDocs(mapped);
        }
      } catch (err) {
        console.error("Error loading documents:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  const filteredDocs = docs.filter(d => 
    d.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeFiles = docs.length;
  const pendingSignatures = docs.filter(d => d.stage !== 'Approved').length;
  const drafts = docs.filter(d => d.stage === 'Drafted' || d.stage === 'Draft').length;
  const archived = docs.filter(d => d.stage === 'Approved').length;

  return (
    <div>
      <PageHeader eyebrow="Paperless Office" title="Documents & e-File Management"
        subtitle="Digital memos, approvals, signatures, version control and full audit trail."
        action={<button className="h-9 px-4 rounded-lg gold-gradient text-gold-foreground text-[12px] font-semibold inline-flex items-center gap-2"><Plus className="size-3.5" /> New memo</button>}
      />
      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Active Files" value={activeFiles.toString()} sub="Across MDAs" icon={<FileText className="size-4" />} />
          <Stat label="Pending Signatures" value={pendingSignatures.toString()} sub="Avg 1.4 days" tone="warn" icon={<FileSignature className="size-4" />} />
          <Stat label="Drafts" value={drafts.toString()} tone="default" icon={<FilePenLine className="size-4" />} />
          <Stat label="Archived" value={archived.toString()} sub="OCR-searchable" icon={<Archive className="size-4" />} />
        </div>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 px-3 rounded-lg bg-muted/60 border border-border flex items-center gap-2 flex-1">
              <Search className="size-4 text-muted-foreground" />
              <input 
                placeholder="Search by reference, subject, originator…" 
                className="bg-transparent outline-none text-[13px] flex-1" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-[12.5px] min-w-[800px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                  {["Reference","Subject","From","To","Stage"].map(h => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(d => (
                  <tr key={d.ref} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{d.ref}</td>
                    <td className="px-4 py-3 font-medium">{d.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.from}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.to}</td>
                    <td className="px-4 py-3"><Pill tone={d.tone}>{d.stage}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}