import { dbGetLegalDocuments } from '@/lib/postgres-service';
import { createFileRoute, Link } from '@tanstack/react-router';
import { FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
});

function TermsPage() {
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoc = async () => {
      try {
        
        const docs = await dbGetLegalDocuments();
        const match = docs.find((d: any) => d.document_type === 'terms');
        if (match && match.status === 'published') {
          setDoc(match);
        }
      } catch (e) {
        console.error("Failed to load terms from DB:", e);
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
            <FileText className="size-6 text-[#C5A059]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{doc?.title || "Terms & Conditions"}</h1>
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
                <p className="font-semibold text-white">1. PLATFORM ACCEPTABLE USE</p>
                <p>These terms and conditions govern your access to and use of the Kogi State Digital Governance and Performance Delivery Platform ("OneGov ERP"). By logging in, you agree to comply with all acceptable use guidelines and operational policies.</p>
                
                <p className="font-semibold text-white">2. ACCOUNT SECURITY</p>
                <p>Users are responsible for safeguarding their login credentials and system tokens. You must immediately notify the GDU Super Admin or Security Officer of any suspected security breaches or unauthorized account use.</p>

                <p className="font-semibold text-white">3. GOVERNMENT SYSTEM RULES</p>
                <p>This is an official government computing environment. Unauthorized activities, data manipulation, or attempting to bypass strategic plan checking policies are strictly prohibited and subject to legal prosecution and internal disciplinary reviews.</p>
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
