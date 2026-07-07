import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { useNominalRollStore } from '@/lib/nominalRollStore';
import { useApplicationsStore, type ApplicationDocument } from '@/lib/applicationsStore';
import { uploadFile } from '@/lib/firebase';
import { FileText, UploadCloud, Trash2, Send, CheckCircle, Clock, AlertCircle, FileSpreadsheet, FileImage } from 'lucide-react';

export const Route = createFileRoute('/dashboard/staff/apply')({
  component: SelfServiceApplyPage,
});

// Destination offices matching the MDAs registered
const TARGET_OFFICES = [
  'Civil Service Commission',
  'Office of the Head of Service',
  'Ministry of Finance',
  'Ministry of Education',
  'Ministry of Health',
  'Ministry of Works & Housing',
  'Ministry of Agriculture',
  'Ministry of Justice',
  'Governance Delivery Unit',
];

const LEAVE_TYPES = [
  'Annual Leave',
  'Sick Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Study Leave (With Pay)',
  'Study Leave (Without Pay)',
  'Compassionate Leave',
  'Casual Leave',
];

function SelfServiceApplyPage() {
  const session = getSession();
  const { records: nominalRecords, loadRecords } = useNominalRollStore();
  const { applications, loadApplications, submitApplication, isLoading: storeLoading } = useApplicationsStore();
  
  // Find current logged in staff record
  const currentStaff = nominalRecords.find(r => r.email === session?.email) || 
                       nominalRecords.find(r => r.fullName.toLowerCase() === session?.name.toLowerCase());

  // Form states
  const [appType, setAppType] = useState<'Leave' | 'Transfer' | 'Promotion'>('Leave');
  const [targetOffice, setTargetOffice] = useState(TARGET_OFFICES[0]);
  
  // Leave states
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');

  // Transfer states
  const [targetMda, setTargetMda] = useState(TARGET_OFFICES[0]);
  const [targetDept, setTargetDept] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Promotion states
  const [currentGL, setCurrentGL] = useState(currentStaff?.gradeLevel || 'GL-08');
  const [currentStep, setCurrentStep] = useState(currentStaff?.step || '01');
  const [targetGL, setTargetGL] = useState('GL-09');
  const [targetStep, setTargetStep] = useState('01');
  const [justification, setJustification] = useState('');

  // Document upload state
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; name: string; size: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  useEffect(() => {
    loadRecords();
    loadApplications();
  }, []);

  useEffect(() => {
    if (currentStaff) {
      setCurrentGL(currentStaff.gradeLevel || 'GL-08');
      setCurrentStep(currentStaff.step || '01');
    }
  }, [currentStaff]);

  if (!session) {
    return (
      <div className="p-6 max-w-[800px] mx-auto text-center h-[50vh] flex flex-col items-center justify-center">
        <AlertCircle className="size-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold">Session Required</h1>
        <p className="text-muted-foreground mt-2">Please login to access the self-service portal.</p>
      </div>
    );
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    // Max 5 documents rule
    if (uploadedFiles.length + filesArray.length > 5) {
      alert('You can upload a maximum of 5 documents in total.');
      return;
    }

    const validFiles: typeof uploadedFiles = [];
    for (const file of filesArray) {
      // Size check (max 25MB per document)
      const maxSizeBytes = 25 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        alert(`File "${file.name}" exceeds the maximum size limit of 25MB.`);
        continue;
      }
      validFiles.push({
        file,
        name: file.name,
        size: file.size,
      });
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove a file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (uploadedFiles.length === 0) {
      alert('Please upload at least one supporting document.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Uploading documents...');

    try {
      // 1. Upload documents to Firebase
      const documents: ApplicationDocument[] = [];
      for (const item of uploadedFiles) {
        const path = `applications/${session.email}/${Date.now()}_${item.name}`;
        const downloadUrl = await uploadFile(path, item.file);
        documents.push({
          name: item.name,
          url: downloadUrl,
          size: item.size,
          type: item.file.type,
        });
      }

      // 2. Compile details
      let details: any = {};
      if (appType === 'Leave') {
        details = { leaveType, startDate: leaveStart, endDate: leaveEnd };
      } else if (appType === 'Transfer') {
        details = { targetMda, targetDepartment: targetDept, reasonForTransfer: transferReason };
      } else if (appType === 'Promotion') {
        details = { currentGradeLevel: currentGL, currentStep, targetGradeLevel: targetGL, targetStep, justification };
      }

      // 3. Submit application
      await submitApplication({
        staffId: currentStaff?.staffId || 'NOT-MAPPED',
        fullName: currentStaff?.fullName || session.name,
        email: session.email,
        mda: currentStaff?.mda || 'Unassigned',
        type: appType,
        details,
        targetOfficeMda: targetOffice,
        documents,
      });

      alert(`Your ${appType} application has been successfully submitted to ${targetOffice}.`);
      
      // Reset form states
      setUploadedFiles([]);
      setLeaveStart('');
      setLeaveEnd('');
      setTransferReason('');
      setTargetDept('');
      setJustification('');
      
    } catch (error) {
      console.error('Submission failed:', error);
      alert('An error occurred while submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  // Get status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  // User's own applications
  const myApplications = applications.filter(app => app.email === session.email);

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2">
          Self-Service Application Portal
        </h1>
        <p className="text-muted-foreground mt-1">
          Apply for leave, transfer of service, or grade level promotions. Track processing stages in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit}>
            <Card className="border-border/60 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md">
              <CardHeader className="bg-primary/5 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <FileText className="size-5 text-primary" /> New Application Request
                </CardTitle>
                <CardDescription>Select request type, enter details and attach supporting documents.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* Selector */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-muted/40 rounded-lg border border-border/50">
                  {(['Leave', 'Transfer', 'Promotion'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAppType(type)}
                      className={`py-2 text-xs font-bold rounded-md transition-colors ${
                        appType === type 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-white'
                      }`}
                    >
                      {type} Request
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Destination MDA Selection */}
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Submit to Office / MDA Authority</label>
                    <select
                      value={targetOffice}
                      onChange={e => setTargetOffice(e.target.value)}
                      className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                    >
                      {TARGET_OFFICES.map(office => (
                        <option key={office} value={office}>{office}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground">The request will be routed directly to the selected administration desk for evaluation.</p>
                  </div>

                  {/* LEAVE FIELDS */}
                  {appType === 'Leave' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Leave Type</label>
                        <select
                          value={leaveType}
                          onChange={e => setLeaveType(e.target.value)}
                          className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                        >
                          {LEAVE_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start Date</label>
                          <input
                            required
                            type="date"
                            value={leaveStart}
                            onChange={e => setLeaveStart(e.target.value)}
                            className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">End Date</label>
                          <input
                            required
                            type="date"
                            value={leaveEnd}
                            onChange={e => setLeaveEnd(e.target.value)}
                            className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* TRANSFER FIELDS */}
                  {appType === 'Transfer' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target MDA</label>
                        <select
                          value={targetMda}
                          onChange={e => setTargetMda(e.target.value)}
                          className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                        >
                          {TARGET_OFFICES.map(office => (
                            <option key={office} value={office}>{office}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Department</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Administration"
                          value={targetDept}
                          onChange={e => setTargetDept(e.target.value)}
                          className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="space-y-1.5 col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detailed Reason for Transfer Request</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Provide career details, family postings, health status or other motivations..."
                          value={transferReason}
                          onChange={e => setTransferReason(e.target.value)}
                          className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </>
                  )}

                  {/* PROMOTION FIELDS */}
                  {appType === 'Promotion' && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Grade Level</label>
                          <input
                            disabled
                            type="text"
                            value={currentGL}
                            className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none cursor-not-allowed font-bold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Step</label>
                          <input
                            disabled
                            type="text"
                            value={`Step ${currentStep}`}
                            className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none cursor-not-allowed font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Applied Grade Level</label>
                          <select
                            value={targetGL}
                            onChange={e => setTargetGL(e.target.value)}
                            className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                          >
                            {Array.from({ length: 17 }, (_, i) => `GL-${(i + 1).toString().padStart(2, '0')}`).map(gl => (
                              <option key={gl} value={gl}>{gl}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Applied Step</label>
                          <select
                            value={targetStep}
                            onChange={e => setTargetStep(e.target.value)}
                            className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                          >
                            {Array.from({ length: 15 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(st => (
                              <option key={st} value={st}>Step {st}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5 col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Justification / Promotion Claims</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="State eligibility, time-in-grade, exams passed, major projects completed..."
                          value={justification}
                          onChange={e => setJustification(e.target.value)}
                          className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Document Attachments - Custom Upload widget */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase tracking-wider text-[#C5A059]">
                      Supporting Documents ({uploadedFiles.length}/5 max)
                    </label>
                    <span className="text-[10px] text-muted-foreground">Max 25MB per document</span>
                  </div>

                  <div className="border-2 border-dashed border-border/80 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-muted/10 transition-all cursor-pointer relative group">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      disabled={uploadedFiles.length >= 5}
                    />
                    <div className="p-3 bg-primary/10 text-primary rounded-full mb-2 group-hover:scale-105 transition-transform">
                      <UploadCloud className="size-6 text-primary" />
                    </div>
                    <p className="text-xs font-bold text-white mb-0.5">Click to browse or drag & drop files here</p>
                    <p className="text-[10px] text-muted-foreground">Supported: PDF, Word (Docx), Images (PNG/JPG), Excel (Xlsx) — max 25MB each</p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-background/50 border border-border/50 rounded-lg text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            {file.file.type.includes('image') ? (
                              <FileImage className="size-4 text-primary shrink-0" />
                            ) : file.file.name.includes('xls') ? (
                              <FileSpreadsheet className="size-4 text-emerald-500 shrink-0" />
                            ) : (
                              <FileText className="size-4 text-blue-500 shrink-0" />
                            )}
                            <span className="truncate font-semibold text-white max-w-[250px]">{file.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                              ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="p-1.5 hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 rounded transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {uploadProgress && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-bold animate-pulse">
                    {uploadProgress}
                  </div>
                )}

                <div className="pt-4 flex justify-end border-t border-border/50">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-primary text-primary-foreground font-extrabold rounded-lg text-xs flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Send className="size-4" />
                    {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
                  </button>
                </div>

              </CardContent>
            </Card>
          </form>
        </div>

        {/* History Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 bg-primary/5 pb-4">
              <CardTitle className="text-md font-bold text-white flex items-center gap-2">
                <Clock className="size-4 text-[#C5A059]" /> Application History
              </CardTitle>
              <CardDescription>Review and track your recent requests.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              {myApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs font-medium">
                  No requests submitted yet.
                </div>
              ) : (
                myApplications.map(app => (
                  <div key={app.id} className="p-3 border border-border/50 rounded-xl bg-background/40 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-extrabold text-xs text-white block uppercase tracking-wider">{app.type}</span>
                        <span className="text-[10px] text-muted-foreground">ID: {app.id}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="text-[11px] space-y-1 pt-1.5 border-t border-border/40">
                      <div>
                        <span className="text-muted-foreground">Office Target:</span>{' '}
                        <span className="font-semibold text-white">{app.targetOfficeMda}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submitted:</span>{' '}
                        <span className="font-semibold text-white">{app.submittedAt}</span>
                      </div>
                      
                      {app.details.leaveType && (
                        <div>
                          <span className="text-muted-foreground">Type:</span>{' '}
                          <span className="font-semibold text-white">{app.details.leaveType}</span>
                        </div>
                      )}
                      
                      {app.details.targetMda && (
                        <div>
                          <span className="text-muted-foreground">Target MDA:</span>{' '}
                          <span className="font-semibold text-white">{app.details.targetMda}</span>
                        </div>
                      )}

                      {app.details.targetGradeLevel && (
                        <div>
                          <span className="text-muted-foreground">Target Rank:</span>{' '}
                          <span className="font-semibold text-white">{app.details.targetGradeLevel} {app.details.targetStep && `Step ${app.details.targetStep}`}</span>
                        </div>
                      )}
                    </div>

                    {app.remarks && (
                      <div className="p-2 bg-muted/40 rounded border border-border/50 text-[10px] text-muted-foreground mt-1.5">
                        <span className="font-black text-[9px] text-[#C5A059] uppercase block mb-0.5">Admin Action Notes</span>
                        {app.remarks}
                      </div>
                    )}

                    {app.documents.length > 0 && (
                      <div className="pt-2 border-t border-border/40 space-y-1">
                        <span className="text-[9px] font-black uppercase text-[#C5A059] block">Attached Documents</span>
                        {app.documents.map((doc, idx) => (
                          <a
                            key={idx}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] text-primary hover:underline"
                          >
                            <FileText className="size-3 shrink-0" />
                            <span className="truncate max-w-[150px]">{doc.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
