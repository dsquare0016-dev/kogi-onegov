import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Landmark, Users, FileText, Settings } from 'lucide-react';

export const Route = createFileRoute('/dashboard/structure/$officeId')({
  component: ExecutiveOfficePage,
});

function ExecutiveOfficePage() {
  const { officeId } = Route.useParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'appointees' | 'memos' | 'settings'>('profile');
  
  // Format the ID to a readable title (e.g. chief-of-staff -> Chief Of Staff)
  const title = officeId.split('-').map(word => {
    if (word.toUpperCase() === 'SSG' || word.toUpperCase() === 'GDU') return word.toUpperCase();
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Office of the {title}</h1>
        <p className="text-muted-foreground mt-1">Manage executive operations, personnel, and directives for this executive office.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeTab === 'profile' && (
          <Card className="border-border/60 shadow-sm col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2"><Landmark className="size-5 text-primary" /> Office Profile</CardTitle>
              <CardDescription>Current administration and operational metrics.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div className="space-y-1.5">
                 <label className="text-sm font-medium">Head of Office</label>
                 <input type="text" className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder={`Enter name of the ${title}...`} />
               </div>
               <div className="space-y-1.5">
                 <label className="text-sm font-medium">Official Email Address</label>
                 <input type="email" className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder={`e.g. ${officeId}@kogistate.gov.ng`} />
               </div>
               <div className="space-y-1.5">
                 <label className="text-sm font-medium">Office Mandate / Description</label>
                 <textarea className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary h-24" placeholder="Brief description of the office's core responsibilities and constitutional mandate..."></textarea>
               </div>
               <div className="pt-4 flex justify-end">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">Update Office Records</button>
               </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'appointees' && (
          <Card className="border-border/60 shadow-sm col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2"><Users className="size-5 text-primary" /> Political Appointees</CardTitle>
              <CardDescription>Manage aides, assistants, and other political appointees.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="rounded-md border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Role</th>
                      <th className="p-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <tr><td className="p-3 font-medium">John Doe</td><td className="p-3 text-muted-foreground">Special Assistant</td><td className="p-3"><span className="text-green-600 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded text-xs font-medium">Active</span></td></tr>
                    <tr><td className="p-3 font-medium">Jane Smith</td><td className="p-3 text-muted-foreground">Senior Special Assistant</td><td className="p-3"><span className="text-green-600 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded text-xs font-medium">Active</span></td></tr>
                    <tr><td className="p-3 font-medium">Abubakar Musa</td><td className="p-3 text-muted-foreground">Personal Assistant</td><td className="p-3"><span className="text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-medium">On Leave</span></td></tr>
                  </tbody>
                </table>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">Add New Appointee</button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'memos' && (
          <Card className="border-border/60 shadow-sm col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2"><FileText className="size-5 text-primary" /> Official Memos & Directives</CardTitle>
              <CardDescription>Recent memos and directives issued by the {title}.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="p-4 border border-border rounded-md hover:bg-muted/50 cursor-pointer transition-colors shadow-sm">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="font-semibold text-sm text-foreground">Directive on Immediate Project Monitoring</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Oct 24, 2024</span>
                  </div>
                  <p className="text-sm text-muted-foreground">To all Commissioners and Heads of Agencies regarding Q4 projects.</p>
                </div>
                <div className="p-4 border border-border rounded-md hover:bg-muted/50 cursor-pointer transition-colors shadow-sm">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="font-semibold text-sm text-foreground">Memo: Implementation of 32-Year Development Plan</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Sep 15, 2024</span>
                  </div>
                  <p className="text-sm text-muted-foreground">To the Head of Service and Permanent Secretaries.</p>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">Draft New Memo</button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card className="border-border/60 shadow-sm col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2"><Settings className="size-5 text-primary" /> Dashboard Settings</CardTitle>
              <CardDescription>Configure the {title}'s dashboard preferences.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-md">
                <div>
                  <h4 className="font-medium text-sm text-foreground">Receive Weekly Reports</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Get an automated summary of state performance every Friday.</p>
                </div>
                <input type="checkbox" className="size-4 accent-primary" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-md">
                <div>
                  <h4 className="font-medium text-sm text-foreground">Require Two-Factor Authentication</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Enforce 2FA for all staff in this office.</p>
                </div>
                <input type="checkbox" className="size-4 accent-primary" defaultChecked />
              </div>
              <div className="pt-4 flex justify-end">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">Save Settings</button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
           <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-sm">Administrative Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <button onClick={() => setActiveTab('appointees')} className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 transition-colors ${activeTab === 'appointees' ? 'bg-primary text-primary-foreground shadow-sm font-medium' : 'hover:bg-muted text-foreground'}`}>
                <Users className={`size-4 ${activeTab === 'appointees' ? 'text-primary-foreground' : 'text-muted-foreground'}`} /> Manage Political Appointees
              </button>
              <button onClick={() => setActiveTab('memos')} className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 transition-colors ${activeTab === 'memos' ? 'bg-primary text-primary-foreground shadow-sm font-medium' : 'hover:bg-muted text-foreground'}`}>
                <FileText className={`size-4 ${activeTab === 'memos' ? 'text-primary-foreground' : 'text-muted-foreground'}`} /> View Official Memos & Directives
              </button>
              <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 transition-colors ${activeTab === 'settings' ? 'bg-primary text-primary-foreground shadow-sm font-medium' : 'hover:bg-muted text-foreground'}`}>
                <Settings className={`size-4 ${activeTab === 'settings' ? 'text-primary-foreground' : 'text-muted-foreground'}`} /> Office Dashboard Settings
              </button>
              
              {activeTab !== 'profile' && (
                <div className="pt-4 mt-2 border-t border-border/50">
                  <button onClick={() => setActiveTab('profile')} className="w-full text-center px-3 py-2 text-xs font-medium hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                    ← Back to Office Profile
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
