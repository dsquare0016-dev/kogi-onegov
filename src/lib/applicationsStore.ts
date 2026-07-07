import { create } from 'zustand';
import { safeGetCollection, safeSetDoc } from './firebase';

export interface ApplicationDocument {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Application {
  id: string;
  staffId: string;
  fullName: string;
  email: string;
  mda: string;
  type: 'Leave' | 'Transfer' | 'Promotion';
  details: {
    // Leave fields
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    
    // Transfer fields
    targetMda?: string;
    targetDepartment?: string;
    reasonForTransfer?: string;
    
    // Promotion fields
    currentGradeLevel?: string;
    currentStep?: string;
    targetGradeLevel?: string;
    targetStep?: string;
    justification?: string;
  };
  targetOfficeMda: string;
  documents: ApplicationDocument[];
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  submittedAt: string;
  remarks?: string;
}

interface ApplicationsState {
  applications: Application[];
  isLoading: boolean;
  loadApplications: () => Promise<void>;
  submitApplication: (app: Omit<Application, 'id' | 'submittedAt' | 'status'>) => Promise<void>;
  updateApplicationStatus: (id: string, status: Application['status'], remarks?: string) => Promise<void>;
}

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],
  isLoading: false,
  loadApplications: async () => {
    set({ isLoading: true });
    try {
      const { dbGetApplicationsList } = await import('./postgres-service');
      const data = await dbGetApplicationsList();
      if (data && data.length > 0) {
        set({ applications: data, isLoading: false });
        return;
      }
    } catch (err) {
      console.error("Failed to load applications from PostgreSQL:", err);
    }
    const data = await safeGetCollection<Application>('applications', []);
    set({ applications: data, isLoading: false });
  },
  submitApplication: async (appData) => {
    const id = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const submittedAt = new Date().toISOString().split('T')[0];
    const newApp: Application = {
      ...appData,
      id,
      submittedAt,
      status: 'Pending',
    };
    
    try {
      const { dbSaveApplication } = await import('./postgres-service');
      await dbSaveApplication({
        data: {
          ...newApp,
          isUpdate: false
        }
      });
    } catch (err) {
      console.error("Failed to save application to PostgreSQL:", err);
    }
    
    // Save to Firestore
    await safeSetDoc('applications', id, newApp);
    
    set((state) => ({
      applications: [newApp, ...state.applications]
    }));
  },
  updateApplicationStatus: async (id, status, remarks) => {
    const app = get().applications.find(a => a.id === id);
    if (app) {
      const updated = { ...app, status, remarks: remarks || app.remarks };
      
      try {
        const { dbSaveApplication } = await import('./postgres-service');
        await dbSaveApplication({
          data: {
            id,
            status,
            remarks: remarks || app.remarks,
            isUpdate: true
          }
        });
      } catch (err) {
        console.error("Failed to update application status in PostgreSQL:", err);
      }

      await safeSetDoc('applications', id, updated);
      set((state) => ({
        applications: state.applications.map(a => a.id === id ? updated : a)
      }));
    }
  }
}));
