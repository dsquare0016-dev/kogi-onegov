import { create } from 'zustand';
import { safeGetCollection, safeSetDoc } from './firebase';
import { DESK_OFFICERS as initialDeskOfficers, DeskOfficer } from './governance-data';

export interface DeskOfficerActivity {
  id: string;
  officerId: string;
  officerName: string;
  mda: string;
  action: string;
  detail: string;
  timestamp: string;
}

interface DeskOfficersState {
  deskOfficers: DeskOfficer[];
  activities: DeskOfficerActivity[];
  isLoading: boolean;
  loadStore: () => Promise<void>;
  assignDeskOfficer: (officer: Omit<DeskOfficer, 'id' | 'competency' | 'trained' | 'certified'>) => Promise<void>;
  logActivity: (activity: Omit<DeskOfficerActivity, 'id' | 'timestamp'>) => Promise<void>;
  updateStatus: (id: string, status: DeskOfficer['status']) => Promise<void>;
  verifyCertification: (id: string, certified: boolean) => Promise<void>;
}

const initialActivities: DeskOfficerActivity[] = [
  { id: 'act-1', officerId: 'DO-101', officerName: 'Ibrahim Suleiman', mda: 'Ministry of Health', action: 'Uploaded Budget', detail: 'Uploaded 2026 Recurrent Estimates draft', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'act-2', officerId: 'DO-102', officerName: 'Halima Yusuf', mda: 'Ministry of Education', action: 'Registered Staff', detail: 'Verified and registered Fatima Audu', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() }
];

export const useDeskOfficersStore = create<DeskOfficersState>((set, get) => ({
  deskOfficers: initialDeskOfficers,
  activities: initialActivities,
  isLoading: false,

  loadStore: async () => {
    set({ isLoading: true });
    const officers = await safeGetCollection<DeskOfficer>('desk_officers', initialDeskOfficers);
    const logs = await safeGetCollection<DeskOfficerActivity>('desk_officer_activities', initialActivities);
    set({ deskOfficers: officers, activities: logs, isLoading: false });
  },

  assignDeskOfficer: async (officer) => {
    const newOfficer: DeskOfficer = {
      ...officer,
      id: `DO-${Date.now()}`,
      trained: true,
      certified: false,
      competency: 75
    };
    
    const updatedOfficers = [...get().deskOfficers, newOfficer];
    await safeSetDoc('desk_officers', newOfficer.id, newOfficer);
    set({ deskOfficers: updatedOfficers });
    
    // Log the assignment activity
    await get().logActivity({
      officerId: 'SYSTEM',
      officerName: 'Super Admin',
      mda: officer.ministry,
      action: 'Assigned Desk Officer',
      detail: `Assigned ${officer.name} as Desk Officer for ${officer.ministry}`
    });

    window.dispatchEvent(new Event('deskOfficersStoreUpdate'));
  },

  logActivity: async (act) => {
    const newActivity: DeskOfficerActivity = {
      ...act,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    const updatedActivities = [newActivity, ...get().activities];
    await safeSetDoc('desk_officer_activities', newActivity.id, newActivity);
    set({ activities: updatedActivities });
    
    window.dispatchEvent(new Event('deskOfficersStoreUpdate'));
  },

  updateStatus: async (id, status) => {
    const match = get().deskOfficers.find(d => d.id === id);
    if (match) {
      const updated = { ...match, status };
      await safeSetDoc('desk_officers', id, updated);
      set(state => ({
        deskOfficers: state.deskOfficers.map(d => d.id === id ? updated : d)
      }));
      window.dispatchEvent(new Event('deskOfficersStoreUpdate'));
    }
  },

  verifyCertification: async (id, certified) => {
    const match = get().deskOfficers.find(d => d.id === id);
    if (match) {
      const updated = { ...match, certified };
      await safeSetDoc('desk_officers', id, updated);
      set(state => ({
        deskOfficers: state.deskOfficers.map(d => d.id === id ? updated : d)
      }));
      window.dispatchEvent(new Event('deskOfficersStoreUpdate'));
    }
  }
}));
