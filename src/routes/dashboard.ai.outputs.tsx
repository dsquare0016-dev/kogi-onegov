import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bot, Send, User, Search, Filter, MessageSquare, 
  Clock, AlertCircle, CheckCircle2, Phone, MoreVertical, Paperclip, ShieldAlert
} from 'lucide-react';

export const Route = createFileRoute('/dashboard/ai/outputs')({
  component: ChatbotManagementConsole,
});

interface ChatMessage {
  id: number;
  text: string;
  sender: 'ai' | 'user' | 'admin';
  timestamp: string;
}

interface Conversation {
  id: string;
  user: string;
  role: string;
  department: string;
  status: 'AI Handling' | 'Requires Human' | 'Escalated to GDU';
  lastActivity: string;
  messages: ChatMessage[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "CHAT-9921",
    user: "Dr. Usman Ahmed",
    role: "Director of Medical Services",
    department: "Ministry of Health",
    status: "Requires Human",
    lastActivity: "2 mins ago",
    messages: [
      { id: 1, text: "I need to check the status of the supplementary budget approval for the new MRI machines at the Specialist Hospital.", sender: 'user', timestamp: '10:41 AM' },
      { id: 2, text: "The supplementary budget for the Specialist Hospital MRI machines is currently marked as 'Pending Director Review' in the Budget Control module. Would you like me to flag this for urgent review?", sender: 'ai', timestamp: '10:41 AM' },
      { id: 3, text: "Yes, please. It has been pending for 3 weeks and we have patients waiting.", sender: 'user', timestamp: '10:42 AM' },
      { id: 4, text: "I have flagged this request. Since this involves critical infrastructure delays, I am transferring this conversation to a GDU Desk Officer for immediate assistance.", sender: 'ai', timestamp: '10:42 AM' }
    ]
  },
  {
    id: "CHAT-9920",
    user: "Amina Bello",
    role: "Project Inspector",
    department: "Ministry of Works",
    status: "AI Handling",
    lastActivity: "15 mins ago",
    messages: [
      { id: 1, text: "How do I upload the site photos for the Lokoja Road Project?", sender: 'user', timestamp: '10:25 AM' },
      { id: 2, text: "You can upload site photos by navigating to 'Projects & Programmes' > 'Project Locations'. Select the Lokoja Road Project, click 'Update Status', and use the attachment tool to upload your photos.", sender: 'ai', timestamp: '10:25 AM' },
      { id: 3, text: "Thank you.", sender: 'user', timestamp: '10:26 AM' }
    ]
  },
  {
    id: "CHAT-9918",
    user: "Chief Samuel Ojo",
    role: "Permanent Secretary",
    department: "Ministry of Education",
    status: "Escalated to GDU",
    lastActivity: "1 hour ago",
    messages: [
      { id: 1, text: "The Q3 budget allocation figures for rural schools seem incorrect on my dashboard. They are showing zero.", sender: 'user', timestamp: '09:15 AM' },
      { id: 2, text: "Let me check the database. I am seeing an active freeze on Q3 disbursements for rural schools pending the completion of the Q2 audit.", sender: 'ai', timestamp: '09:15 AM' },
      { id: 3, text: "That audit was completed yesterday. Who can unlock it?", sender: 'user', timestamp: '09:16 AM' },
      { id: 4, text: "The block requires clearance from the GDU Command Center. I am escalating this chat to an officer now.", sender: 'ai', timestamp: '09:16 AM' }
    ]
  }
];

