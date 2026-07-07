import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCircuit, Search, Send, Sparkles, AlertTriangle, TrendingUp, Filter, MessageSquare, PieChart } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/budget/intel/ai')({
  component: AIBudgetAssistantPage,
});

function AIBudgetAssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome, Honorable Commissioner. I am the Antigravity Budget Intelligence Core. I can forecast revenues, detect fiscal anomalies, and instantly compare MDA performances. What would you like to know today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);
    
    setTimeout(() => {
       setIsTyping(false);
       setMessages(prev => [...prev, { 
         role: 'assistant', 
         content: 'Based on my analysis of the FY26 database, the Ministry of Health is currently executing at 86%. However, I have detected a ₦2.4B leakage risk in their overhead spending pattern. Would you like me to draft an executive query memo to the Permanent Secretary?' 
       }]);
    }, 1500);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 h-[calc(100vh-172px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Budget Assistant</h1>
        <p className="text-muted-foreground mt-1">
          Interact with the intelligence core to forecast outcomes, detect leakages, and generate contextual insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
         {/* Main Chat Interface */}
         <Card className="lg:col-span-3 border-border/60 shadow-sm flex flex-col h-full bg-muted/5">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                     <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-indigo-500/20 text-indigo-500'}`}>
                        {msg.role === 'user' ? <div className="font-bold text-sm">Gov</div> : <BrainCircuit className="size-5" />}
                     </div>
                     <div className={`p-4 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border/50 shadow-sm'}`}>
                        {msg.content}
                     </div>
                  </div>
               ))}
               {isTyping && (
                 <div className="flex gap-4 max-w-[80%]">
                    <div className="size-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                       <BrainCircuit className="size-5" />
                    </div>
                    <div className="p-4 rounded-xl bg-background border border-border/50 shadow-sm flex items-center gap-2">
                       <div className="size-2 bg-indigo-500 rounded-full animate-bounce" />
                       <div className="size-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                       <div className="size-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                 </div>
               )}
            </div>
            
            <div className="p-4 border-t border-border/50 bg-background">
               <div className="flex gap-2 relative">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about budget leakages, revenue forecasts, or MDA rankings..." 
                    className="flex-1 bg-muted/50 border border-border rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                  >
                     <Send className="size-4" />
                  </button>
               </div>
               <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    'Which ministry utilized its budget best?',
                    'Which projects are behind schedule?',
                    'What is the performance of the Ministry of Health?',
                    'Which LGA received the highest allocation?'
                  ].map((suggestion, i) => (
                    <button 
                       key={i} 
                       onClick={() => setInput(suggestion)}
                       className="whitespace-nowrap px-3 py-1.5 bg-muted/50 border border-border/50 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                    >
                       <Sparkles className="size-3 text-indigo-500" /> {suggestion}
                    </button>
                  ))}
               </div>
            </div>
         </Card>

         {/* Contextual Intelligence Sidebar */}
         <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 text-sm font-bold text-indigo-400 flex flex-col gap-2 shadow-sm">
               <div className="flex items-center gap-2"><Sparkles className="size-4"/> Active Context</div>
               <div className="text-xs font-normal text-muted-foreground">The AI is currently analyzing data from the FY26 Master Budget (₦250B) and live expenditure tables.</div>
            </div>

            <Card className="border-border/60 shadow-sm">
               <CardContent className="p-4 space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2"><AlertTriangle className="size-4"/> Detected Anomalies</h3>
                  <div className="space-y-3">
                     <div className="p-3 bg-destructive/5 border border-destructive/10 rounded">
                        <div className="font-bold text-sm text-destructive mb-1">Min. of Agriculture</div>
                        <div className="text-xs text-foreground/80">Recurrent overhead spending is 45% above Q3 projections.</div>
                     </div>
                     <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded">
                        <div className="font-bold text-sm text-amber-600 mb-1">State Secretariat Project</div>
                        <div className="text-xs text-foreground/80">Contractor mobilization paid, but 0% milestone progress recorded.</div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
               <CardContent className="p-4 space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2"><TrendingUp className="size-4"/> Forecasts</h3>
                  <div className="space-y-3">
                     <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded">
                        <div className="font-bold text-sm text-emerald-600 mb-1">Revenue Surplus</div>
                        <div className="text-xs text-foreground/80">VAT collection is trending to beat annual estimates by ₦4.2B.</div>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
