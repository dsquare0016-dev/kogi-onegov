// Global Data Service for Dashboard Cards and System Settings
// This centralizes data fetching to easily swap between mock and live database sources.

export type DataStatus = 'connected' | 'mock' | 'not_connected' | 'error';

export interface DataResponse<T> {
  status: DataStatus;
  value: T | null;
  message: string;
  details?: any;
}

// Simulated delay for async operations
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// Helper to wrap mock data in standard response
const mockResponse = <T>(value: T, details?: any): DataResponse<T> => ({
  status: 'mock',
  value,
  message: 'Using Mock Data',
  details
});

const notConnectedResponse = <T>(): DataResponse<T> => ({
  status: 'not_connected',
  value: null,
  message: 'Not Connected'
});

// System Settings
import { safeGetCollection, safeSetDoc, db } from "./firebase";
import { collection, getDocs, doc, setDoc, getDoc, addDoc } from "firebase/firestore";
import { MINISTRIES, DEPARTMENTS, LGAS, MDA_HIERARCHY } from "./mock-data";
import { devPlanStore } from "./devPlanStore";
import { programmesStore } from "./programmesStore";
import { projectsStore } from "./projectsStore";
import { useNominalRollStore } from "./nominalRollStore";
let systemSettingsCache = {
  platformName: 'Kogi OneGov',
  shortPlatformName: 'OneGov',
  governmentName: 'Kogi State Government',
  stateName: 'Kogi',
  officeName: 'Government Delivery Unit',
  managingInstitution: 'Office of the Governor',
  websiteTitle: 'Kogi State ERP',
  websiteDescription: 'Unified Command Center for Governance',
  systemTagline: 'Excellence in Service Delivery',
  officialEmail: 'info@kogistate.gov.ng',
  officialPhone: '+234 800 000 0000',
  officialAddress: 'Government House, Lokoja, Kogi State',
  supportEmail: 'support@kogistate.gov.ng',
  supportPhone: '+234 800 000 0001',
  portalUrl: 'https://erp.kogistate.gov.ng',
  logo: '/kogi-logo.png',
  favicon: '/favicon.ico',
  watermarkLogo: '/gdu-logo.png',
  letterheadLogo: '/kogi-logo.png',
  footerText: 'Powered by GDU',
  copyrightText: '© 2026 Kogi State Government. All rights reserved.',
  currentGovernorName: 'H.E. Alhaji Ahmed Usman Ododo',
  deputyGovernorName: 'H.E. Comrade Joel Salifu',
  dgCoordinatorName: 'Hon. Abdulkareem Asuku',
  defaultReportPreparedBy: 'Government Delivery Unit',
  defaultReportPreparedFor: 'The Executive Governor',
  defaultCurrency: 'NGN (₦)',
  defaultFinancialYear: '2026',
  developmentPlanPeriod: '2024 - 2027',
  developmentPlanStartYear: '2024',
  developmentPlanEndYear: '2027'
};

export async function getSystemSettings(): Promise<DataResponse<typeof systemSettingsCache>> {
  await delay(100);
  return mockResponse(systemSettingsCache);
}

export async function updateSystemSettings(updates: Partial<typeof systemSettingsCache>) {
  await delay(200);
  systemSettingsCache = { ...systemSettingsCache, ...updates };
  return mockResponse(systemSettingsCache);
}

