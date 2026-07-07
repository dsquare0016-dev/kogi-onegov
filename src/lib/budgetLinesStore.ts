import { create } from 'zustand';
import { safeGetCollection, safeSetDoc } from './firebase';

export interface BudgetLineItem {
  id: string;
  mda: string;
  description: string;
  category: string;
  amount: number;
  year: number;
}

interface BudgetLinesState {
  budgetLines: BudgetLineItem[];
  isLoading: boolean;
  loadStore: () => Promise<void>;
  saveBudgetLinesForMda: (mda: string, lines: Omit<BudgetLineItem, 'id' | 'mda' | 'year'>[], year?: number) => Promise<void>;
  getMdaTotalBudget: (mda: string) => number;
  getTotalBudget: () => number;
}

const defaultBudgetLines: BudgetLineItem[] = [
  { id: 'bl-1', mda: 'Ministry of Health', description: 'Renovation of Specialist Hospitals', category: 'Capital Expenditure', amount: 450000000, year: 2026 },
  { id: 'bl-2', mda: 'Ministry of Education', description: 'Procurement of primary school books', category: 'Capital Expenditure', amount: 150000000, year: 2026 },
  { id: 'bl-3', mda: 'Ministry of Works', description: 'Highway maintenance equipment', category: 'Capital Expenditure', amount: 380000000, year: 2026 },
];

export const useBudgetLinesStore = create<BudgetLinesState>((set, get) => ({
  budgetLines: defaultBudgetLines,
  isLoading: false,

  loadStore: async () => {
    set({ isLoading: true });
    try {
      const { dbGetBudgetLines } = await import('./postgres-service');
      const data = await dbGetBudgetLines();
      set({ budgetLines: data.length > 0 ? data : defaultBudgetLines, isLoading: false });
    } catch (err) {
      console.error("Failed to load budget lines:", err);
      set({ budgetLines: defaultBudgetLines, isLoading: false });
    }
  },

  saveBudgetLinesForMda: async (mda, lines, year = 2026) => {
    try {
      const { dbSaveBudgetLinesForMda } = await import('./postgres-service');
      await dbSaveBudgetLinesForMda({ data: { mda, lines, year } });
      await get().loadStore();
      window.dispatchEvent(new Event('budgetLinesStoreUpdate'));
    } catch (err) {
      console.error("Failed to save budget lines:", err);
    }
  },

  getMdaTotalBudget: (mda) => {
    return get().budgetLines
      .filter(item => item.mda.toLowerCase() === mda.toLowerCase())
      .reduce((sum, item) => sum + item.amount, 0);
  },

  getTotalBudget: () => {
    return get().budgetLines.reduce((sum, item) => sum + item.amount, 0);
  }
}));

import { getSession } from './auth';

// Load store on load in browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    if (getSession()) {
      useBudgetLinesStore.getState().loadStore();
    }
  }, 100);
}
