import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/attendance/upload')({
  component: AttendanceUploadPage,
});

function AttendanceUploadPage() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleUpload = () => {
    setUploadStatus('uploading');
    setTimeout(() => {
      setUploadStatus('success');
    }, 2000);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Attendance Register</h1>
        <p className="text-muted-foreground mt-1">Submit daily or weekly attendance logs for automated processing and AI analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-sm border-dashed">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <UploadCloud className="size-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Drag and drop your attendance file here</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Supported formats: .xlsx, .csv, .pdf (scanned signature registers). Maximum file size: 50MB.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleUpload}
                  disabled={uploadStatus === 'uploading'}
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {uploadStatus === 'uploading' ? 'Processing File...' : 'Select File from Computer'}
                </button>
              </div>

              {uploadStatus === 'success' && (
                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg flex items-center gap-3 w-full max-w-md mx-auto">
                  <CheckCircle2 className="size-5 shrink-0" />
                  <div className="text-left">
                    <p className="font-bold text-sm">Upload Successful</p>
                    <p className="text-xs">482 records imported and processed.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-lg">Instructions & Templates</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3">
                <AlertCircle className="size-5 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-700">Ensure your uploaded file matches the official template designed by the Superadmin. Unmatched columns will be ignored.</p>
              </div>

              <button className="w-full py-2.5 border border-border bg-card hover:bg-muted font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                <FileSpreadsheet className="size-4 text-emerald-600" /> Download Excel Template
              </button>
              
              <button className="w-full py-2.5 border border-border bg-card hover:bg-muted font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                <Download className="size-4 text-blue-600" /> Download CSV Template
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
