import { useState, useRef, useEffect } from 'react';
import { 
  Bot, X, Send, Paperclip, Minimize2, MoreVertical, 
  Sparkles, CheckCircle2, ShieldAlert, User, Mail, Briefcase, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getSession } from '@/lib/auth';
import { dbCreateConversation, dbSendSupportMessage, dbGetSupportMessages } from '@/lib/postgres-service';

interface Message {
  id: string;
  conversation_id: string;
  sender_user_id: string | null;
  sender_type: string;
  message_body: string;
  created_at: string;
  isTicket?: boolean;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [mainLogo, setMainLogo] = useState('/kogi-logo.png');
  const [gduLogo, setGduLogo] = useState('/gdu-logo.png');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const getStoredLogos = () => {
        setMainLogo(localStorage.getItem('gdu_main_logo') || '/kogi-logo.png');
        setGduLogo(localStorage.getItem('gdu_gdu_logo') || '/gdu-logo.png');
      };
      getStoredLogos();
      window.addEventListener('siteConfigUpdate', getStoredLogos);
      return () => window.removeEventListener('siteConfigUpdate', getStoredLogos);
    }
  }, []);

  const [mode, setMode] = useState<'details' | 'issue' | 'chat'>('details');
  const [emailInput, setEmailInput] = useState('');
  const [issueCategory, setIssueCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const session = getSession();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('openChatbot', handleOpenChatbot);
    return () => window.removeEventListener('openChatbot', handleOpenChatbot);
  }, []);

  useEffect(() => {
    if (session && !emailInput) {
      setEmailInput(session.email || '');
    }
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, mode]);

  // Polling for messages
  useEffect(() => {
    let interval: any;
    if (activeConversationId) {
      interval = setInterval(async () => {
        const msgs = await dbGetSupportMessages({ data: { conversationId: activeConversationId, markReadAs: 'user' } });
        if (msgs && msgs.length > 0) {
          setMessages(msgs as Message[]);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeConversationId]);

  const handleConfirmDetails = () => {
    if (!emailInput) return;
    setMode('issue');
  };

  const handleSubmitIssue = async () => {
    if (!issueCategory || !subject || !inputText.trim()) return;
    setIsTyping(true);

    const conv = await dbCreateConversation({
      data: {
        user_full_name: session?.name || 'Unknown',
        user_title: session?.role || 'Staff',
        user_email: emailInput,
        staff_id: session?.staffId || 'N/A',
        issue_category: issueCategory,
        subject,
        priority,
        message_body: inputText
      }
    });

    if (conv) {
      setActiveConversationId(conv.id);
      setMode('chat');
      setMessages([{
        id: 'temp-1',
        conversation_id: conv.id,
        sender_user_id: null,
        sender_type: 'system',
        message_body: 'I can’t solve this directly. Let me transfer you to the 24/7 support team. They are always here to assist you.',
        created_at: new Date().toISOString()
      }, {
        id: 'temp-2',
        conversation_id: conv.id,
        sender_user_id: null,
        sender_type: 'user',
        message_body: inputText,
        created_at: new Date().toISOString()
      }]);
      setInputText('');
    }
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeConversationId) return;

    const currentText = inputText;
    setInputText('');
    
    // Optimistic UI
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      conversation_id: activeConversationId,
      sender_user_id: null,
      sender_type: 'user',
      message_body: currentText,
      created_at: new Date().toISOString()
    }]);

    await dbSendSupportMessage({
      data: {
        conversationId: activeConversationId,
        sender_type: 'user',
        message_body: currentText
      }
    });
  };

  if (!isOpen) {
    return (
      <>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slow-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-slow-spin {
            animation: slow-spin 25s linear infinite;
          }
          @keyframes chatbot-bubble {
            0% {
              transform: translate(-50%, -50%) translate(0, 0) scale(0.4);
              opacity: 0;
            }
            15% {
              opacity: 0.7;
            }
            85% {
              opacity: 0.4;
            }
            100% {
              transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(1.3);
              opacity: 0;
            }
          }
          .chatbot-bubble-particle {
            position: absolute;
            left: 50%;
            top: 50%;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 70%, rgba(255,255,255,0) 100%);
            border: 1px solid rgba(255,255,255,0.4);
            box-shadow: inset 0 0 4px rgba(255,255,255,0.6);
            pointer-events: none;
            animation: chatbot-bubble var(--duration) ease-in-out infinite;
            animation-delay: var(--delay);
          }
        `}} />
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] size-14 bg-white border border-[#C5A059]/40 rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.15)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group hover:shadow-[0_4px_30px_rgba(197,160,89,0.3)]"
        >
          {/* Bubbles */}
          <div className="absolute inset-0 pointer-events-none rounded-full overflow-visible">
            <div className="chatbot-bubble-particle" style={{ '--dx': '-24px', '--dy': '-24px', '--duration': '3.2s', '--delay': '0s', 'width': '8px', 'height': '8px' } as any} />
            <div className="chatbot-bubble-particle" style={{ '--dx': '24px', '--dy': '-28px', '--duration': '3.8s', '--delay': '0.6s', 'width': '11px', 'height': '11px' } as any} />
            <div className="chatbot-bubble-particle" style={{ '--dx': '-28px', '--dy': '20px', '--duration': '4.2s', '--delay': '1.2s', 'width': '7px', 'height': '7px' } as any} />
            <div className="chatbot-bubble-particle" style={{ '--dx': '20px', '--dy': '24px', '--duration': '3.0s', '--delay': '1.8s', 'width': '10px', 'height': '10px' } as any} />
            <div className="chatbot-bubble-particle" style={{ '--dx': '-10px', '--dy': '-36px', '--duration': '3.5s', '--delay': '2.4s', 'width': '6px', 'height': '6px' } as any} />
            <div className="chatbot-bubble-particle" style={{ '--dx': '30px', '--dy': '-10px', '--duration': '4.0s', '--delay': '3.0s', 'width': '12px', 'height': '12px' } as any} />
          </div>

          {/* Kogi Logo with Slow Spin */}
          <div className="size-11 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm border border-muted/50 animate-slow-spin">
            <img 
              src={mainLogo} 
              alt="Kogi State Logo" 
              className="w-full h-full object-contain rounded-full" 
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Notification Badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4 z-[10000]">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-black text-white items-center justify-center">1</span>
          </span>
        </button>
      </>
    );
  }

  return (
    <Card 
      className={`fixed right-6 z-[9999] transition-all duration-300 ease-in-out shadow-2xl border-border/50 flex flex-col overflow-hidden backdrop-blur-xl bg-background/95 ${
        isMinimized 
          ? 'bottom-6 w-72 h-16 cursor-pointer' 
          : 'bottom-6 w-96 h-[600px] max-h-[80vh]'
      }`}
    >
      <CardHeader 
        className="p-4 bg-gradient-to-r from-indigo-600/10 to-cyan-500/10 border-b border-border/50 flex flex-row items-center justify-between cursor-pointer"
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-8 rounded-full overflow-hidden border border-border/40 bg-white flex items-center justify-center shadow-sm">
              <img src={gduLogo} alt="GDU Logo" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -bottom-1 -right-1 size-3 bg-emerald-500 rounded-full border-2 border-background"></div>
          </div>
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-1">
              GDU Live Support <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-indigo-500/10 text-indigo-500">24/7</Badge>
            </CardTitle>
            {!isMinimized && <p className="text-[10px] text-muted-foreground">{activeConversationId ? "Connected to Support Desk" : "Secure channel"}</p>}
          </div>
        </div>
        {!isMinimized && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}>
              <Minimize2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7 text-red-500/70 hover:text-red-500 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}>
              <X className="size-4" />
            </Button>
          </div>
        )}
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex-1 overflow-y-auto p-0 flex flex-col relative">
          
          {!session ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <ShieldAlert className="size-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Please log in to access live support chat.</p>
            </div>
          ) : (
            <>
              {mode === 'details' && (
                <div className="flex-1 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-muted/50 p-4 rounded-xl border border-border">
                    <p className="text-sm">Welcome {session.role ? session.role : ''} <strong>{session.name}</strong>.</p>
                    <p className="text-xs text-muted-foreground mt-1">Please confirm your details before starting a support session.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><User className="size-3" /> Full Name</label>
                      <Input value={session.name} disabled className="bg-muted text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Briefcase className="size-3" /> MDA/Organization</label>
                      <Input value={session.mda || 'Not Assigned'} disabled className="bg-muted text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Mail className="size-3" /> Email</label>
                      <Input value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="Enter your email" className="text-sm" />
                    </div>
                    
                    <Button onClick={handleConfirmDetails} disabled={!emailInput} className="w-full mt-4">Confirm Details</Button>
                  </div>
                </div>
              )}

              {mode === 'issue' && (
                <div className="flex-1 p-5 space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-muted/50 p-4 rounded-xl border border-border">
                    <p className="text-sm">Please state your problem so our support team can assist you.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Issue Category *</label>
                      <select 
                        value={issueCategory} 
                        onChange={e => setIssueCategory(e.target.value)}
                        className="w-full flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Select Category</option>
                        <option value="Technical Error">Technical Error</option>
                        <option value="Account Access">Account Access</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Subject *</label>
                      <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief subject" className="text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Priority</label>
                      <select 
                        value={priority} 
                        onChange={e => setPriority(e.target.value)}
                        className="w-full flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Message *</label>
                      <textarea 
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Describe your issue in detail..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <Button onClick={handleSubmitIssue} disabled={!issueCategory || !subject || !inputText || isTyping} className="w-full mt-2">
                      {isTyping ? "Connecting..." : "Start Live Chat"}
                    </Button>
                  </div>
                </div>
              )}

              {mode === 'chat' && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.sender_type === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.sender_type === 'user' ? (
                          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                            <p className="text-sm">{msg.message_body}</p>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 max-w-[85%]">
                            <div className="size-6 shrink-0 rounded-full border border-border/40 bg-white flex items-center justify-center overflow-hidden mt-1 shadow-sm">
                              <img src={gduLogo} alt="GDU Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-muted-foreground ml-1 font-semibold">{msg.sender_type === 'system' ? 'System' : 'Support Desk'}</span>
                              <div className={`px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm border ${msg.sender_type === 'system' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200' : 'bg-muted border-border/50'}`}>
                                <p className="text-sm text-foreground/90 leading-relaxed">{msg.message_body}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <span className="text-[9px] text-muted-foreground mt-1 mx-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-3 bg-muted/20 border-t border-border/50">
                    <div className="relative flex items-center bg-background border border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-full px-2 py-1 shadow-sm transition-all">
                      <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground hover:bg-muted shrink-0">
                        <Paperclip className="size-4" />
                      </Button>
                      <input 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none outline-none text-sm px-2 placeholder:text-muted-foreground"
                      />
                      <Button 
                        size="icon" 
                        className="size-8 rounded-full shrink-0 transition-transform active:scale-95 bg-primary hover:bg-primary/90"
                        onClick={handleSendMessage}
                        disabled={!inputText.trim()}
                      >
                        <Send className="size-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

        </CardContent>
      )}
    </Card>
  );
}
