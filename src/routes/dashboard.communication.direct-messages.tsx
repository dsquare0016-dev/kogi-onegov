import { getNominalRollList, dbGetMessages, dbSendMessage } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, Paperclip, MoreVertical, CheckCheck, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/communication/direct-messages')({
  component: DirectMessagesComponent,
})

const CONTACTS = [
  { id: '1', name: 'Dr. Usman Ahmed', role: 'Commissioner of Health', unread: 2, online: true, lastMessage: 'The new hospital beds have arrived.', time: '10:42 AM' },
  { id: '2', name: 'Engr. Sarah Ochu', role: 'Director of Works', unread: 0, online: false, lastMessage: 'Site inspection completed.', time: 'Yesterday' },
  { id: '3', name: 'Hon. Yusuf Ali', role: 'Chief of Staff', unread: 5, online: true, lastMessage: 'Please review the executive brief.', time: '09:15 AM' },
  { id: '4', name: 'Amina Bello', role: 'Head of ICT', unread: 0, online: true, lastMessage: 'Server maintenance scheduled for midnight.', time: 'Monday' },
  { id: '5', name: 'Dr. Halima Musa', role: 'Commissioner of Education', unread: 0, online: false, lastMessage: 'School renovation plans approved.', time: 'Last week' },
];

const MESSAGES = [
  { id: 'm1', senderId: '1', text: 'Good morning. Have we received the latest shipment of medical supplies for the Lokoja General Hospital?', time: '10:30 AM', isMe: false },
  { id: 'm2', senderId: 'me', text: 'Yes, Commissioner. They arrived earlier this morning. The inventory team is logging them into the system right now.', time: '10:35 AM', isMe: true },
  { id: 'm3', senderId: '1', text: 'Excellent. Please ensure the surgical kits are prioritized.', time: '10:38 AM', isMe: false },
  { id: 'm4', senderId: 'me', text: 'Will do. I will send you the confirmation report once the kits are disbursed to the wards.', time: '10:40 AM', isMe: true },
  { id: 'm5', senderId: '1', text: 'The new hospital beds have arrived.', time: '10:42 AM', isMe: false },
];

function DirectMessagesComponent() {
  const session = getSession();
  const [contacts, setContacts] = useState<any[]>(CONTACTS);
  const [activeContactId, setActiveContactId] = useState('1');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MESSAGES);

  const activeContact = contacts.find(c => c.id === activeContactId);

  // Load contacts from nominal roll
  useEffect(() => {
    async function loadContacts() {
      try {
        
        const list = await getNominalRollList();
        if (list && list.length > 0) {
          const mapped = list
            .filter((c: any) => c.email !== session?.email) // exclude self
            .map((c: any) => ({
              id: c.staffId,
              email: c.email,
              name: c.fullName,
              role: c.presentAppointment || c.staffType || 'Official',
              unread: 0,
              online: Math.random() > 0.5,
              lastMessage: 'Tap to start conversation',
              time: ''
            }));
          if (mapped.length > 0) {
            setContacts(mapped);
            setActiveContactId(mapped[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load contacts from Postgres:", err);
      }
    }
    loadContacts();
  }, [session?.email]);

  // Load chat messages when activeContactId changes
  useEffect(() => {
    async function loadChat() {
      const activeContact = contacts.find(c => c.id === activeContactId);
      if (!activeContact || !session?.email) return;

      try {
        
        const dbM = await dbGetMessages({
          data: {
            email: session.email,
            receiverEmailOrId: activeContact.email
          }
        });
        if (dbM && dbM.length > 0) {
          setMessages(dbM);
        } else {
          setMessages([
            { id: 'welcome', senderId: activeContact.id, text: `This is the start of your secure chat history with ${activeContact.name}.`, time: '', isMe: false }
          ]);
        }
      } catch (err) {
        console.error("Failed to load chat messages:", err);
      }
    }
    loadChat();
  }, [activeContactId, contacts, session?.email]);

  const handleSend = async () => {
    if (!message.trim() || !session?.email) return;
    const activeContact = contacts.find(c => c.id === activeContactId);
    if (!activeContact) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages(prev => [...prev, newMsg]);
    const txt = message;
    setMessage('');

    try {
      
      await dbSendMessage({
        data: {
          email: session.email,
          receiverEmailOrId: activeContact.email,
          text: txt
        }
      });
    } catch (err) {
      console.error("Failed to send message to database:", err);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-[calc(100vh-172px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Direct Messages</h1>
        <p className="text-muted-foreground mt-1">Secure, end-to-end encrypted communication for state officials.</p>
      </div>

      <Card className="flex-1 border-border/60 shadow-sm flex overflow-hidden min-h-0">
        {/* Left Sidebar - Contact List */}
        <div className="w-80 border-r border-border/50 flex flex-col bg-muted/10">
          <div className="p-4 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input placeholder="Search officials..." className="pl-9 bg-background" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {contacts.map(contact => (
              <div 
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`p-4 border-b border-border/30 cursor-pointer transition-colors hover:bg-muted/50 ${activeContactId === contact.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="size-10 border border-border/50">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {contact.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className={`text-sm truncate ${contact.unread > 0 ? 'font-bold text-foreground' : 'font-semibold text-foreground/80'}`}>{contact.name}</h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{contact.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate ${contact.unread > 0 ? 'font-medium text-foreground/90' : 'text-muted-foreground'}`}>{contact.lastMessage}</p>
                      {contact.unread > 0 && (
                        <span className="ml-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                          {contact.unread}
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
          {activeContact ? (
            <>
              <div className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 border border-border/50">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {activeContact.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{activeContact.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {activeContact.role}
                      {activeContact.online && (
                        <>
                          <span className="inline-block size-1.5 bg-emerald-500 rounded-full ml-1" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
                        </>
                      )}
                    </p>
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
                
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${msg.isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border/50 text-card-foreground rounded-tl-sm'}`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${msg.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {msg.time}
                        {msg.isMe && <CheckCheck className="size-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-card border-t border-border/50">
                <div className="flex items-center gap-2 bg-muted/30 rounded-full border border-border/50 p-1 pl-4 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                  <Input 
                    placeholder={`Message ${activeContact.name}...`} 
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
              <MessageSquare className="size-12 mb-4 opacity-20" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