function ChatbotManagementConsole() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<string>(MOCK_CONVERSATIONS[0].id);
  const [inputText, setInputText] = useState('');
  const [showChat, setShowChat] = useState(false); // mobile: false = list, true = chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = conversations.find(c => c.id === activeChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setShowChat(true); // on mobile: switch to chat panel
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChat) return;

    const newMsg: ChatMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'admin',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        return { 
          ...c, 
          messages: [...c.messages, newMsg],
          status: 'Escalated to GDU',
          lastActivity: 'Just now'
        };
      }
      return c;
    }));
    setInputText('');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'AI Handling': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Requires Human': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse';
      case 'Escalated to GDU': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      default: return 'bg-muted text-muted-foreground border-border/50';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto flex flex-col pb-6" style={{ height: 'calc(100dvh - 60px)' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-border/50 pb-4 mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 text-indigo-500 mb-1">
             <Bot className="size-5" />
             <span className="font-black uppercase tracking-[0.2em] text-xs sm:text-sm">Chatbot Command Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Live Chat Desk</h1>
          <p className="text-muted-foreground mt-1 text-sm hidden sm:block">Monitor live AI conversations and intervene when human assistance is required.</p>
        </div>
      </div>

      {/* Main UI */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-h-0">
        
        {/* Left Panel: Conversations List — hidden on mobile when chat is open */}
        <Card className={`lg:col-span-4 border-border/60 shadow-xl flex flex-col overflow-hidden bg-card/50 backdrop-blur-xl ${showChat ? 'hidden lg:flex' : 'flex'}`}>
          <CardHeader className="border-b border-border/50 bg-muted/10 p-4 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search users or ticket IDs..." 
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border/50 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" 
              />
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 cursor-pointer">Needs Human (1)</Badge>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-pointer">AI Handled (12)</Badge>
            </div>
          </CardHeader>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {conversations.map(chat => {
              const isActive = activeChatId === chat.id;
              return (
                <div 
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500/10 to-transparent border-indigo-500/30 shadow-sm' 
                      : 'bg-transparent border-transparent hover:bg-muted/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold truncate pr-2 ${isActive ? 'text-indigo-500' : 'text-foreground'}`}>{chat.user}</h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{chat.lastActivity}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2 truncate">
                    {chat.role} • {chat.department}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline" className={`text-[9px] uppercase tracking-wider ${getStatusColor(chat.status)}`}>
                      {chat.status}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground opacity-50">{chat.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Panel: Active Chat Window — hidden on mobile when list is shown */}
        {activeChat ? (
          <Card className={`lg:col-span-8 border-border/60 shadow-xl flex-col overflow-hidden bg-card/50 backdrop-blur-xl relative ${showChat ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* Chat Header */}
            <CardHeader className="border-b border-border/50 bg-muted/10 p-3 sm:p-4 shrink-0 flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                {/* Mobile: back button */}
                <button 
                  onClick={() => setShowChat(false)}
                  className="lg:hidden shrink-0 p-1.5 rounded-lg bg-muted hover:bg-accent text-foreground transition-colors"
                  aria-label="Back to conversations"
                >
                  ← 
                </button>
                <div className="size-9 sm:size-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg text-white font-bold text-base sm:text-lg shrink-0">
                  {activeChat.user.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-lg leading-tight truncate">{activeChat.user}</h3>
                  <div className="flex items-center gap-1 sm:gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground truncate">{activeChat.role}</span>
                    <span className="text-xs text-muted-foreground opacity-50 hidden sm:inline">•</span>
                    <span className="text-xs text-muted-foreground truncate hidden sm:inline">{activeChat.department}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs h-8 hidden sm:flex"><Phone className="size-3" /> Call User</Button>
                <Button variant="outline" size="icon" className="size-8"><MoreVertical className="size-4" /></Button>
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
              
              <div className="text-center">
                <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border/50 text-[10px] font-normal px-3 py-1">
                  Conversation started today
                </Badge>
              </div>

              {activeChat.messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isAI = msg.sender === 'ai';
                const isAdmin = msg.sender === 'admin';

                return (
                  <div key={msg.id} className={`flex items-end gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    
                    {!isUser && (
                      <div className={`size-7 sm:size-8 shrink-0 rounded-full flex items-center justify-center shadow-sm ${
                        isAI ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/30' : 'bg-emerald-500 text-white shadow-emerald-500/20'
                      }`}>
                        {isAI ? <Bot className="size-3.5 sm:size-4" /> : <ShieldAlert className="size-3.5 sm:size-4" />}
                      </div>
                    )}

                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%]`}>
                      
                      {!isUser && (
                        <span className="text-[10px] font-bold text-muted-foreground mb-1 ml-1 uppercase tracking-wider">
                          {isAI ? 'Chatbot' : 'GDU Officer (You)'}
                        </span>
                      )}

                      <div className={`p-3 sm:p-3.5 rounded-2xl shadow-sm text-sm ${
                        isUser 
                          ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-br-sm' 
                          : isAdmin
                            ? 'bg-gradient-to-br from-emerald-600 to-teal-500 text-white rounded-bl-sm'
                            : 'bg-card border border-border/50 rounded-bl-sm'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                        {isUser && <CheckCircle2 className="size-3 text-indigo-500" />}
                      </div>
                    </div>

                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Chat Input Area */}
            <div className="p-3 sm:p-4 bg-muted/10 border-t border-border/50 shrink-0">
               {activeChat.status === 'Requires Human' && (
                  <div className="mb-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2 text-amber-500 text-xs font-medium">
                    <AlertCircle className="size-4 shrink-0" />
                    User is waiting for human intervention.
                  </div>
               )}
               <div className="flex items-end gap-2">
                 <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground h-10 w-10 rounded-xl hidden sm:flex">
                   <Paperclip className="size-5" />
                 </Button>
                 <div className="flex-1 relative">
                   <textarea 
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSendMessage();
                       }
                     }}
                     placeholder="Type a response..."
                     className="w-full bg-background border border-border/50 rounded-xl py-2.5 sm:py-3 pl-3 sm:pl-4 pr-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar"
                     rows={1}
                   />
                 </div>
                 <Button 
                   onClick={handleSendMessage}
                   disabled={!inputText.trim()}
                   className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all p-0 flex items-center justify-center disabled:opacity-50"
                 >
                   <Send className="size-4 sm:size-5 text-white" />
                 </Button>
               </div>
               <p className="text-center mt-2 text-[10px] text-muted-foreground hidden sm:block">Press Enter to send, Shift+Enter for new line.</p>
            </div>
          </Card>
        ) : (
          <Card className={`lg:col-span-8 border-border/60 shadow-xl items-center justify-center bg-card/50 backdrop-blur-xl ${showChat ? 'flex' : 'hidden lg:flex'}`}>
            <div className="text-center opacity-50">
              <MessageSquare className="size-16 mx-auto mb-4 opacity-20" />
              <h2 className="text-xl font-bold">No Conversation Selected</h2>
              <p className="text-sm mt-1">Select an active chat from the left to view details.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
