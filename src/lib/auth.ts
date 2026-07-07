import { type Role, roleById, ROLES } from './roles';

export { type Role, roleById, ROLES };

export interface Session {
  role: Role;
  name: string;
  email?: string;
  mda?: string;
  department?: string;
  staffId?: string;
  permissions?: string[];
  organizationId?: string;
  deskOfficerEnabled?: boolean;
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('gdu_session');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Session;
  } catch {
    return null;
  }
}

export function signIn(role: Role, userObject?: any): void {
  if (typeof window === 'undefined') return;
  
  // Find fallback details from static ROLES if not provided
  const matchedRole = ROLES.find(r => r.id === role);
  
  const sessionData: Session = {
    role,
    name: userObject?.name || matchedRole?.demoName || 'Authorized User',
    email: userObject?.email || matchedRole?.demoEmail || '',
    mda: userObject?.mda || matchedRole?.mda || '',
    department: userObject?.department || matchedRole?.ministry || '',
    staffId: userObject?.staffId || '',
    permissions: userObject?.permissions || [],
    organizationId: userObject?.organizationId || '',
    deskOfficerEnabled: userObject?.deskOfficerEnabled || false
  };
  
  localStorage.setItem('gdu_session', JSON.stringify(sessionData));
  
  // Also store permissions if available
  if (sessionData.email) {
    const permissions = sessionData.permissions || [];
    localStorage.setItem(`gdu_permissions_${sessionData.email}`, JSON.stringify(permissions));
  }
  
  // Dispatch event for sidebar or layout updates
  window.dispatchEvent(new Event('sidebarUpdate'));
}

export function signOut(): void {
  if (typeof window === 'undefined') return;
  const session = getSession();
  if (session?.email) {
    localStorage.removeItem(`gdu_permissions_${session.email}`);
  }
  localStorage.removeItem('gdu_session');
  window.dispatchEvent(new Event('sidebarUpdate'));
}