import { dbGetLegalDocuments } from '@/lib/postgres-service';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/data-protection')({
  component: DataProtectionPage,
});

function DataProtectionPage() {
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoc = async () => {
      try {
        
        const docs = await dbGetLegalDocuments();
        const match = docs.find((d: any) => d.document_type === 'dataprotection');
        if (match && match.status === 'published') {
          setDoc(match);
        }
      } catch (e) {
        console.error("Failed to load data protection policy from DB:", e);
      } finally {
        setLoading(false);
      }
    };
    loadDoc();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 selection:bg-[#C5A059]/20">
      <div className="max-w-[800px] mx-auto space-y-6 pt-12 pb-24">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-[#C5A059] hover:underline font-bold">
          <ArrowLeft className="size-3.5" /> Back to Sign In
        </Link>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-xl">
            <ShieldAlert className="size-6 text-[#C5A059]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{doc?.title || "Data Protection Policy"}</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Kogi State Government ERP Portal</p>
          </div>
        </div>

        <div className="border-t border-slate-800 my-6"></div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="size-8 animate-spin text-[#C5A059]" />
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-8 space-y-6 text-xs text-slate-300 leading-relaxed">
            {doc ? (
              <div className="whitespace-pre-wrap">{doc.content}</div>
            ) : (
              <div className="space-y-4">
                <p className="font-semibold text-white">1. REGULATORY COMPLIANCE</p>
                <p>Kogi State Government processes personal and organizational data in full alignment with the Nigeria Data Protection Act (NDPA) and other applicable federal guidelines. We act as data controller and processor for all operational inputs.</p>
                
                <p className="font-semibold text-white">2. DATA ACCESS RIGHTS</p>
                <p>Users have the right to inspect their nominal roll details, request corrections, view E-Memo signatures associated with their profile, and receive summaries of their logged audit items in accordance with internal regulations.</p>

                <p className="font-semibold text-white">3. RETENTION AND PURGING</p>
                <p>System audit logs are kept indefinitely for security compliance. Staff nominal roll profiles are soft-deleted when retired or terminated and archived in the Data Recovery Center, with permanent purging restricted to the DG GDU / Super Admin.</p>
              </div>
            )}
          </div>
        )}

        <div className="text-[10px] text-slate-500 pt-6 border-t border-slate-800/60 text-center">
          © 2026 Kogi State Government. All Rights Reserved. Powered by GDU.
        </div>
      </div>
    </div>
  );
}
