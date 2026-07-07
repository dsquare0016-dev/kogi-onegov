import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, PartyPopper, Plus, Info, Globe2, Sun, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { bannerStore, BannerType } from '@/lib/banner-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/calendar')({
  component: DashboardCalendarComponent,
})

function DashboardCalendarComponent() {
  const [activeBanner, setActiveBanner] = useState<BannerType>(() => bannerStore.activeBanner);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [calendarView, setCalendarView] = useState('Month');

  useEffect(() => {
    const handleUpdate = () => setActiveBanner(bannerStore.activeBanner);
    window.addEventListener('bannerUpdate', handleUpdate);
    return () => window.removeEventListener('bannerUpdate', handleUpdate);
  }, []);

  const handleDisableBanner = () => {
    bannerStore.setActiveBanner(null);
    toast.success("Global banner deactivated");
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName || !newEventDate) return;
    toast.success(`Custom event "${newEventName}" added successfully.`);
    setIsAddEventOpen(false);
    setNewEventName("");
    setNewEventDate("");
  };

  const handlePrev = () => toast("Viewing previous period");
  const handleNext = () => toast("Viewing next period");

  const [holidays, setHolidays] = useState([
    { name: "New Year's Day", date: "Jan 1, 2026", type: "National", active: false },
    { name: "Workers' Day", date: "May 1, 2026", type: "National", active: false },
    { name: "Democracy Day", date: "Jun 12, 2026", type: "National", active: false },
    { name: "Eid al-Fitr (Sallah)", date: "Jun 24, 2026", type: "Religious", active: true },
    { name: "Independence Day", date: "Oct 1, 2026", type: "National", active: false },
    { name: "Christmas Day", date: "Dec 25, 2026", type: "Religious", active: false },
    { name: "Kogi State Anniversary", date: "Aug 27, 2026", type: "State", active: false },
  ]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar & Holidays</h1>
          <p className="text-muted-foreground mt-1">Manage public holidays, state events, and system-wide greetings.</p>
        </div>
        <button onClick={() => setIsAddEventOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md text-sm hover:bg-primary/90">
          <Plus className="size-4" /> Add Custom Event
        </button>
      </div>

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Event</DialogTitle>
            <DialogDescription>Create a new event or holiday for the calendar.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Name</label>
              <Input placeholder="e.g., State Assembly Session" value={newEventName} onChange={e => setNewEventName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Date</label>
              <Input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} required />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
              <Button type="submit">Save Event</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Upcoming Holidays Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className={`shadow-sm ${activeBanner ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/60'}`}>
            <CardHeader className={`pb-4 border-b ${activeBanner ? 'border-emerald-500/10' : 'border-border/50'}`}>
              <CardTitle className={`${activeBanner ? 'text-emerald-700' : 'text-muted-foreground'} flex items-center gap-2`}><PartyPopper className="size-5" /> Active Today</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               {activeBanner ? (
                 <>
                   <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 mb-2">Eid al-Fitr (Sallah)</div>
                   <p className="text-sm text-emerald-700/80 dark:text-emerald-200/80 mb-4">
                     Global holiday banner is currently active across the ERP for all 1,402 users.
                   </p>
                   <button onClick={handleDisableBanner} className="w-full px-4 py-2 bg-emerald-600 text-white font-bold rounded-md text-sm hover:bg-emerald-700 transition-colors">
                     Disable Active Banner
                   </button>
                 </>
               ) : (
                 <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                   <CalendarDays className="size-10 mb-3 opacity-20" />
                   <p className="text-sm">No global banners are active today.</p>
                 </div>
               )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-lg">Registered Holidays (2026)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border/50">
                 {holidays.map((h, i) => (
                   <div key={i} className={`p-4 flex justify-between items-center ${h.active ? 'bg-muted/30' : 'hover:bg-muted/10'}`}>
                     <div>
                       <div className="font-semibold text-sm flex items-center gap-2">
                         {h.name} {h.active && <Badge className="bg-emerald-500 h-5">Today</Badge>}
                       </div>
                       <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <Calendar className="size-3" /> {h.date}
                       </div>
                     </div>
                     <Badge variant="outline" className={`
                       ${h.type === 'National' ? 'text-blue-500 border-blue-500/50' : ''}
                       ${h.type === 'Religious' ? 'text-amber-500 border-amber-500/50' : ''}
                       ${h.type === 'State' ? 'text-indigo-500 border-indigo-500/50' : ''}
                     `}>{h.type}</Badge>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* The Calendar UI Mockup */}
        <div className="lg:col-span-2">
           <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-4">
                <CardTitle className="text-xl">June 2026</CardTitle>
                <div className="flex gap-1">
                  <button onClick={handlePrev} className="px-2 py-1 text-xs border border-border rounded hover:bg-muted transition-colors">Prev</button>
                  <button onClick={handleNext} className="px-2 py-1 text-xs border border-border rounded hover:bg-muted transition-colors">Next</button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/50 p-1 rounded-md border border-border">
                {['Month', 'Week', 'Day'].map(view => (
                  <button 
                    key={view}
                    onClick={() => setCalendarView(view)}
                    className={`px-3 py-1 rounded transition-colors ${calendarView === view ? 'bg-background shadow-sm text-foreground' : 'hover:bg-background/50'}`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
               <div className="grid grid-cols-7 gap-px bg-border/50 border border-border/50 rounded-lg overflow-hidden">
                 {/* Day Headers */}
                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                   <div key={day} className="bg-muted/30 p-2 text-center text-xs font-semibold text-muted-foreground uppercase">{day}</div>
                 ))}
                 
                 {/* Calendar Grid (Mocked Days) */}
                 {/* Pre-padding */}
                 <div className="bg-background min-h-[100px] p-2 opacity-50"><span className="text-xs font-bold text-muted-foreground">31</span></div>
                 
                 {/* June Days */}
                 {Array.from({ length: 30 }).map((_, i) => {
                   const day = i + 1;
                   const isDemocracyDay = day === 12;
                   const isSallah = day === 24;

                   return (
                     <div key={day} className={`bg-background min-h-[100px] p-2 relative border-t border-border/30 hover:bg-muted/10 transition-colors ${isSallah ? 'bg-emerald-500/5' : ''}`}>
                       <span className={`text-xs font-bold ${isSallah ? 'bg-primary text-white size-6 flex items-center justify-center rounded-full' : ''}`}>
                         {day}
                       </span>
                       
                       {isDemocracyDay && (
                         <div className="mt-2 p-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-semibold text-blue-700 leading-tight">
                           Democracy Day
                         </div>
                       )}

                       {isSallah && (
                         <div className="mt-2 p-1 bg-emerald-500 text-white rounded text-[10px] font-bold leading-tight">
                           Eid al-Fitr (Sallah)
                         </div>
                       )}

                       {day === 15 && (
                         <div className="mt-2 p-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] font-semibold text-indigo-700 leading-tight">
                           State Exco Meeting
                         </div>
                       )}
                     </div>
                   )
                 })}
                 
                 {/* Post-padding */}
                 <div className="bg-background min-h-[100px] p-2 opacity-50"><span className="text-xs font-bold text-muted-foreground">1</span></div>
                 <div className="bg-background min-h-[100px] p-2 opacity-50"><span className="text-xs font-bold text-muted-foreground">2</span></div>
                 <div className="bg-background min-h-[100px] p-2 opacity-50"><span className="text-xs font-bold text-muted-foreground">3</span></div>
                 <div className="bg-background min-h-[100px] p-2 opacity-50"><span className="text-xs font-bold text-muted-foreground">4</span></div>
               </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
