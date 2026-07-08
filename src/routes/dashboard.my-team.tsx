import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/SearchableSelect';
import { 
  Users, Search, UserCheck, Settings2, UserPlus, 
  Workflow, Network, KanbanSquare, CheckCircle, AlertCircle, Trash2, Calendar, FileText, Zap, Send
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  getStaffSearchableList,
  saveOfficeTeamMember,
  removeOfficeTeamMember,
  saveMemoRoutingSettings,
  createOfficeDelegation,
  getOfficeManagementDashboard
} from '@/lib/postgres-service';

export const Route = createFileRoute('/dashboard/my-team')({
  component: OfficeManagementCentre,
});

function OfficeManagementCentre() {
  const session = getSession();
  const role = session?.role;
  const navigate = useNavigate();

  // Authorization Check
  const authorizedRoles = ['super_admin', 'governor', 'deputy_governor', 'dg_gdu', 'commissioner', 'perm_secretary', 'director', 'hod'];
  if (!role || !authorizedRoles.includes(role)) {
    return (
      <div className="p-6 text-center h-[50vh] flex flex-col items-center justify-center">
        <AlertCircle className="size-16 text-rose-500 mb-4 opacity-80" />
        <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Sorry, you are not authorized to manage an office team.</p>
      </div>
    );
  }

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);

  const [newTeamMember, setNewTeamMember] = useState<string>('');
  const [newRoleInOffice, setNewRoleInOffice] = useState<string>('Secretary');

  const [routingConfig, setRoutingConfig] = useState({
    secretaryFirst: true,
    autoNotifyOfficeHolder: true,
    autoNotifySecretary: true,
  });

  const loadData = async () => {
    try {
      const [dbData, staff] = await Promise.all([
        getOfficeManagementDashboard({ data: { officeHolderUserId: session?.user?.id || '' } }),
        getStaffSearchableList({ data: { filterByOrganization: role === 'super_admin' ? undefined : session?.user?.organizationId } })
      ]);
      setDashboardData(dbData);
      setStaffList(staff || []);
      if (dbData.routing) {
        setRoutingConfig({
          secretaryFirst: dbData.routing.secretary_first,
          autoNotifyOfficeHolder: dbData.routing.auto_notify_office_holder,
          autoNotifySecretary: dbData.routing.auto_notify_secretary,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAssignMember = async () => {
    if (!newTeamMember) return toast.error("Please select a staff member");
    try {
      await saveOfficeTeamMember({
        data: {
          officeHolderUserId: session?.user?.id,
          teamMemberUserId: newTeamMember,
          organizationId: session?.user?.organizationId,
          roleInOffice: newRoleInOffice,
          responsibilities: ['Receive Memo', 'Schedule Meetings'],
          assignedBy: session?.user?.id
        }
      });
      toast.success(`${newRoleInOffice} assigned successfully!`);
      setNewTeamMember('');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      await removeOfficeTeamMember({ data: { assignmentId: id, userId: session?.user?.id } });
      toast.success("Team member removed from office.");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveRouting = async () => {
    try {
      await saveMemoRoutingSettings({
        data: {
          officeHolderUserId: session?.user?.id,
          organizationId: session?.user?.organizationId,
          ...routingConfig,
          userId: session?.user?.id
        }
      });
      toast.success("Memo routing rules updated!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const secretary = dashboardData?.team?.find((t: any) => t.role_in_office.includes('Secretary') || t.role_in_office.includes('PA'));

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-6 sm:space-y-8 pb-24 text-foreground">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-3 text-primary mb-2">
            <Users className="size-5" />
            <span className="font-black uppercase tracking-[0.2em] text-xs">Office Management Centre</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">My Team & Assistants</h1>
          <p className="text-muted-foreground mt-1.5 font-medium">Configure your immediate office staff, memo routing, and delegations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Secretary & Team Config */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Current Secretary Card */}
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <CardTitle className="text-lg flex items-center justify-between">Current Principal Assistant</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {secretary ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary font-bold shadow-sm border border-border text-xl">
                      {secretary.member_name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{secretary.member_name}</h3>
                      <p className="text-sm font-bold text-muted-foreground">{secretary.role_in_office} • {secretary.member_staff_id}</p>
                      <p className="text-xs text-muted-foreground mt-1">{secretary.member_email}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                </div>
              ) : (
                <div className="text-center p-6 border border-dashed rounded-lg">
                  <p className="text-muted-foreground font-medium">No Secretary or PA assigned yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assign Staff */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg">Assign Team Member</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">Staff Member</label>
                  <SearchableSelect 
                    options={staffList.map(s => ({ id: s.id, name: s.full_name, subtext: s.staff_id }))} 
                    value={newTeamMember} 
                    onChange={val => setNewTeamMember(val || '')} 
                    placeholder="Search verified staff..." 
                  />
                  <p className="text-[10px] text-muted-foreground">Limited to your authorized MDA scope.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">Role in Office</label>
                  <select className="w-full p-2.5 bg-background border border-border rounded-md text-sm" value={newRoleInOffice} onChange={e => setNewRoleInOffice(e.target.value)}>
                    <option value="Secretary">Secretary</option>
                    <option value="Personal Assistant">Personal Assistant</option>
                    <option value="Confidential Secretary">Confidential Secretary</option>
                    <option value="Special Assistant">Special Assistant</option>
                    <option value="Desk Officer">Desk Officer</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleAssignMember} className="w-full font-bold gap-2"><UserPlus className="size-4" /> Assign to Office</Button>
            </CardContent>
          </Card>

          {/* Team Members Table */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg">Office Team Roster</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 border-b border-border text-left">
                    <tr>
                      <th className="p-4 font-bold text-xs uppercase text-muted-foreground">Name & ID</th>
                      <th className="p-4 font-bold text-xs uppercase text-muted-foreground">Office Role</th>
                      <th className="p-4 font-bold text-xs uppercase text-muted-foreground">Status</th>
                      <th className="p-4 font-bold text-xs uppercase text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.team?.map((member: any) => (
                      <tr key={member.id} className="border-b border-border/50 last:border-0 hover:bg-muted/5">
                        <td className="p-4">
                          <p className="font-bold">{member.member_name}</p>
                          <p className="text-xs text-muted-foreground">{member.member_staff_id}</p>
                        </td>
                        <td className="p-4 font-medium">{member.role_in_office}</td>
                        <td className="p-4"><Badge variant="outline" className="text-emerald-600 border-emerald-500/50 bg-emerald-500/10">Active</Badge></td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!dashboardData?.team?.length && (
                      <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No team members assigned.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Memo Routing */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-blue-500/5 border-b border-border/50">
              <CardTitle className="text-lg">Memo Routing Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-background">
                <div>
                  <p className="font-bold">Secretary-First Routing</p>
                  <p className="text-xs text-muted-foreground">Incoming memos to your office are routed to your PA/Secretary for vetting first.</p>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded text-primary" checked={routingConfig.secretaryFirst} onChange={e => setRoutingConfig({...routingConfig, secretaryFirst: e.target.checked})} />
              </div>
              <Button onClick={handleSaveRouting} variant="outline" className="w-full">Save Routing Rules</Button>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Workload, Delegation, AI */}
        <div className="space-y-6">
          
          {/* Workload Summary */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg">Workload Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/10 border border-border/50 rounded-lg text-center">
                <FileText className="size-5 text-primary mx-auto mb-2" />
                <p className="text-3xl font-black">{dashboardData?.workload?.pendingMemos || 0}</p>
                <p className="text-xs font-bold uppercase text-muted-foreground mt-1">Pending Memos</p>
              </div>
              <div className="p-4 bg-muted/10 border border-border/50 rounded-lg text-center">
                <CheckCircle className="size-5 text-amber-500 mx-auto mb-2" />
                <p className="text-3xl font-black text-amber-500">{dashboardData?.workload?.dueTasks || 0}</p>
                <p className="text-xs font-bold uppercase text-muted-foreground mt-1">Due Tasks</p>
              </div>
            </CardContent>
          </Card>

          {/* Office Communication */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate({ to: '/dashboard/communication/direct-messages' })}><Send className="size-4" /> Message Team</Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate({ to: '/dashboard/e-memo' })}><FileText className="size-4" /> Create Memo</Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate({ to: '/dashboard/calendar' })}><Calendar className="size-4" /> Schedule Meeting</Button>
            </CardContent>
          </Card>

          {/* AI Tools */}
          <Card className="border-primary/20 shadow-sm bg-primary/5">
            <CardHeader className="border-b border-primary/10">
              <CardTitle className="text-lg flex items-center gap-2"><Zap className="size-5 text-primary" /> AI Office Tools</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button className="w-full justify-start gap-2 bg-background text-foreground border border-primary/20 hover:bg-primary/10" onClick={() => navigate({ to: '/dashboard/ai/assistant' })}>
                Generate Memo Draft
              </Button>
              <Button className="w-full justify-start gap-2 bg-background text-foreground border border-primary/20 hover:bg-primary/10" onClick={() => navigate({ to: '/dashboard/ai/assistant' })}>
                Summarize Pending Reports
              </Button>
              <Button className="w-full justify-start gap-2 bg-background text-foreground border border-primary/20 hover:bg-primary/10" onClick={() => navigate({ to: '/dashboard/ai/assistant' })}>
                Generate Meeting Minutes
              </Button>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">Powered by Kogi AI</p>
            </CardContent>
          </Card>

          {/* Delegation Center */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-amber-500/5 border-b border-border/50">
              <CardTitle className="text-lg">Active Delegations</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {dashboardData?.delegations?.length ? (
                <div className="space-y-3">
                  {dashboardData.delegations.map((del: any) => (
                    <div key={del.id} className="p-3 border border-amber-500/30 bg-amber-500/5 rounded-lg">
                      <p className="font-bold text-sm text-amber-700 dark:text-amber-500">{del.delegation_type} Authority</p>
                      <p className="text-xs mt-1">To: {del.delegate_name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">No active delegations.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
