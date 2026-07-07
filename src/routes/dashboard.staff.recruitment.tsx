import { dbGetRecruitmentCampaigns, dbGetRecruitmentApplications, dbGetWorkforceCategories, getOrganizationsList, dbSaveRecruitmentCampaign, dbUpdateRecruitmentApplicationStatus, dbConvertToStaff, dbGetRecruitmentCampaignBySlug } from '@/lib/postgres-service';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Power, Users, Save, Plus, X, Briefcase, FileText, Link2, Copy, Check, CheckCircle2, ChevronRight, UserPlus, RefreshCw, Loader2 } from 'lucide-react';
import { getSession } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/staff/recruitment')({
  component: RecruitmentAdminPage,
});

function RecruitmentAdminPage() {
  const session = getSession();
  
  // Campaigns state
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  
  // Form states for creating campaigns
  const [showCreateCamp, setShowCreateCamp] = useState(false);
  const [campTitle, setCampTitle] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campWorkforceCat, setCampWorkforceCat] = useState('');
  const [campOrg, setCampOrg] = useState('');
  const [campSlug, setCampSlug] = useState('');
  
  // Applicants state
  const [applicants, setApplicants] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Workforce & Org options
  const [workforceCats, setWorkforceCats] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);

  // Onboard modal state
  const [selectedOnboardApp, setSelectedOnboardApp] = useState<any | null>(null);
  const [onboardOrgId, setOnboardOrgId] = useState('');
  const [onboardDeptName, setOnboardDeptName] = useState('');
  const [onboardGrade, setOnboardGrade] = useState('GL-08');
  const [onboardRank, setOnboardRank] = useState('');
  const [onboardLoading, setOnboardLoading] = useState(false);

  // Form Config Builder states for selected campaign
  const [rules, setRules] = useState('');
  const [positions, setPositions] = useState('');
  const [certifications, setCertifications] = useState('');
  const [requireExperience, setRequireExperience] = useState(true);
  const [requireCerts, setRequireCerts] = useState(true);
  const [requirePassport, setRequirePassport] = useState(true);
  const [requireSignature, setRequireSignature] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);


  const loadCampaigns = async () => {
    try {
      
      const data = await dbGetRecruitmentCampaigns();
      setCampaigns(data);
      if (data.length > 0 && !selectedCampaignId) {
        setSelectedCampaignId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  };

  const loadApplicants = async () => {
    if (!selectedCampaignId) return;
    setLoading(true);
    try {
      
      const data = await dbGetRecruitmentApplications({
        data: {
          campaignId: selectedCampaignId || undefined,
          status: statusFilter || undefined
        }
      });
      setApplicants(data);
    } catch (err) {
      console.error('Failed to load applicants:', err);
    }
    setLoading(false);
  };

  const loadHelpers = async () => {
    try {
      
      const cats = await dbGetWorkforceCategories();
      setWorkforceCats(cats);
      if (cats.length > 0) setCampWorkforceCat(cats[0].id);

      const orgs = await getOrganizationsList();
      setOrganizations(orgs);
      setCampOrg(''); // Default to Civil Service (first option)
      if (orgs.length > 0) {
        setOnboardOrgId(orgs[0].id);
      }
    } catch (err) {
      console.error('Failed to load helpers:', err);
    }
  };

  useEffect(() => {
    loadCampaigns();
    loadHelpers();
  }, []);

  useEffect(() => {
    loadApplicants();
  }, [selectedCampaignId, statusFilter]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle || !campSlug) {
      alert('Campaign Title and URL Slug are required.');
      return;
    }
    try {
      
      await dbSaveRecruitmentCampaign({
        data: {
          title: campTitle,
          description: campDesc,
          workforceCategoryId: campWorkforceCat || null,
          organizationId: campOrg || null,
          applicationStartDate: new Date().toISOString(),
          applicationEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          publicSlug: campSlug
        }
      });
      alert('Recruitment Campaign Created successfully!');
      setShowCreateCamp(false);
      setCampTitle('');
      setCampDesc('');
      setCampSlug('');
      loadCampaigns();
    } catch (err: any) {
      alert(err.message || 'Failed to create campaign');
    }
  };

  const handleToggleCampaignStatus = async (id: string, currentActive: boolean) => {
    try {
      
      const comp = campaigns.find(c => c.id === id);
      if (comp) {
        await dbSaveRecruitmentCampaign({
          data: {
            ...comp,
            isActive: !currentActive
          }
        });
        loadCampaigns();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      
      await dbUpdateRecruitmentApplicationStatus({
        data: {
          id: appId,
          newStatus,
          remarks: `Status updated by administrator (${session?.name || 'Admin'})`,
          changedBy: session?.id || null
        }
      });
      loadApplicants();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOnboardApp || !onboardOrgId || !onboardGrade || !onboardRank) {
      alert('Please fill out all onboarding fields.');
      return;
    }

    setOnboardLoading(true);
    try {
      
      const res = await dbConvertToStaff({
        data: {
          applicationId: selectedOnboardApp.id,
          organizationId: onboardOrgId,
          departmentId: undefined, // default
          gradeLevel: onboardGrade,
          rank: onboardRank,
          addedBy: session?.id || null
        }
      });

      if (res.success) {
        alert(`Successfully onboarded to Nominal Roll! Assigned Staff ID: ${res.staffId}`);
        setSelectedOnboardApp(null);
        setOnboardRank('');
        loadApplicants();
      }
    } catch (err: any) {
      alert(err.message || 'Onboarding failed');
    }
    setOnboardLoading(false);
  };

  useEffect(() => {
    if (selectedCampaign) {
      const fetchDetails = async () => {
        try {
          
          const slugToUse = selectedCampaign.slug || selectedCampaign.public_slug;
          if (!slugToUse) return;
          const fullCamp = await dbGetRecruitmentCampaignBySlug({ data: { slug: slugToUse } });
          if (fullCamp) {
            setRules(fullCamp.eligibility_rules || '');
            setPositions(fullCamp.positions?.map((p: any) => p.position_title).join(', ') || '');
            
            // Extract certs and document toggles from sections/documents
            const certs = fullCamp.documents?.filter((d: any) => d.document_key === 'certification').map((d: any) => d.document_name).join(', ') || '';
            setCertifications(certs);
            
            setRequireExperience(fullCamp.sections?.find((s: any) => s.section_key === 'experience')?.is_enabled ?? true);
            setRequireCerts(fullCamp.sections?.find((s: any) => s.section_key === 'certification')?.is_enabled ?? true);
            setRequirePassport(fullCamp.documents?.find((d: any) => d.document_key === 'passport')?.is_required ?? true);
            setRequireSignature(fullCamp.documents?.find((d: any) => d.document_key === 'signature')?.is_required ?? true);
          }
        } catch (e) {
          console.error("Failed to fetch full campaign details", e);
        }
      };
      fetchDetails();
    }
  }, [selectedCampaignId, campaigns]);

  const handleSaveConfig = async () => {
    if (!selectedCampaign) return;
    setSaveLoading(true);
    try {
      
      const positionsArray = positions.split(',').map(s => s.trim()).filter(Boolean).map(title => ({ positionTitle: title }));
      const certsArray = certifications.split(',').map(s => s.trim()).filter(Boolean);
      
      const docs = [
        { documentName: 'CV / Resume', documentKey: 'cv', isRequired: true },
        { documentName: 'Educational Credentials', documentKey: 'credentials', isRequired: true },
        { documentName: 'Passport Photograph', documentKey: 'passport', isRequired: requirePassport },
        { documentName: 'Digital Signature', documentKey: 'signature', isRequired: requireSignature }
      ];
      certsArray.forEach(c => docs.push({ documentName: c, documentKey: 'certification', isRequired: true }));

      const sects = [
        { sectionKey: 'experience', sectionName: 'Work Experience', isEnabled: requireExperience, isRequired: false },
        { sectionKey: 'certification', sectionName: 'Professional Certifications', isEnabled: requireCerts, isRequired: false }
      ];

      await dbSaveRecruitmentCampaign({
        data: {
          ...selectedCampaign,
          eligibilityRules: rules,
          positions: positionsArray,
          documents: docs,
          sections: sects
        }
      });
      alert('Application form configuration updated successfully!');
      loadCampaigns();
    } catch (err: any) {
      alert(err.message || 'Failed to save configuration');
    }
    setSaveLoading(false);
  };

  const copyLink = (slug: string) => {
    const link = `${window.location.origin}/recruitment/apply/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-6 pb-24 text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-primary">Recruitment Campaign Registry</h1>
          <p className="text-muted-foreground text-xs mt-1">Manage public entry campaigns, application tracking, and civil servant onboarding pipelines.</p>
        </div>
        <button 
          onClick={() => setShowCreateCamp(true)}
          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 hover:bg-primary/95 cursor-pointer"
        >
          <Plus className="size-4" /> Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: campaigns list */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-border/60 bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
              <CardTitle className="text-sm font-black text-primary uppercase">Active Campaigns</CardTitle>
              <CardDescription className="text-xs">Select a campaign to manage applicant queue.</CardDescription>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {campaigns.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground p-8">No campaigns registered.</div>
              ) : campaigns.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedCampaignId(c.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    selectedCampaignId === c.id 
                      ? 'border-[#C5A059] bg-[#C5A059]/5' 
                      : 'border-border/60 hover:bg-muted/10'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-xs text-foreground leading-relaxed">{c.title}</div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                      c.is_active 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {c.is_active ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{c.description || 'No description provided.'}</div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-border/40 mt-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); copyLink(c.public_slug); }}
                      className="inline-flex items-center gap-1 text-[9px] text-[#C5A059] hover:underline font-bold"
                    >
                      {copiedId === c.public_slug ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      Copy Link
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleCampaignStatus(c.id, c.is_active); }}
                      className="inline-flex items-center gap-1 text-[9px] text-rose-400 hover:underline font-bold"
                    >
                      <Power className="size-3" />
                      {c.is_active ? 'Close' : 'Open'}
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column: applicant list */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 bg-card/60 backdrop-blur-md h-full">
            <CardHeader className="border-b border-border/50 bg-muted/10">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-sm font-black text-primary uppercase flex items-center gap-2">
                    <Users className="size-5 text-primary" /> Application Pipeline
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Campaign: <span className="font-bold text-primary">{selectedCampaign?.title || 'None'}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)} 
                    className="p-1.5 bg-background border border-border text-xs rounded-md outline-none text-foreground cursor-pointer font-semibold"
                  >
                    <option value="">All Statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Screening">Screening</option>
                    <option value="Interview">Interview</option>
                    <option value="Successful">Successful</option>
                    <option value="Unsuccessful">Unsuccessful</option>
                    <option value="Added to Nominal Roll">Added to Nominal Roll</option>
                  </select>
                  <button onClick={loadApplicants} className="p-1.5 bg-background border border-border rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
                    <RefreshCw className="size-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-muted-foreground space-y-2">
                  <Loader2 className="size-8 animate-spin text-primary mx-auto" />
                  <p className="text-xs">Retrieving applicant profiles...</p>
                </div>
              ) : applicants.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                  <Briefcase className="size-12 mb-3 opacity-20 text-[#C5A059]" />
                  <p className="text-xs">No applicant records found for this criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Reference</th>
                        <th className="px-4 py-3">Candidate</th>
                        <th className="px-4 py-3">Position Seeked</th>
                        <th className="px-4 py-3">Education</th>
                        <th className="px-4 py-3 text-right">Process Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {applicants.map(app => (
                        <tr key={app.id} className="hover:bg-muted/5 transition-all">
                          <td className="px-4 py-3 font-mono font-bold text-primary">{app.application_number}</td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-foreground">{app.first_name} {app.last_name}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{app.email} · {app.phone}</div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-200">{app.position_applied_for}</td>
                          <td className="px-4 py-3 font-medium text-slate-300">{app.qualification}</td>
                          <td className="px-4 py-3 text-right space-x-2" onClick={e => e.stopPropagation()}>
                            {app.application_status === 'Successful' && (
                              <button 
                                onClick={() => setSelectedOnboardApp(app)}
                                className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg font-black transition-colors text-[9px] uppercase cursor-pointer inline-flex items-center gap-1"
                              >
                                <UserPlus className="size-3" /> Onboard Staff
                              </button>
                            )}
                            
                            <select 
                              value={app.application_status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              className={`p-1.5 rounded font-black text-[9px] uppercase border focus:outline-none cursor-pointer ${
                                app.application_status === 'Successful' || app.application_status === 'Added to Nominal Roll' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                app.application_status === 'Unsuccessful' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}
                            >
                              <option value="Submitted">Submitted</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Screening">Screening</option>
                              <option value="Interview">Interview</option>
                              <option value="Successful">Successful</option>
                              <option value="Unsuccessful">Unsuccessful</option>
                              <option value="Added to Nominal Roll" disabled>Added to Nominal Roll</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* 3. Form Settings & Requirements Builder */}
          {selectedCampaign && (
            <Card className="border-border/60 bg-card/60 backdrop-blur-md mt-6">
              <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                <CardTitle className="text-sm font-black text-primary uppercase flex items-center gap-2">
                  <Briefcase className="size-5 text-[#C5A059]" /> Application Form Configuration
                </CardTitle>
                <CardDescription className="text-xs">
                  Modify available positions, required credentials, eligibility rules, and sections for <span className="font-bold text-primary">{selectedCampaign.title}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Rules, Requirements & Qualifications</label>
                  <textarea 
                    value={rules} 
                    onChange={e => setRules(e.target.value)} 
                    rows={4} 
                    className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground" 
                    placeholder="Enter eligibility rules and requirements (displayed to applicants before they start)..." 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Available Positions (Comma Separated)</label>
                    <input 
                      type="text" 
                      value={positions} 
                      onChange={e => setPositions(e.target.value)} 
                      className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground" 
                      placeholder="e.g. Administrative Officer II, Medical Officer, Accountant" 
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">These will show as a dropdown list. Leave empty for open entries.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Required Certifications (Comma Separated)</label>
                    <input 
                      type="text" 
                      value={certifications} 
                      onChange={e => setCertifications(e.target.value)} 
                      className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground" 
                      placeholder="e.g. SSCE, B.Sc Degree, COREN License, PMP" 
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">These must be selected by the applicant during submission.</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border/40 pt-4">
                  <label className="text-xs font-bold uppercase text-muted-foreground block">Optional Fields & Sections</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-foreground">
                      <input type="checkbox" checked={requireExperience} onChange={e => setRequireExperience(e.target.checked)} className="rounded border-border text-[#C5A059] focus:ring-[#C5A059]" />
                      Work Experience
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-foreground">
                      <input type="checkbox" checked={requireCerts} onChange={e => setRequireCerts(e.target.checked)} className="rounded border-border text-[#C5A059] focus:ring-[#C5A059]" />
                      Professional Certs
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-foreground">
                      <input type="checkbox" checked={requirePassport} onChange={e => setRequirePassport(e.target.checked)} className="rounded border-border text-[#C5A059] focus:ring-[#C5A059]" />
                      Passport Upload
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-foreground">
                      <input type="checkbox" checked={requireSignature} onChange={e => setRequireSignature(e.target.checked)} className="rounded border-border text-[#C5A059] focus:ring-[#C5A059]" />
                      Signature Upload
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={handleSaveConfig} 
                    disabled={saveLoading}
                    className="px-4 py-2 bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 hover:bg-[#C5A059]/90 disabled:opacity-50 cursor-pointer"
                  >
                    {saveLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Form Configuration
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      </div>

      {/* 1. Create Campaign Dialog */}
      {showCreateCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateCampaign} className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 relative flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <h3 className="text-sm font-black uppercase text-primary">Create Recruitment Campaign</h3>
              <button type="button" onClick={() => setShowCreateCamp(false)} className="text-muted-foreground hover:text-white"><X className="size-4" /></button>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Campaign Title *</label>
              <input required type="text" value={campTitle} onChange={e => setCampTitle(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground" placeholder="e.g. 2026 Special Legal Service Drive" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Description</label>
              <textarea value={campDesc} onChange={e => setCampDesc(e.target.value)} rows={3} className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground" placeholder="Details about requirements/openings..." />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Workforce Category</label>
              <select value={campWorkforceCat} onChange={e => setCampWorkforceCat(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground cursor-pointer">
                {workforceCats.map(wc => <option key={wc.id} value={wc.id}>{wc.name} ({wc.code})</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Target Agency/MDA</label>
              <select value={campOrg} onChange={e => setCampOrg(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground cursor-pointer">
                <option value="">Civil Service</option>
                {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Public URL Slug *</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-muted-foreground">/apply/</span>
                <input required type="text" value={campSlug} onChange={e => setCampSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="flex-1 p-2 bg-background border border-border rounded-lg text-xs text-foreground font-mono" placeholder="legal-2026" />
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-lg shadow hover:bg-primary/95 transition-colors cursor-pointer">
              Deploy Campaign Link
            </button>
          </form>
        </div>
      )}

      {/* 2. Onboard Successful Candidate Dialog */}
      {selectedOnboardApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleOnboardSubmit} className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 relative flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <h3 className="text-sm font-black uppercase text-primary flex items-center gap-1.5"><UserPlus className="size-4 text-emerald-500" /> Onboard to Nominal Roll</h3>
              <button type="button" onClick={() => setSelectedOnboardApp(null)} className="text-muted-foreground hover:text-white"><X className="size-4" /></button>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              Candidate: {selectedOnboardApp.first_name} {selectedOnboardApp.last_name}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Assigned MDA / Placement *</label>
              <select value={onboardOrgId} onChange={e => setOnboardOrgId(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground cursor-pointer">
                {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Grade Level *</label>
              <select value={onboardGrade} onChange={e => setOnboardGrade(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground cursor-pointer">
                {Array.from({ length: 17 }, (_, i) => String(i + 1).padStart(2, '0')).map(gl => (
                  <option key={gl} value={`GL-${gl}`}>Grade Level {gl}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Assigned Rank / Official Title *</label>
              <input required type="text" value={onboardRank} onChange={e => setOnboardRank(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground" placeholder="e.g. Administrative Officer II" />
            </div>

            <button type="submit" disabled={onboardLoading} className="w-full py-2.5 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow hover:bg-emerald-600 transition-colors cursor-pointer flex items-center justify-center gap-2">
              {onboardLoading ? <Loader2 className="size-4 animate-spin" /> : 'Confirm Placement & Generate Staff ID'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
