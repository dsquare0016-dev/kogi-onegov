import { dbGetChatGroups, dbGetMessages, dbSendMessage } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, Paperclip, MoreVertical, Users, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/communication/group-messages')({
  component: GroupMessagesComponent,
})

const GROUPS = [
  { id: 'g1', name: 'Executive Council', members: 12, unread: 5, lastMessage: 'The governor will join shortly.', time: '11:05 AM' },
  { id: 'g2', name: 'Budget Taskforce 2026', members: 8, unread: 0, lastMessage: 'Final revisions have been submitted.', time: 'Yesterday' },
  { id: 'g3', name: 'Health Sector Reform', members: 24, unread: 12, lastMessage: 'Please review the new policy draft.', time: '08:30 AM' },
  { id: 'g4', name: 'ICT Infrastructure Team', members: 15, unread: 0, lastMessage: 'Server migration successful.', time: 'Monday' },
  { id: 'g5', name: 'Emergency Response Unit', members: 30, unread: 0, lastMessage: 'All clear on the recent flood warnings.', time: 'Last week' },
];

const MESSAGES = [
  { id: 'm1', senderId: 'sys', text: 'Dr. Usman Ahmed joined the group.', time: '10:00 AM', type: 'system' },
  { id: 'm2', senderId: 'user2', senderName: 'Hon. Yusuf Ali', role: 'Chief of Staff', text: 'Welcome everyone. We need to align on the upcoming state address.', time: '10:05 AM', type: 'message', isMe: false },
  { id: 'm3', senderId: 'me', senderName: 'You', text: 'I have the initial draft ready for review. I will send it to this group shortly.', time: '10:12 AM', type: 'message', isMe: true },
  { id: 'm4', senderId: 'user3', senderName: 'Amina Bello', role: 'Head of ICT', text: 'I will ensure the presentation systems in the council chambers are prepped for tomorrow.', time: '10:15 AM', type: 'message', isMe: false },
  { id: 'm5', senderId: 'user2', senderName: 'Hon. Yusuf Ali', role: 'Chief of Staff', text: 'The governor will join shortly.', time: '11:05 AM', type: 'message', isMe: false },
];

function GroupMessagesComponent() {
  const session = getSession();
  const [groups, setGroups] = useState<any[]>(GROUPS);
  const [activeGroupId, setActiveGroupId] = useState('g1');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MESSAGES);

  const activeGroup = groups.find(g => g.id === activeGroupId);

  // Load chat groups
  useEffect(() => {
    async function loadGroups() {
      try {
        
        const list = await dbGetChatGroups();
        if (list && list.length > 0) {
          setGroups(list);
          setActiveGroupId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load chat groups from Postgres:", err);
      }
    }
    loadGroups();
  }, []);

  // Load messages for active group
  useEffect(() => {
    async function loadGroupChat() {
      if (!session?.email) return;
      try {
        
        const dbM = await dbGetMessages({
          data: {
            email: session.email,
            threadId: activeGroupId
          }
        });
        if (dbM && dbM.length > 0) {
          setMessages(dbM.map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.senderName || 'Staff',
            role: m.senderRole || 'Official',
            text: m.text,
            time: m.time,
            type: 'message' as const,
            isMe: m.isMe
          })));
        } else {
          setMessages([
            { id: 'welcome', senderId: 'sys', text: 'This is the start of this group chat thread.', time: '', type: 'system' }
          ]);
        }
      } catch (err) {
        console.error("Failed to load group messages:", err);
      }
    }
    loadGroupChat();
  }, [activeGroupId, session?.email]);

  const handleSend = async () => {
    if (!message.trim() || !session?.email) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      senderName: 'You',
      role: 'You',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'message' as const,
      isMe: true
    };
    setMessages(prev => [...prev, newMsg]);
    const txt = message;
    setMessage('');

    try {
      
      await dbSendMessage({
        data: {
          email: session.email,
          threadId: activeGroupId,
          text: txt
        }
      });
    } catch (err) {
      console.error("Failed to send group message:", err);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-[calc(100vh-172px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Group Messages</h1>
        <p className="text-muted-foreground mt-1">Collaborate with multiple officials in secure channels.</p>
      </div>

      <Card className="flex-1 border-border/60 shadow-sm flex overflow-hidden min-h-0">
        {/* Left Sidebar - Group List */}
        <div className="w-80 border-r border-border/50 flex flex-col bg-muted/10">
          <div className="p-4 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input placeholder="Search groups..." className="pl-9 bg-background" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {groups.map(group => (
              <div 
                key={group.id}
                onClick={() => setActiveGroupId(group.id)}
                className={`p-4 border-b border-border/30 cursor-pointer transition-colors hover:bg-muted/50 ${activeGroupId === group.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 border border-border/50 bg-background flex items-center justify-center">
                    <Users className="size-5 text-muted-foreground" />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className={`text-sm truncate ${group.unread > 0 ? 'font-bold text-foreground' : 'font-semibold text-foreground/80'}`}>{group.name}</h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{group.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate ${group.unread > 0 ? 'font-medium text-foreground/90' : 'text-muted-foreground'}`}>{group.lastMessage}</p>
                      {group.unread > 0 && (
                        <span className="ml-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                          {group.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Area - Chat Window */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Chat Header */}
          {activeGroup ? (
            <>
              <div className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 border border-border/50 bg-background flex items-center justify-center">
                    <Users className="size-5 text-primary" />
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{activeGroup.name}</h3>
                    <p className="text-xs text-muted-foreground">{activeGroup.members} Members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Search className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5">
                <div className="text-center text-xs text-muted-foreground my-4 font-medium">
                  <span className="bg-background px-3 py-1 rounded-full border shadow-sm">Today</span>
                </div>
                
                {messages.map((msg) => {
                  if (msg.type === 'system') {
                    return (
                      <div key={msg.id} className="flex justify-center my-4">
                        <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">{msg.text}</span>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex flex-col gap-1 max-w-[70%]">
                        {!msg.isMe && (
                          <div className="flex items-baseline gap-2 ml-1">
                            <span className="text-xs font-semibold">{msg.senderName}</span>
                            <span className="text-[10px] text-muted-foreground">{msg.role}</span>
                          </div>
                        )}
                        <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${msg.isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border/50 text-card-foreground rounded-tl-sm'}`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${msg.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {msg.time}
                            {msg.isMe && <CheckCheck className="size-3" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-card border-t border-border/50">
                <div className="flex items-center gap-2 bg-muted/30 rounded-full border border-border/50 p-1 pl-4 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                  <Input 
                    placeholder={`Message ${activeGroup.name}...`} 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
                  />
                  <div className="flex items-center gap-1 pr-1">
                    <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground hover:text-foreground">
                      <Paperclip className="size-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      onClick={handleSend}
                      className="size-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95"
                    >
                      <Send className="size-3.5 ml-0.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Users className="size-12 mb-4 opacity-20" />
              <p>Select a group to start messaging</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
