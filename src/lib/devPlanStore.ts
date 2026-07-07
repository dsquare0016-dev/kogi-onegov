export interface Pillar {
  id: string;
  name: string;
  description: string;
  color: string;
  budgetAllocated: number;
}

export interface Objective {
  id: string;
  pillarId: string;
  title: string;
  timeline: string;
}

export interface KPI {
  id: string;
  objectiveId: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
}

export interface SPIMetric {
  id: string;
  name: string;
  description: string;
  weight: number;
  color: string;
}

// Helper to interact with localStorage safely
const getLocal = <T,>(key: string, defaultVal: T): T => {
  if (typeof window === 'undefined') return defaultVal;
  const val = localStorage.getItem(key);
  if (!val) return defaultVal;
  try {
    return JSON.parse(val) as T;
  } catch {
    return defaultVal;
  }
};

const setLocal = (key: string, val: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event('devPlanUpdate'));
  }
};

const defaultPillars: Pillar[] = [
  { id: 'p1', name: 'Fostering Prosperity', description: 'Economic growth and wealth creation.', color: 'emerald', budgetAllocated: 150000000000 },
  { id: 'p2', name: 'Building Resilience', description: 'Human capital and infrastructure development.', color: 'blue', budgetAllocated: 200000000000 },
  { id: 'p3', name: 'Providing Direction', description: 'Governance and public sector effectiveness.', color: 'amber', budgetAllocated: 80000000000 }
];

const defaultObjectives: Objective[] = [
  { id: 'o1', pillarId: 'p1', title: 'Achieve a high standard of living through sustainable economic growth', timeline: '2056' },
  { id: 'o2', pillarId: 'p1', title: 'Transform Kogi into an investment and business destination', timeline: '2040' },
  { id: 'o3', pillarId: 'p2', title: 'Provide world-class education and healthcare', timeline: '2056' },
  { id: 'o4', pillarId: 'p2', title: 'Build a technology-driven and innovation-based society', timeline: '2056' },
  { id: 'o5', pillarId: 'p3', title: 'Strengthen institutions for peace, security, justice, and governance', timeline: '2030' }
];

const defaultKPIs: KPI[] = [
  { id: 'k1', objectiveId: 'o1', metric: 'GDP Growth Rate (%)', targetValue: 12, currentValue: 4, unit: '%' },
  { id: 'k2', objectiveId: 'o2', metric: 'FDI Inflow ($M)', targetValue: 5000, currentValue: 120, unit: '$M' },
  { id: 'k3', objectiveId: 'o3', metric: 'Literacy Rate (%)', targetValue: 98, currentValue: 72, unit: '%' },
  { id: 'k4', objectiveId: 'o4', metric: 'Broadband Penetration (%)', targetValue: 90, currentValue: 35, unit: '%' },
  { id: 'k5', objectiveId: 'o5', metric: 'Justice Delivery Time (Days)', targetValue: 30, currentValue: 180, unit: 'Days' }
];

export const syncToDb = async () => {
  try {
    const { dbSaveDevelopmentPlan } = await import('./postgres-service');
    await dbSaveDevelopmentPlan({
      data: {
        vision: devPlanStore.vision,
        pillars: devPlanStore.pillars,
        objectives: devPlanStore.objectives,
        kpis: devPlanStore.kpis
      }
    });
  } catch (err) {
    console.error("Failed to sync dev plan to DB:", err);
  }
};

