import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { getSession } from "@/lib/auth";
import { roleById } from "@/lib/roles";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Trigger lazy loading of database stores once authenticated dashboard is mounted
    const session = getSession();
    if (session) {
      import("@/lib/nominalRollStore").then(m => m.useNominalRollStore.getState().loadRecords());
      import("@/lib/projectsStore").then(m => m.syncProjectsFromDb());
      import("@/lib/programmesStore").then(m => m.programmesStore.load());
      import("@/lib/devPlanStore").then(m => m.syncFromDb());
      import("@/lib/budgetLinesStore").then(m => m.useBudgetLinesStore.getState().loadStore());
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0b0e14] text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Verifying Session...
      </div>
    );
  }

  const session = getSession();
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}