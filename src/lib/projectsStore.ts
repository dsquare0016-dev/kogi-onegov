import { PROJECTS } from "./mock-data";
import { CAPITAL_PROJECTS } from "./budget-data";

export interface MajorProject {
  id: string;
  name: string;
  amount: number;
}

export interface Category {
  id: string;
  name: string;
  projects: MajorProject[];
}

export interface ProjectRow {
  id: string;
  name: string;
  ministry: string;
  lga: string;
  budget: number;
  progress: number;
  risk: string;
  status: string;
  spent?: number;
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
    window.dispatchEvent(new Event('projectsStoreUpdate'));
  }
};

const defaultCategories: Category[] = CAPITAL_PROJECTS.categories.map((c, i) => ({
  id: `cat-${i}`,
  name: c.name,
  projects: c.projects.map((p, j) => ({
    id: `mp-${i}-${j}`,
    name: p.name,
    amount: p.amount
  }))
}));

const defaultProjectRows: ProjectRow[] = PROJECTS.map(p => ({
  id: p.id,
  name: p.name,
  ministry: p.ministry,
  lga: p.lga,
  budget: p.budget,
  progress: p.progress,
  risk: p.risk,
  status: p.status
}));

export const syncProjectsToDb = async () => {
  try {
    const { dbSaveProject } = await import('./postgres-service');
    for (const p of projectsStore.projects) {
      await dbSaveProject({ data: p });
    }
  } catch (err) {
    console.error("Failed to sync projects to DB:", err);
  }
};

export const syncProjectsFromDb = async () => {
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
    if (data.projects && data.projects.length > 0) {
      localStorage.setItem('gdu_projects_rows', JSON.stringify(data.projects));
      window.dispatchEvent(new Event('projectsStoreUpdate'));
    }
  } catch (err) {
    console.error("Failed to sync projects from DB:", err);
  }
};

export const projectsStore = {
  get pageTitle() {
    return getLocal<string>('gdu_projects_title', 'Projects & Verification Engine');
  },
  set pageTitle(val: string) {
    setLocal('gdu_projects_title', val);
  },

  get pageSubtitle() {
    return getLocal<string>('gdu_projects_subtitle', 'Capital and recurrent project pipeline with mandatory evidence-based authenticity verification before completion.');
  },
  set pageSubtitle(val: string) {
    setLocal('gdu_projects_subtitle', val);
  },

  get categories() {
    return getLocal<Category[]>('gdu_projects_categories', defaultCategories);
  },
  set categories(val: Category[]) {
    setLocal('gdu_projects_categories', val);
  },

  get projects() {
    return getLocal<ProjectRow[]>('gdu_projects_rows', defaultProjectRows);
  },
  set projects(val: ProjectRow[]) {
    setLocal('gdu_projects_rows', val);
    syncProjectsToDb();
  }
};

import { getSession } from './auth';

if (typeof window !== 'undefined') {
  setTimeout(() => {
    if (getSession()) {
      syncProjectsFromDb();
    }
  }, 200);
}
