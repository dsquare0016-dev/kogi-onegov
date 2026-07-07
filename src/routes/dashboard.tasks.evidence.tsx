import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, Image as ImageIcon, FileText, Video, MapPin, CheckCircle2 } from 'lucide-react';

export const Route = createFileRoute('/dashboard/tasks/evidence')({
  component: TaskEvidenceComponent,
})

function TaskEvidenceComponent() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Task Evidence Center</h1>
        <p className="text-muted-foreground mt-1">No task can be completed without verifiable evidence. Upload required documents here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Images Section */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
             <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="size-5 text-blue-500" /> Photographic Evidence
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
             <EvidenceUploadBox label="Before Implementation" required />
             <EvidenceUploadBox label="During Implementation" />
             <EvidenceUploadBox label="After Completion" required />
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
             <CardTitle className="text-base flex items-center gap-2">
              <FileText className="size-5 text-indigo-500" /> Document Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
             <EvidenceUploadBox label="Progress Report (PDF/Word)" />
             <EvidenceUploadBox label="Completion Report (PDF)" required />
             <EvidenceUploadBox label="Financial Summary (Excel)" required />
          </CardContent>
        </Card>

        {/* Certificates & Geo Section */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
             <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-500" /> Verification Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
             <div className="p-3 border border-dashed border-border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer flex flex-col items-center justify-center py-6 text-center">
               <Video className="size-6 text-muted-foreground mb-2" />
               <span className="text-sm font-medium">Upload Site Video</span>
               <span className="text-xs text-muted-foreground mt-1">MP4, WebM (Max 50MB)</span>
             </div>
             
             <div className="p-4 border border-border rounded-lg bg-amber-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="size-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">Geo-tagged Evidence Required</span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">System will extract GPS coordinates from uploaded media to verify project location.</p>
                <button className="w-full py-2 bg-amber-500 text-white rounded-md text-xs font-bold hover:bg-amber-600 transition-colors">Capture Location Now</button>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
         <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          Submit Evidence Bundle
        </button>
      </div>
    </div>
  );
}

function EvidenceUploadBox({ label, required }: { label: string, required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold flex justify-between">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      <div className="w-full border border-dashed border-border/80 rounded-lg p-4 flex items-center justify-center bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <FileUp className="size-4" /> Click to browse or drag file here
        </div>
      </div>
    </div>
  )
}
