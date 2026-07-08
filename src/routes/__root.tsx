import { dbGetMaintenanceSettings, dbGetSystemSetting } from '@/lib/postgres-service';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { GlobalAlertModal } from "@/components/GlobalAlertModal";
import { useState } from "react";
import { getSession, signOut } from "@/lib/auth";
import { AlertTriangle, Terminal, ChevronDown, ChevronUp, PowerOff } from "lucide-react";
import { GduKogiLoader } from "@/components/GduKogiLoader";
import { CustomSystemModal } from "@/components/CustomSystemModal";
import { customAlert } from "@/lib/customModal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const [showDev, setShowDev] = useState(false);
  const session = getSession();
  const isDev = true; // Temporary for debugging

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-amber-500/10 mb-4">
            <AlertTriangle className="size-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Page Under Maintenance
          </h1>
          <p className="mt-3 text-lg font-medium text-muted-foreground">
            Please check back later. We are currently stabilizing this module.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                router.history.back();
                reset();
              }}
              className="inline-flex items-center justify-center rounded-lg bg-background border border-border px-6 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-accent shadow-sm"
            >
              Go Back
            </button>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
            >
              Go to Dashboard
            </a>
            {isDev && (
              <button
                onClick={() => setShowDev(!showDev)}
                className="inline-flex items-center gap-2 justify-center rounded-lg bg-slate-800 text-slate-200 px-6 py-2.5 text-sm font-bold transition-colors hover:bg-slate-700 shadow-sm"
              >
                <Terminal className="size-4" /> Developer Details
                {showDev ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
            )}
          </div>
        </div>

        {isDev && showDev && (
          <div className="bg-black/90 border border-slate-800 rounded-xl p-6 text-emerald-400 font-mono text-xs overflow-auto shadow-2xl animate-in slide-in-from-top-4 fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <span className="text-slate-400 uppercase tracking-widest font-bold text-[10px]">Error Trace Log</span>
              <span className="text-slate-500">{new Date().toISOString()}</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-slate-500 block mb-1">Route Path</span>
                <div className="text-white bg-slate-900/50 p-2 rounded">{window.location.pathname}</div>
              </div>
              
              <div>
                <span className="text-slate-500 block mb-1">Error Message</span>
                <div className="text-red-400 bg-red-950/30 border border-red-900/50 p-2 rounded whitespace-pre-wrap">{error.message}</div>
              </div>
              
              <div>
                <span className="text-slate-500 block mb-1">Stack Trace</span>
                <div className="text-emerald-500 bg-slate-900/50 p-3 rounded whitespace-pre-wrap overflow-x-auto">
                  {error.stack}
                </div>
              </div>
              
              <div className="bg-blue-950/30 border border-blue-900/50 p-3 rounded">
                <span className="text-blue-400 font-bold block mb-1">Suggested Fix Direction</span>
                <span className="text-blue-300">Check the component mounting at this route for undefined data access, unhandled promise rejections, or missing mock state in the corresponding service layer.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Digital Governance ERP Platform" },
      { name: "description", content: "Kogi State Digital Governance, Performance Delivery & Executive Management ERP — one unified command center for governance." },
      { name: "author", content: "Kogi State Government — GDU" },
      { property: "og:title", content: "Digital Governance ERP Platform" },
      { property: "og:description", content: "Kogi State Digital Governance, Performance Delivery & Executive Management ERP — one unified command center for governance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Digital Governance ERP Platform" },
      { name: "twitter:description", content: "Kogi State Digital Governance, Performance Delivery & Executive Management ERP — one unified command center for governance." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/9b455201-7569-4c64-a04e-464a4351d008" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/9b455201-7569-4c64-a04e-464a4351d008" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Branding States
  const [primaryColor, setPrimaryColor] = useState("#0A1142");
  const [secondaryColor, setSecondaryColor] = useState("#F4B41A");
  const [successColor, setSuccessColor] = useState("#10B981");
  const [errorColor, setErrorColor] = useState("#EF4444");
  const [siteFont, setSiteFont] = useState("Inter, sans-serif");
  const [dashboardFont, setDashboardFont] = useState("Outfit, sans-serif");
  const [systemLocked, setSystemLocked] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      window.alert = (msg) => {
        customAlert(String(msg));
      };
    }
  }, []);

  // System Configuration Sync Effect
  useEffect(() => {
    if (!mounted) return;

    const syncConfig = async () => {
      try {
        const yearData = await dbGetSystemSetting({ data: { key: 'operational_year' } });
        if (yearData) {
          localStorage.setItem('gdu_operational_year', String(yearData.current_year || 2026));
          localStorage.setItem('gdu_operational_year_locked', String(yearData.is_locked || false));
        }

        const data = await dbGetSystemSetting({ data: { key: 'site_configuration' } });
        if (data) {
          const keys = [
            ['gdu_site_name', data.siteName],
            ['gdu_site_title', data.siteTitle],
            ['gdu_short_name', data.shortName],
            ['gdu_org_name', data.orgName],
            ['gdu_gov_name', data.govName],
            ['gdu_copyright', data.copyright],
            ['gdu_main_logo', data.mainLogo],
            ['gdu_state_seal', data.stateSeal],
            ['gdu_gdu_logo', data.gduLogo],
            ['gdu_login_bg', data.loginBg],
            ['gdu_watermark', data.watermark],
            ['gdu_portal_theme', data.activeTheme],
            ['gdu_primary_color', data.primaryColor],
            ['gdu_secondary_color', data.secondaryColor],
            ['gdu_success_color', data.successColor],
            ['gdu_error_color', data.errorColor],
            ['gdu_site_font', data.siteFont],
            ['gdu_dashboard_font', data.dashboardFont],
            ['gdu_report_font', data.reportFont],
            ['gdu_seo_title', data.seoTitle],
            ['gdu_meta_desc', data.metaDescription],
            ['gdu_meta_keys', data.metaKeywords],
            ['gdu_enable_sitemap', data.enableSitemap],
            ['gdu_generate_robots', data.generateRobots],
            ['gdu_system_locked', data.systemLocked]
          ];
          
          keys.forEach(([k, v]) => {
            if (v !== undefined && v !== null) {
              localStorage.setItem(k, String(v));
            }
          });

          // Sync page title
          if (data.siteTitle) {
            document.title = data.siteTitle;
          }

          // Sync theme
          if (data.activeTheme) {
            window.dispatchEvent(new Event('themeUpdate'));
          }

          // Sync alignmentLevel
          if (data.alignmentLevel || data.communicationHub !== undefined) {
            const { useSettingsStore } = await import('@/lib/settingsStore');
            if (data.alignmentLevel) {
              useSettingsStore.getState().setGovernanceAlignmentLevel(data.alignmentLevel);
            }
            if (data.communicationHub !== undefined) {
              useSettingsStore.getState().setCommunicationHubEnabled(data.communicationHub);
            }
          }

          // Sync bannerStore
          const { bannerStore } = await import('@/lib/banner-store');
          if (data.activeBanner !== undefined) {
            bannerStore.setActiveBanner(data.activeBanner);
          }
          if (data.greetings) {
            bannerStore.setGreetings(data.greetings);
          }

          // Sync carouselStore
          const { carouselStore } = await import('@/lib/carouselStore');
          if (data.slides) {
            carouselStore.slides = data.slides;
          }

          // Sync workingHoursStore
          const { workingHoursStore } = await import('@/lib/working-hours-store');
          if (data.startHour !== undefined || data.endHour !== undefined || data.holidays !== undefined) {
            localStorage.setItem('gdu_working_hours_config', JSON.stringify({
              startHour: data.startHour ?? workingHoursStore.startHour,
              endHour: data.endHour ?? workingHoursStore.endHour,
              holidays: data.holidays ?? workingHoursStore.holidays
            }));
            window.dispatchEvent(new Event('workingHoursUpdate'));
          }

          // Notify all config listeners
          window.dispatchEvent(new Event('siteConfigUpdate'));
        }
      } catch (err) {
        console.error("Failed to synchronize system configuration:", err);
      }
    };

    syncConfig();
  }, [mounted]);
  // Listen for local site configuration updates to reload local state styles dynamically
  useEffect(() => {
    if (!mounted) return;
    
    const handleLocalUpdate = () => {
      if (typeof window !== 'undefined') {
        setPrimaryColor(localStorage.getItem('gdu_primary_color') || '#0A1142');
        setSecondaryColor(localStorage.getItem('gdu_secondary_color') || '#F4B41A');
        setSuccessColor(localStorage.getItem('gdu_success_color') || '#10B981');
        setErrorColor(localStorage.getItem('gdu_error_color') || '#EF4444');
        setSiteFont(localStorage.getItem('gdu_site_font') || 'Inter, sans-serif');
        setDashboardFont(localStorage.getItem('gdu_dashboard_font') || 'Outfit, sans-serif');
        setSystemLocked(localStorage.getItem('gdu_system_locked') === 'true');
      }
    };

    window.addEventListener('siteConfigUpdate', handleLocalUpdate);
    handleLocalUpdate(); // Initial call

    return () => {
      window.removeEventListener('siteConfigUpdate', handleLocalUpdate);
    };
  }, [mounted]);  // Apply CSS variables to body
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--color-primary', primaryColor);
    root.style.setProperty('--secondary', secondaryColor);
    root.style.setProperty('--color-secondary', secondaryColor);
    root.style.setProperty('--success', successColor);
    root.style.setProperty('--color-success', successColor);
    root.style.setProperty('--destructive', errorColor);
    root.style.setProperty('--color-error', errorColor);
    root.style.setProperty('--font-sans', siteFont);
    root.style.setProperty('--font-display', dashboardFont);
  }, [mounted, primaryColor, secondaryColor, successColor, errorColor, siteFont, dashboardFont]);

  // Maintenance mode redirect check
  useEffect(() => {
    if (!mounted) return;
    const pathname = window.location.pathname;
    // Skip for public pages
    const publicPaths = ['/maintenance', '/login', '/privacy-policy', '/terms', '/data-protection', '/cookie-policy'];
    if (publicPaths.some(p => pathname.startsWith(p))) return;

    const checkMaintenance = async () => {
      try {
        
        const settings = await dbGetMaintenanceSettings();
        if (!settings?.maintenance_enabled) return;

        // Check user role from session
        const { getSession } = await import('@/lib/auth');
        const session = getSession();
        const role = (session as any)?.role || (session as any)?.user?.role || '';
        if (role === 'super_admin') return; // Super admin bypasses maintenance

        // Redirect non-admins to maintenance page
        router.navigate({ to: '/maintenance' });
      } catch (e) {
        // Silently fail — never block the app due to maintenance check errors
      }
    };
    checkMaintenance();
  }, [mounted, router]);
  const session = getSession();
  const role = session?.role || '';
  const isBypassed = role === 'super_admin' || role === 'governor' || role === 'dg_gdu';

  if (systemLocked && mounted && !isBypassed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="max-w-md w-full border border-red-500/20 shadow-2xl bg-slate-900 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-red-500/10 bg-red-500/5 text-center">
            <div className="mx-auto bg-red-500/10 p-3 rounded-full size-14 flex items-center justify-center mb-3">
              <PowerOff className="size-8 text-red-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-red-500 tracking-tight">ERP ACCESS SUSPENDED</h3>
            <p className="text-[10px] text-red-400 font-bold mt-1 uppercase tracking-wider">EXECUTIVE MASTER LOCK OVERRIDE</p>
          </div>
          <div className="p-6 space-y-5 text-center">
            <p className="text-sm leading-relaxed text-slate-300">
              Under the executive authority of the Director General of the Governance Delivery Unit (GDU), access to the Kogi State Digital Governance ERP has been temporarily suspended.
            </p>
            <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-lg font-semibold">
              ⚠️ All active operational modules, budgets, e-memos, and workflow systems are frozen. No new logins or data transactions are allowed at this time.
            </p>
            
            <div className="pt-4 border-t border-slate-800">
              <button 
                onClick={() => {
                  signOut();
                  window.location.href = '/login';
                }}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer shadow-md inline-flex items-center gap-2 animate-bounce"
              >
                <PowerOff className="size-4" /> Return to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {!mounted ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
          <GduKogiLoader size="lg" text="Initializing Portal Command Center..." />
        </div>
      ) : (
        <>
          <style>{`
            :root {
              --primary: ${primaryColor} !important;
              --secondary: ${secondaryColor} !important;
              --success: ${successColor} !important;
              --destructive: ${errorColor} !important;
              --font-sans: ${siteFont} !important;
              --font-display: ${dashboardFont} !important;
            }
            body {
              font-family: ${siteFont} !important;
            }
          `}</style>
          <Outlet />
          <CustomSystemModal />
        </>
      )}
    </QueryClientProvider>
  );
}
