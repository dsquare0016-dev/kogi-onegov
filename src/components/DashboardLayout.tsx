import React, { ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import { getSession } from '@/lib/auth';
import { AppShell } from '@/components/AppShell';

/**
 * DashboardLayout provides a consistent layout for all dashboard routes and ensures
 * the user is authenticated. If no session is present, the user is redirected to
 * the login page.
 */
export function DashboardLayout({ children }: { children: ReactNode }) {
  const session = getSession();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <AppShell>{children}</AppShell>;
}
