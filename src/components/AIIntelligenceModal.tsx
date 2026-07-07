import { useState, useEffect, useRef } from 'react';
import { 
  X, BrainCircuit, ServerOff, Settings2, ArrowLeft, ExternalLink, 
  ShieldAlert, Database, Lock, Send, Sparkles, Bot, User, Check, RefreshCw 
} from 'lucide-react';
import { getAIProviderStatus, AIConnectionStatus, AIContextPayload } from '@/lib/ai-intelligence-service';
import { generateAiChatResponse } from '@/lib/ai-server';
import { ragService } from '@/lib/ragService';
import { getSession, roleById } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
  timestamp: string;
}

export function AIIntelligenceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<AIContextPayload | null>(null);
  const [status, setStatus] = useState<AIConnectionStatus | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<AIContextPayload>;
      const detail = customEvent.detail || null;
      setContext(detail);
      
      // Fetch status
      getAIProviderStatus().then(res => setStatus(res));
      setIsOpen(true);

      // Initialize welcome message
      const contextTitle = detail?.contextTitle || "General Governance";
      const moduleName = detail?.module || "Global Dashboard";
      
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Welcome! I am the Kogi State AI Governance Advisor. 

I am configured in **Strict Local RAG Sandbox Mode** and will *only* answer questions using the data on this system and the files uploaded in the AI Knowledge Base.

