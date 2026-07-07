import { useState, useEffect } from 'react';

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Info';
export type AlertStatus = 'Draft' | 'Published';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  targetUser: string;
  colorOverride?: string;
  createdAt: Date;
  status: AlertStatus;
}

let alerts: Alert[] = [
  {
    id: "A1",
    title: "System Maintenance",
    message: "The ERP will undergo scheduled maintenance at midnight.",
    severity: "Info",
    targetUser: "All Users",
    createdAt: new Date(),
    status: "Published"
  }
];

let dismissedAlertIds: Set<string> = new Set();
let listeners: (() => void)[] = [];

export const alertStore = {
  getAlerts: () => alerts,
  getActiveAlerts: () => alerts.filter(a => a.status === 'Published' && !dismissedAlertIds.has(a.id)),
  addAlert: async (alert: Omit<Alert, 'id' | 'createdAt'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newAlert = { ...alert, id: tempId, createdAt: new Date() };
    alerts = [newAlert, ...alerts];
    alertStore.notify();

    try {
      const { dbAddNotification } = await import('./postgres-service');
      await dbAddNotification({
        data: {
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          email: 'admin@kogionegov.gov.ng'
        }
      });
    } catch (err) {
      console.error("Failed to save alert to PostgreSQL:", err);
    }
  },
  updateAlert: (id: string, updates: Partial<Alert>) => {
    alerts = alerts.map(a => a.id === id ? { ...a, ...updates } : a);
    alertStore.notify();
  },
  deleteAlert: (id: string) => {
    alerts = alerts.filter(a => a.id !== id);
    alertStore.notify();
  },
  dismissAlert: (id: string) => {
    dismissedAlertIds.add(id);
    alertStore.notify();
  },
  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  notify: () => {
    listeners.forEach(l => l());
  }
};

export function useAlertStore() {
  const [state, setState] = useState({
    alerts: alerts,
    activeAlerts: alertStore.getActiveAlerts()
  });
  
  useEffect(() => {
    async function loadDbAlerts() {
      try {
        const { dbGetNotifications } = await import('./postgres-service');
        const dbAlerts = await dbGetNotifications({ data: { email: 'admin@kogionegov.gov.ng' } });
        if (dbAlerts && dbAlerts.length > 0) {
          alerts = dbAlerts.map((a: any) => ({
            id: a.id,
            title: a.title,
            message: a.message,
            severity: a.severity as AlertSeverity,
            targetUser: a.targetUser,
            createdAt: new Date(a.createdAt),
            status: a.status as AlertStatus
          }));
          alertStore.notify();
        }
      } catch (err) {
        console.error("Failed to load alerts from PostgreSQL:", err);
      }
    }
    loadDbAlerts();

    return alertStore.subscribe(() => {
      setState({
        alerts: [...alertStore.getAlerts()],
        activeAlerts: alertStore.getActiveAlerts()
      });
    });
  }, []);
  
  return state;
}
