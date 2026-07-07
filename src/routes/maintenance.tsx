import { dbGetMaintenanceSettings } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Wrench } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/maintenance')({
  component: MaintenancePage,
});

function MaintenancePage() {
  const [msg, setMsg] = useState("The system is currently undergoing scheduled upgrades and maintenance. Normal access will be restored shortly. We apologize for any inconvenience caused.");

  useEffect(() => {
    const fetchMaintenanceMsg = async () => {
      try {
        
        const settings = await dbGetMaintenanceSettings();
        if (settings && settings.maintenance_enabled) {
          setMsg(settings.maintenance_message || msg);
        }
      } catch (e) {
        console.warn("Failed to fetch maintenance message, using default:", e);
      }
    };
    fetchMaintenanceMsg();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans selection:bg-amber-500/20">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 size-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 size-48 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <Wrench className="size-10 text-amber-500 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">System Under Maintenance</h1>
          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Kogi State Government ERP Portal</p>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl">
          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
            {msg}
          </p>
        </div>

        <div className="text-[10px] text-slate-500 pt-4 border-t border-slate-800/60 flex items-center justify-between">
          <span>GDU Command Center</span>
          <span>© 2026 Kogi State</span>
        </div>
      </div>
    </div>
  );
}
