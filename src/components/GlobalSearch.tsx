import React, { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { 
  Building2, Users, FileText, LayoutDashboard, Settings, UserCog, Activity, FolderKanban
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { checkItemVisibility } from "./AppShell";
import { useSettingsStore } from "@/lib/settingsStore";

export function GlobalSearch({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const navigate = useNavigate();
  const session = getSession();
  const isAttendanceEnabled = useSettingsStore((s) => s.isAttendanceEnabled);
  const isCommunicationHubEnabled = useSettingsStore((s) => s.isCommunicationHubEnabled);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, [setOpen]);

  if (!session) return null;
  const role = session.role;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search projects, MDAs, staff, memos…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Dashboards & Overviews">
          <CommandItem onSelect={() => runCommand(() => navigate({ to: "/dashboard" }))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Global Dashboard</span>
          </CommandItem>
          {checkItemVisibility(role, "Governance", false, isAttendanceEnabled, isCommunicationHubEnabled) && (
            <CommandItem onSelect={() => runCommand(() => navigate({ to: "/dashboard/governance" }))}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Governance</span>
            </CommandItem>
          )}
          {checkItemVisibility(role, "Financial", false, isAttendanceEnabled, isCommunicationHubEnabled) && (
            <CommandItem onSelect={() => runCommand(() => navigate({ to: "/dashboard/financial" }))}>
              <Activity className="mr-2 h-4 w-4" />
              <span>Financial & Budget</span>
            </CommandItem>
          )}
        </CommandGroup>
        
        {(checkItemVisibility(role, "Nominal Roll", false, isAttendanceEnabled, isCommunicationHubEnabled) || checkItemVisibility(role, "Ministries", false, isAttendanceEnabled, isCommunicationHubEnabled)) && (
          <CommandGroup heading="Personnel & Structure">
            {checkItemVisibility(role, "Nominal Roll", false, isAttendanceEnabled, isCommunicationHubEnabled) && (
              <CommandItem onSelect={() => runCommand(() => navigate({ to: "/dashboard/staff" }))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Nominal Roll & Staff</span>
              </CommandItem>
            )}
            {checkItemVisibility(role, "Ministries", false, isAttendanceEnabled, isCommunicationHubEnabled) && (
              <CommandItem onSelect={() => runCommand(() => navigate({ to: "/dashboard/ministries" }))}>
                <Building2 className="mr-2 h-4 w-4" />
                <span>Ministries & MDAs</span>
              </CommandItem>
            )}
          </CommandGroup>
        )}
        
        {(checkItemVisibility(role, "Projects", false, isAttendanceEnabled, isCommunicationHubEnabled) || checkItemVisibility(role, "E-Memo Center", false, isAttendanceEnabled, isCommunicationHubEnabled)) && (
          <CommandGroup heading="Projects & Operations">
            {checkItemVisibility(role, "Projects", false, isAttendanceEnabled, isCommunicationHubEnabled) && (
              <CommandItem onSelect={() => runCommand(() => navigate({ to: "/dashboard/projects" }))}>
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>Projects & Tracking</span>
              </CommandItem>
            )}
            {checkItemVisibility(role, "E-Memo Center", false, isAttendanceEnabled, isCommunicationHubEnabled) && (
              <CommandItem onSelect={() => runCommand(() => navigate({ to: "/dashboard/e-memo" }))}>
                <FileText className="mr-2 h-4 w-4" />
                <span>e-Memos & Documents</span>
              </CommandItem>
            )}
          </CommandGroup>
        )}

        {(checkItemVisibility(role, "System Administration", false, isAttendanceEnabled, isCommunicationHubEnabled) || checkItemVisibility(role, "Users", false, isAttendanceEnabled, isCommunicationHubEnabled)) && (
          <CommandGroup heading="Administration">
            {checkItemVisibility(role, "System Administration", false, isAttendanceEnabled, isCommunicationHubEnabled) && (
              <CommandItem onSelect={() => runCommand(() => navigate({ to: "/dashboard/admin" }))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Platform Configuration</span>
              </CommandItem>
            )}
            {checkItemVisibility(role, "Users", false, isAttendanceEnabled, isCommunicationHubEnabled) && (
              <CommandItem onSelect={() => runCommand(() => navigate({ to: "/dashboard/admin" }))}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>User Management</span>
              </CommandItem>
            )}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
