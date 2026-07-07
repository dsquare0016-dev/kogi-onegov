import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { PageHeader, Card, Pill, Stat } from "@/components/ui-bits";
import { getSession } from "@/lib/auth";
import { 
  dbGetAllConversations, 
  dbGetSupportMessages, 
  dbSendSupportMessage, 
  dbUpdateConversationStatus 
} from "@/lib/postgres-service";
import { 
  MessageSquare, User, Bot, Clock, Filter, Search, Send, FileText, Settings, Key, UserCog, UserCheck, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/support")({ component: SupportDesk });

function SupportDesk() {
  const session = getSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [filterStatus, setFilterStatus] = useState("Open");

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      const interval = setInterval(() => fetchMessages(activeConversation.id), 3000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    const data = await dbGetAllConversations();
    if (data) setConversations(data);
  };

  const fetchMessages = async (convId: string) => {
    const data = await dbGetSupportMessages({ data: { conversationId: convId, markReadAs: 'support' } });
    if (data) setMessages(data);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeConversation) return;

    const currentText = replyText;
    setReplyText("");
    
    // Optimistic UI
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      conversation_id: activeConversation.id,
      sender_type: 'support',
      message_body: currentText,
      created_at: new Date().toISOString()
    }]);

    await dbSendSupportMessage({
      data: {
        conversationId: activeConversation.id,
        sender_type: 'support',
        message_body: currentText
      }
    });
    fetchConversations();
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!activeConversation) return;
    const updated = await dbUpdateConversationStatus({
      data: {
        conversationId: activeConversation.id,
        status: newStatus
      }
    });
    if (updated) {
      setActiveConversation(updated);
      fetchConversations();
    }
  };

  const filteredConversations = conversations.filter(c => {
    if (filterStatus === 'All') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        eyebrow="GDU Service Hub"
        title="Live Support Desk"
        subtitle="Manage 24/7 user support requests and chatbot escalations."
        action={
          <div className="flex items-center gap-2">
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm shadow-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Pending Support">Pending Support</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        }
      />
      
      <div className="flex-1 flex gap-4 px-6 md:px-8 pb-8 overflow-hidden h-[calc(100vh-140px)]">
        {/* Left Pane: Conversations */}
        <Card className="w-1/3 flex flex-col overflow-hidden h-full">
          <div className="p-3 border-b border-border flex items-center gap-2 bg-muted/20">
            <Search className="size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No conversations found.
              </div>
            ) : (
              filteredConversations.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setActiveConversation(c)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${activeConversation?.id === c.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card border-border hover:bg-muted/50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold text-sm truncate">{c.subject}</div>
                    <div className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="truncate">{c.user_full_name}</span>
                    <Badge variant={c.status === 'Resolved' ? 'outline' : 'secondary'} className="text-[9px] h-4">
                      {c.status}
                    </Badge>
                  </div>
                  {c.unread_count > 0 && (
                    <div className="mt-2 flex justify-end">
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {c.unread_count} new
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right Pane: Active Chat */}
        <Card className="flex-1 flex flex-col overflow-hidden h-full relative">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{activeConversation.subject}</h3>
                  <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                    <span className="flex items-center gap-1"><User className="size-3" /> {activeConversation.user_full_name} ({activeConversation.user_title})</span>
                    <span className="flex items-center gap-1"><FileText className="size-3" /> {activeConversation.conversation_number}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={activeConversation.status} 
                    onChange={e => handleChangeStatus(e.target.value)}
                    className="h-8 rounded-md border border-input bg-card px-2 text-xs font-semibold shadow-sm"
                  >
                    <option value="Open">Status: Open</option>
                    <option value="Pending Support">Status: Pending Support</option>
                    <option value="Resolved">Status: Resolved</option>
                    <option value="Closed">Status: Closed</option>
                  </select>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.sender_type === 'support' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {msg.sender_type === 'support' ? 'Support Agent' : msg.sender_type === 'system' ? 'System' : activeConversation.user_full_name}
                      </span>
                    </div>
                    {msg.sender_type === 'support' ? (
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                        <p className="text-sm">{msg.message_body}</p>
                      </div>
                    ) : (
                      <div className={`px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm border ${msg.sender_type === 'system' ? 'bg-amber-50 border-amber-200' : 'bg-muted border-border/50'}`}>
                        <p className="text-sm text-foreground/90 leading-relaxed max-w-[85%]">{msg.message_body}</p>
                      </div>
                    )}
                    <span className="text-[9px] text-muted-foreground mt-1 mx-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              {activeConversation.status === 'Closed' ? (
                <div className="p-4 bg-muted/30 border-t border-border text-center text-sm text-muted-foreground">
                  This conversation has been closed.
                </div>
              ) : (
                <div className="p-4 bg-background border-t border-border flex items-end gap-2">
                  <textarea 
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="flex-1 min-h-[60px] resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <Button onClick={handleSendReply} disabled={!replyText.trim()} className="h-[60px] px-6">
                    <Send className="size-4 mr-2" /> Send
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="size-12 mb-4 opacity-20" />
              <p>Select a conversation to view details.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