export const syncFromDb = async (mdaName?: string | null) => {
  try {
    const { dbLoadDevelopmentPlan, dbLoadDevelopmentPlanForMda } = await import('./postgres-service');
    const data = mdaName 
      ? await dbLoadDevelopmentPlanForMda({ data: { mda: mdaName } })
      : await dbLoadDevelopmentPlan();
    
    if (data.plans && data.plans.length > 0) {
      localStorage.setItem('gdu_devplan_vision', JSON.stringify(data.plans[0].description));
    } else if (data.vision) {
      localStorage.setItem('gdu_devplan_vision', JSON.stringify(data.vision));
    }
    
    if (data.pillars) {
      const mappedPillars = data.pillars.map((p: any) => ({
        id: p.code || p.id,
        name: p.name,
        description: p.description || '',
        color: p.code === 'FP' || p.code === 'p1' ? 'emerald' : p.code === 'BR' || p.code === 'p2' ? 'blue' : 'amber',
        budgetAllocated: Number(p.weight || p.budgetAllocated || 0)
      }));
      localStorage.setItem('gdu_devplan_pillars', JSON.stringify(mappedPillars));
    }
    
    if (data.objectives) {
      const mappedObjs = data.objectives.map((o: any) => ({
        id: o.code || o.id,
        pillarId: o.pillarId || o.pillar_id || 'p1',
        title: o.title || o.objective_title || '',
        timeline: o.timeline || '2056'
      }));
      localStorage.setItem('gdu_devplan_objectives', JSON.stringify(mappedObjs));
    }
    
    if (data.kpis) {
      const mappedKpis = data.kpis.map((k: any) => ({
        id: k.id,
        objectiveId: k.objectiveId || k.objective_id,
        metric: k.metric,
        targetValue: Number(k.targetValue || k.target_value || 0),
        currentValue: Number(k.currentValue || k.current_value || 0),
        unit: k.unit || ''
      }));
      localStorage.setItem('gdu_devplan_kpis', JSON.stringify(mappedKpis));
    }
    window.dispatchEvent(new Event('devPlanUpdate'));
  } catch (err) {
    console.error("Failed to sync dev plan from DB:", err);
  }
};


export const devPlanStore = {
  get vision() {
    return getLocal<string>('gdu_devplan_vision', 'A state distinguished by its exceptional innovation, health and wealth, firmly established on the foundations of peace, durable infrastructure, environmental sustainability and exemplary governance, presenting a confluence of diverse opportunities.');
  },
  set vision(val: string) {
    setLocal('gdu_devplan_vision', val);
    syncToDb();
  },

  get pillars() {
    return getLocal<Pillar[]>('gdu_devplan_pillars', defaultPillars);
  },
  setPillars(pillars: Pillar[]) {
    setLocal('gdu_devplan_pillars', pillars);
    syncToDb();
  },

  get objectives() {
    return getLocal<Objective[]>('gdu_devplan_objectives', defaultObjectives);
  },
  setObjectives(objectives: Objective[]) {
    setLocal('gdu_devplan_objectives', objectives);
    syncToDb();
  },

  get kpis() {
    return getLocal<KPI[]>('gdu_devplan_kpis', defaultKPIs);
  },
  setKPIs(kpis: KPI[]) {
    setLocal('gdu_devplan_kpis', kpis);
    syncToDb();
  },

  get spiFormula() {
    const defaultSPIMetrics: SPIMetric[] = [
      { id: 'sm1', name: 'Budget Execution', description: 'Financial discipline and adherence to approved budget limits.', weight: 40, color: 'emerald' },
      { id: 'sm2', name: 'KPI Completion', description: 'Physical project delivery and KPI target completion.', weight: 40, color: 'blue' },
      { id: 'sm3', name: 'Citizen Feedback', description: 'Public satisfaction and community impact surveys.', weight: 10, color: 'indigo' },
      { id: 'sm4', name: 'Compliance & Audit', description: 'Adherence to public procurement and audit guidelines.', weight: 10, color: 'amber' }
    ];
    return getLocal<SPIMetric[]>('gdu_devplan_spi_formula_v2', defaultSPIMetrics);
  },
  set spiFormula(val: SPIMetric[]) {
    setLocal('gdu_devplan_spi_formula_v2', val);
  }
};

import { getSession } from './auth';

if (typeof window !== 'undefined') {
  setTimeout(() => {
    if (getSession()) {
      syncFromDb();
    }
  }, 200);
}
