import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill } from "@/components/ui-bits";
import { MESSAGES } from "@/lib/mock-data";
import { GROUPS } from "@/lib/governance-data";
import { useState } from "react";
import { Send, Phone, Video, Paperclip, Mic, Megaphone, Lock, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard/communications")({ component: Comms });

function Comms() {
  const [activeId, setActiveId] = useState(GROUPS[0].id);
  const [input, setInput] = useState("");
  const active = GROUPS.find((g) => g.id === activeId)!;

  return (
    <div>
      <PageHeader eyebrow="Government Collaboration Hub" title="Communications Hub" subtitle="Secure messaging, voice notes, calls, broadcasts, file-sharing — all archived and auditable." action={<button className="h-9 px-4 rounded-lg gold-gradient text-gold-foreground text-[12px] font-semibold inline-flex items-center gap-2"><Megaphone className="size-3.5" /> Broadcast</button>} />
      <div className="px-6 md:px-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 h-[640px]">
          <Card className="!p-0 overflow-y-auto">
            <div className="p-3 border-b border-border text-[11px] uppercase tracking-widest text-muted-foreground">Government Groups</div>
            <ul className="p-2 space-y-0.5">
              {GROUPS.map((g) => (
                <li key={g.id}>
                  <button onClick={()=>setActiveId(g.id)} className={`w-full text-left flex flex-col gap-1 px-3 py-2 rounded-lg ${g.id===activeId ? "bg-accent" : "hover:bg-muted/60"}`}>
                    <div className="flex items-center gap-2 text-[12.5px]">
                      <span className="font-semibold flex-1 truncate">{g.name}</span>
                      {g.unread > 0 && <span className="size-5 rounded-full gold-gradient text-gold-foreground text-[10px] font-bold inline-flex items-center justify-center">{g.unread}</span>}
                    </div>
                    <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Lock className="size-2.5" /> {g.classification} · {g.members}</span>
                      <span>{g.lastMessage.at}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{g.lastMessage.from}: {g.lastMessage.text}</div>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="!p-0 flex flex-col">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold inline-flex items-center gap-2">{active.name} <Pill tone="info">{active.classification}</Pill></div>
                <div className="text-[11px] text-muted-foreground">{active.members} members · audit-trail enabled</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center" title="Voice note"><Mic className="size-3.5" /></button>
                <button className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center"><Phone className="size-3.5" /></button>
                <button className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center"><Video className="size-3.5" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {MESSAGES.map((m, i) => (
                <div key={i} className="flex gap-3">
                  <div className="size-8 rounded-full gold-gradient text-gold-foreground text-[11px] font-bold flex items-center justify-center shrink-0">
                    {m.from.split(" ").map(s=>s[0]).slice(0,2).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[12px]"><span className="font-semibold">{m.from}</span><span className="text-muted-foreground text-[10px]">{m.time}</span></div>
                    <div className="mt-0.5 text-[13px]">{m.text}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground inline-flex items-center gap-1"><CheckCheck className="size-3 text-[color:var(--info)]" /> Read by {active.members - 1}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border flex items-center gap-2">
              <button className="h-9 w-9 rounded-lg border border-border bg-card flex items-center justify-center"><Paperclip className="size-3.5" /></button>
              <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder={`Message ${active.name}`} className="flex-1 h-9 px-3 rounded-lg bg-muted/60 border border-border text-[13px] outline-none" />
              <button className="h-9 px-4 rounded-lg gold-gradient text-gold-foreground text-[12px] font-semibold inline-flex items-center gap-1.5"><Send className="size-3.5" /> Send</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}