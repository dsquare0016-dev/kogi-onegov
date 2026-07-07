export interface HolidayConfig {
  id: string;
  date: string; // YYYY-MM-DD format
  name: string;
}

export interface WorkingHoursConfig {
  startHour: number; // e.g., 8 for 8:00 AM
  endHour: number; // e.g., 16 for 4:00 PM
  holidays: HolidayConfig[];
}

const KEY = 'gdu_working_hours_config';

const defaultHolidays: HolidayConfig[] = [
  { id: 'h1', date: '2026-06-15', name: 'Eid al-Fitr (Sallah)' },
  { id: 'h2', date: '2026-12-25', name: 'Christmas Day' },
  { id: 'h3', date: '2026-06-12', name: 'Democracy Day' },
  { id: 'h4', date: '2026-01-01', name: 'New Year\'s Day' }
];

const defaultConfig: WorkingHoursConfig = {
  startHour: 8,
  endHour: 16,
  holidays: defaultHolidays
};

class WorkingHoursStore {
  private getLocal(): WorkingHoursConfig {
    if (typeof window === 'undefined') return defaultConfig;
    const val = localStorage.getItem(KEY);
    if (!val) return defaultConfig;
    try {
      return JSON.parse(val) as WorkingHoursConfig;
    } catch {
      return defaultConfig;
    }
  }

  private setLocal(config: WorkingHoursConfig) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY, JSON.stringify(config));
      window.dispatchEvent(new Event('workingHoursUpdate'));
    }
  }

  get config(): WorkingHoursConfig {
    return this.getLocal();
  }

  updateConfig(updates: Partial<WorkingHoursConfig>) {
    const current = this.getLocal();
    this.setLocal({ ...current, ...updates });
  }

  get startHour(): number {
    return this.config.startHour;
  }

  get endHour(): number {
    return this.config.endHour;
  }

  get holidays(): HolidayConfig[] {
    return this.config.holidays;
  }

  addHoliday(holiday: HolidayConfig) {
    const current = this.getLocal();
    this.setLocal({
      ...current,
      holidays: [...current.holidays, holiday]
    });
  }

  deleteHoliday(id: string) {
    const current = this.getLocal();
    this.setLocal({
      ...current,
      holidays: current.holidays.filter(h => h.id !== id)
    });
  }

  getStatusForDate(date: Date): { status: 'working' | 'closed' | 'weekend' | 'holiday'; label: string; tone: 'success' | 'destructive' | 'warning' | 'info' } {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // 1. Check if weekend (Saturday or Sunday)
    if (day === 0 || day === 6) {
      return {
        status: 'weekend',
        label: 'WEEKEND 🥳',
        tone: 'warning'
      };
    }

    // 2. Check if holiday
    const foundHoliday = this.holidays.find(h => h.date === dateStr);
    if (foundHoliday) {
      return {
        status: 'holiday',
        label: `HOLIDAY (${foundHoliday.name}) 🎈`,
        tone: 'info'
      };
    }

    // 3. Check weekday working hours
    const currentHour = date.getHours();
    if (currentHour >= this.startHour && currentHour < this.endHour) {
      return {
        status: 'working',
        label: 'WORKING HOURS',
        tone: 'success'
      };
    }

    return {
      status: 'closed',
      label: 'CLOSING TIME',
      tone: 'destructive'
    };
  }
}

export const workingHoursStore = new WorkingHoursStore();
