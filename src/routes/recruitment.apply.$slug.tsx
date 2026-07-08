import { dbGetRecruitmentCampaignBySlug, dbSubmitRecruitmentApplication } from '@/lib/postgres-service';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { Briefcase, AlertCircle, CheckCircle, UploadCloud, Loader2, ArrowRight, X, FileText, User, Calendar, Mail, Phone, MapPin, Award, BookOpen, FileSignature, Printer } from 'lucide-react';
import { useDbLgas, useDbNigerianStates } from '@/lib/useDbLgas';

export const Route = createFileRoute('/recruitment/apply/$slug')({
  component: RecruitmentApplyPage,
});

function RecruitmentApplyPage() {
  const { slug } = Route.useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successAppNum, setSuccessAppNum] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Eligibility Rules Modal state
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [stateOfOrigin, setStateOfOrigin] = useState('Kogi');
  const [lgaId, setLgaId] = useState('');
  const [address, setAddress] = useState('');
  const [qualification, setQualification] = useState('B.Sc');
  const [positionAppliedFor, setPositionAppliedFor] = useState('');
  const [otherPosition, setOtherPosition] = useState('');
  
  // Custom uploaded files (from campaign_documents)
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  
  // Legacy doc state variables
  const [cvUrl, setCvUrl] = useState('');
  const [credentialsUrl, setCredentialsUrl] = useState('');
  const [passportBase64, setPassportBase64] = useState('');
  const [signatureBase64, setSignatureBase64] = useState('');

  // Selected dynamic certifications checklist
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [otherCert, setOtherCert] = useState('');

  // Work Experience Builder
  const [experienceList, setExperienceList] = useState<{ company: string; role: string; startDate: string; endDate: string }[]>([]);
  const [expCompany, setExpCompany] = useState('');
  const [expRole, setExpRole] = useState('');
  const [expStart, setExpStart] = useState('');
  const [expEnd, setExpEnd] = useState('');

  // Qualifications Builder
  const [qualificationsList, setQualificationsList] = useState<{ title: string; institution: string; year: string }[]>([]);
  const [qualTitle, setQualTitle] = useState('');
  const [qualInstitution, setQualInstitution] = useState('');
  const [qualYear, setQualYear] = useState('');

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  
  // Non-Kogi LGA text fallback
  const [lgaText, setLgaText] = useState('');

  // Dropdowns hooks
  const { lgas, loading: lgasLoading } = useDbLgas();
  const { states, loading: statesLoading } = useDbNigerianStates();

  // Campaign configurations mapped from relational tables
  const [config, setConfig] = useState<any>({
    rules: '',
    positions: [],
    documents: [],
    sections: [],
    certifications: [],
    requireExperience: true,
    requireCerts: true,
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        
        const res = (await dbGetRecruitmentCampaignBySlug({ data: { slug } })) as any;
        setCampaign(res);
        if (res) {
          // Process certifications from documents table or string config
          const certString = res.documents?.filter((d: any) => d.document_key === 'certification').map((d: any) => d.document_name).join(', ') || '';
          const certList = certString.split(',').map((s: string) => s.trim()).filter(Boolean);
          
          setConfig({
            rules: res.eligibility_rules || 'Please ensure all credentials are valid and uploaded professionally.',
            positions: res.positions || [],
            documents: res.documents || [],
            sections: res.sections || [],
            certifications: certList,
            requireExperience: res.sections?.find((s: any) => s.section_key === 'experience')?.is_enabled ?? true,
            requireCerts: res.sections?.find((s: any) => s.section_key === 'certification')?.is_enabled ?? true,
          });
          setShowRulesModal(true); // Open rules modal initially
        }
      } catch (err) {
        console.error("Failed to load campaign", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [slug]);

  const handleFileUpload = async (file: File, documentKey: string, campaignDocumentId: string | null = null) => {
    try {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds the 5MB limit.');
        return;
      }
      
      const { uploadFile } = await import('@/lib/firebase');
      const uniqueFilename = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
      const path = `recruitment_docs/${campaign.id}/${uniqueFilename}`;
      
      const publicUrl = await uploadFile(path, file);
      
      if (publicUrl) {
        setUploadedDocuments(prev => {
          // Remove old entry for same documentKey if exists
          const filtered = prev.filter(d => d.documentKey !== documentKey);
          return [...filtered, {
            campaignDocumentId,
            documentKey,
            fileUrl: publicUrl,
            fileName: uniqueFilename,
            fileSize: file.size,
            fileType: file.type
          }];
        });
        alert('File uploaded successfully!');
      } else {
        alert('File upload failed or unavailable');
      }
    } catch(e: any) {
      alert(e.message || 'Error uploading file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setBase64: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds the 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddExperience = () => {
    if (!expCompany || !expRole || !expStart || !expEnd) {
      alert('Please fill out all fields in the work experience entry.');
      return;
    }
    setExperienceList([...experienceList, { company: expCompany, role: expRole, startDate: expStart, endDate: expEnd }]);
    setExpCompany('');
    setExpRole('');
    setExpStart('');
    setExpEnd('');
  };

  const handleRemoveExperience = (idx: number) => {
    setExperienceList(experienceList.filter((_, i) => i !== idx));
  };

  const handleAddQualification = () => {
    if (!qualTitle || !qualInstitution || !qualYear) {
      alert('Please fill out all fields in the qualification entry.');
      return;
    }
    setQualificationsList([...qualificationsList, { title: qualTitle, institution: qualInstitution, year: qualYear }]);
    setQualTitle('');
    setQualInstitution('');
    setQualYear('');
  };

  const handleRemoveQualification = (idx: number) => {
    setQualificationsList(qualificationsList.filter((_, i) => i !== idx));
  };

  const handleCertCheckboxChange = (certName: string) => {
    if (selectedCerts.includes(certName)) {
      setSelectedCerts(selectedCerts.filter(c => c !== certName));
    } else {
      setSelectedCerts([...selectedCerts, certName]);
    }
  };

  const getFinalPosition = () => {
    return positionAppliedFor === 'Others' ? otherPosition : positionAppliedFor;
  };

  const getFinalCertifications = () => {
    const list = [...selectedCerts];
    if (otherCert.trim()) list.push(otherCert.trim());
    return list;
  };

  const handleFormSubmit = async () => {
    if (!confirmCheckbox) {
      alert('Please check the confirmation box and sign with your full name.');
      return;
    }
    
    setSubmitLoading(true);
    setErrorMsg(null);
    try {
      const finalPosition = getFinalPosition();
      const finalCerts = getFinalCertifications();

      // Check required documents (from campaign.documents)
      const missingRequired = config.documents?.filter((d: any) => d.is_required).find((d: any) => !uploadedDocuments.find(ud => ud.documentKey === d.document_key));
      if (missingRequired) {
        throw new Error(`Missing required document: ${missingRequired.document_name}`);
      }

      const experiencePayload = JSON.stringify(experienceList);
      const additionalQuals = JSON.stringify(qualificationsList);

      
      const res = await dbSubmitRecruitmentApplication({
        data: {
          campaignId: campaign.id,
          firstName,
          middleName,
          lastName,
          email,
          phone,
          dateOfBirth: dob,
          gender,
          stateOfOrigin,
          lgaId: stateOfOrigin === 'Kogi' ? lgaId : null,
          lgaText: stateOfOrigin !== 'Kogi' ? lgaText : null,
          address,
          highestQualification: qualification,
          positionAppliedFor: finalPosition,
          professionalCertification: finalCerts.join(', '),
          workExperienceSummary: experiencePayload,
          declarationAccepted: confirmCheckbox,
          rulesAcknowledgedAt: new Date().toISOString(),
          uploadedDocuments: uploadedDocuments,
          uploadedCv: uploadedDocuments.find(d => d.documentKey === 'cv')?.fileUrl || null,
          uploadedCredentials: additionalQuals,
        }
      });

      if (res.success) {
        setSuccessAppNum(res.applicationNumber);
        setShowPreviewModal(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed');
    }
    setSubmitLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-2">
          <Loader2 className="size-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">Loading recruitment campaign details...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-background text-foreground p-6">
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full border-border/60 bg-card/60 backdrop-blur">
            <CardContent className="p-8 text-center space-y-4">
              <Logo size={48} className="mx-auto" />
              <AlertCircle className="size-12 text-rose-500 mx-auto" />
              <h2 className="text-xl font-black uppercase text-primary">Recruitment Campaign Closed</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This recruitment portal or dynamic link is currently closed, expired, or invalid. Please check back later.
              </p>
              <div className="pt-2">
                <Link to="/recruitment/status" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-bold uppercase tracking-wider">
                  Check Existing Status <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="text-center text-[10px] text-muted-foreground pb-4">
          © 2026 Kogi State Civil Service Commission.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6">
      <div className="max-w-3xl w-full mx-auto space-y-6 py-8">
        <div className="flex justify-between items-center border-b border-border/50 pb-4 print:hidden">
          <Logo size={44} withText textClass="text-primary" />
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => setShowRulesModal(true)} 
              className="px-3.5 py-1.5 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/25 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-[#C5A059]/20"
            >
              View Rules &amp; Guidelines
            </button>
            <Link to="/recruitment/status" className="px-3.5 py-1.5 bg-muted hover:bg-accent border border-border text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors">
              Check Status
            </Link>
          </div>
        </div>

        {successAppNum ? (
          <div className="space-y-6">
            <Card className="border-emerald-500/20 bg-emerald-500/5 print:hidden">
              <CardContent className="p-8 text-center space-y-6">
                <CheckCircle className="size-16 text-emerald-500 mx-auto" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-emerald-600 mb-2 uppercase">Congratulations! Application Submitted Successfully</h2>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mb-2">
                    We deeply appreciate you for choosing to serve and work with the Kogi State Government. Your desire to contribute to the development of our great state is highly commendable.
                  </p>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">Your application ID is <strong className="text-foreground text-lg">{successAppNum}</strong>. You can use this reference to track your application status.</p>
                </div>
                
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-lg max-w-md mx-auto leading-relaxed">
                  ⚠️ WARNING: Applying multiple times for the same or different vacancies will trigger automatic disqualification by the Civil Service Commission Screening engine.
                </div>

                <div className="pt-4 flex items-center justify-center gap-3">
                  <button 
                    onClick={() => window.print()} 
                    className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-primary/95 cursor-pointer flex items-center gap-2 shadow"
                  >
                    <Printer className="size-4" /> Print Acknowledgement Slip
                  </button>
                  <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-bold uppercase tracking-wider rounded-lg text-xs transition-colors">Return to Home</button>
                </div>
              </CardContent>
            </Card>

            {/* Printable Acknowledgement Slip Card */}
            <div className="border border-border/80 rounded-2xl bg-card relative overflow-hidden print:border-none print:shadow-none shadow-2xl">
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <Logo size={500} />
              </div>

              <div className="p-8 pb-4">
                {/* Header Letterhead */}
                <div className="flex flex-col items-center text-center border-b-2 border-primary/50 pb-6 mb-6">
                  <Logo size={72} className="mb-3" />
                  <h2 className="text-xl font-black uppercase text-primary tracking-widest">Kogi State Government of Nigeria</h2>
                  <h3 className="text-md font-bold uppercase text-[#C5A059] tracking-wider mt-1">Civil Service Commission</h3>
                  
                  {/* Application ID boldly in middle top */}
                  <div className="mt-6 mb-2 text-center">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Application ID</div>
                    <div className="text-2xl font-mono font-black text-primary tracking-widest bg-primary/10 px-6 py-2 border border-primary/20 rounded-md">
                      {successAppNum}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/80 mt-2 uppercase font-semibold">Verification &amp; Acknowledgement Slip</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start justify-between relative z-10">
                  {/* Left Columns - Details */}
                  <div className="flex-1 w-full space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#C5A059] border-b border-border/60 pb-1">
                        <User className="size-4" /> Personal Profile
                      </div>
                      
                      {/* Justified layout for applicant information */}
                      <div className="flex flex-col gap-3 text-xs">
                        <div className="flex justify-between items-center border-b border-border/20 pb-1">
                          <span className="text-muted-foreground font-semibold uppercase tracking-wider">Full Name:</span>
                          <span className="font-black text-foreground uppercase text-right">{lastName}, {firstName} {middleName}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-border/20 pb-1">
                          <span className="text-muted-foreground font-semibold uppercase tracking-wider">Email Address:</span>
                          <span className="font-mono font-semibold text-foreground text-right">{email}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-border/20 pb-1">
                          <span className="text-muted-foreground font-semibold uppercase tracking-wider">Phone Number:</span>
                          <span className="font-mono font-semibold text-foreground text-right">{phone}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-border/20 pb-1">
                          <span className="text-muted-foreground font-semibold uppercase tracking-wider">Date of Birth:</span>
                          <span className="font-bold text-foreground text-right">{dob}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-border/20 pb-1">
                          <span className="text-muted-foreground font-semibold uppercase tracking-wider">Gender:</span>
                          <span className="font-bold text-foreground text-right">{gender}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-border/20 pb-1">
                          <span className="text-muted-foreground font-semibold uppercase tracking-wider">State & LGA:</span>
                          <span className="font-bold text-foreground text-right">{stateOfOrigin} / {stateOfOrigin === 'Kogi' ? lgas.find(l => l.id === lgaId)?.name : lgaText}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#C5A059] border-b border-border/60 pb-1 pt-2">
                        <Briefcase className="size-4" /> Appointment Placement
                      </div>
                      <div className="flex flex-col gap-3 text-xs">
                        <div className="flex justify-between items-center border-b border-border/20 pb-1">
                          <span className="text-muted-foreground font-semibold uppercase tracking-wider">Position Applied:</span>
                          <span className="font-black text-primary uppercase text-right">{getFinalPosition()}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-border/20 pb-1">
                          <span className="text-muted-foreground font-semibold uppercase tracking-wider">Highest Qualification:</span>
                          <span className="font-bold text-foreground text-right">{qualification}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Passport & Signature */}
                  <div className="w-full md:w-40 flex flex-col items-center shrink-0 space-y-6">
                    {uploadedDocuments.find(d => d.documentKey === 'passport')?.fileUrl ? (
                      <div className="w-32 h-40 rounded-lg border border-border shadow-sm overflow-hidden bg-white flex items-center justify-center shrink-0">
                        <img src={uploadedDocuments.find(d => d.documentKey === 'passport')?.fileUrl} alt="Applicant Passport" className="size-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-32 h-40 rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-center p-2 text-[10px] text-muted-foreground bg-muted/30">
                        <User className="size-6 mb-1 opacity-50" />
                        No Passport Uploaded
                      </div>
                    )}

                    {uploadedDocuments.find(d => d.documentKey === 'signature')?.fileUrl && (
                      <div className="w-full space-y-1 text-center border-t border-border/40 pt-4">
                        <div className="h-12 flex items-center justify-center">
                          <img src={uploadedDocuments.find(d => d.documentKey === 'signature')?.fileUrl} alt="Applicant Signature" className="h-full object-contain filter brightness-0" />
                        </div>
                        <span className="block text-muted-foreground font-semibold uppercase text-[8px] tracking-widest border-t border-border/50 pt-1 w-24 mx-auto">Applicant Signature</span>
                      </div>
                    )}

                    <div className="w-full pt-6 border-t border-border/40 text-center">
                      <div className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Status</div>
                      <div className="mt-1 px-2.5 py-1 inline-block bg-primary/10 border border-primary/20 text-primary font-black uppercase rounded text-[10px] tracking-wider shadow-sm">
                        Pending Screening
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-4 border-t border-border/40 text-center">
                  <div className="text-[10px] text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                    Please preserve this slip. Presentation of this reference number will be mandatory during screening operations.
                  </div>
                  <div className="text-[9px] text-muted-foreground/60 mt-3 font-semibold tracking-wider">
                    Kogi State Civil Service Commission · Unified Recruitment Portal
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setShowPreviewModal(true); }} className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold uppercase tracking-wider">
                <Briefcase className="size-3" /> Job Application Portal
              </div>
              <h1 className="text-3xl font-black tracking-tight text-primary uppercase">{campaign.title}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {config.text || campaign.description || 'Welcome to the public application tracking gateway.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-lg">
                ⚠️ Error: {errorMsg}
              </div>
            )}

            {/* 1. Personal Information */}
            <Card className="border-border/60 bg-card/40 backdrop-blur-md">
              <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                <CardTitle className="text-sm uppercase font-black text-primary">1. Personal Information</CardTitle>
                <CardDescription className="text-xs">Provide matching details as shown on your NIN/passport.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">First Name *</label>
                    <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-[#C5A059]" placeholder="e.g. Ahmed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Middle Name</label>
                    <input type="text" value={middleName} onChange={e => setMiddleName(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-[#C5A059]" placeholder="e.g. Usman" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Last Name *</label>
                    <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-[#C5A059]" placeholder="e.g. Ododo" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Email Address *</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-[#C5A059]" placeholder="name@domain.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number *</label>
                    <input required type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground font-mono focus:ring-1 focus:ring-[#C5A059]" placeholder="e.g. 08034567890" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Date of Birth *</label>
                    <input required type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-[#C5A059]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Gender *</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground cursor-pointer focus:ring-1 focus:ring-[#C5A059]">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">State of Origin</label>
                    <select value={stateOfOrigin} onChange={e => setStateOfOrigin(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground cursor-pointer focus:ring-1 focus:ring-[#C5A059]">
                      {statesLoading && <option>Loading...</option>}
                      {states.map(s => <option key={s.id} value={s.state_name}>{s.state_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">LGA of Origin</label>
                    {stateOfOrigin === 'Kogi' ? (
                      <select value={lgaId} onChange={e => setLgaId(e.target.value)} required className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground cursor-pointer focus:ring-1 focus:ring-[#C5A059]">
                        <option value="">Select LGA...</option>
                        {lgasLoading && <option>Loading...</option>}
                        {lgas.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    ) : (
                      <input 
                        required 
                        type="text" 
                        value={lgaText} 
                        onChange={e => setLgaText(e.target.value)} 
                        className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-[#C5A059]" 
                        placeholder="Type your LGA of origin..." 
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Residential Address *</label>
                  <textarea required value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-[#C5A059]" placeholder="Complete physical address" />
                </div>
              </CardContent>
            </Card>

            {/* 2. Position & Required Checklist */}
            <Card className="border-border/60 bg-card/40 backdrop-blur-md">
              <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                <CardTitle className="text-sm uppercase font-black text-primary">2. Position &amp; Qualifications</CardTitle>
                <CardDescription className="text-xs">Specify the office you are seeking and educational credentials.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Position Applied For *</label>
                    {config.positions.length > 0 ? (
                      <div className="space-y-2">
                        <select 
                          required 
                          value={positionAppliedFor} 
                          onChange={e => setPositionAppliedFor(e.target.value)} 
                          className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground cursor-pointer focus:ring-1 focus:ring-[#C5A059]"
                        >
                          <option value="">Select Position...</option>
                          {config.positions.map((pos: any) => <option key={pos.id} value={pos.position_title}>{pos.position_title}</option>)}
                          <option value="Others">Others (Not Listed)</option>
                        </select>
                        {positionAppliedFor === 'Others' && (
                          <input 
                            required 
                            type="text" 
                            value={otherPosition} 
                            onChange={e => setOtherPosition(e.target.value)} 
                            className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-[#C5A059]" 
                            placeholder="Type unlisted position here..." 
                          />
                        )}
                        <p className="text-[10px] text-amber-500 font-bold leading-normal">
                          Notice: Candidates who do not find a suitable opening here are advised that they may not be eligible for this campaign.
                        </p>
                      </div>
                    ) : (
                      <input required type="text" value={positionAppliedFor} onChange={e => setPositionAppliedFor(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-[#C5A059]" placeholder="e.g. Administrative Officer II" />
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Highest Educational Qualification *</label>
                    <select value={qualification} onChange={e => setQualification(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground cursor-pointer focus:ring-1 focus:ring-[#C5A059]">
                      <option value="B.Sc">B.Sc / Bachelor Degree</option>
                      <option value="M.Sc">M.Sc / Master Degree</option>
                      <option value="HND">HND / Higher National Diploma</option>
                      <option value="OND">OND / National Diploma</option>
                      <option value="NCE">NCE / National Certificate in Education</option>
                      <option value="WASSCE">WASSCE / SSCE School Certificate</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Certifications Required checklist */}
                {config.certifications.length > 0 && (
                  <div className="border border-border/60 bg-muted/5 p-4 rounded-xl space-y-2 mt-2">
                    <label className="text-xs font-bold text-primary uppercase block">Certifications Checklist *</label>
                    <p className="text-[10px] text-muted-foreground">Select all certifications you hold. If you lack the required qualifications, you may be ineligible.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {config.certifications.map((cert: string) => (
                        <label key={cert} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={selectedCerts.includes(cert)} 
                            onChange={() => handleCertCheckboxChange(cert)} 
                            className="rounded border-border text-[#C5A059] focus:ring-[#C5A059]" 
                          />
                          {cert}
                        </label>
                      ))}
                      <div className="sm:col-span-2 space-y-1 mt-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Other Certification (If any)</label>
                        <input 
                          type="text" 
                          value={otherCert} 
                          onChange={e => setOtherCert(e.target.value)} 
                          className="w-full p-2 bg-background border border-border rounded text-xs" 
                          placeholder="Type other certificate details..." 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. Qualifications Builder */}
            <Card className="border-border/60 bg-card/40 backdrop-blur-md">
              <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                <CardTitle className="text-sm uppercase font-black text-primary">3. Education &amp; Academic Credentials</CardTitle>
                <CardDescription className="text-xs">Add your academic background and secondary certificates.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Qualifications List Table */}
                {qualificationsList.length > 0 && (
                  <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-muted/40 font-bold text-[10px] uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2">Qualification Title</th>
                          <th className="px-4 py-2">Institution</th>
                          <th className="px-4 py-2">Year</th>
                          <th className="px-4 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {qualificationsList.map((q, i) => (
                          <tr key={i} className="hover:bg-muted/5">
                            <td className="px-4 py-2.5 font-bold text-foreground">{q.title}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{q.institution}</td>
                            <td className="px-4 py-2.5 font-mono">{q.year}</td>
                            <td className="px-4 py-2.5 text-right">
                              <button type="button" onClick={() => handleRemoveQualification(i)} className="text-rose-500 hover:underline">Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Builder inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/10 p-4 border border-border/50 rounded-xl">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Certificate / Degree Title</label>
                    <input type="text" value={qualTitle} onChange={e => setQualTitle(e.target.value)} className="w-full p-2 bg-background border border-border rounded text-xs" placeholder="e.g. B.Eng Mechanical Engineering" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Institution Name</label>
                    <input type="text" value={qualInstitution} onChange={e => setQualInstitution(e.target.value)} className="w-full p-2 bg-background border border-border rounded text-xs" placeholder="e.g. Kogi State University" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Graduation Year</label>
                    <div className="flex gap-2">
                      <input type="text" value={qualYear} onChange={e => setQualYear(e.target.value)} className="flex-1 p-2 bg-background border border-border rounded text-xs font-mono" placeholder="e.g. 2023" />
                      <button type="button" onClick={handleAddQualification} className="px-3 bg-primary text-primary-foreground font-bold text-xs uppercase rounded hover:bg-primary/90">Add</button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Work Experience Builder */}
            {config.requireExperience && (
              <Card className="border-border/60 bg-card/40 backdrop-blur-md">
                <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                  <CardTitle className="text-sm uppercase font-black text-primary">4. Work History &amp; Experience</CardTitle>
                  <CardDescription className="text-xs">Provide details of past positions held, including dates and roles.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Experience list table */}
                  {experienceList.length > 0 && (
                    <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-muted/40 font-bold text-[10px] uppercase text-muted-foreground">
                          <tr>
                            <th className="px-4 py-2">Company / Organization</th>
                            <th className="px-4 py-2">Role Title</th>
                            <th className="px-4 py-2">Date range</th>
                            <th className="px-4 py-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {experienceList.map((exp, i) => (
                            <tr key={i} className="hover:bg-muted/5">
                              <td className="px-4 py-2.5 font-bold text-foreground">{exp.company}</td>
                              <td className="px-4 py-2.5 text-muted-foreground">{exp.role}</td>
                              <td className="px-4 py-2.5 font-mono">{exp.startDate} - {exp.endDate}</td>
                              <td className="px-4 py-2.5 text-right">
                                <button type="button" onClick={() => handleRemoveExperience(i)} className="text-rose-500 hover:underline">Remove</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Builder inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-muted/10 p-4 border border-border/50 rounded-xl">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Employer Name</label>
                      <input type="text" value={expCompany} onChange={e => setExpCompany(e.target.value)} className="w-full p-2 bg-background border border-border rounded text-xs" placeholder="e.g. Dangote Cement" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Job / Position Title</label>
                      <input type="text" value={expRole} onChange={e => setExpRole(e.target.value)} className="w-full p-2 bg-background border border-border rounded text-xs" placeholder="e.g. Operations Assistant" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Start Date</label>
                      <input type="text" value={expStart} onChange={e => setExpStart(e.target.value)} className="w-full p-2 bg-background border border-border rounded text-xs font-mono" placeholder="e.g. Jan 2021" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">End Date</label>
                      <div className="flex gap-2">
                        <input type="text" value={expEnd} onChange={e => setExpEnd(e.target.value)} className="flex-1 p-2 bg-background border border-border rounded text-xs font-mono" placeholder="e.g. Present" />
                        <button type="button" onClick={handleAddExperience} className="px-3 bg-primary text-primary-foreground font-bold text-xs uppercase rounded hover:bg-primary/90">Add</button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 5. Document Uploads & Passport/Signature */}
            <Card className="border-border/60 bg-card/40 backdrop-blur-md">
              <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                <CardTitle className="text-sm uppercase font-black text-primary">5. Required Attachments &amp; Identification</CardTitle>
                <CardDescription className="text-xs">Upload your profile assets and verification files.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-dashed border-border rounded-lg flex flex-col justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-primary uppercase">Upload CV / Resume *</div>
                      <div className="text-[10px] text-muted-foreground">URL link to your cloud drive.</div>
                      <input required type="text" value={cvUrl} onChange={e => setCvUrl(e.target.value)} className="w-full mt-2 p-1.5 bg-background border border-border rounded text-[11px]" placeholder="Link to CV (Google Drive/Dropbox)" />
                    </div>
                    <UploadCloud className="size-8 text-muted-foreground" />
                  </div>

                  <div className="p-4 border border-dashed border-border rounded-lg flex flex-col justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-primary uppercase">Credentials Certificate *</div>
                      <div className="text-[10px] text-muted-foreground">URL link to your credentials PDF.</div>
                      <input required type="text" value={credentialsUrl} onChange={e => setCredentialsUrl(e.target.value)} className="w-full mt-2 p-1.5 bg-background border border-border rounded text-[11px]" placeholder="Link to Certificate" />
                    </div>
                    <UploadCloud className="size-8 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border/40 pt-6">
                  {/* Passport Photo Upload */}
                  {config.requirePassport && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase block">Passport Photograph *</label>
                      <div className="flex items-center gap-4">
                        {passportBase64 ? (
                          <div className="size-20 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                            <img src={passportBase64} alt="Passport Preview" className="size-full object-cover" />
                          </div>
                        ) : (
                          <div className="size-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground shrink-0">
                            No Photo
                          </div>
                        )}
                        <div className="flex-1 space-y-1.5">
                          <input 
                            required={!passportBase64}
                            type="file" 
                            accept="image/*" 
                            onChange={e => handleFileChange(e, setPassportBase64)}
                            className="text-xs text-muted-foreground file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border file:border-border file:text-[10px] file:font-black file:uppercase file:bg-muted file:text-foreground cursor-pointer" 
                          />
                          <p className="text-[9px] text-muted-foreground">JPG/PNG formats only. Max 5MB.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Signature Upload */}
                  {config.requireSignature && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase block">Authorized Signature *</label>
                      <div className="flex items-center gap-4">
                        {signatureBase64 ? (
                          <div className="w-24 h-12 rounded border border-border bg-white p-1 flex items-center justify-center shrink-0">
                            <img src={signatureBase64} alt="Signature Preview" className="h-full object-contain filter invert" />
                          </div>
                        ) : (
                          <div className="w-24 h-12 rounded border-2 border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground shrink-0">
                            No Signature
                          </div>
                        )}
                        <div className="flex-1 space-y-1.5">
                          <input 
                            required={!signatureBase64}
                            type="file" 
                            accept="image/*" 
                            onChange={e => handleFileChange(e, setSignatureBase64)}
                            className="text-xs text-muted-foreground file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border file:border-border file:text-[10px] file:font-black file:uppercase file:bg-muted file:text-foreground cursor-pointer" 
                          />
                          <p className="text-[9px] text-muted-foreground">Clear image of handwritten signature.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-lg shadow hover:bg-primary/95 transition-colors cursor-pointer flex items-center justify-center gap-2">
              Preview Application
            </button>
          </form>
        )}
      </div>

      {/* Rules & Requirements Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6 relative flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <h3 className="text-sm font-black uppercase text-primary flex items-center gap-1.5">
                <Briefcase className="size-4 text-[#C5A059]" /> Eligibility Rules &amp; Qualifications
              </h3>
              <button type="button" onClick={() => setShowRulesModal(false)} className="text-muted-foreground hover:text-white"><X className="size-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 text-xs text-muted-foreground space-y-4 leading-relaxed pr-2">
              <div className="p-3 bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059] font-bold rounded-lg uppercase tracking-wider text-[10px] text-center">
                Please review the campaign guidelines carefully before proceeding.
              </div>
              <div className="space-y-2">
                <div className="font-bold text-foreground text-xs uppercase tracking-wider border-b border-border/40 pb-1">Vacancies &amp; Directives:</div>
                <p className="whitespace-pre-line text-slate-300 font-semibold">{config.rules}</p>
              </div>
              <div className="space-y-1.5 border-t border-border/40 pt-3 mt-3">
                <span className="block text-[10px] uppercase font-bold text-primary">Required Documents Checklist:</span>
                <ul className="list-disc pl-4 space-y-1 font-medium">
                  <li>Valid Passport Photograph (digital upload)</li>
                  <li>Handwritten scanned Signature</li>
                  <li>Academic Credentials Certificate</li>
                  <li>Curriculum Vitae / Resume</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border/50 pt-3 flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowRulesModal(false)} 
                className="px-5 py-2.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-lg hover:bg-primary/95 transition-colors cursor-pointer"
              >
                I Understand &amp; Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview and Submit Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <h3 className="text-sm font-black uppercase text-primary flex items-center gap-1.5">
                <CheckCircle className="size-4 text-emerald-500" /> Preview Application Details
              </h3>
              <button type="button" onClick={() => setShowPreviewModal(false)} className="text-muted-foreground hover:text-white"><X className="size-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded-lg uppercase tracking-wider text-center leading-normal">
                Please double check all details. You cannot modify your information after submission.
              </div>

              {/* Grid Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-4 text-xs">
                  {/* Personal info summary */}
                  <div className="space-y-2 border-b border-border/40 pb-3">
                    <div className="text-[10px] font-bold uppercase text-[#C5A059] tracking-wider">1. Applicant Profile</div>
                    <div className="grid grid-cols-2 gap-3 text-slate-300">
                      <div>
                        <span className="block text-muted-foreground uppercase text-[8px] tracking-widest font-black">Full Name</span>
                        <span className="font-bold">{firstName} {middleName} {lastName}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground uppercase text-[8px] tracking-widest font-black">Email / Phone</span>
                        <span className="font-mono">{email} / {phone}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground uppercase text-[8px] tracking-widest font-black">Date of Birth</span>
                        <span>{dob}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground uppercase text-[8px] tracking-widest font-black">Gender</span>
                        <span>{gender}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground uppercase text-[8px] tracking-widest font-black">Origin Details</span>
                        <span>{stateOfOrigin} State</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground uppercase text-[8px] tracking-widest font-black">Residential Address</span>
                        <span className="line-clamp-2">{address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Position summary */}
                  <div className="space-y-2 border-b border-border/40 pb-3">
                    <div className="text-[10px] font-bold uppercase text-[#C5A059] tracking-wider">2. Appointment Target</div>
                    <div className="grid grid-cols-2 gap-3 text-slate-300">
                      <div>
                        <span className="block text-muted-foreground uppercase text-[8px] tracking-widest font-black">Position Applied</span>
                        <span className="font-bold text-primary">{getFinalPosition()}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground uppercase text-[8px] tracking-widest font-black">Qualification Level</span>
                        <span className="font-bold">{qualification}</span>
                      </div>
                    </div>
                  </div>

                  {/* Credentials summary */}
                  {qualificationsList.length > 0 && (
                    <div className="space-y-2 border-b border-border/40 pb-3">
                      <div className="text-[10px] font-bold uppercase text-[#C5A059] tracking-wider">3. Credentials</div>
                      <div className="space-y-1.5">
                        {qualificationsList.map((q, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-muted/20 p-2 rounded text-[11px]">
                            <span className="font-bold text-slate-200">{q.title}</span>
                            <span className="text-muted-foreground">{q.institution} ({q.year})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience summary */}
                  {experienceList.length > 0 && (
                    <div className="space-y-2 border-b border-border/40 pb-3">
                      <div className="text-[10px] font-bold uppercase text-[#C5A059] tracking-wider">4. Work History</div>
                      <div className="space-y-1.5">
                        {experienceList.map((exp, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-muted/20 p-2 rounded text-[11px]">
                            <span className="font-bold text-slate-200">{exp.role} at {exp.company}</span>
                            <span className="text-muted-foreground font-mono">{exp.startDate} - {exp.endDate}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Passport & Signature Summary */}
                <div className="flex flex-col items-center text-center space-y-4 md:border-l md:border-border/60 md:pl-4">
                  {passportBase64 ? (
                    <div className="size-28 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      <img src={passportBase64} alt="Passport Summary" className="size-full object-cover" />
                    </div>
                  ) : (
                    <div className="size-28 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground shrink-0">
                      No Passport photograph
                    </div>
                  )}

                  {signatureBase64 ? (
                    <div className="w-full space-y-1">
                      <span className="block text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Handwritten Signature</span>
                      <div className="h-10 border border-border bg-white p-1 flex items-center justify-center">
                        <img src={signatureBase64} alt="Signature Summary" className="h-full object-contain filter invert" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-10 border border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground shrink-0">
                      No Signature
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm name validation and checkbox */}
              <div className="border-t border-border/50 pt-4 mt-4 space-y-3">
                <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer font-bold leading-relaxed">
                  <input 
                    type="checkbox" 
                    checked={confirmCheckbox} 
                    onChange={e => setConfirmCheckbox(e.target.checked)} 
                    className="rounded border-border text-[#C5A059] focus:ring-[#C5A059] mt-0.5" 
                  />
                  <span>
                    I hereby confirm that all information filled above is completely correct and approved by: <span className="text-primary underline font-black">{firstName} {middleName} {lastName}</span>.
                  </span>
                </label>
              </div>
            </div>

            <div className="border-t border-border/50 pt-3 flex justify-between gap-3">
              <button 
                type="button" 
                onClick={() => setShowPreviewModal(false)} 
                className="px-5 py-2.5 bg-muted border border-border text-foreground font-black text-xs uppercase tracking-wider rounded-lg hover:bg-accent transition-colors"
              >
                Back To Form
              </button>
              <button 
                type="button" 
                onClick={handleFormSubmit}
                disabled={submitLoading || !confirmCheckbox}
                className="px-6 py-2.5 bg-[#C5A059] text-white font-black text-xs uppercase tracking-wider rounded-lg hover:bg-[#C5A059]/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitLoading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                Confirm &amp; Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-[10px] text-muted-foreground py-4 border-t border-border/20 max-w-3xl w-full mx-auto print:hidden">
        © 2026 Kogi State Civil Service Commission. Unified ERP Recruitment Portal.
      </div>
    </div>
  );
}
