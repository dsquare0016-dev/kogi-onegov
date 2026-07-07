import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PartyPopper, Calendar, Download, Sparkles, Clock, Building } from 'lucide-react';
import { useState } from 'react';
import { getSession, roleById } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/retiree')({
  component: RetireeDashboard,
});

function RetireeDashboard() {
  const session = getSession();
  const profile = session ? roleById(session.role) : null;
  const lastMda = profile?.mda || profile?.motherMinistry || 'Ministry of Education';

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-start gap-2">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-700 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 font-bold mb-2">
            <PartyPopper className="size-4" /> Pension & Gratuity Portal
          </div>
          <h1 className="text-3xl font-black text-foreground">Welcome to your Retiree Dashboard</h1>
          <p className="text-muted-foreground max-w-2xl text-sm font-medium">
            Thank you for your 35 years of meritorious service to Kogi State. This portal is your dedicated space to access pension records, download service history, and receive AI-driven post-retirement guidance.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-foreground bg-background/50 px-4 py-2 rounded-lg border border-border/50">
            <Building className="size-4 text-[#C5A059]" /> Last Posted MDA: <span className="text-[#C5A059]">{lastMda}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm md:col-span-1">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="size-4" />
              <span className="text-sm font-medium">Retirement Date</span>
            </div>
            <div className="text-2xl font-bold text-foreground">Nov 14, 2026</div>
            <p className="text-xs text-muted-foreground font-medium">Statutory Limit Reached</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/60 shadow-sm md:col-span-1">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="size-4" />
              <span className="text-sm font-medium">Years of Service</span>
            </div>
            <div className="text-3xl font-bold text-foreground">35 <span className="text-sm font-normal text-muted-foreground">Years</span></div>
            <p className="text-xs text-emerald-500 font-medium">Full Benefits Unlocked</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm md:col-span-2 bg-primary/5">
          <CardContent className="p-6 flex justify-between items-center h-full">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Sparkles className="size-4" />
                <span className="text-sm font-bold">AI Post-Retirement Advisor</span>
              </div>
              <p className="text-xs text-foreground/80 font-medium max-w-sm">
                "Based on your grade level 15 exit, your gratuity processing is at Step 2 of 4. Expect clearance by January 2027."
              </p>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg text-xs shadow-sm hover:bg-primary/90 transition-colors">
              Chat with AI
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle>Service Timeline & Milestones</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="w-10 text-right text-xs font-bold text-muted-foreground pt-1">2026</div>
                <div className="relative">
                  <div className="size-3 bg-amber-500 rounded-full mt-1.5 relative z-10 ring-4 ring-card"></div>
                  <div className="absolute top-4 bottom-[-24px] left-1.5 w-0.5 bg-border -translate-x-1/2"></div>
                </div>
                <div className="pb-4">
                  <p className="font-bold text-sm">Statutory Retirement</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Honorable exit from Kogi State Civil Service.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 text-right text-xs font-bold text-muted-foreground pt-1">2022</div>
                <div className="relative">
                  <div className="size-3 bg-primary rounded-full mt-1.5 relative z-10 ring-4 ring-card"></div>
                  <div className="absolute top-4 bottom-[-24px] left-1.5 w-0.5 bg-border -translate-x-1/2"></div>
                </div>
                <div className="pb-4">
                  <p className="font-bold text-sm">Promotion to Director (GL-15)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Ministry of Works and Housing.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 text-right text-xs font-bold text-muted-foreground pt-1">1991</div>
                <div className="relative">
                  <div className="size-3 bg-emerald-500 rounded-full mt-1.5 relative z-10 ring-4 ring-card"></div>
                </div>
                <div>
                  <p className="font-bold text-sm">First Appointment</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Joined service as Assistant Engineer.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-lg">My Documents</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <button className="w-full py-2.5 border border-border bg-card hover:bg-muted font-bold rounded-lg transition-colors flex items-center justify-between px-4 shadow-sm group">
                <span className="text-sm">Retirement Letter</span>
                <Download className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
              <button className="w-full py-2.5 border border-border bg-card hover:bg-muted font-bold rounded-lg transition-colors flex items-center justify-between px-4 shadow-sm group">
                <span className="text-sm">Final Promotion Letter (GL-15)</span>
                <Download className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
              <button className="w-full py-2.5 border border-border bg-card hover:bg-muted font-bold rounded-lg transition-colors flex items-center justify-between px-4 shadow-sm group">
                <span className="text-sm">Complete Service Record (PDF)</span>
                <Download className="size-4 text-emerald-600 transition-colors" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