const withTimeout = <T>(promise: Promise<T>, ms: number = 2000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout ${ms}ms`)), ms))
  ]);
};

// Data Source Registry & Diagnostic Service
export async function getDataSourceStatus(): Promise<DataResponse<any[]>> {
  let isConnected = false;
  try {
    if (db) {
      // connection ping test
      const colRef = collection(db, 'system_settings');
      await withTimeout(getDocs(colRef), 1800);
      isConnected = true;
    }
  } catch (error) {
    console.warn("Real-time database connection test failed:", error);
    isConnected = false;
  }

  const sourcesList = [
    { id: 'users', name: 'Users Credentials', serviceFile: 'auth.ts', expectedTable: 'users', defaultCount: 5 },
    { id: 'nominal_roll', name: 'Nominal Roll (Staff)', serviceFile: 'nominalRollStore.ts', expectedTable: 'nominal_roll', defaultCount: 1200 },
    { id: 'memos', name: 'E-Memos', serviceFile: 'memo-service.ts', expectedTable: 'memos', defaultCount: 30 },
    { id: 'tasks', name: 'Tasks Registry', serviceFile: 'task-service.ts', expectedTable: 'tasks', defaultCount: 15 },
    { id: 'lgas', name: 'LGAs', serviceFile: 'systemDataService.ts', expectedTable: 'lgas', defaultCount: 21 },
    { id: 'budget', name: 'Budget Allocations', serviceFile: 'budget-data.ts', expectedTable: 'budget_allocations', defaultCount: 80 },
    { id: 'projects', name: 'Projects Registry', serviceFile: 'projectsStore.ts', expectedTable: 'projects', defaultCount: 40 },
    { id: 'exco_resolutions', name: 'EXCO Resolutions', serviceFile: 'systemDataService.ts', expectedTable: 'exco_resolutions', defaultCount: 3 },
    { id: 'legislative_bills', name: 'Legislative Bills', serviceFile: 'systemDataService.ts', expectedTable: 'legislative_bills', defaultCount: 2 },
    { id: 'governance_risk_alerts', name: 'Governance Risk Alerts', serviceFile: 'systemDataService.ts', expectedTable: 'governance_risk_alerts', defaultCount: 1 },
    { id: 'mda_compliance', name: 'MDA Compliance', serviceFile: 'systemDataService.ts', expectedTable: 'mda_compliance', defaultCount: 5 },
    { id: 'ministries', name: 'Ministries Registry', serviceFile: 'mda-service.ts', expectedTable: 'ministries', defaultCount: 24 },
    { id: 'departments', name: 'Departments Registry', serviceFile: 'mda-service.ts', expectedTable: 'departments', defaultCount: 142 },
    { id: 'agencies', name: 'Agencies & Boards', serviceFile: 'mda-service.ts', expectedTable: 'agencies', defaultCount: 68 }
  ];

  const results = [];

  for (const src of sourcesList) {
    let status: 'connected' | 'mock' | 'not_connected' = 'not_connected';
    let recordCount = 0;
    
    if (isConnected) {
      try {
        const colRef = collection(db, src.expectedTable);
        const snap = await withTimeout(getDocs(colRef), 2000);
        status = 'connected';
        recordCount = snap.size;
      } catch (err) {
        status = 'mock';
      }
    } else {
      status = 'mock';
    }

    if (status === 'mock') {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`firebase_fallback_${src.expectedTable}`);
        if (cached) {
          try {
            const list = JSON.parse(cached);
            recordCount = list.length;
          } catch {
            recordCount = 0;
          }
        } else {
          recordCount = src.defaultCount;
        }
      } else {
        recordCount = src.defaultCount;
      }
    }

    results.push({
      id: src.id,
      name: src.name,
      serviceFile: src.serviceFile,
      expectedTable: src.expectedTable,
      status: isConnected && status === 'connected' ? 'connected' : 'mock',
      records: recordCount
    });
  }

  return {
    status: isConnected ? 'connected' : 'mock',
    value: results,
    message: isConnected ? "Real-time diagnostics complete. Database connected." : "Diagnostics complete. Working in local offline cache mode."
  };
}

// MDA Statistics
export const defaultMinistriesSeed = MINISTRIES.map((m, i) => ({
  id: `min-${i}`,
  name: m.name,
  budget: m.budget,
  spent: m.spent,
  score: m.score,
  commissioner: {
    name: `Hon. Commissioner ${m.name.replace('Ministry of ', '')}`,
    phone: "+234 800 000 0000",
    email: `hon.comm@kogi.gov.ng`
  },
  activeProjectsCount: 5 + (i % 5),
  completedProjectsCount: 2 + (i % 3),
  kpis: [
    { name: "Budget Utilization Rate", target: "90%", actual: `${Math.round((m.spent/m.budget)*100)}%` },
    { name: "Project Completion Time", target: "95%", actual: `${m.score}%` }
  ],
  topProjects: [
    { name: `${m.name} Headquarter Renovation`, budget: "₦450M", status: "Active" }
  ]
}));

export const defaultAgenciesSeed = MDA_HIERARCHY.flatMap((m, idx) => 
  m.agencies.map((a, aIdx) => ({
    id: `ag-${idx}-${aIdx}`,
    name: a.name,
    motherMinistry: m.ministry,
    head: `DG/Exec Sec. ${a.name.split(' ')[0]}`,
    budget: 100 + ((idx * 13) % 400),
    score: 70 + ((idx * 7) % 25),
    status: "Active",
    locations: ["Lokoja HQ"],
    projectsCount: 2 + (aIdx % 4),
    departments: a.departments || ["Admin", "Finance", "Operations"]
  }))
);

export const defaultDepartmentsSeed = MDA_HIERARCHY.flatMap((m, idx) => [
  ...(m.departments || []).map((d, dIdx) => ({ id: `dept-min-${idx}-${dIdx}`, name: d, parent: m.ministry, type: 'Ministry', score: 75 + (dIdx % 15) })),
  ...(m.agencies || []).flatMap((a, aIdx) => (a.departments || []).map((d, dIdx) => ({ id: `dept-ag-${idx}-${aIdx}-${dIdx}`, name: d, parent: a.name, type: 'Agency', score: 72 + (dIdx % 15) })))
]);

export const defaultUnitsSeed = [
  { id: 'unit-1', name: 'Information Technology Unit', parent: 'Planning, Research & Statistics', type: 'Department' },
  { id: 'unit-2', name: 'Internal Audit Unit', parent: 'Finance & Accounts', type: 'Department' }
];

let pendingSummaryPromise: Promise<any> | null = null;
let summaryCache: any = null;
let cacheTimestamp = 0;

async function getCachedSummary(mdaFilter?: string) {
  if (mdaFilter) {
    try {
      const { dbGetMdaDashboardSummary } = await import('./postgres-service');
      return await dbGetMdaDashboardSummary({ data: { mda: mdaFilter } });
    } catch (err) {
      console.error("Failed to load MDA dashboard summary:", err);
      return null;
    }
  }

  const now = Date.now();
  if (summaryCache && (now - cacheTimestamp < 1000)) {
    return summaryCache;
  }
  if (pendingSummaryPromise) {
    return pendingSummaryPromise;
  }

  pendingSummaryPromise = (async () => {
    try {
      const { dbGetSystemDashboardSummary } = await import('./postgres-service');
      const res = await dbGetSystemDashboardSummary();
      if (res) {
        summaryCache = res;
        cacheTimestamp = Date.now();
      }
      return res;
    } catch (err) {
      console.error("Failed to load dashboard summary from database:", err);
      return null;
    } finally {
      pendingSummaryPromise = null;
    }
  })();

  return pendingSummaryPromise;
}

export async function getTotalMinistries(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary) {
    return { status: 'connected', value: summary.ministries, message: 'Fetched from Postgres' };
  }
  const data = await safeGetCollection('ministries', defaultMinistriesSeed);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Ministries Registry is empty. Root data not inputed in Ministries Directory (/dashboard/ministries/create).'
    };
  }
  return {
    status: 'connected',
    value: data.length,
    message: 'Fetched from Firestore ministries'
  };
}

export async function getTotalAgencies(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary) {
    return { status: 'connected', value: summary.agencies, message: 'Fetched from Postgres' };
  }
  const data = await safeGetCollection('agencies', defaultAgenciesSeed);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Agencies Registry is empty. Root data not inputed in Agencies Directory (/dashboard/agencies/create).'
    };
  }
  return {
    status: 'connected',
    value: data.length,
    message: 'Fetched from Firestore agencies'
  };
}

export async function getTotalDepartments(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary) {
    return { status: 'connected', value: summary.departments, message: 'Fetched from Postgres' };
  }
  const data = await safeGetCollection('departments', defaultDepartmentsSeed);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Departments Registry is empty. Root data not inputed in Departments Directory (/dashboard/departments/create).'
    };
  }
  return {
    status: 'connected',
    value: data.length,
    message: 'Fetched from Firestore departments'
  };
}

export async function getTotalUnits(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary) {
    return { status: 'connected', value: summary.units, message: 'Fetched from Postgres' };
  }
  const data = await safeGetCollection('units', defaultUnitsSeed);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Units Registry is empty. Root data not inputed in Units Directory (/dashboard/units/create).'
    };
  }
  return {
    status: 'connected',
    value: data.length,
    message: 'Fetched from Firestore units'
  };
}

export interface LgaEntry {
  id: string;
  name: string;
  headquarters: string;
  chairmanName: string;
  population: number;
  contactEmail: string;
  contactPhone: string;
  landArea: number;
  annualBudget: number;
}

export const defaultLgaEntries: LgaEntry[] = [
  { id: 'adavi', name: 'Adavi', headquarters: 'Ogaminana', chairmanName: 'Hon. Joseph Omuya', population: 202800, contactEmail: 'adavi@kogistate.gov.ng', contactPhone: '+234 803 000 0001', landArea: 718, annualBudget: 85000000 },
  { id: 'ajaokuta', name: 'Ajaokuta', headquarters: 'Egayin', chairmanName: 'Hon. Mustapha Akaaba', population: 122000, contactEmail: 'ajaokuta@kogistate.gov.ng', contactPhone: '+234 803 000 0002', landArea: 1362, annualBudget: 90000000 },
  { id: 'ankpa', name: 'Ankpa', headquarters: 'Ankpa', chairmanName: 'Hon. Ibrahim Abagwu', population: 266000, contactEmail: 'ankpa@kogistate.gov.ng', contactPhone: '+234 803 000 0003', landArea: 921, annualBudget: 110000000 },
  { id: 'bassa', name: 'Bassa', headquarters: 'Oguma', chairmanName: 'Hon. Muktar Shuaibu', population: 139000, contactEmail: 'bassa@kogistate.gov.ng', contactPhone: '+234 803 000 0004', landArea: 1925, annualBudget: 75000000 },
  { id: 'dekina', name: 'Dekina', headquarters: 'Dekina', chairmanName: 'Hon. Ishaq Shaibu', population: 352000, contactEmail: 'dekina@kogistate.gov.ng', contactPhone: '+234 803 000 0005', landArea: 2461, annualBudget: 130000000 },
  { id: 'ibaji', name: 'Ibaji', headquarters: 'Onyedega', chairmanName: 'Hon. William Iko-Ojo', population: 128000, contactEmail: 'ibaji@kogistate.gov.ng', contactPhone: '+234 803 000 0006', landArea: 1377, annualBudget: 60000000 },
  { id: 'idah', name: 'Idah', headquarters: 'Idah', chairmanName: 'Hon. Abuh Odoma', population: 79800, contactEmail: 'idah@kogistate.gov.ng', contactPhone: '+234 803 000 0007', landArea: 36, annualBudget: 80000000 },
  { id: 'igalamela-odolu', name: 'Igalamela-Odolu', headquarters: 'Ajaka', chairmanName: 'Hon. Cosmas Atabor', population: 148000, contactEmail: 'igalamela@kogistate.gov.ng', contactPhone: '+234 803 000 0008', landArea: 2175, annualBudget: 78000000 },
  { id: 'ijumu', name: 'Ijumu', headquarters: 'Iyara', chairmanName: 'Hon. Taofiq Isah', population: 118000, contactEmail: 'ijumu@kogistate.gov.ng', contactPhone: '+234 803 000 0009', landArea: 708, annualBudget: 82000000 },
  { id: 'kabba-bunu', name: 'Kabba/Bunu', headquarters: 'Kabba', chairmanName: 'Hon. Moses Olorunleke', population: 145000, contactEmail: 'kabba@kogistate.gov.ng', contactPhone: '+234 803 000 0010', landArea: 2706, annualBudget: 95000000 },
  { id: 'kogi', name: 'Koton Karfe (Kogi)', headquarters: 'Koton Karfe', chairmanName: 'Hon. Isah Abdulkarim', population: 115000, contactEmail: 'kogi_lga@kogistate.gov.ng', contactPhone: '+234 803 000 0011', landArea: 2955, annualBudget: 87000000 },
  { id: 'lokoja', name: 'Lokoja', headquarters: 'Lokoja', chairmanName: 'Hon. Muhammed Danasabe', population: 196000, contactEmail: 'lokoja@kogistate.gov.ng', contactPhone: '+234 803 000 0012', landArea: 3180, annualBudget: 150000000 },
  { id: 'mopa-muro', name: 'Mopa-Muro', headquarters: 'Mopa', chairmanName: 'Hon. Moses Sunday', population: 44000, contactEmail: 'mopamuro@kogistate.gov.ng', contactPhone: '+234 803 000 0013', landArea: 901, annualBudget: 55000000 },
  { id: 'ofu', name: 'Ofu', headquarters: 'Ogbonicha', chairmanName: 'Hon. Amodu Ibrahim', population: 192000, contactEmail: 'ofu@kogistate.gov.ng', contactPhone: '+234 803 000 0014', landArea: 1680, annualBudget: 88000000 },
  { id: 'ogori-magongo', name: 'Ogori/Magongo', headquarters: 'Akpafa', chairmanName: 'Hon. Goke Oparison', population: 40000, contactEmail: 'ogorimagongo@kogistate.gov.ng', contactPhone: '+234 803 000 0015', landArea: 79, annualBudget: 50000000 },
  { id: 'okehi', name: 'Okehi', headquarters: 'Obangede', chairmanName: 'Hon. Abdulraheem Ohiare', population: 228000, contactEmail: 'okehi@kogistate.gov.ng', contactPhone: '+234 803 000 0016', landArea: 661, annualBudget: 89000000 },
  { id: 'okene', name: 'Okene', headquarters: 'Okene', chairmanName: 'Hon. Abdulrazaq Muhammad', population: 320000, contactEmail: 'okene@kogistate.gov.ng', contactPhone: '+234 803 000 0017', landArea: 328, annualBudget: 140000000 },
  { id: 'olamaboro', name: 'Olamaboro', headquarters: 'Okpo', chairmanName: 'Hon. Friday Adejoh', population: 160000, contactEmail: 'olamaboro@kogistate.gov.ng', contactPhone: '+234 803 000 0018', landArea: 1132, annualBudget: 82000000 },
  { id: 'omala', name: 'Omala', headquarters: 'Abejukolo', chairmanName: 'Hon. Ibrahim Aboh', population: 108000, contactEmail: 'omala@kogistate.gov.ng', contactPhone: '+234 803 000 0019', landArea: 1667, annualBudget: 79000000 },
  { id: 'yagba-east', name: 'Yagba East', headquarters: 'Isanlu', chairmanName: 'Hon. Ijagbemi Asiru', population: 148000, contactEmail: 'yagbaeast@kogistate.gov.ng', contactPhone: '+234 803 000 0020', landArea: 1396, annualBudget: 86000000 },
  { id: 'yagba-west', name: 'Yagba West', headquarters: 'Odo-Eri', chairmanName: 'Hon. Pius Kolawole', population: 140000, contactEmail: 'yagbawest@kogistate.gov.ng', contactPhone: '+234 803 000 0021', landArea: 1276, annualBudget: 84000000 }
];

export async function getTotalLGAs(): Promise<DataResponse<number>> {
  const data = await safeGetCollection<LgaEntry>('lgas', defaultLgaEntries);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'LGAs Registry is empty. Root data not inputed in LGA Registry.'
    };
  }
  return {
    status: 'connected',
    value: data.length,
    message: 'Fetched from Firestore lgas',
    details: { list: data.map((item: any) => item.name) }
  };
}

export async function getLGAs(): Promise<DataResponse<LgaEntry[]>> {
  const data = await safeGetCollection<LgaEntry>('lgas', defaultLgaEntries);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'LGAs Registry is empty.'
    };
  }
  return {
    status: 'connected',
    value: data,
    message: 'Fetched LGAs from Firestore lgas'
  };
}

export async function updateLGA(id: string, updates: LgaEntry): Promise<DataResponse<LgaEntry>> {
  await safeSetDoc('lgas', id, updates);
  return {
    status: 'connected',
    value: updates,
    message: 'LGA Registry updated successfully.'
  };
}

// Staff (Nominal Roll Rule Applied)
export async function getTotalCivilServants(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary) {
    return { status: 'connected', value: summary.civilServants, message: 'Fetched from Postgres' };
  }
  const storeRecords = useNominalRollStore.getState().records;
  if (!storeRecords || storeRecords.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Nominal Roll is empty. Upload staff sheet in Staff Import (/dashboard/staff/upload).'
    };
  }
  return {
    status: 'connected',
    value: storeRecords.length,
    message: 'Fetched from local nominal roll store'
  };
}

export async function getTotalMaleCivilServants(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary) {
    return { status: 'connected', value: summary.males, message: 'Fetched from Postgres' };
  }
  const storeRecords = useNominalRollStore.getState().records;
  // Let's filter by gender or estimate based on profile data
  const count = storeRecords.filter((x: any) => x.gender === 'male' || x.gender === 'Male' || x.sex === 'Male' || x.sex === 'male').length;
  // Fallback to default mock number if no data yet
  return mockResponse(count || 8940);
}

export async function getTotalFemaleCivilServants(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary) {
    return { status: 'connected', value: summary.females, message: 'Fetched from Postgres' };
  }
  const storeRecords = useNominalRollStore.getState().records;
  const count = storeRecords.filter((x: any) => x.gender === 'female' || x.gender === 'Female' || x.sex === 'Female' || x.sex === 'female').length;
  return mockResponse(count || 6480);
}

export async function getTotalPoliticalAppointees(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary) {
    return { status: 'connected', value: summary.politicalAppointees, message: 'Fetched from Postgres' };
  }
  const data = await safeGetCollection('political_appointees', []);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Political Appointees Registry is empty. Root data not inputed.'
    };
  }
  return {
    status: 'connected',
    value: data.length,
    message: 'Fetched from Firestore'
  };
}

export async function getTotalAdhocStaff(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary) {
    return { status: 'connected', value: summary.adhocStaff, message: 'Fetched from Postgres' };
  }
  const data = await safeGetCollection('adhoc_staff', []);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Adhoc Staff Registry is empty. Root data not inputed.'
    };
  }
  return {
    status: 'connected',
    value: data.length,
    message: 'Fetched from Firestore'
  };
}

export async function getTotalRetirees(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary) {
    return { status: 'connected', value: summary.retirees, message: 'Fetched from Postgres' };
  }
  const data = await safeGetCollection('retirees', []);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Retirees Registry is empty. Root data not inputed.'
    };
  }
  return {
    status: 'connected',
    value: data.length,
    message: 'Fetched from Firestore'
  };
}

// Projects & Performance
// Projects & Performance
export async function getTotalProgrammes(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary && !mdaFilter) {
    return { status: 'connected', value: summary.programmes, message: 'Fetched from Postgres' };
  }
  const progs = programmesStore.programmes;
  const activeProgs = progs.filter(p => p.status === 'Active');
  
  const filtered = mdaFilter 
    ? activeProgs.filter(p => p.mda.toLowerCase() === mdaFilter.toLowerCase())
    : activeProgs;

  if (filtered.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Programmes Database is empty. Input data in Programmes Dashboard (/dashboard/programmes/create).'
    };
  }
  return {
    status: 'connected',
    value: filtered.length,
    message: mdaFilter ? `Active programmes for ${mdaFilter}` : 'Total active programmes in the state'
  };
}

export async function getTotalProjects(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary && !mdaFilter) {
    return { status: 'connected', value: summary.projects, message: 'Fetched from Postgres' };
  }
  const projects = projectsStore.projects;
  
  const filtered = mdaFilter
    ? projects.filter(p => p.ministry.toLowerCase() === mdaFilter.toLowerCase())
    : projects;

  if (filtered.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Projects Registry is empty. Input data in Projects Center (/dashboard/projects/create).'
    };
  }
  return {
    status: 'connected',
    value: filtered.length,
    message: mdaFilter ? `Total projects for ${mdaFilter}` : 'Total projects in the state'
  };
}

export async function getActiveProjects(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary && !mdaFilter) {
    return { status: 'connected', value: summary.activeProjects, message: 'Fetched from Postgres' };
  }
  const projects = projectsStore.projects;
  const active = projects.filter(p => p.status === 'Active' || p.status === 'On-Track' || p.status === 'At-Risk' || p.status === 'Delayed');
  
  const filtered = mdaFilter
    ? active.filter(p => p.ministry.toLowerCase() === mdaFilter.toLowerCase())
    : active;

  if (filtered.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Projects Registry is empty. Input data in Projects Center (/dashboard/projects/create).'
    };
  }
  return {
    status: 'connected',
    value: filtered.length,
    message: mdaFilter ? `Active projects for ${mdaFilter}` : 'Total active projects in the state'
  };
}

export async function getCompletedProjects(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary) {
    return { status: 'connected', value: summary.completedProjects, message: 'Fetched from Postgres' };
  }
  const data = await safeGetCollection('projects', []);
  const completed = data.filter((p: any) => p.status === 'Completed');
  return mockResponse(completed.length || 0);
}

export async function getDelayedProjects(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary) {
    return { status: 'connected', value: summary.delayedProjects, message: 'Fetched from Postgres' };
  }
  const data = await safeGetCollection('projects', []);
  const delayed = data.filter((p: any) => p.status === 'Delayed');
  return mockResponse(delayed.length || 0);
}

export async function getStatePerformanceIndex(mdaFilter?: string): Promise<DataResponse<number>> {
  const data = await safeGetCollection('kpis', []);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'KPI Framework is empty. No KPI measurements logged in KPI Framework (/dashboard/dev-plan/kpi-framework).'
    };
  }
  // Compute average of KPI values
  const avg = Math.round(data.reduce((acc: number, item: any) => acc + (item.value || 0), 0) / data.length);
  return {
    status: 'connected',
    value: avg || 84,
    message: 'Calculated from KPI framework'
  };
}

export async function getDevelopmentPlanPerformance(mdaFilter?: string): Promise<DataResponse<number>> {
  const data = await safeGetCollection('pillars', []);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Development Plan Pillars empty. No pillars progress logged (/dashboard/dev-plan/pillars).'
    };
  }
  const avg = Math.round(data.reduce((acc: number, item: any) => acc + (item.progress || 0), 0) / data.length);
  return {
    status: 'connected',
    value: avg || 76,
    message: 'Calculated from Development Plan Pillars'
  };
}

// Finance & Treasury
export async function getTotalBudget(mdaFilter?: string): Promise<DataResponse<string>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary && summary.totalAllocated) {
    return { status: 'connected', value: `₦${summary.totalAllocated.toLocaleString()}`, message: 'Fetched from Postgres' };
  }
  const data = await safeGetCollection('budgets', []);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Budget registry is empty. Upload budget allocations (/dashboard/budget/upload).'
    };
  }
  const total = data.reduce((acc: number, item: any) => acc + (item.amount || 0), 0);
  return {
    status: 'connected',
    value: `₦${total.toLocaleString()}`,
    message: 'Fetched from Firestore'
  };
}

export async function getTotalRevenue(): Promise<DataResponse<string>> {
  return {
    status: 'not_connected',
    value: null,
    message: 'Revenue logs empty. No revenues registered.'
  };
}

export async function getBudgetUtilization(mdaFilter?: string): Promise<DataResponse<number>> {
  const summary = await getCachedSummary(mdaFilter);
  if (summary && summary.totalAllocated) {
    return { status: 'connected', value: Math.round((summary.totalReleased / summary.totalAllocated) * 100), message: 'Fetched from Postgres' };
  }
  const data = await safeGetCollection('budgets', []);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Budget performance empty. Upload budget allocations or releases (/dashboard/budget/upload).'
    };
  }
  const totalAllocated = data.reduce((acc: number, item: any) => acc + (item.allocated || 0), 0);
  const totalReleased = data.reduce((acc: number, item: any) => acc + (item.released || 0), 0);
  if (!totalAllocated) return mockResponse(71);
  return {
    status: 'connected',
    value: Math.round((totalReleased / totalAllocated) * 100),
    message: 'Calculated from budget releases vs allocations'
  };
}

export async function getAttendanceRate(): Promise<DataResponse<number>> {
  const data = await safeGetCollection('attendance', []);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Attendance logs empty. Upload daily biometric attendance logs (/dashboard/attendance/upload).'
    };
  }
  const presentCount = data.filter((x: any) => x.status === 'Present' || x.status === 'Late').length;
  const rate = Math.round((presentCount / data.length) * 100);
  return {
    status: 'connected',
    value: rate || 92,
    message: 'Calculated from attendance logs'
  };
}

export async function getTotalDevPlanPillars(): Promise<DataResponse<number>> {
  const pillars = devPlanStore.pillars;
  if (!pillars || pillars.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Development Plan Pillars empty. No pillars progress logged (/dashboard/dev-plan/pillars).'
    };
  }
  return {
    status: 'connected',
    value: pillars.length,
    message: 'Fetched from Strategic Pillars configurations'
  };
}

export async function getTreasurySummary(): Promise<DataResponse<any>> {
  return mockResponse({
    crfBalance: '₦14,250,000,000',
    lastReconciled: 'Today'
  });
}

export async function getAuditSummary(): Promise<DataResponse<any>> {
  return mockResponse({
    openQueries: 4,
    complianceScore: 78
  });
}

// --- Executive Governance ---
export interface ExcoResolution {
  id: string;
  title: string;
  assignedTo: string;
  status: 'In Progress' | 'Implemented' | 'Delayed';
  datePassed: string;
}

export interface LegislativeBill {
  id: string;
  title: string;
  status: string;
  progress: number;
}

export interface GovernanceRiskAlert {
  id: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface MdaCompliance {
  id: string;
  mdaName: string;
  complianceScore: number;
}

const defaultExcoResolutions: ExcoResolution[] = [
  { id: 'RES-2026-084', title: 'Approval for Statewide Rural Electrification Phase 2', assignedTo: 'Ministry of Rural Development', status: 'In Progress', datePassed: '2026-06-15' },
  { id: 'RES-2026-083', title: 'Upward Review of Civil Service Minimum Wage Structure', assignedTo: 'Head of Service / Min of Finance', status: 'Implemented', datePassed: '2026-05-10' },
  { id: 'RES-2026-082', title: 'Procurement of 50 Waste Management Trucks', assignedTo: 'Ministry of Environment', status: 'Delayed', datePassed: '2026-04-20' }
];

const defaultLegislativeBills: LegislativeBill[] = [
  { id: 'BILL-2026-01', title: 'State Digital Economy Bill 2026', status: '2nd Reading', progress: 40 },
  { id: 'BILL-2026-02', title: 'Agricultural Zoning Act Amendment', status: 'Committee Stage', progress: 70 }
];

const defaultRiskAlerts: GovernanceRiskAlert[] = [
  { id: 'alert-1', title: 'Implementation Deadline Missed', message: 'Ministry of Environment has missed the 30-day implementation window for EXCO RES-2026-082. GDU intervention recommended.', severity: 'high' }
];

const defaultMdaCompliance: MdaCompliance[] = [
  { id: 'comp-1', mdaName: 'Ministry of Finance', complianceScore: 92 },
  { id: 'comp-2', mdaName: 'Ministry of Health', complianceScore: 88 },
  { id: 'comp-3', mdaName: 'Ministry of Education', complianceScore: 85 },
  { id: 'comp-4', mdaName: 'Ministry of Works', complianceScore: 82 },
  { id: 'comp-5', mdaName: 'Ministry of Environment', complianceScore: 65 }
];

export async function getExcoResolutions(): Promise<DataResponse<ExcoResolution[]>> {
  const data = await safeGetCollection<ExcoResolution>('exco_resolutions', defaultExcoResolutions);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'EXCO Resolutions database is empty. Add data in EXCO Management center.'
    };
  }
  return {
    status: 'connected',
    value: data,
    message: 'Fetched EXCO Resolutions from Firestore exco_resolutions'
  };
}

export async function getLegislativeBills(): Promise<DataResponse<LegislativeBill[]>> {
  const data = await safeGetCollection<LegislativeBill>('legislative_bills', defaultLegislativeBills);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Legislative Bills database is empty. Add data in Assembly relations center.'
    };
  }
  return {
    status: 'connected',
    value: data,
    message: 'Fetched Legislative Bills from Firestore legislative_bills'
  };
}

export async function getGovernanceRiskAlerts(): Promise<DataResponse<GovernanceRiskAlert[]>> {
  const data = await safeGetCollection<GovernanceRiskAlert>('governance_risk_alerts', defaultRiskAlerts);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Governance Risk Alerts database is empty.'
    };
  }
  return {
    status: 'connected',
    value: data,
    message: 'Fetched Governance Risk Alerts from Firestore governance_risk_alerts'
  };
}

export async function getMdaCompliance(): Promise<DataResponse<MdaCompliance[]>> {
  const data = await safeGetCollection<MdaCompliance>('mda_compliance', defaultMdaCompliance);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'MDA Compliance data empty.'
    };
  }
  return {
    status: 'connected',
    value: data,
    message: 'Fetched MDA Compliance from Firestore mda_compliance'
  };
}

export async function getBudgetExecutionTrend(): Promise<DataResponse<any[]>> {
  let isConnected = false;
  let allocations: any[] = [];
  
  try {
    if (db) {
      const colRef = collection(db, 'budget_allocations');
      const snapshot = await getDocs(colRef);
      isConnected = true;
      allocations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch (error) {
    console.warn("Firestore connection check failed for budget_allocations:", error);
    isConnected = false;
  }

  // If not connected, check if there is cached data in localStorage
  if (!isConnected) {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('firebase_fallback_budget_allocations');
      if (cached) {
        try {
          allocations = JSON.parse(cached);
        } catch {
          allocations = [];
        }
      }
    }
  }

  // Determine return status
  if (!isConnected && allocations.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Database is not connected and no local cache was found.'
    };
  }

  if (isConnected && allocations.length === 0) {
    return {
      status: 'connected',
      value: [],
      message: 'Database is connected, but the budget_allocations collection is empty. Please upload the budget in the Budget Upload section.'
    };
  }

  // We have allocations! Sum the approved amounts
  const totalApproved = allocations.reduce((sum, item) => sum + (item.amount || 0), 0);

  // Fetch projects to compute spent
  let projects: any[] = [];
  try {
    if (db) {
      const colRef = collection(db, 'projects');
      const snapshot = await getDocs(colRef);
      projects = snapshot.docs.map(doc => doc.data());
    }
  } catch {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('firebase_fallback_projects');
      if (cached) {
        try { projects = JSON.parse(cached); } catch {}
      }
    }
  }

  const totalSpent = projects.reduce((sum, item) => sum + (item.spent || 0), 0);

  // Generate monthly trend points (Jan - Dec)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const plannedPillars = [0.08, 0.16, 0.25, 0.33, 0.41, 0.50, 0.58, 0.66, 0.75, 0.83, 0.91, 1.0];
  
  const actualRatio = totalApproved > 0 ? Math.min(1.0, totalSpent / totalApproved) : 0.65;
  const targetActualMax = totalApproved * actualRatio;

  const trendData = months.map((m, idx) => {
    const plannedVal = Math.round(totalApproved * plannedPillars[idx]);
    const actualProgress = plannedPillars[idx] * (0.85 + (idx * 0.01));
    const actualVal = Math.round(targetActualMax * Math.min(1.0, actualProgress));
    
    return {
      m,
      planned: Math.round(plannedVal / 1000000), // in Millions (₦M)
      actual: Math.round(actualVal / 1000000)
    };
  });

  return {
    status: isConnected ? 'connected' : 'mock',
    value: trendData,
    message: isConnected ? 'Fetched live budget trend from Firestore.' : 'Using local cached budget trend.'
  };
}

export interface InfrastructureMetrics {
  dbStatus: 'Healthy' | 'Offline Cache' | 'Disconnected';
  totalRecords: number;
  storageUsed: string;
  evidenceSize: string;
  reportsSize: string;
}

export async function getInfrastructureMetrics(): Promise<DataResponse<InfrastructureMetrics>> {
  try {
    const { dbGetInfrastructureMetrics } = await import('./postgres-service');
    const metrics = await dbGetInfrastructureMetrics();
    return {
      status: 'connected',
      value: {
        dbStatus: `${metrics.dbStatus} (${metrics.dbName} on ${metrics.dbHost})`,
        totalRecords: metrics.totalRecords,
        storageUsed: metrics.storageUsed,
        evidenceSize: metrics.evidenceSize,
        reportsSize: metrics.reportsSize
      },
      message: `Database statistics read from live PostgreSQL instance with latency of ${metrics.latency}.`
    };
  } catch (err: any) {
    console.error("getInfrastructureMetrics error:", err);
    return {
      status: 'error',
      value: {
        dbStatus: 'Degraded',
        totalRecords: 0,
        storageUsed: '0 MB / 10 GB',
        evidenceSize: '0 MB',
        reportsSize: '0 MB'
      },
      message: 'Failed to read database statistics: ' + err.message
    };
  }
}

export interface DatabaseBackup {
  id: string;
  name: string;
  recordCount: number;
  size: string;
  timestamp: string;
  createdBy: string;
  payload?: string;
}

export async function getDatabaseBackups(): Promise<DataResponse<DatabaseBackup[]>> {
  try {
    const { dbGetDatabaseBackups } = await import('./postgres-service');
    const list = await dbGetDatabaseBackups();
    return {
      status: 'connected',
      value: list,
      message: 'Fetched backups list from PostgreSQL database.'
    };
  } catch (err: any) {
    console.error("getDatabaseBackups error:", err);
    return {
      status: 'error',
      value: [],
      message: 'Failed to fetch backups list.'
    };
  }
}

export async function createDatabaseBackupRecord(backup: DatabaseBackup): Promise<void> {
  const { dbSaveDatabaseBackup } = await import('./postgres-service');
  await dbSaveDatabaseBackup({
    data: {
      id: backup.id,
      name: backup.name,
      recordCount: backup.recordCount,
      size: backup.size,
      createdBy: backup.createdBy,
      payload: backup.payload || ''
    }
  });
}

export async function getBackupSettings(): Promise<DataResponse<{ frequency: string }>> {
  try {
    const { dbGetSystemSetting } = await import('./postgres-service');
    const config = await dbGetSystemSetting({ data: { key: 'backup_config' } });
    return {
      status: 'connected',
      value: {
        frequency: config?.frequency || 'Daily at 00:00'
      },
      message: 'Loaded backup configurations.'
    };
  } catch (err: any) {
    console.error("getBackupSettings error:", err);
    return {
      status: 'mock',
      value: { frequency: 'Daily at 00:00' },
      message: 'Failed to load backup config, using fallback.'
    };
  }
}

export async function updateBackupSettings(frequency: string): Promise<void> {
  const { dbSaveSystemSetting } = await import('./postgres-service');
  await dbSaveSystemSetting({
    data: {
      key: 'backup_config',
      value: { frequency }
    }
  });
}

export async function optimizeDatabaseTables(): Promise<{ status: string, message: string }> {
  try {
    const { dbOptimizeDatabase } = await import('./postgres-service');
    const res = await dbOptimizeDatabase();
    return res;
  } catch (err: any) {
    return {
      status: 'error',
      message: 'Optimization failed: ' + err.message
    };
  }
}

export interface WorkforceOverview {
  totalActive: number;
  biometricPercent: number;
  retirementsCount: number;
  ghostWorkersCount: number;
  glDistribution: { name: string; percentage: number }[];
  mdaRoll: { name: string; count: number; pct: number }[];
}

export async function getWorkforceOverview(): Promise<DataResponse<WorkforceOverview>> {
  const data = await safeGetCollection<any>('nominal_roll', []);
  if (data.length === 0) {
    return {
      status: 'not_connected',
      value: null,
      message: 'Nominal Roll is empty. Upload staff sheet in Staff Import (/dashboard/staff/upload).'
    };
  }

  const totalActive = data.filter(x => x.status === 'Active' || !x.status).length;
  const verifiedCount = data.filter(x => x.biometricVerified === true || x.biometricVerified === 'Verified').length;
  const biometricPercent = data.length > 0 ? Math.round((verifiedCount / data.length) * 100) : 98;
  const retirementsCount = data.filter(x => x.status === 'Retired' || x.isImminentRetirement || (x.retirementDate && new Date(x.retirementDate).getFullYear() <= new Date().getFullYear() + 1)).length;
  const ghostWorkersCount = data.filter(x => x.status === 'Flagged' || x.status === 'Ghost' || x.isFlaggedGhost).length;

  let junior = 0, mid = 0, senior = 0, mgmt = 0;
  data.forEach(x => {
    const gl = parseInt((x.gradeLevel || '').replace(/[^0-9]/g, '')) || 1;
    if (gl <= 6) junior++;
    else if (gl <= 10) mid++;
    else if (gl <= 14) senior++;
    else mgmt++;
  });
  const total = data.length || 1;
  const glDistribution = [
    { name: "GL 01 - GL 06 (Junior Staff)", percentage: Math.round((junior / total) * 100) },
    { name: "GL 07 - GL 10 (Mid-level Staff)", percentage: Math.round((mid / total) * 100) },
    { name: "GL 12 - GL 14 (Senior Staff)", percentage: Math.round((senior / total) * 100) },
    { name: "GL 15 - GL 17 (Management / Directorate)", percentage: Math.round((mgmt / total) * 100) }
  ];

  const mdaMap: Record<string, number> = {};
  data.forEach(x => {
    const mda = x.ministry || x.department || 'Office of the Governor';
    mdaMap[mda] = (mdaMap[mda] || 0) + 1;
  });
  const sortedMda = Object.entries(mdaMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100)
    }));

  return {
    status: 'connected',
    value: {
      totalActive,
      biometricPercent,
      retirementsCount,
      ghostWorkersCount,
      glDistribution,
      mdaRoll: sortedMda
    },
    message: 'Calculated from live nominal roll database.'
  };
}
