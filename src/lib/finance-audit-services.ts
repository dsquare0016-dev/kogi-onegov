import { 
  dbGetAuditQueries, 
  dbCreateAuditQuery, 
  dbResolveAuditQuery, 
  dbGetComplianceScores, 
  dbUpdateComplianceScore 
} from './postgres-service';

export async function fetchAuditQueries() {
  return await dbGetAuditQueries();
}

export async function createAuditQuery(data: { mda: string; subject: string; urgency: string }) {
  return await dbCreateAuditQuery({ data });
}

export async function resolveAuditQuery(id: string) {
  return await dbResolveAuditQuery({ data: { id } });
}

export async function createComplianceRecord(data: any) {
  return { success: true, record: data };
}

export async function fetchComplianceScores() {
  return await dbGetComplianceScores();
}

export async function updateComplianceScore(id: string, newScore: number) {
  await dbUpdateComplianceScore({ data: { id, score: newScore } });
  return null; // The frontend refetches
}

export async function updateTreasuryRecord(data: any) {
  return { success: true, record: data };
}

export async function syncTreasuryBalance() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    crf: '₦15,800,500,000', // Updated from 14.25B
    lastSynced: new Date().toLocaleTimeString(),
    reconciled: true
  };
}

export async function createPaymentRecord(data: any) {
  return { success: true, record: data };
}

export async function updateExpenditureRecord(data: any) {
  return { success: true, record: data };
}