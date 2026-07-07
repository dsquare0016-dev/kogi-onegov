export interface CarouselSlide {
  id: string;
  type: "default" | "quote";
  title?: string;
  quote?: string;
  bgImage: string;
  author?: string;
  active: boolean;
}

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
    window.dispatchEvent(new Event('carouselUpdate'));
  }
};

const defaultSlides: CarouselSlide[] = [
  {
    id: "1",
    type: "default",
    bgImage: "",
    active: true
  },
  {
    id: "2",
    type: "quote",
    title: "On Unity and Inclusive Governance",
    quote: "Leadership is not about serving a select few; it is about serving every citizen. I was elected to serve all Kogites—those who supported me and those who did not. Democracy thrives on freedom of choice, and every citizen deserves respect, inclusion, and a voice in the collective progress of our state.",
    bgImage: "/slide-2.jpg",
    author: "H.E. Governor Ahmed Usman Ododo",
    active: true
  },
  {
    id: "3",
    type: "quote",
    title: "On Security and Sustainable Development",
    quote: "Security remains the foundation upon which development is built. The significant reduction in kidnapping, armed robbery, and other criminal activities across Kogi East demonstrates what can be achieved through collaboration, commitment, and strategic action. A safer society creates the right environment for investment, growth, and prosperity for all.",
    bgImage: "/slide-3.jpg",
    author: "H.E. Governor Ahmed Usman Ododo",
    active: true
  },
  {
    id: "4",
    type: "quote",
    title: "On Economic Growth",
    quote: "Kogi State is open for business and digital transformation. We are committed to creating an enabling environment for investors and ensuring that the dividends of democracy reach every corner of the state.",
    bgImage: "/slide-3.jpg",
    author: "H.E. Governor Ahmed Usman Ododo",
    active: false
  }
];

export const carouselStore = {
  get slides(): CarouselSlide[] {
    return getLocal<CarouselSlide[]>('gdu_carousel_slides', defaultSlides);
  },
  set slides(val: CarouselSlide[]) {
    setLocal('gdu_carousel_slides', val);
  },
  
  updateSlide(id: string, updates: Partial<CarouselSlide>) {
    const s = this.slides;
    const index = s.findIndex(x => x.id === id);
    if (index !== -1) {
      s[index] = { ...s[index], ...updates };
      this.slides = s;
    }
  },

  addSlide(slide: Omit<CarouselSlide, 'id'>) {
    const s = this.slides;
    s.push({ ...slide, id: Date.now().toString() });
    this.slides = s;
  },

  deleteSlide(id: string) {
    this.slides = this.slides.filter(x => x.id !== id);
  }
};
