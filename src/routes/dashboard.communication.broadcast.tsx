import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Megaphone, Send, Users, Activity, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/communication/broadcast')({
  component: BroadcastMessagesComponent,
})

const PAST_BROADCASTS = [
  { id: 'b1', title: 'State Address: Q3 Development Plan Review', audience: 'All Government Officials', date: 'Yesterday, 04:00 PM', delivered: 1250, read: 1102, status: 'Completed' },
  { id: 'b2', title: 'Urgent: Security Briefing Update', audience: 'Executive Council & Security Chiefs', date: 'Mon, 09:15 AM', delivered: 45, read: 45, status: 'Completed' },
  { id: 'b3', title: 'System Maintenance Downtime', audience: 'All System Users', date: 'Last Friday', delivered: 1400, read: 980, status: 'Completed' },
];

function BroadcastMessagesComponent() {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('All Government Officials');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleBroadcast = () => {
    if (!title || !message) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setTitle('');
      setMessage('');
    }, 3000);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Broadcast Messages</h1>
        <p className="text-muted-foreground mt-1">Send official, high-priority announcements to targeted groups.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Compose Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/5">
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="size-5 text-primary" />
                Compose Broadcast
              </CardTitle>
              <CardDescription>Messages sent here will trigger push notifications to the selected audience.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                  <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="size-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold">Broadcast Sent Successfully</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">Your message is being delivered to {audience}. You can track engagement in the logs shortly.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Broadcast Title / Subject</Label>
                    <Input 
                      placeholder="e.g. Mandatory Security Briefing" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-muted/10 border-border/60" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Target Audience</Label>
                    <select 
                      className="w-full p-2 bg-muted/10 border border-border/60 rounded-md text-sm focus:ring-1 focus:ring-primary"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                    >
                      <option>All Government Officials</option>
                      <option>Executive Council</option>
                      <option>All Commissioners</option>
                      <option>Ministry of Health</option>
                      <option>Custom List...</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Message Content</Label>
                    <Textarea 
                      placeholder="Type your official announcement here..." 
                      className="min-h-[250px] bg-muted/10 border-border/60 resize-y"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">Warning:</span> Broadcasts cannot be unsent.
                    </p>
                    <Button onClick={handleBroadcast} disabled={!title || !message} className="gap-2">
                      <Send className="size-4" />
                      Send Broadcast
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats & History Area */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-border/60 bg-primary/5">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                <Activity className="size-5 text-primary mb-1" />
                <h4 className="text-2xl font-bold">12</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">This Month</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-emerald-500/5">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                <Eye className="size-5 text-emerald-600 mb-1" />
                <h4 className="text-2xl font-bold">94%</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Avg Read Rate</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 shadow-sm flex-1">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg">Recent Broadcasts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {PAST_BROADCASTS.map(log => (
                  <div key={log.id} className="p-4 hover:bg-muted/10 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm line-clamp-1">{log.title}</h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{log.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <Users className="size-3" />
                      <span>{log.audience}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-blue-500" />
                        <span>{log.delivered.toLocaleString()} Delivered</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span>{log.read.toLocaleString()} Read</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border/50 text-center">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">View All Logs</Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
