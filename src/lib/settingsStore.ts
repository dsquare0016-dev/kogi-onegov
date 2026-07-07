import { create } from 'zustand';

export type GovernanceAlignmentLevel = 1 | 2 | 3;

interface SettingsState {
  isAttendanceEnabled: boolean;
  isCommunicationHubEnabled: boolean;
  governanceAlignmentLevel: GovernanceAlignmentLevel;
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  setAttendanceEnabled: (enabled: boolean) => void;
  setCommunicationHubEnabled: (enabled: boolean) => void;
  setGovernanceAlignmentLevel: (level: GovernanceAlignmentLevel) => void;
  setMaintenanceMode: (enabled: boolean, message?: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isAttendanceEnabled: true,
  isCommunicationHubEnabled: false,
  governanceAlignmentLevel: 2, // Default to Level 2 (Approval Warning)
  isMaintenanceMode: false,
  maintenanceMessage: 'System Under Scheduled Maintenance. Please try again later.',
  
  setAttendanceEnabled: (enabled) => set({ isAttendanceEnabled: enabled }),
  
  setCommunicationHubEnabled: (enabled) => set({ isCommunicationHubEnabled: enabled }),
  
  setGovernanceAlignmentLevel: (level) => set({ governanceAlignmentLevel: level }),
  
  setMaintenanceMode: (enabled, message) => set((state) => ({ 
    isMaintenanceMode: enabled,
    maintenanceMessage: message ?? state.maintenanceMessage
  })),
}));
