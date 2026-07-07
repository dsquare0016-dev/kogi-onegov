// Mock service for Ministries, Departments, and Agencies
// Replaces hardcoded component state with clean async functions ready for API

import { MINISTRIES } from './mock-data';

// Extended ministry type that allows dynamic properties added at runtime
type MinistryRecord = {
  name: string;
  score: number;
  projects: number;
  budget: number;
  spent: number;
  id?: string;
  commissioner?: string;
  permanentSecretary?: string;
  agenciesList?: string[];
  [key: string]: any;
};

// Add auto-generated IDs for service operations
let ministriesData: MinistryRecord[] = MINISTRIES.map((m, i) => ({
  ...m,
  id: `ministry-${i + 1}`,
}));

export async function fetchMinistries() {
  // Simulate network
  await new Promise(r => setTimeout(r, 400));
  return [...ministriesData];
}

export async function getMinistryById(id: string) {
  const m = ministriesData.find(m => m.id === id);
  if (!m) throw new Error('Ministry not found');
  return m;
}

export async function updateMinistry(id: string, updates: Partial<MinistryRecord>) {
  ministriesData = ministriesData.map(m => 
    m.id === id ? { ...m, ...updates } : m
  );
  return await getMinistryById(id);
}

export async function assignPrincipalOfficer(ministryId: string, role: 'commissioner' | 'permanent_secretary', officerData: any) {
  const m = await getMinistryById(ministryId);
  const updated: Partial<MinistryRecord> = { ...m };
  
  if (role === 'commissioner') {
    updated.commissioner = officerData.name;
  } else if (role === 'permanent_secretary') {
    updated.permanentSecretary = officerData.name;
  }

  return await updateMinistry(ministryId, updated);
}

export async function fetchAgencies() {
  // Simulating agencies derived from mock data
  return ministriesData.flatMap(m => 
    m.agenciesList ? m.agenciesList.map((name: string) => ({
      name,
      parentMinistry: m.name,
      status: 'Active'
    })) : []
  );
}
