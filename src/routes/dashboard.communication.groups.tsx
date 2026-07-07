import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Users, Shield, Settings2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/communication/groups')({
  component: GroupsComponent,
})

const GROUPS_DATA = [
  { id: 'g1', name: 'Executive Council', members: 12, type: 'Official', privacy: 'Private', description: 'Core executive members and the Governor.' },
  { id: 'g2', name: 'Budget Taskforce 2026', members: 8, type: 'Project', privacy: 'Private', description: 'Cross-functional team for 2026 budget planning.' },
  { id: 'g3', name: 'Health Sector Reform', members: 24, type: 'Departmental', privacy: 'Public (Internal)', description: 'All officials involved in the health reform agenda.' },
  { id: 'g4', name: 'ICT Infrastructure Team', members: 15, type: 'Technical', privacy: 'Private', description: 'System administrators and IT directors.' },
  { id: 'g5', name: 'Emergency Response Unit', members: 30, type: 'Operational', privacy: 'Public (Internal)', description: 'Rapid response coordination for state emergencies.' },
  { id: 'g6', name: 'All Commissioners', members: 18, type: 'Official', privacy: 'Private', description: 'General communication channel for all state commissioners.' },
];

function GroupsComponent() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = GROUPS_DATA.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups & Teams</h1>
          <p className="text-muted-foreground mt-1">Manage official communication channels and team directories.</p>
        </div>
        <Button className="gap-2 font-bold">
          <Plus className="size-4" />
          Create New Group
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle>Directory</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search groups..." 
                className="pl-9 bg-muted/10 border-border/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 p-6 gap-6 bg-muted/5">
            {filteredGroups.map(group => (
              <Card key={group.id} className="border-border/60 shadow-sm hover:border-primary/30 transition-colors">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Users className="size-5 text-primary" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground -mr-2 -mt-2">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </div>
                  
                  <h3 className="font-bold text-lg leading-tight mb-1">{group.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {group.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-border/50">
                    <Badge variant="secondary" className="bg-muted/50 text-xs font-medium">
                      <Users className="size-3 mr-1" />
                      {group.members} Members
                    </Badge>
                    <Badge variant="outline" className="text-xs font-medium text-muted-foreground border-border/60">
                      {group.type}
                    </Badge>
                    {group.privacy === 'Private' ? (
                      <Badge variant="outline" className="text-xs font-medium text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 ml-auto">
                        <Shield className="size-3 mr-1" />
                        Private
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs font-medium text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 ml-auto">
                        Internal
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredGroups.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <Users className="size-12 mx-auto mb-3 opacity-20" />
                <p>No groups found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
