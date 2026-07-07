import { create } from 'zustand';
import { safeGetCollection, safeSetDoc } from './firebase';

export type StaffType = 
  | 'Civil Servant'
  | 'Political Appointee'
  | 'Adhoc Staff'
  | 'Consultant'
  | 'Contract Staff'
  | 'Intern'
  | 'Volunteer'
  | 'Retiree'
  | 'Temporary Staff';

export interface NominalRollEntry {
  staffId: string;
  fullName: string;
  email: string;
  staffType: StaffType;
  department: string;
  mda: string;
  gradeLevel: string;
  dateOfFirstAppointment: string;
  dateOfBirth: string;
  status: 'Active' | 'Suspended' | 'Retired' | 'Transferred';
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  expectedRetirementDate: string;
  isRegistered?: boolean; // True if registered by Desk Officer
  
  // Extended profile and security fields
  psnNumber?: string;
  nin?: string;
  bvn?: string;
  passportUrl?: string;
  documentUrl?: string;
  customFields?: Record<string, string>;

  // Additional form fields for comprehensive staff details
  rollNumber?: string;
  sex?: string;
  stateOfOrigin?: string;
  lgaOfOrigin?: string;
  dateOfConfirmation?: string;
  presentAppointment?: string;
  dateOfAppointment?: string;
  highestQualification?: string;
  phoneNumber?: string;
  step?: string;
}

const defaultRecords: NominalRollEntry[] = [
  {
    staffId: 'KGS/001/15/48',
    fullName: 'Aisha Bello',
    email: 'aisha.bello@kogionegov.gov.ng',
    staffType: 'Civil Servant',
    department: 'Secondary Education',
    mda: 'Ministry of Education',
    gradeLevel: 'GL-12',
    dateOfFirstAppointment: '2015-08-14',
    dateOfBirth: '1988-11-20',
    status: 'Active',
    verificationStatus: 'Verified',
    expectedRetirementDate: '2048-11-20',
    isRegistered: true
  },
  {
    staffId: 'KGS/002/12/40',
    fullName: 'Dr. Samuel Ojo',
    email: 'samuel.ojo@kogionegov.gov.ng',
    staffType: 'Civil Servant',
    department: 'Public Health',
    mda: 'Ministry of Health',
    gradeLevel: 'GL-14',
    dateOfFirstAppointment: '2012-04-10',
    dateOfBirth: '1980-05-15',
    status: 'Active',
    verificationStatus: 'Verified',
    expectedRetirementDate: '2040-05-15',
    isRegistered: true
  }
];

interface NominalRollState {
  staffTypes: StaffType[];
  records: NominalRollEntry[];
  isLoading: boolean;
  loadRecords: () => Promise<void>;
  addRecord: (record: NominalRollEntry) => Promise<void>;
  generateStaffId: (dateOfFirstAppointment: string, expectedRetirementDate?: string, dateOfBirth?: string) => string;
  calculateRetirement: (dateOfBirth: string, dateOfFirstAppointment: string) => string;
  updateRecordStatus: (staffId: string, status: 'Active' | 'Suspended' | 'Retired' | 'Transferred') => Promise<void>;
}

export const useNominalRollStore = create<NominalRollState>((set, get) => ({
  staffTypes: [
    'Civil Servant', 'Political Appointee', 'Adhoc Staff', 'Consultant', 
    'Contract Staff', 'Intern', 'Volunteer', 'Retiree', 'Temporary Staff'
  ],
  records: defaultRecords,
  isLoading: false,
  loadRecords: async () => {
    set({ isLoading: true });
    const { getNominalRollList } = await import('./postgres-service');
    const data = await getNominalRollList();
    const typedData = data.map((r: any) => ({
      ...r,
      verificationStatus: (r.verificationStatus || 'Pending') as "Verified" | "Pending" | "Rejected",
      status: (r.status || 'Active') as "Active" | "Suspended" | "Retired" | "Transferred"
    }));
    set({ records: typedData.length > 0 ? typedData : defaultRecords, isLoading: false });
  },
  addRecord: async (record) => {
    let finalRecord = { ...record };
    if (!finalRecord.staffId) {
      finalRecord.staffId = get().generateStaffId(
        finalRecord.dateOfFirstAppointment,
        finalRecord.expectedRetirementDate,
        finalRecord.dateOfBirth
      );
    }
    
    // Save to Postgres
    const { saveNominalRollRecord } = await import('./postgres-service');
    await saveNominalRollRecord({ data: finalRecord });
    
    set((state) => ({
      records: [...state.records.filter(r => r.staffId !== finalRecord.staffId), finalRecord]
    }));
  },
  generateStaffId: (dateOfFirstAppointment, expectedRetirementDate, dateOfBirth) => {
    let empYear = new Date().getFullYear();
    if (dateOfFirstAppointment && !isNaN(new Date(dateOfFirstAppointment).getTime())) {
      empYear = new Date(dateOfFirstAppointment).getFullYear();
    }
    
    let retYear = empYear + 35;
    if (expectedRetirementDate && !isNaN(new Date(expectedRetirementDate).getTime())) {
      retYear = new Date(expectedRetirementDate).getFullYear();
    } else if (dateOfBirth && !isNaN(new Date(dateOfBirth).getTime())) {
      const calculatedRet = get().calculateRetirement(dateOfBirth, dateOfFirstAppointment);
      if (calculatedRet && !isNaN(new Date(calculatedRet).getTime())) {
        retYear = new Date(calculatedRet).getFullYear();
      }
    }
    
    const registeredCount = get().records.length;
    const seq = (registeredCount + 1).toString().padStart(6, '0');
    const empYearStr = empYear.toString().slice(-2);
    const retYearStr = retYear.toString().slice(-2);
    
    return `KGS/CS/${seq}/${empYearStr}/${retYearStr}`;
  },
  calculateRetirement: (dateOfBirth, dateOfFirstAppointment) => {
    const dob = new Date(dateOfBirth);
    const doa = new Date(dateOfFirstAppointment);
    
    const ageRetirement = new Date(dob.setFullYear(dob.getFullYear() + 60));
    const serviceRetirement = new Date(doa.setFullYear(doa.getFullYear() + 35));
    
    return ageRetirement < serviceRetirement ? ageRetirement.toISOString().split('T')[0] : serviceRetirement.toISOString().split('T')[0];
  },
  updateRecordStatus: async (staffId, status) => {
    const record = get().records.find(r => r.staffId === staffId);
    if (record) {
      const updated = { ...record, status };
      const { updateNominalRollStatus } = await import('./postgres-service');
      await updateNominalRollStatus({ data: { staffId, status } });
      set((state) => ({
        records: state.records.map(r => r.staffId === staffId ? updated : r)
      }));
    }
  }
}));

import { getSession } from './auth';

// Auto-trigger loading on window load if on browser and logged in
if (typeof window !== 'undefined') {
  setTimeout(() => {
    if (getSession()) {
      useNominalRollStore.getState().loadRecords();
    }
  }, 100);
}

