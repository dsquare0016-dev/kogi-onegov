import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Save, User, Calendar, Mail, Phone, MapPin, Award, BookOpen, Building, FileText, ArrowLeft, Loader2, Camera } from 'lucide-react';
import { getSession } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/staff/create')({
  component: CreateStaffMemberPage,
});

function CreateStaffMemberPage() {
  const navigate = useNavigate();
  const session = getSession();

  // Redirect if not super_admin or civil_service_commission
  const isAuthorized = session?.role === 'super_admin' || session?.role === 'civil_service_commission' || session?.role === 'desk_officer';
  
  if (!isAuthorized) {
    return (
      <div className="p-6 max-w-[800px] mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold tracking-tight text-rose-500">Access Restricted</h1>
        <p className="text-muted-foreground mt-2">
          Only Super Admins, Civil Service Commissioners, or Desk Officers are authorized to register staff.
        </p>
        <Link to="/dashboard/staff/nominal-roll" className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to Nominal Roll
        </Link>
      </div>
    );
  }

  // API Lists
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [gradeLevels, setGradeLevels] = useState<any[]>([]);
  const [ranks, setRanks] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [lgas, setLgas] = useState<any[]>([]);
  const [workforceTypes, setWorkforceTypes] = useState<any[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  // Personal Info
  const [fullName, setFullName] = useState('');
  const [sex, setSex] = useState('male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [lgaOfOrigin, setLgaOfOrigin] = useState('');
  const [nationality, setNationality] = useState('Nigeria');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Gov Info
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [position, setPosition] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [step, setStep] = useState('1');
  const [rank, setRank] = useState('');
  const [dateOfFirstAppointment, setDateOfFirstAppointment] = useState('');
  const [dateOfConfirmation, setDateOfConfirmation] = useState('');
  const [workforceType, setWorkforceType] = useState('civil_servant');
  const [employmentType, setEmploymentType] = useState('permanent');

  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const handleCustomField = (key: string, value: string) => {
    setCustomFields(prev => ({ ...prev, [key]: value }));
  };

  // Identity & Payroll
  const [nin, setNin] = useState('');
  const [bvn, setBvn] = useState('');
  const [psnNumber, setPsnNumber] = useState('');
  const [passportUrl, setPassportUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');

  // Auto-calculated retirement date
  const [calculatedRetirement, setCalculatedRetirement] = useState('N/A');

  // Load Dropdowns
  useEffect(() => {
    async function loadData() {
      try {
        const {
          getNominalRollOrganizations,
          getNominalRollPositions,
          getNominalRollGradeLevels,
          getNominalRollRanks,
          getNominalRollStates,
          getNominalRollWorkforceTypes,
          getNominalRollEmploymentTypes
        } = await import('@/lib/nominal-roll-endpoints');

        const [orgs, pos, gl, rk, st, wt, et] = await Promise.all([
          getNominalRollOrganizations(),
          getNominalRollPositions(),
          getNominalRollGradeLevels(),
          getNominalRollRanks(),
          getNominalRollStates(),
          getNominalRollWorkforceTypes(),
          getNominalRollEmploymentTypes()
        ]);

        setOrganizations(orgs);
        setPositions(pos);
        setGradeLevels(gl);
        setRanks(rk);
        setStates(st);
        setWorkforceTypes(wt);
        setEmploymentTypes(et);
      } catch (err) {
        console.error("Failed to load dropdown directories:", err);
      } finally {
        setLoadingLists(false);
      }
    }
    loadData();
  }, []);

  // Fetch Departments when Org changes
  useEffect(() => {
    if (!selectedOrgId) {
      setDepartments([]);
      return;
    }
    async function loadDepts() {
      const { getNominalRollDepartments } = await import('@/lib/nominal-roll-endpoints');
      const deptsData = await getNominalRollDepartments({ data: selectedOrgId });
      setDepartments(deptsData);
    }
    loadDepts();
  }, [selectedOrgId]);

  // Fetch Units when Dept changes
  useEffect(() => {
    if (!selectedDeptId) {
      setUnits([]);
      return;
    }
    async function loadUnits() {
      const { getNominalRollUnits } = await import('@/lib/nominal-roll-endpoints');
      const unitsData = await getNominalRollUnits({ data: selectedDeptId });
      setUnits(unitsData);
    }
    loadUnits();
  }, [selectedDeptId]);

  // Fetch LGAs when State changes
  useEffect(() => {
    if (!stateOfOrigin) {
      setLgas([]);
      return;
    }
    async function loadLgas() {
      const { getNominalRollLgas } = await import('@/lib/nominal-roll-endpoints');
      const lgasData = await getNominalRollLgas({ data: stateOfOrigin });
      setLgas(lgasData);
    }
    loadLgas();
  }, [stateOfOrigin]);

  // Calculate retirement year dynamically
  useEffect(() => {
    if (dateOfBirth && dateOfFirstAppointment) {
      const dob = new Date(dateOfBirth);
      const ageRet = new Date(dob.setFullYear(dob.getFullYear() + 60));

      const doa = new Date(dateOfFirstAppointment);
      const serviceRet = new Date(doa.setFullYear(doa.getFullYear() + 35));

      const finalRetDate = ageRet < serviceRet ? ageRet : serviceRet;
      if (!isNaN(finalRetDate.getTime())) {
        setCalculatedRetirement(finalRetDate.getFullYear().toString());
      }
    } else {
      setCalculatedRetirement('N/A');
    }
  }, [dateOfBirth, dateOfFirstAppointment]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Resolve final values
    const finalState = stateOfOrigin === 'Other' ? customFields.stateOfOrigin : stateOfOrigin;
    const finalLga = lgaOfOrigin === 'Other' ? customFields.lgaOfOrigin : lgaOfOrigin;
    const finalOrg = selectedOrgId === 'Other' ? customFields.selectedOrgId : selectedOrgId;
    const finalDept = selectedDeptId === 'Other' ? customFields.selectedDeptId : selectedDeptId;
    const finalUnit = selectedUnitId === 'Other' ? customFields.selectedUnitId : selectedUnitId;
    const finalPosition = position === 'Other' ? customFields.position : position;
    const finalRank = rank === 'Other' ? customFields.rank : rank;
    const finalGradeLevel = gradeLevel === 'Other' ? customFields.gradeLevel : gradeLevel;

    // Client-side validations
    if (!fullName || fullName.length < 3 || fullName.length > 150) {
      return alert("Full Name must be between 3 and 150 characters.");
    }

    // Validate phone number format if provided
    const cleanPhone = phoneNumber ? phoneNumber.replace(/\s+/g, '') : '';
    if (cleanPhone && !/^\+?234\d{10}$/.test(cleanPhone)) {
      return alert("Phone Number must be in Nigerian format (+234XXXXXXXXXX or 234XXXXXXXXXX)");
    }

    setSaving(true);
    try {
      const { createNominalRollRecord } = await import('@/lib/nominal-roll-endpoints');
      const res = await createNominalRollRecord({
        data: {
          fullName,
          sex,
          dateOfBirth,
          stateOfOrigin: finalState,
          lgaOfOrigin: finalLga,
          nationality,
          phoneNumber: cleanPhone,
          email: email || null,
          address,
          mda: finalOrg,
          department: finalDept,
          unit: finalUnit || null,
          position: finalPosition,
          gradeLevel: finalGradeLevel,
          step,
          rank: finalRank,
          dateOfFirstAppointment,
          dateOfConfirmation: dateOfConfirmation || null,
          workforceType,
          employmentType,
          nin: nin || null,
          bvn: bvn || null,
          psnNumber: psnNumber || null,
          passportUrl: passportUrl || null,
          signatureUrl: signatureUrl || null
        }
      });

      if (res.success) {
        alert("Nominal roll entry registered successfully! Status is set to Pending superadmin approval.");
        navigate({ to: '/dashboard/staff/nominal-roll' });
      }
    } catch (err: any) {
      alert("Failed to submit Nominal Roll entry: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loadingLists) {
    return (
      <div className="p-6 h-[70vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="size-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading dropdown directories...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24 text-white">
      <div className="flex items-center gap-2">
        <Link to="/dashboard/staff/nominal-roll" className="p-2 hover:bg-card border border-border rounded-lg text-muted-foreground hover:text-white transition-all">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Register Civil Servant</h1>
          <p className="text-muted-foreground mt-1 text-sm">Add a new pending employee entry to the Master Nominal Roll database.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Fields Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Personal Information */}
            <Card className="border-border/60 bg-card/60 backdrop-blur-md">
              <CardHeader className="py-4 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-md flex items-center gap-2 text-white">
                  <User className="size-4.5 text-[#C5A059]" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Enter employee full name (Last Name, First Name Middle Name)"
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender / Sex *</label>
                  <select
                    value={sex}
                    onChange={e => setSex(e.target.value)}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth *</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">State of Origin *</label>
                  <select
                    value={stateOfOrigin}
                    onChange={e => setStateOfOrigin(e.target.value)}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  >
                    <option value="">Select State</option>
                    <option value="N/A">N/A</option>
                    {states.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="Other">Other (Please specify)</option>
                  </select>
                  {stateOfOrigin === 'Other' && (
                    <input
                      type="text"
                      value={customFields.stateOfOrigin || ''}
                      onChange={e => handleCustomField('stateOfOrigin', e.target.value)}
                      placeholder="Enter State"
                      className="w-full mt-2 p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">LGA of Origin</label>
                  <select
                    disabled={!stateOfOrigin}
                    value={lgaOfOrigin}
                    onChange={e => setLgaOfOrigin(e.target.value)}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  >
                    <option value="">Select LGA</option>
                    <option value="N/A">N/A</option>
                    {lgas.map(l => (
                      <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                    <option value="Other">Other (Please specify)</option>
                  </select>
                  {lgaOfOrigin === 'Other' && (
                    <input
                      type="text"
                      value={customFields.lgaOfOrigin || ''}
                      onChange={e => handleCustomField('lgaOfOrigin', e.target.value)}
                      placeholder="Enter LGA"
                      className="w-full mt-2 p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number *</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +2348030000000"
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. staff.name@kogi.gov.ng"
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Residential Address *</label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Enter complete residential address..."
                    className="w-full p-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[75px]"
                  />
                </div>

              </CardContent>
            </Card>

            {/* 2. Government & Career Information */}
            <Card className="border-border/60 bg-card/60 backdrop-blur-md">
              <CardHeader className="py-4 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-md flex items-center gap-2 text-white">
                  <Building className="size-4.5 text-[#C5A059]" /> Government Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Organization (MDA)</label>
                  <select
                    value={selectedOrgId}
                    onChange={e => {
                      setSelectedOrgId(e.target.value);
                      setSelectedDeptId('');
                      setSelectedUnitId('');
                    }}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  >
                    <option value="">Select Supervising MDA</option>
                    <option value="N/A">N/A</option>
                    {organizations.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                    <option value="Other">Other (Please specify)</option>
                  </select>
                  {selectedOrgId === 'Other' && (
                    <input
                      type="text"
                      value={customFields.selectedOrgId || ''}
                      onChange={e => handleCustomField('selectedOrgId', e.target.value)}
                      placeholder="Enter Organization (MDA)"
                      className="w-full mt-2 p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department *</label>
                  <select
                    disabled={!selectedOrgId}
                    value={selectedDeptId}
                    onChange={e => {
                      setSelectedDeptId(e.target.value);
                      setSelectedUnitId('');
                    }}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  >
                    <option value="">Select Department</option>
                    <option value="N/A">N/A</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                    <option value="Other">Other (Please specify)</option>
                  </select>
                  {selectedDeptId === 'Other' && (
                    <input
                      type="text"
                      value={customFields.selectedDeptId || ''}
                      onChange={e => handleCustomField('selectedDeptId', e.target.value)}
                      placeholder="Enter Department"
                      className="w-full mt-2 p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit (Optional)</label>
                  <select
                    disabled={!selectedDeptId}
                    value={selectedUnitId}
                    onChange={e => setSelectedUnitId(e.target.value)}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  >
                    <option value="">Select Unit</option>
                    <option value="N/A">N/A</option>
                    {units.map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Official Position *</label>
                  <select
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  >
                    <option value="">Select Position</option>
                    <option value="N/A">N/A</option>
                    {positions.map((p, i) => (
                      <option key={i} value={p.name}>{p.name}</option>
                    ))}
                    <option value="Other">Other (Please specify)</option>
                  </select>
                  {position === 'Other' && (
                    <input
                      type="text"
                      value={customFields.position || ''}
                      onChange={e => handleCustomField('position', e.target.value)}
                      placeholder="Enter Position"
                      className="w-full mt-2 p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Official Rank *</label>
                  <select
                    value={rank}
                    onChange={e => setRank(e.target.value)}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  >
                    <option value="">Select Rank</option>
                    <option value="N/A">N/A</option>
                    {ranks.map((r, i) => (
                      <option key={i} value={r.name}>{r.name}</option>
                    ))}
                    <option value="Other">Other (Please specify)</option>
                  </select>
                  {rank === 'Other' && (
                    <input
                      type="text"
                      value={customFields.rank || ''}
                      onChange={e => handleCustomField('rank', e.target.value)}
                      placeholder="Enter Rank"
                      className="w-full mt-2 p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Grade Level *</label>
                  <select
                    value={gradeLevel}
                    onChange={e => setGradeLevel(e.target.value)}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  >
                    <option value="">Select Grade Level</option>
                    <option value="N/A">N/A</option>
                    {gradeLevels.map(gl => (
                      <option key={gl.value} value={gl.name}>{gl.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Step *</label>
                  <select
                    value={step}
                    onChange={e => setStep(e.target.value)}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  >
                    <option value="N/A">N/A</option>
                    {Array.from({ length: 15 }, (_, i) => (
                      <option key={i} value={String(i + 1)}>Step {i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employment Date (1st Appt) *</label>
                  <input
                    type="date"
                    value={dateOfFirstAppointment}
                    onChange={e => setDateOfFirstAppointment(e.target.value)}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Confirmation</label>
                  <input
                    type="date"
                    value={dateOfConfirmation}
                    onChange={e => setDateOfConfirmation(e.target.value)}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workforce Type *</label>
                  <select
                    value={workforceType}
                    onChange={e => setWorkforceType(e.target.value)}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  >
                    <option value="N/A">N/A</option>
                    {workforceTypes.map(w => (
                      <option key={w.value} value={w.value}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employment Type *</label>
                  <select
                    value={employmentType}
                    onChange={e => setEmploymentType(e.target.value)}
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  >
                    <option value="N/A">N/A</option>
                    {employmentTypes.map(e => (
                      <option key={e.value} value={e.value}>{e.name}</option>
                    ))}
                  </select>
                </div>

              </CardContent>
            </Card>

            {/* 3. Identity Verification & Security */}
            <Card className="border-border/60 bg-card/60 backdrop-blur-md">
              <CardHeader className="py-4 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-md flex items-center gap-2 text-white">
                  <Award className="size-4.5 text-[#C5A059]" /> Identity & Payroll
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">National Identity Number (NIN)</label>
                  <input
                    type="text"
                    maxLength={11}
                    value={nin}
                    onChange={e => setNin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 11-digit NIN"
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bank Verification Number (BVN)</label>
                  <input
                    type="text"
                    maxLength={11}
                    value={bvn}
                    onChange={e => setBvn(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 11-digit BVN"
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">PSN Number (Pension Service Number)</label>
                  <input
                    type="text"
                    value={psnNumber}
                    onChange={e => setPsnNumber(e.target.value)}
                    placeholder="Enter Pension Service Number"
                    className="w-full p-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

              </CardContent>
            </Card>

          </div>

          {/* Side Panel: Files & Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Auto Calculations Summary */}
            <Card className="border-border/60 bg-card/60 backdrop-blur-md">
              <CardHeader className="py-3.5 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-sm flex items-center gap-2"><BookOpen className="size-4 text-primary" /> Derived Data</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5 text-xs text-muted-foreground">
                <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                  <span className="font-semibold text-muted-foreground">Staff ID Generation</span>
                  <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                    Pending Approval
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                  <span className="font-semibold text-muted-foreground">Retirement Year</span>
                  <span className="font-mono text-white font-bold">{calculatedRetirement}</span>
                </div>
                <p className="text-[10px] leading-relaxed text-muted-foreground mt-2">
                  * Retirement is auto-calculated based on 35 years of active service or 60 years of age (whichever is earlier).
                </p>
              </CardContent>
            </Card>

            {/* Profile Attachments */}
            <Card className="border-border/60 bg-card/60 backdrop-blur-md">
              <CardHeader className="py-3.5 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-sm flex items-center gap-2"><Camera className="size-4 text-primary" /> Profile Media</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Passport Photograph</label>
                  <div className="flex items-center gap-3">
                    {passportUrl ? (
                      <img src={passportUrl} className="size-16 rounded-lg object-cover border border-border" />
                    ) : (
                      <div className="size-16 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground">
                        <User className="size-8" />
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => handleFileChange(e, setPassportUrl)}
                      className="text-xs file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Signature Image</label>
                  <div className="flex items-center gap-3">
                    {signatureUrl ? (
                      <img src={signatureUrl} className="h-10 w-24 object-contain border border-border p-1 bg-white rounded" />
                    ) : (
                      <div className="h-10 w-24 rounded bg-card border border-border flex items-center justify-center text-muted-foreground text-[10px]">
                        Signature
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => handleFileChange(e, setSignatureUrl)}
                      className="text-xs file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Submission Actions */}
            <Card className="border-border/60 bg-card/60 backdrop-blur-md">
              <CardContent className="p-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-lg text-sm flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" /> Save Record
                    </>
                  )}
                </button>
              </CardContent>
            </Card>

          </div>
        </div>
      </form>
    </div>
  );
}
