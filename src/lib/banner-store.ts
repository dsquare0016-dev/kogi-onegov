export interface Greeting {
  id: string;
  title: string;
  description: string;
}

export type BannerType = string | null;

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
    window.dispatchEvent(new Event('bannerUpdate'));
  }
};

const defaultGreetings: Greeting[] = [
  { id: 'eid', title: 'Happy Eid al-Fitr (Sallah)', description: 'Displays a celebratory banner and Islamic motifs.' },
  { id: 'christmas', title: 'Merry Christmas & Happy New Year', description: 'Displays holiday decorations and a greeting from the Governor.' },
  { id: 'democracy', title: 'Democracy Day Anniversary', description: 'Displays patriotic colors and state achievements.' }
];

class BannerStore {
  get activeBanner(): BannerType {
    return getLocal<BannerType>('gdu_active_banner', 'eid');
  }

  setActiveBanner(banner: BannerType) {
    setLocal('gdu_active_banner', banner);
  }

  get greetings(): Greeting[] {
    return getLocal<Greeting[]>('gdu_greetings', defaultGreetings);
  }

  setGreetings(greetings: Greeting[]) {
    setLocal('gdu_greetings', greetings);
  }

  addGreeting(greeting: Greeting) {
    const current = this.greetings;
    this.setGreetings([...current, greeting]);
  }

  updateGreeting(id: string, updated: Partial<Greeting>) {
    const current = this.greetings;
    this.setGreetings(current.map(g => g.id === id ? { ...g, ...updated } : g));
  }

  deleteGreeting(id: string) {
    const current = this.greetings;
    this.setGreetings(current.filter(g => g.id !== id));
  }
}

export const bannerStore = new BannerStore();
