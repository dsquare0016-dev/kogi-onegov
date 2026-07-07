import React from 'react';
import { getSession } from '@/lib/auth';
import { roleById, type Role } from '@/lib/roles';
import { Navigate } from '@tanstack/react-router';

/**
 * Checks if the current session's role matches one of the allowed roles.
 * If not, redirects to an unauthorized page (or login if no session).
 */
export function requireRoles(allowedRoles: Role[]) {
  const session = getSession();
  if (!session) {
    // Not logged in – send to login
    return React.createElement(Navigate, { to: "/login", replace: true });
  }
  const profile = roleById(session.role);
  if (allowedRoles.includes(profile.id)) {
    // Allowed – render children (use as wrapper component)
    return null; // indicates authorized
  }
  // Unauthorized – could redirect to a generic unauthorized page
  return React.createElement(Navigate, { to: "/unauthorized", replace: true });
}

/**
 * Utility to check if a role's scope matches a required scope.
 * Scopes: "executive", "command", "ministry", "department", "staff"
 */
export function hasScope(role: Role, requiredScope: string): boolean {
  const profile = roleById(role);
  return profile.scope === requiredScope;
}
