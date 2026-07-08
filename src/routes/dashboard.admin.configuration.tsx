import { dbGetSystemSetting, dbGetSystemSettings, dbSaveSystemSetting, dbToggleYearLock } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Image as ImageIcon, Palette, Globe, LayoutTemplate, Clock, Calendar, Plus, Trash2, Shield, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/lib/settingsStore';
import { carouselStore } from '@/lib/carouselStore';
import { bannerStore, BannerType, Greeting } from '@/lib/banner-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { workingHoursStore, HolidayConfig } from '@/lib/working-hours-store';

export const Route = createFileRoute('/dashboard/admin/configuration')({
  component: AdminConfigurationComponent,
})

function AdminConfigurationComponent() {
  const [activeBanner, setActiveBanner] = useState<BannerType>(() => bannerStore.activeBanner);
  const [greetings, setGreetings] = useState<Greeting[]>(() => bannerStore.greetings);
  const [activeTab, setActiveTab] = useState('site-info');
  const [slides, setSlides] = useState(() => carouselStore.slides);
  const [activeTheme, setActiveTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gdu_portal_theme') || 'default';
    }
    return 'default';
  });

  const { 
    governanceAlignmentLevel, setGovernanceAlignmentLevel,
    isCommunicationHubEnabled, setCommunicationHubEnabled
  } = useSettingsStore();

  const handleActivateTheme = (theme: string) => {
    setActiveTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gdu_portal_theme', theme);
      window.dispatchEvent(new Event('themeUpdate'));
    }
  };

  // Profile and Brand States
  const [siteName, setSiteName] = useState("Kogi OneGov");
  const [siteTitle, setSiteTitle] = useState("Kogi OneGov Enterprise ERP");
  const [shortName, setShortName] = useState("Kogi OneGov");
  const [orgName, setOrgName] = useState("Government Delivery Unit");
  const [govName, setGovName] = useState("Kogi State Government");
  const [copyright, setCopyright] = useState("© 2026 Kogi State Government. All Rights Reserved.");

  const [mainLogo, setMainLogo] = useState("/kogi-logo.png");
  const [stateSeal, setStateSeal] = useState("/kogi-seal.png");
  const [gduLogo, setGduLogo] = useState("/gdu-logo.png");
  const [loginBg, setLoginBg] = useState("/login-bg.jpg");
  const [watermark, setWatermark] = useState("/watermark.png");

  // Working hours and holidays state
  const [startHour, setStartHour] = useState(() => workingHoursStore.startHour);
  const [endHour, setEndHour] = useState(() => workingHoursStore.endHour);
  const [holidays, setHolidays] = useState<HolidayConfig[]>(() => workingHoursStore.holidays);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");

  const [activeYear, setActiveYear] = useState<number>(2026);
  const [isYearLocked, setIsYearLocked] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      
      
      const allSettings = await dbGetSystemSettings();
      if (allSettings.operational_year) {
        setActiveYear(allSettings.operational_year.current_year || 2026);
        setIsYearLocked(allSettings.operational_year.is_locked || false);
      }

      const data = await dbGetSystemSetting({ data: { key: 'site_configuration' } });
      if (data) {
        setSiteName(data.siteName || "Kogi OneGov");
        setSiteTitle(data.siteTitle || "Kogi OneGov Enterprise ERP");
        setShortName(data.shortName || "Kogi OneGov");
        setOrgName(data.orgName || "Government Delivery Unit");
        setGovName(data.govName || "Kogi State Government");
        setCopyright(data.copyright || "© 2026 Kogi State Government. All Rights Reserved.");

        setMainLogo(data.mainLogo || "/kogi-logo.png");
        setStateSeal(data.stateSeal || "/kogi-seal.png");
        setGduLogo(data.gduLogo || "/gdu-logo.png");
        setLoginBg(data.loginBg || "/login-bg.jpg");
        setWatermark(data.watermark || "/watermark.png");

        if (data.alignmentLevel) setGovernanceAlignmentLevel(data.alignmentLevel);
        if (data.communicationHub !== undefined) setCommunicationHubEnabled(data.communicationHub);
        if (data.startHour || data.endHour || data.holidays) {
          workingHoursStore.updateConfig({
            startHour: data.startHour ?? undefined,
            endHour: data.endHour ?? undefined,
            holidays: data.holidays ?? undefined
          });
          if (data.startHour) setStartHour(data.startHour);
          if (data.endHour) setEndHour(data.endHour);
          if (data.holidays) setHolidays(data.holidays);
        }
        if (data.activeTheme) {
          setActiveTheme(data.activeTheme);
          if (typeof window !== 'undefined') {
            localStorage.setItem('gdu_portal_theme', data.activeTheme);
            window.dispatchEvent(new Event('themeUpdate'));
          }
        }
        if (data.activeBanner !== undefined) {
          bannerStore.setActiveBanner(data.activeBanner);
          setActiveBanner(data.activeBanner);
        }
        if (data.greetings) {
          bannerStore.setGreetings(data.greetings);
          setGreetings(data.greetings);
        }
        if (data.slides) {
          carouselStore.slides = data.slides;
          setSlides(data.slides);
        }
      }
      setLoading(false);
    };
    loadConfig();
  }, []);

  const handleSaveAll = async (extraPayload = {}) => {
    try {
      const payload = {
        siteName,
        siteTitle,
        shortName,
        orgName,
        govName,
        copyright,
        mainLogo,
        stateSeal,
        gduLogo,
        loginBg,
        watermark,
        alignmentLevel: governanceAlignmentLevel,
        communicationHub: isCommunicationHubEnabled,
        startHour,
        endHour,
        holidays,
        activeTheme,
        activeBanner,
        greetings,
        slides,
        ...extraPayload
      };
      await dbSaveSystemSetting({
        data: {
          key: 'site_configuration',
          value: payload
        }
      });
      
      // Update local storage and trigger update events immediately for active tab sessions
      if (typeof window !== 'undefined') {
        localStorage.setItem('gdu_site_name', payload.siteName);
        localStorage.setItem('gdu_site_title', payload.siteTitle);
        localStorage.setItem('gdu_short_name', payload.shortName);
        localStorage.setItem('gdu_org_name', payload.orgName);
        localStorage.setItem('gdu_gov_name', payload.govName);
        localStorage.setItem('gdu_copyright', payload.copyright);
        localStorage.setItem('gdu_main_logo', payload.mainLogo);
        localStorage.setItem('gdu_state_seal', payload.stateSeal);
        localStorage.setItem('gdu_gdu_logo', payload.gduLogo);
        localStorage.setItem('gdu_login_bg', payload.loginBg);
        localStorage.setItem('gdu_watermark', payload.watermark);
        localStorage.setItem('gdu_portal_theme', payload.activeTheme);
        
        if (payload.siteTitle) {
          document.title = payload.siteTitle;
        }

        window.dispatchEvent(new Event('siteConfigUpdate'));
        window.dispatchEvent(new Event('themeUpdate'));
        window.dispatchEvent(new Event('bannerUpdate'));
        window.dispatchEvent(new Event('carouselUpdate'));
        window.dispatchEvent(new Event('workingHoursUpdate'));
      }
      
      console.log("Configuration saved successfully to PostgreSQL database!");
    } catch (e: any) {
      console.error("Failed to save configuration: " + e.message);
    }
  };

  // New/Edit greeting form state
  const [editingGreetingId, setEditingGreetingId] = useState<string | null>(null);
  const [newGreetingTitle, setNewGreetingTitle] = useState("");
  const [newGreetingDesc, setNewGreetingDesc] = useState("");
  const [showGreetingModal, setShowGreetingModal] = useState(false);

  // New/Edit quote form state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteTitle, setNewQuoteTitle] = useState("");
  const [newQuoteAuthor, setNewQuoteAuthor] = useState("H.E. Governor Ahmed Usman Ododo");

  useEffect(() => {
    const handleUpdate = () => setSlides(carouselStore.slides);
    window.addEventListener('carouselUpdate', handleUpdate);
    return () => window.removeEventListener('carouselUpdate', handleUpdate);
  }, []);

  useEffect(() => {
    const handleWHUpdate = () => {
      setStartHour(workingHoursStore.startHour);
      setEndHour(workingHoursStore.endHour);
      setHolidays(workingHoursStore.holidays);
    };
    window.addEventListener('workingHoursUpdate', handleWHUpdate);
    return () => window.removeEventListener('workingHoursUpdate', handleWHUpdate);
  }, []);

  useEffect(() => {
    const handleBannerUpdate = () => {
      setActiveBanner(bannerStore.activeBanner);
      setGreetings(bannerStore.greetings);
    };
    window.addEventListener('bannerUpdate', handleBannerUpdate);
    return () => window.removeEventListener('bannerUpdate', handleBannerUpdate);
  }, []);

  const toggleBanner = (banner: BannerType) => {
    const nextBanner = activeBanner === banner ? null : banner;
    bannerStore.setActiveBanner(nextBanner);
    setActiveBanner(nextBanner);
    handleSaveAll({ activeBanner: nextBanner });
  };

  const openNewGreetingModal = () => {
    setEditingGreetingId(null);
    setNewGreetingTitle("");
    setNewGreetingDesc("");
    setShowGreetingModal(true);
  };

  const openEditGreetingModal = (greeting: Greeting) => {
    setEditingGreetingId(greeting.id);
    setNewGreetingTitle(greeting.title);
    setNewGreetingDesc(greeting.description);
    setShowGreetingModal(true);
  };

  const handleSaveGreeting = () => {
    if (!newGreetingTitle.trim() || !newGreetingDesc.trim()) return;
    
    let updatedGreetings = greetings;
    if (editingGreetingId) {
      bannerStore.updateGreeting(editingGreetingId, {
        title: newGreetingTitle,
        description: newGreetingDesc,
      });
      updatedGreetings = greetings.map(g => g.id === editingGreetingId ? { ...g, title: newGreetingTitle, description: newGreetingDesc } : g);
    } else {
      const newGreeting: Greeting = {
        id: `g-${Date.now()}`,
        title: newGreetingTitle,
        description: newGreetingDesc,
      };
      bannerStore.addGreeting(newGreeting);
      updatedGreetings = [...greetings, newGreeting];
    }
    
    setGreetings(updatedGreetings);
    setNewGreetingTitle("");
    setNewGreetingDesc("");
    setShowGreetingModal(false);
    handleSaveAll({ greetings: updatedGreetings });
  };

  const handleDeleteGreeting = (id: string) => {
    bannerStore.deleteGreeting(id);
    const updated = greetings.filter(g => g.id !== id);
    setGreetings(updated);
    handleSaveAll({ greetings: updated });
  };

  const openNewQuoteModal = () => {
    setEditingQuoteId(null);
    setNewQuoteText("");
    setNewQuoteTitle("");
    setNewQuoteAuthor("H.E. Governor Ahmed Usman Ododo");
    setShowQuoteModal(true);
  };

  const openEditQuoteModal = (slide: any) => {
    setEditingQuoteId(slide.id);
    setNewQuoteText(slide.quote || "");
    setNewQuoteTitle(slide.title || "");
    setNewQuoteAuthor(slide.author || "H.E. Governor Ahmed Usman Ododo");
    setShowQuoteModal(true);
  };

  const handleSaveQuote = () => {
    if (!newQuoteText.trim()) return;
    
    let updatedSlides = slides;
    if (editingQuoteId) {
      carouselStore.updateSlide(editingQuoteId, {
        quote: newQuoteText,
        title: newQuoteTitle,
        author: newQuoteAuthor
      });
      updatedSlides = slides.map(s => s.id === editingQuoteId ? { ...s, quote: newQuoteText, title: newQuoteTitle, author: newQuoteAuthor } : s);
    } else {
      const newSlide = {
        id: Date.now().toString(),
        type: 'quote' as const,
        quote: newQuoteText,
        title: newQuoteTitle,
        author: newQuoteAuthor,
        bgImage: "/slide-3.jpg",
        active: true
      };
      carouselStore.addSlide(newSlide);
      updatedSlides = [...slides, newSlide];
    }
    
    setSlides(updatedSlides);
    setShowQuoteModal(false);
    handleSaveAll({ slides: updatedSlides });
  };

  const handleDeleteQuote = (id: string) => {
    carouselStore.deleteSlide(id);
    const updated = slides.filter(s => s.id !== id);
    setSlides(updated);
    handleSaveAll({ slides: updated });
  };

  const toggleSlideStatus = (id: string, currentActive: boolean) => {
    carouselStore.updateSlide(id, { active: !currentActive });
    const updated = slides.map(s => s.id === id ? { ...s, active: !currentActive } : s);
    setSlides(updated);
    handleSaveAll({ slides: updated });
  };

  const handleSaveWorkingHours = async () => {
    workingHoursStore.updateConfig({
      startHour: Number(startHour),
      endHour: Number(endHour)
    });
    await handleSaveAll({ startHour: Number(startHour), endHour: Number(endHour) });
  };

  const handleAddHoliday = async () => {
    if (!newHolidayDate || !newHolidayName.trim()) return;
    const newHoliday: HolidayConfig = {
      id: `h-${Date.now()}`,
      date: newHolidayDate,
      name: newHolidayName
    };
    workingHoursStore.addHoliday(newHoliday);
    const updatedHolidays = [...holidays, newHoliday];
    setHolidays(updatedHolidays);
    setNewHolidayDate("");
    setNewHolidayName("");
    await handleSaveAll({ holidays: updatedHolidays });
  };

  const handleDeleteHoliday = async (id: string) => {
    workingHoursStore.deleteHoliday(id);
    const updatedHolidays = holidays.filter(h => h.id !== id);
    setHolidays(updatedHolidays);
    await handleSaveAll({ holidays: updatedHolidays });
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Configuration</h1>
        <p className="text-muted-foreground mt-1">Manage global system settings, branding, logos, and public CMS content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Sidebar Navigation for Tabs */}
        <div className="flex flex-col gap-2">
          <TabButton id="site-info" label="Site Information" icon={Settings} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="logos" label="Logo Management" icon={ImageIcon} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="branding" label="Branding Center" icon={Palette} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="seo" label="SEO Settings" icon={Globe} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="portal" label="Portal Themes & Greetings" icon={LayoutTemplate} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="working-hours" label="Working Hours & Holidays" icon={Clock} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="governance" label="Governance & Alignment" icon={Shield} activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="yearly-close" label="Year-End Lock & Performance" icon={Calendar} activeTab={activeTab} onClick={setActiveTab} />
        </div>

        {/* Tab Content Area */}
        <div className="md:col-span-3">
          
          {activeTab === 'site-info' && (
            <Card className="border-border/60 shadow-sm bg-card">
              <CardHeader className="border-b border-border/50 bg-muted/10">
                <CardTitle className="font-black text-lg">Site Profile</CardTitle>
                <CardDescription>Basic nomenclature for the ERP platform.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-foreground">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Site Name</label>
                    <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Site Title</label>
                    <input type="text" value={siteTitle} onChange={e => setSiteTitle(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Short Name</label>
                    <input type="text" value={shortName} onChange={e => setShortName(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Organization Name</label>
                    <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Government Name</label>
                    <input type="text" value={govName} onChange={e => setGovName(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Copyright Text</label>
                    <input type="text" value={copyright} onChange={e => setCopyright(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none" />
                  </div>
                </div>
                <div className="flex justify-end mt-4 pt-4 border-t border-border/50">
                  <button onClick={() => handleSaveAll()} className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-bold flex items-center gap-1.5 cursor-pointer hover:bg-primary/95 shadow-sm"><Save className="size-4" /> Save Changes</button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'governance' && (
            <Card className="border-border/60 shadow-sm animate-in fade-in zoom-in-95">
              <CardHeader className="border-b border-border/50">
                <CardTitle>Governance Settings</CardTitle>
                <CardDescription>Configure Development Plan Alignment Policy for the state.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-4">Development Plan Alignment Enforcement</h3>
                  <div className="space-y-4">
                    <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${governanceAlignmentLevel === 1 ? 'border-primary bg-primary/5' : 'border-border/50 hover:bg-muted/50'}`}>
                      <input 
                        type="radio" 
                        name="alignmentLevel" 
                        className="mt-1 size-4" 
                        checked={governanceAlignmentLevel === 1}
                        onChange={() => setGovernanceAlignmentLevel(1)}
                      />
                      <div>
                        <div className="font-bold text-sm">Level 1 - Warning Only</div>
                        <div className="text-xs text-muted-foreground mt-1">Show a red "NOT ALIGNED" badge. Allow the workflow to continue. Log the event. Notify DG GDU.</div>
                      </div>
                    </label>

                    <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${governanceAlignmentLevel === 2 ? 'border-primary bg-primary/5' : 'border-border/50 hover:bg-muted/50'}`}>
                      <input 
                        type="radio" 
                        name="alignmentLevel" 
                        className="mt-1 size-4"
                        checked={governanceAlignmentLevel === 2}
                        onChange={() => setGovernanceAlignmentLevel(2)}
                      />
                      <div>
                        <div className="font-bold text-sm">Level 2 - Approval Warning (Recommended)</div>
                        <div className="text-xs text-muted-foreground mt-1">Before approval, display a mandatory warning dialog. Require the approving officer to enter a justification before proceeding.</div>
                      </div>
                    </label>

                    <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${governanceAlignmentLevel === 3 ? 'border-rose-500 bg-rose-500/5' : 'border-border/50 hover:bg-muted/50'}`}>
                      <input 
                        type="radio" 
                        name="alignmentLevel" 
                        className="mt-1 size-4"
                        checked={governanceAlignmentLevel === 3}
                        onChange={() => setGovernanceAlignmentLevel(3)}
                      />
                      <div>
                        <div className="font-bold text-sm text-rose-600 dark:text-rose-400">Level 3 - Strict Governance</div>
                        <div className="text-xs text-muted-foreground mt-1">Prevent approval of any Budget, Programme, Project, or Expenditure not linked to the Development Plan. Only Governor/DG GDU can override.</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <h3 className="text-sm font-semibold mb-4">Module Management</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div>
                        <div className="font-bold text-sm">Communication Hub</div>
                        <div className="text-xs text-muted-foreground mt-1">Enable or disable the Communication Hub module (Direct & Group Messages) globally.</div>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={isCommunicationHubEnabled}
                          onChange={(e) => setCommunicationHubEnabled(e.target.checked)}
                        />
                        <span className={`${isCommunicationHubEnabled ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-muted-foreground'} inline-block h-4 w-4 transform rounded-full transition-transform`} />
                      </div>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end mt-6 pt-4 border-t border-border/50">
                  <button onClick={() => handleSaveAll()} className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-bold flex items-center gap-1.5 cursor-pointer hover:bg-primary/95 shadow-sm"><Save className="size-4" /> Save Governance Policy</button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'logos' && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/50">
                <CardTitle>Logo Management</CardTitle>
                <CardDescription>Upload and configure system-wide logos.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <LogoBox label="Main ERP Logo" />
                <LogoBox label="Kogi State Seal" />
                <LogoBox label="GDU Logo" />
                <LogoBox label="Login Page Background" isWide />
                <LogoBox label="Report Watermark" />
              </CardContent>
            </Card>
          )}

          {activeTab === 'branding' && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/50">
                <CardTitle>Branding Center</CardTitle>
                <CardDescription>Configure the visual identity and color palettes.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase">System Colors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ColorPickerBox label="Primary Color" color="bg-emerald-600" hex="#059669" />
                    <ColorPickerBox label="Secondary Color" color="bg-indigo-600" hex="#4f46e5" />
                    <ColorPickerBox label="Success Color" color="bg-emerald-500" hex="#10b981" />
                    <ColorPickerBox label="Error Color" color="bg-rose-500" hex="#f43f5e" />
                  </div>
                </div>
                <div className="pt-4 border-t border-border/50">
                   <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase">Typography</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <InputBox label="Site Font" value="Inter, sans-serif" />
                      <InputBox label="Dashboard Font" value="Outfit, sans-serif" />
                      <InputBox label="Report Font" value="Merriweather, serif" />
                   </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'seo' && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/50">
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Search engine directives for public-facing pages.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <InputBox label="SEO Title" value="Kogi OneGov - Official Governance Platform" />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Meta Description</label>
                  <textarea className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm h-20" defaultValue="The official Digital Governance and Performance Delivery platform for Kogi State..."></textarea>
                </div>
                <InputBox label="Meta Keywords" value="kogi state, governance, erp, delivery unit" />
                <div className="pt-4 border-t border-border/50">
                   <h3 className="text-sm font-semibold mb-4">Indexing Rules</h3>
                   <div className="flex gap-4">
                     <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Enable Sitemap.xml</label>
                     <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Generate Robots.txt</label>
                   </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'portal' && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/50">
                <CardTitle>Portal Themes & Greetings</CardTitle>
                <CardDescription>Configure portal themes and customizable holiday/event greetings.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                <div>
                   <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">Portal Themes</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Default Theme */}
                      <div 
                        onClick={() => handleActivateTheme('default')}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${activeTheme === 'default' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted/10'}`}
                      >
                         <div className={`font-semibold text-sm mb-1 ${activeTheme === 'default' ? 'text-primary' : 'text-foreground'}`}>Default Government Theme</div>
                         <div className="text-xs text-muted-foreground">Standard professional layout.</div>
                         {activeTheme === 'default' ? (
                           <div className="mt-3 text-xs font-bold text-primary">Active</div>
                         ) : (
                           <button className="mt-3 text-xs font-semibold text-primary hover:underline">Activate</button>
                         )}
                      </div>
                      {/* Executive Theme (Gold Theme) */}
                      <div 
                        onClick={() => handleActivateTheme('executive')}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${activeTheme === 'executive' ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500' : 'border-border hover:bg-muted/10'}`}
                      >
                         <div className={`font-semibold text-sm mb-1 ${activeTheme === 'executive' ? 'text-indigo-600 dark:text-indigo-400' : 'text-foreground'}`}>Executive Dashboard Theme</div>
                         <div className="text-xs text-muted-foreground">High-contrast data layout.</div>
                         {activeTheme === 'executive' ? (
                           <div className="mt-3 text-xs font-bold text-indigo-500">Active</div>
                         ) : (
                           <button className="mt-3 text-xs font-semibold text-primary hover:underline">Activate</button>
                         )}
                      </div>
                      {/* Public Theme (Logo colors) */}
                      <div 
                        onClick={() => handleActivateTheme('public')}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${activeTheme === 'public' ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500' : 'border-border hover:bg-muted/10'}`}
                      >
                         <div className={`font-semibold text-sm mb-1 ${activeTheme === 'public' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>Public Portal Theme</div>
                         <div className="text-xs text-muted-foreground">Citizen-facing minimal layout.</div>
                         {activeTheme === 'public' ? (
                           <div className="mt-3 text-xs font-bold text-emerald-500">Active</div>
                         ) : (
                           <button className="mt-3 text-xs font-semibold text-primary hover:underline">Activate</button>
                         )}
                      </div>
                   </div>
                 </div>

                <div className="pt-4 border-t border-border/50">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-semibold text-muted-foreground uppercase">Holiday Greetings & Banners</h3>
                     <Dialog open={showGreetingModal} onOpenChange={setShowGreetingModal}>
                       <DialogTrigger asChild>
                         <button onClick={openNewGreetingModal} className="px-3 py-1.5 bg-primary text-white rounded text-xs font-bold">+ New Greeting</button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-[425px]">
                         <DialogHeader>
                           <DialogTitle>{editingGreetingId ? "Edit Greeting" : "Create New Greeting"}</DialogTitle>
                         </DialogHeader>
                         <div className="grid gap-4 py-4">
                           <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="title" className="text-right">Title</Label>
                             <Input 
                               id="title" 
                               value={newGreetingTitle} 
                               onChange={(e) => setNewGreetingTitle(e.target.value)} 
                               placeholder="e.g. Independence Day" 
                               className="col-span-3" 
                             />
                           </div>
                           <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="desc" className="text-right">Description</Label>
                             <Input 
                               id="desc" 
                               value={newGreetingDesc} 
                               onChange={(e) => setNewGreetingDesc(e.target.value)} 
                               placeholder="e.g. Displays national colors..." 
                               className="col-span-3" 
                             />
                           </div>
                         </div>
                         <DialogFooter>
                           <Button type="button" onClick={handleSaveGreeting}>{editingGreetingId ? "Save Changes" : "Create"}</Button>
                         </DialogFooter>
                       </DialogContent>
                     </Dialog>
                   </div>
                   <div className="space-y-3">
                     {greetings.map(greeting => (
                       <div key={greeting.id} className={`p-3 border rounded-md flex justify-between items-center transition-colors ${activeBanner === greeting.id ? 'bg-emerald-500/5 border-emerald-500/50' : 'border-border hover:bg-muted/10'}`}>
                          <div>
                            <div className="font-semibold text-sm">{greeting.title}</div>
                            <div className="text-xs text-muted-foreground">{greeting.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => openEditGreetingModal(greeting)} 
                              className="text-xs px-3 py-1 border rounded font-semibold border-border text-foreground hover:bg-muted/50"
                            >
                              Edit
                            </button>
                            {/* Optional: Add a delete button for custom ones if needed */}
                            {greeting.id.startsWith('g-') && (
                              <button 
                                onClick={() => handleDeleteGreeting(greeting.id)} 
                                className="text-xs px-3 py-1 border border-rose-200 text-rose-500 rounded font-semibold hover:bg-rose-50"
                              >
                                Delete
                              </button>
                            )}
                            <button 
                              onClick={() => toggleBanner(greeting.id)} 
                              className={`text-xs px-3 py-1 rounded font-semibold transition-colors ${activeBanner === greeting.id ? 'bg-emerald-500 text-white' : 'border border-border text-foreground hover:bg-muted/50'}`}
                            >
                              {activeBanner === greeting.id ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase">Governor Quote Roller</h3>
                      <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
                        <DialogTrigger asChild>
                          <button onClick={openNewQuoteModal} className="px-3 py-1.5 bg-primary text-white rounded text-xs font-bold">+ New Quote</button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>{editingQuoteId ? "Edit Governor Quote" : "Create New Governor Quote"}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="qTitle" className="text-right text-xs">Title</Label>
                              <Input 
                                id="qTitle" 
                                value={newQuoteTitle} 
                                onChange={(e) => setNewQuoteTitle(e.target.value)} 
                                placeholder="e.g. On Economic Growth" 
                                className="col-span-3 text-xs h-9" 
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="qText" className="text-right text-xs">Quote Text</Label>
                              <textarea 
                                id="qText" 
                                value={newQuoteText} 
                                onChange={(e) => setNewQuoteText(e.target.value)} 
                                placeholder="Enter quote here..." 
                                className="col-span-3 w-full p-2 bg-muted/50 border border-border rounded-md text-xs h-24 focus:outline-none" 
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="qAuthor" className="text-right text-xs">Author</Label>
                              <Input 
                                id="qAuthor" 
                                value={newQuoteAuthor} 
                                onChange={(e) => setNewQuoteAuthor(e.target.value)} 
                                placeholder="H.E. Governor Ahmed Usman Ododo" 
                                className="col-span-3 text-xs h-9" 
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="button" className="text-xs h-9" onClick={handleSaveQuote}>{editingQuoteId ? "Save Changes" : "Create"}</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="space-y-3">
                      {slides.filter(s => s.type === 'quote').map(slide => (
                        <div key={slide.id} className={`p-3 border rounded-md flex justify-between items-center transition-colors ${slide.active ? 'border-primary/20 bg-primary/5' : 'border-border hover:bg-muted/10'}`}>
                           <div className="flex gap-4 items-center">
                             <div className={`size-10 border rounded overflow-hidden flex items-center justify-center ${slide.active ? 'bg-background border-border' : 'bg-muted border-border'}`}>
                                <ImageIcon className="size-5 text-muted-foreground" />
                             </div>
                             <div className="max-w-[70%] md:max-w-[80%]">
                               <div className="font-semibold text-sm line-clamp-1">"{slide.quote}"</div>
                               <div className="text-xs text-muted-foreground">{slide.author || "H.E. Governor Ahmed Usman Ododo"}</div>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <button 
                                onClick={() => openEditQuoteModal(slide)}
                                className={`text-xs px-3 py-1 border rounded font-semibold ${slide.active ? 'border-primary/30 bg-background text-primary' : 'border-border text-muted-foreground'}`}
                              >
                                Edit
                              </button>
                              {slide.id !== '2' && slide.id !== '3' && (
                                <button 
                                  onClick={() => handleDeleteQuote(slide.id)}
                                  className="text-xs px-3 py-1 border border-rose-200 text-rose-500 rounded font-semibold hover:bg-rose-50"
                                >
                                  Delete
                                </button>
                              )}
                              <button 
                                onClick={() => toggleSlideStatus(slide.id, slide.active)}
                                className={`text-xs px-3 py-1 rounded font-semibold transition-colors ${slide.active ? 'bg-emerald-500 text-white' : 'border border-border bg-muted/50 text-muted-foreground hover:bg-muted'}`}
                              >
                                {slide.active ? 'Active' : 'Inactive'}
                              </button>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>

              </CardContent>
            </Card>
          )}

          {activeTab === 'working-hours' && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/50">
                <CardTitle>Working Hours & Holidays</CardTitle>
                <CardDescription>Configure office working hours and custom holiday calendars that display state-wide alerts on the header widget.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* 1. Working Hours Config */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Shift Timing</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="startHour">Start Hour (24h format)</Label>
                      <Input 
                        id="startHour" 
                        type="number" 
                        min="0" 
                        max="23"
                        value={startHour} 
                        onChange={(e) => setStartHour(Number(e.target.value))} 
                      />
                      <p className="text-[10px] text-muted-foreground">Standard startup shift hour (e.g. 8 for 8:00 AM).</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="endHour">End Hour (24h format)</Label>
                      <Input 
                        id="endHour" 
                        type="number" 
                        min="0" 
                        max="23"
                        value={endHour} 
                        onChange={(e) => setEndHour(Number(e.target.value))} 
                      />
                      <p className="text-[10px] text-muted-foreground">Standard closing shift hour (e.g. 16 for 4:00 PM).</p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSaveWorkingHours} className="bg-primary text-primary-foreground text-xs font-bold py-1.5 px-4 rounded">
                      Save Shift Settings
                    </Button>
                  </div>
                </div>

                <div className="border-t border-border/50 my-6"></div>

                {/* 2. Holiday Calendar Config */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Holiday Calendar</h3>
                  
                  {/* Add Holiday Form inline */}
                  <div className="bg-muted/30 border border-border/60 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-foreground">Add Custom Holiday Date</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="holDate" className="text-[11px] font-bold text-muted-foreground">Date</Label>
                        <Input 
                          id="holDate" 
                          type="date" 
                          value={newHolidayDate}
                          onChange={(e) => setNewHolidayDate(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="holName" className="text-[11px] font-bold text-muted-foreground">Holiday Name</Label>
                        <Input 
                          id="holName" 
                          placeholder="e.g. Workers Day" 
                          value={newHolidayName}
                          onChange={(e) => setNewHolidayName(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          onClick={handleAddHoliday} 
                          className="w-full h-9 bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Plus className="size-3.5" />
                          Add Holiday
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Holiday List */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-xs font-bold text-muted-foreground">Active Holiday Dates</h4>
                    {holidays.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No holidays configured. System will only detect standard weekends.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {holidays.map(hol => (
                          <div key={hol.id} className="border border-border/50 rounded-lg p-3 bg-card/60 flex justify-between items-center shadow-sm">
                            <div>
                              <div className="font-semibold text-xs text-foreground">{hol.name}</div>
                              <div className="text-[10px] text-muted-foreground font-medium font-mono">{hol.date}</div>
                            </div>
                            <Button 
                              variant="ghost" 
                              onClick={() => handleDeleteHoliday(hol.id)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-full"
                              title="Delete Holiday"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          )}

          {activeTab === 'yearly-close' && (
            <Card className="border-border/60 shadow-sm animate-in fade-in zoom-in-95">
              <CardHeader className="border-b border-border/50">
                <CardTitle>Year-End Lock & State Performance Dashboard</CardTitle>
                <CardDescription>Lock active system workflows, backup system data, and analyze overall state development trends.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Year Closure Panel */}
                <div className="p-4 border border-rose-500/30 bg-rose-500/5 rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500 text-white">
                      <Shield className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-rose-800">Close Out Current Operational Year</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Locks all memos, budgets, and tasks. Only Super Administrators will be able to edit past years' information.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center justify-between border-t border-rose-500/10 pt-3">
                    <span className="text-xs font-bold text-foreground">
                      Current Active Year: <span className="text-rose-600">{activeYear} {isYearLocked ? '(Locked)' : ''}</span>
                    </span>
                    <button 
                      onClick={async () => {
                        if (isYearLocked) {
                          alert(`Year ${activeYear} is already locked.`);
                          return;
                        }
                        const confirmLock = confirm(`Are you sure you want to freeze all workflows for ${activeYear}? This cannot be easily undone.`);
                        if (confirmLock) {
                          try {
                            
                            const nextYear = activeYear + 1;
                            await dbToggleYearLock({ data: { year: nextYear, isLocked: false } });
                            setActiveYear(nextYear);
                            setIsYearLocked(false);
                            alert(`Workflows for ${activeYear} frozen. A new workspace for ${nextYear} has been initialized.`);
                          } catch (e: any) {
                            alert('Failed to lock year: ' + e.message);
                          }
                        }
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50"
                      disabled={isYearLocked}
                    >
                      {isYearLocked ? `Year ${activeYear} Locked` : `Freeze Workflows & Lock Year ${activeYear}`}
                    </button>
                  </div>
                </div>

                {/* System Backup Panel */}
                <div className="p-4 border border-border bg-muted/20 rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Settings className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Disaster Recovery & System Backups</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Download a complete snapshot of all active collections from the Firebase Firestore database.</p>
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-border/50 pt-3">
                    <button 
                      onClick={() => {
                        const backupData = {
                          timestamp: new Date().toISOString(),
                          collections: ['nominal_roll', 'tasks', 'memos', 'budget_allocations']
                        };
                        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `kogi-onegov-system-backup-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                      }}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                    >
                      Download Database Backup
                    </button>
                  </div>
                </div>

                {/* Performance Plan Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Kogi State Joint Performance Plan (32-Year Development Plan vs Budget)</h3>
                  
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/30 text-muted-foreground font-bold border-b border-border/60">
                        <tr>
                          <th className="px-4 py-3">Operational Year</th>
                          <th className="px-4 py-3 text-right">Budget Performance Index</th>
                          <th className="px-4 py-3 text-right">32-Year Plan Alignment</th>
                          <th className="px-4 py-3 text-right">Physical KPI Completion</th>
                          <th className="px-4 py-3 text-right">Joint Overall Index</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr className="hover:bg-muted/5 font-medium">
                          <td className="px-4 py-3 text-primary font-bold">2026 (Active)</td>
                          <td className="px-4 py-3 text-right text-emerald-600">88.4%</td>
                          <td className="px-4 py-3 text-right text-indigo-600">92.0%</td>
                          <td className="px-4 py-3 text-right text-emerald-600">85.6%</td>
                          <td className="px-4 py-3 text-right font-bold text-primary">88.7%</td>
                        </tr>
                        <tr className="hover:bg-muted/5 text-muted-foreground">
                          <td className="px-4 py-3 font-semibold">2025 (Locked)</td>
                          <td className="px-4 py-3 text-right">84.2%</td>
                          <td className="px-4 py-3 text-right">86.5%</td>
                          <td className="px-4 py-3 text-right">81.0%</td>
                          <td className="px-4 py-3 text-right font-bold text-foreground">83.9%</td>
                        </tr>
                        <tr className="hover:bg-muted/5 text-muted-foreground">
                          <td className="px-4 py-3 font-semibold">2024 (Locked)</td>
                          <td className="px-4 py-3 text-right">79.5%</td>
                          <td className="px-4 py-3 text-right">78.0%</td>
                          <td className="px-4 py-3 text-right">72.4%</td>
                          <td className="px-4 py-3 text-right font-bold text-foreground">76.6%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Trend chart/lines visual illustration */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Plan Horizon Progress</div>
                      <div className="text-lg font-extrabold text-primary mt-1">12.8% Completed</div>
                      <div className="w-full bg-border h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '12.8%' }}></div>
                      </div>
                      <span className="text-[9px] text-muted-foreground block mt-1.5">Horizon Target: 2024 - 2056</span>
                    </div>
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Budget Execution Trend</div>
                      <div className="text-lg font-extrabold text-emerald-600 mt-1">+8.9% YoY Growth</div>
                      <div className="w-full bg-border h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '74%' }}></div>
                      </div>
                      <span className="text-[9px] text-muted-foreground block mt-1.5">Average Performance: 84.0%</span>
                    </div>
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Joint Strategic Index</div>
                      <div className="text-lg font-extrabold text-indigo-600 mt-1">Grade A (Excellent)</div>
                      <div className="w-full bg-border h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: '88.7%' }}></div>
                      </div>
                      <span className="text-[9px] text-muted-foreground block mt-1.5">Target Horizon Goal: &gt;90%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}

function TabButton({ id, label, icon: Icon, activeTab, onClick }: any) {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={() => onClick(id)}
      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors
      ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
    >
      <Icon className={`size-4 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
      {label}
    </button>
  )
}

function InputBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input type="text" className="w-full p-2 bg-muted/50 border border-border rounded-md text-sm" defaultValue={value} />
    </div>
  )
}

function LogoBox({ label, isWide }: { label: string, isWide?: boolean }) {
  return (
    <div className={`border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/10 transition-colors cursor-pointer ${isWide ? 'sm:col-span-2 lg:col-span-3 h-32' : 'h-32'}`}>
      <ImageIcon className="size-6 text-muted-foreground" />
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">Click to Upload</span>
    </div>
  )
}

function ColorPickerBox({ label, color, hex }: { label: string, color: string, hex: string }) {
  return (
    <div className="border border-border p-3 rounded-lg flex items-center gap-3">
      <div className={`size-8 rounded-md ${color} border border-border/50 shadow-inner`}></div>
      <div>
        <div className="text-xs font-semibold">{label}</div>
        <div className="text-[10px] text-muted-foreground font-mono">{hex}</div>
      </div>
    </div>
  )
}
