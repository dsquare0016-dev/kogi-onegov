import { create } from 'zustand';
import { useNominalRollStore, StaffType } from './nominalRollStore';

export interface Applicant {
  id: string; // Unique Application ID
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: 'Under Review' | 'Processing' | 'Give Appointment' | 'Not Qualified' | 'Not Successful';
  appliedDate: string;
}

export interface JobRole {
  id: string;
  title: string;
  requirements: string;
}

const defaultRoles: JobRole[] = [
  { id: '1', title: 'Administrative Officer II', requirements: 'B.Sc / HND in relevant field, NYSC Certificate.' },
  { id: '2', title: 'State Counsel', requirements: 'LLB, BL, NYSC Certificate.' },
  { id: '3', title: 'Medical Officer', requirements: 'MBBS, Current License, NYSC Certificate.' },
  { id: '4', title: 'Education Officer (Teacher)', requirements: 'B.Ed / NCE, TRCN Certification.' }
];

type FormField = { id: number, label: string, checked: boolean, isCustom: boolean };

interface RecruitmentState {
  applicationRules: string;
  formFields: FormField[];
  documentUploads: FormField[];
  isActive: boolean;
  isVisible: boolean;
  applicants: Applicant[];
  roles: JobRole[];
  
  setApplicationRules: (val: string) => void;
  setFormFields: (val: FormField[]) => void;
  setDocumentUploads: (val: FormField[]) => void;
  setIsActive: (val: boolean) => void;
  setIsVisible: (val: boolean) => void;
  setRoles: (roles: JobRole[]) => void;
  
  addApplicant: (applicant: Applicant) => void;
  updateStatus: (id: string, newStatus: Applicant['status']) => void;
  getApplicantById: (id: string) => Applicant | null;
}

export const useRecruitmentStore = create<RecruitmentState>((set, get) => ({
  applicationRules: "1. All applicants must be indigenes of Kogi State.\n2. You must possess a valid NYSC discharge or exemption certificate.\n3. Multiple applications will lead to automatic disqualification.",
  formFields: [
    { id: 1, label: "Personal Details (Name, Phone, Email)", checked: true, isCustom: false },
    { id: 2, label: "State of Origin / LGA", checked: true, isCustom: false },
    { id: 3, label: "Education & Qualifications", checked: true, isCustom: false },
    { id: 4, label: "Work Experience", checked: true, isCustom: false }
  ],
  documentUploads: [
    { id: 5, label: "NYSC Certificate Upload", checked: false, isCustom: false },
    { id: 6, label: "Medical Fitness Report", checked: false, isCustom: false }
  ],
  isActive: false,
  isVisible: true,
  applicants: [
    { id: "APP-983142", fullName: "Ibrahim Yakubu", email: "ibrahim.y@gmail.com", phone: "08012345678", role: "State Counsel", status: "Under Review", appliedDate: "2026-06-25" },
    { id: "APP-412399", fullName: "Mary Ojo", email: "mary.o@gmail.com", phone: "09087654321", role: "Medical Officer", status: "Processing", appliedDate: "2026-06-26" }
  ],
  roles: defaultRoles,
  
  setApplicationRules: (val) => set({ applicationRules: val }),
  setFormFields: (val) => set({ formFields: val }),
  setDocumentUploads: (val) => set({ documentUploads: val }),
  setIsActive: (val) => set({ isActive: val }),
  setIsVisible: (val) => set({ isVisible: val }),
  setRoles: (roles) => set({ roles }),
  
  addApplicant: (applicant) => set((state) => ({ applicants: [...state.applicants, applicant] })),
  
  updateStatus: (id, newStatus) => {
    set((state) => {
      const applicants = [...state.applicants];
      const index = applicants.findIndex(a => a.id === id);
      if (index !== -1) {
        applicants[index] = { ...applicants[index], status: newStatus };
        
        // --- Integration with Nominal Roll ---
        if (newStatus === 'Give Appointment') {
          const applicant = applicants[index];
          const nominalStore = useNominalRollStore.getState();
          const doa = new Date().toISOString().split('T')[0];
          const dob = '1995-01-01'; // Placeholder for now
          const expectedRetirementDate = nominalStore.calculateRetirement(dob, doa);
          const staffId = nominalStore.generateStaffId(doa, expectedRetirementDate, dob);
          
          // Verify they aren't already added (naive check)
          const exists = nominalStore.records.find(r => r.email === applicant.email);
          if (!exists) {
            nominalStore.addRecord({
              staffId,
              fullName: applicant.fullName,
              email: applicant.email,
              staffType: 'Civil Servant',
              department: 'Pending Assignment',
              mda: 'Pending Deployment',
              gradeLevel: 'GL-08',
              dateOfFirstAppointment: doa,
              dateOfBirth: dob,
              status: 'Active',
              verificationStatus: 'Pending',
              expectedRetirementDate
            });
          }
        }
      }
      return { applicants };
    });
  },
  
  getApplicantById: (id) => get().applicants.find(a => a.id === id) || null
}));