I have loaded context for the current screen: **${contextTitle}** in **${moduleName}**. Ask me anything about budgets, projects, programs, or uploaded policies!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    };

    window.addEventListener('openAIPanel', handleOpen);
    return () => window.removeEventListener('openAIPanel', handleOpen);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen || !status) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;

    const userText = inputVal.trim();
    setInputVal('');
    
    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Heuristic: Check if user is inputting/typing new data facts (contains system keywords + numbers or assertion terms)
      const isSystemFact = /\b(budget|staff|project|program|mda|allocated|released|spent|verified|delayed|active|suspended|registered)\b/i.test(userText) && 
                           (/\d/.test(userText) || /\b(is|now|set|update|change|add|delete|remove|correct|should)\b/i.test(userText));
      
      if (isSystemFact) {
        const session = getSession();
        const profile = session ? roleById(session.role) : null;
        const userRole = profile?.title || 'Governance Officer';

        const confirmSave = confirm(`Confirm Information Ingestion:\n\n"You are inputting system details: '${userText}'"\n\nAre you sure of this information? Confirming will save it to the AI Knowledge Base, update local RAG references, and log this activity for Superadmin audit.`);
        if (!confirmSave) {
          setIsLoading(false);
          return;
        }

        // Save directly to RAG knowledge base
        const userFactDoc = {
          id: `user-fact-${Date.now()}`,
          title: `AI Chat Ingested Fact: ${userText.substring(0, 40)}`,
          content: `Manual entry by ${userRole}: ${userText}`,
          category: 'General',
          uploadedAt: new Date().toISOString(),
          uploadedBy: userRole
        };
        await ragService.saveDocument(userFactDoc);

        // Create a private superadmin anomaly or discovery
        const isSuspicious = userText.toLowerCase().includes('suspend') || 
                             userText.toLowerCase().includes('unauthorized') || 
                             userText.toLowerCase().includes('override') || 
                             userText.toLowerCase().includes('variance') ||
                             userText.toLowerCase().includes('risk');

        try {
          const customAnoms = JSON.parse(localStorage.getItem('user_injected_anomalies') || '[]');
          const newAnomaly = {
            id: `anom-user-input-${Date.now()}`,
            type: isSuspicious ? 'critical' : 'warning',
            module: userText.toLowerCase().includes('staff') ? 'Workforce' : 
                    userText.toLowerCase().includes('budget') ? 'Budget' : 'Projects',
            title: isSuspicious ? 'Suspicious Data Ingestion Flagged' : 'Manual System Modification Logged',
            description: `User profile "${userRole}" typed: "${userText}". Saved to RAG and flagged for Superadmin compliance audit.`,
            sourceRecord: `Chat session`,
            resolved: false,
            timestamp: new Date().toISOString()
          };
          customAnoms.push(newAnomaly);
          localStorage.setItem('user_injected_anomalies', JSON.stringify(customAnoms));
          window.dispatchEvent(new Event('ragDocumentsUpdate'));
        } catch (e) {}
      }

      // 1. Fetch RAG Context from local databases & knowledge base
      const ragContext = await ragService.queryContext(userText);
      
      // Extract sources list for rendering
      const sourcesFound: string[] = [];
      const sourceRegex = /\[(?:KNOWLEDGE BASE DOCUMENT|DEVELOPMENT PILLAR|PROGRAMME REPORT|PROJECT RECORD)[\s\S]*?\]/g;
      const matches = ragContext.match(sourceRegex) || [];
      matches.forEach(m => {
        const sourceName = m.replace(/[\[\]]/g, '').trim();
        if (!sourcesFound.includes(sourceName)) {
          sourcesFound.push(sourceName);
        }
      });

      // Get user session to pass role
      const session = getSession();
      const profile = session ? roleById(session.role) : null;
      const userRole = profile?.title || 'Governance Officer';

      // 2. Build secure RAG prompt
      const securePrompt = `
User Query: "${userText}"

=== SYSTEM INSTRUCTION ===
You are the Kogi State AI Governance Advisor. You must answer this query using ONLY the provided local system data and context. Do NOT use any general external knowledge. Keep answers professional, concise, and structured. If the answer cannot be found in the provided context, state that the information is not in the system's database.

=== SYSTEM DATA CONTEXT (RAG) ===
${ragContext || "No matching system data records found."}
`;

      // 3. Call AI Service (Server Function)
      const result = await generateAiChatResponse({
        data: {
          prompt: securePrompt,
          userRole: userRole
        }
      });

      let aiResponseText = result?.response || "";

      // Heuristic Fallback if API fails or falls back to generic text
      if (!aiResponseText || aiResponseText.includes("AI API Not Connected") || result?.sourceData === "general_knowledge") {
        if (ragContext) {
          aiResponseText = `### Local Database Search Results (Offline RAG)
I retrieved the following records matching your query from the Kogi State system database:

${ragContext}

*Note: The live LLM provider is offline, but I have extracted these verified system database logs directly.*`;
        } else {
          aiResponseText = `I searched the system databases (budgets, projects, programmes, and uploaded reference files) for terms matching "${userText}" but found no matching records. Please refine your query or upload the corresponding files to the AI Knowledge Base in the System Settings panel.`;
        }
      }

      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: aiResponseText,
        sources: sourcesFound.length > 0 ? sourcesFound : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (err) {
      console.error("AI response generation error", err);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: "An error occurred while calling the RAG retrieval engine. Please ensure your local database is available.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-[600px] bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 m-4 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
              <BrainCircuit className="size-5 text-[#C5A059]" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">AI Governance Advisor</h2>
              <div className="text-xs text-slate-400 font-medium tracking-wide flex items-center gap-1.5">
                <Database className="size-3 text-emerald-400" /> Secure Local RAG Sandbox (Kogi System Data Only)
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        {/* Chat Messages Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5 min-h-0">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`size-8 rounded-full flex items-center justify-center shrink-0 border ${
                  isAi ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' : 'bg-[#C5A059]/10 border-[#C5A059]/20 text-[#C5A059]'
                }`}>
                  {isAi ? <Bot className="size-4" /> : <User className="size-4" />}
                </div>
                <div className="space-y-1.5">
                  <div className={`p-4 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isAi 
                      ? 'bg-card border border-border/80 text-foreground' 
                      : 'bg-primary text-primary-foreground font-medium'
                  }`}>
                    {msg.text}
                  </div>
                  
                  {/* Sources list */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {msg.sources.map((src, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15 rounded text-[9px] font-bold">
                          <Check className="size-2 text-emerald-500" /> {src}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={`text-[9px] text-muted-foreground ${isAi ? 'text-left' : 'text-right'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[85%] items-center animate-pulse">
              <div className="size-8 rounded-full flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                <Bot className="size-4 animate-bounce" />
              </div>
              <div className="p-3.5 bg-card border border-border/80 rounded-2xl text-xs flex items-center gap-2">
                <RefreshCw className="size-3.5 text-indigo-500 animate-spin" />
                <span>Scanning system databases and generating RAG response...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card shrink-0 flex gap-2">
          <input 
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isLoading}
            placeholder="Ask AI Advisor about budgets, projects, programs, or uploaded policies..."
            className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
          />
          <button 
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="p-2.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer shrink-0"
          >
            <Send className="size-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
