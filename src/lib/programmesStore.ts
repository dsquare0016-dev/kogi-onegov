export type ProgrammeStatus = "Planning" | "Active" | "Pending Approval" | "Suspended" | "Archived";

export interface ProgrammeProject {
  id: string;
  name: string;
  status: string;
  progress: number;
}

export interface ProgrammeRow {
  id: string;
  name: string;
  pillar: string;
  mda: string;
  budget: number; // Stored as number for easier math, displayed as "₦X.XB"
  status: ProgrammeStatus;
  progress: number;
  reason?: string; // For suspended / archived
  projects: ProgrammeProject[];
}

const initialProgrammes: ProgrammeRow[] = [
  {
    id: "PRG-001",
    name: "Lokoja Beautification Programme",
    pillar: "Building Resilience",
    mda: "Ministry of Environment",
    budget: 4200000000,
    status: "Active",
    progress: 45,
    projects: [
      { id: "pj-1", name: "Lokoja Central Roads Rehab", status: "Active", progress: 60 },
      { id: "pj-2", name: "City-wide Streetlights Installation", status: "Active", progress: 85 },
      { id: "pj-3", name: "Drainage Expansion Phase 1", status: "Delayed", progress: 20 },
    ]
  },
  {
    id: "PRG-002",
    name: "Confluence Healthcare Transformation",
    pillar: "Building Resilience",
    mda: "Ministry of Health",
    budget: 12500000000,
    status: "Active",
    progress: 68,
    projects: [
      { id: "pj-4", name: "Reference Hospital Okene Upgrade", status: "Active", progress: 95 },
      { id: "pj-5", name: "Primary Healthcare Centers (21 LGAs)", status: "Active", progress: 40 },
    ]
  },
  {
    id: "PRG-003",
    name: "Youth Tech & Innovation Drive",
    pillar: "Fostering Prosperity",
    mda: "Ministry of Innovation",
    budget: 2100000000,
    status: "Pending Approval",
    progress: 0,
    projects: [
      { id: "pj-6", name: "Confluence Tech Hub Setup", status: "Tendering", progress: 0 },
      { id: "pj-7", name: "10,000 Youth Coding Bootcamp", status: "Planning", progress: 0 },
    ]
  }
];

class ProgrammesStore {
  private _programmes: ProgrammeRow[] = initialProgrammes;

  get programmes() {
    return this._programmes;
  }

  set programmes(val: ProgrammeRow[]) {
    this._programmes = val;
    this.notify();
    
    const saveToDb = async () => {
      try {
        const { dbSaveProgramme } = await import('./postgres-service');
        for (const p of val) {
          await dbSaveProgramme({ data: p });
        }
      } catch (err) {
        console.error("Failed to save programmes to DB:", err);
      }
    };
    saveToDb();
  }

  async load() {
    try {
      const { dbGetProgrammesAndProjects } = await import('./postgres-service');
      const { getSession } = await import('./auth');
      const session = getSession();

      const data = await dbGetProgrammesAndProjects({ 
        data: { 
          role: session?.role, 
          organizationId: session?.organizationId 
        } 
      });
      if (data.programmes && data.programmes.length > 0) {
        this._programmes = data.programmes;
        this.notify();
      }
    } catch (err) {
      console.error("Failed to load programmes from DB:", err);
    }
  }

  private notify() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('programmesStoreUpdate'));
    }
  }
}

export const programmesStore = new ProgrammesStore();

import { getSession } from './auth';

if (typeof window !== 'undefined') {
  setTimeout(() => {
    if (getSession()) {
      programmesStore.load();
    }
  }, 100);
}
