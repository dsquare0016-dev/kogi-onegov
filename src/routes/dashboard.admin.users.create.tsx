import { dbRegisterUser, getOrganizationsList } from '@/lib/postgres-service';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, Save, AlertTriangle, X, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNominalRollStore } from '@/lib/nominalRollStore';
import { ROLES } from '@/lib/roles';
import { getSession } from '@/lib/auth';
import { Lock } from 'lucide-react';
import { safeSetDoc, uploadFile } from '@/lib/firebase';

export const Route = createFileRoute('/dashboard/admin/users/create')({
  loader: async () => {
    const mdas = await getOrganizationsList();
    return { mdas };
  },
  component: CreateUser,
});

function CreateUser() {
  const { mdas } = Route.useLoaderData();
  const navigate = useNavigate();
  const { staffTypes, generateStaffId, records: nominalRecords, loadRecords } = useNominalRollStore();
  const [staffType, setStaffType] = useState('Civil Servant');

  useEffect(() => {
    loadRecords();
  }, []);

  // Form fields
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mda, setMda] = useState('Ministry of Finance');
  const [department, setDepartment] = useState('General');
  const [gradeLevel, setGradeLevel] = useState('GL-08');
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-01');
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportPreview, setPassportPreview] = useState<string>('');
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  // New fields
  const [sex, setSex] = useState('Male');
  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [lgaOfOrigin, setLgaOfOrigin] = useState('');
  const [dateOfFirstAppointment, setDateOfFirstAppointment] = useState('');
  const [dateOfConfirmation, setDateOfConfirmation] = useState('');
  const [presentAppointment, setPresentAppointment] = useState('');
  const [dateOfAppointment, setDateOfAppointment] = useState('');
  const [highestQualification, setHighestQualification] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState('01');
  const [rollNumber, setRollNumber] = useState('');
  const [psnNumber, setPsnNumber] = useState('');
  const [nin, setNin] = useState('');
  const [bvn, setBvn] = useState('');

  // Password, next of kin, and retirement states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nextOfKin, setNextOfKin] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState('');
  const [dateOfRetirement, setDateOfRetirement] = useState('');
  const [userRole, setUserRole] = useState('staff');

  // Recalculate retirement date when birth or appointment dates change
  useEffect(() => {
    if (dateOfBirth && dateOfFirstAppointment) {
      const calc = useNominalRollStore.getState().calculateRetirement(dateOfBirth, dateOfFirstAppointment);
      setDateOfRetirement(calc);
    }
  }, [dateOfBirth, dateOfFirstAppointment]);

  // When a nominal roll entry is selected, pre‑fill fields
  const handleNominalSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedStaffId(selectedId); // We store the `id` here now
    const entry = nominalRecords.find(r => (r.id === selectedId) || (r.staffId === selectedId));
    if (entry) {
      setFullName(entry.fullName || '');
      setEmail(entry.email || (entry.fullName ? entry.fullName.toLowerCase().replace(/\s+/g, '.') + '@kogistate.gov.ng' : ''));
      setStaffType(entry.staffType || 'Civil Servant');
      setDepartment(entry.department || 'General');
      setMda(entry.mda || 'Ministry of Finance');
      setGradeLevel(entry.gradeLevel || 'GL-08');
      setDateOfBirth(entry.dateOfBirth || '1990-01-01');
      setIsAlreadyRegistered(!!entry.isRegistered);
      if (entry.passportUrl) {
        setPassportPreview(entry.passportUrl);
      } else {
        setPassportPreview('');
      }
      
      // Prefill new fields
      setSex(entry.sex || 'Male');
      setStateOfOrigin(entry.stateOfOrigin || '');
      setLgaOfOrigin(entry.lgaOfOrigin || '');
      setDateOfFirstAppointment(entry.dateOfFirstAppointment || '');
      setDateOfConfirmation(entry.dateOfConfirmation || '');
      setPresentAppointment(entry.presentAppointment || '');
      setDateOfAppointment(entry.dateOfAppointment || '');
      setHighestQualification(entry.highestQualification || '');
      setPhoneNumber(entry.phoneNumber || '');
      setStep(entry.step || '01');
      setRollNumber(entry.rollNumber || '');
      setPsnNumber(entry.psnNumber || '');
      setNin(entry.nin || '');
      setBvn(entry.bvn || '');

      // Prefill extra security/kin fields
      setDateOfRetirement(entry.expectedRetirementDate || '');
      setNextOfKin((entry as any).nextOfKin || '');
      setNextOfKinPhone((entry as any).nextOfKinPhone || '');
      setNextOfKinRelationship((entry as any).nextOfKinRelationship || '');
      setPassword((entry as any).password || '');
      setConfirmPassword((entry as any).password || '');
      setUserRole((entry as any).role || 'staff');
    } else {
      setFullName('');
      setEmail('');
      setIsAlreadyRegistered(false);
      setPassportPreview('');
      setSex('Male');
      setStateOfOrigin('');
      setLgaOfOrigin('');
      setDateOfFirstAppointment('');
      setDateOfConfirmation('');
      setPresentAppointment('');
      setDateOfAppointment('');
      setHighestQualification('');
      setPhoneNumber('');
      setStep('01');
      setRollNumber('');
      setPsnNumber('');
      setNin('');
      setBvn('');

      setDateOfRetirement('');
      setNextOfKin('');
      setNextOfKinPhone('');
      setNextOfKinRelationship('');
      setPassword('');
      setConfirmPassword('');
      setUserRole('staff');
    }
  };

  // Generate email from name if not manually edited
  useEffect(() => {
    if (!email && fullName) {
      const generated = fullName.toLowerCase().replace(/\s+/g, '.') + '@kogistate.gov.ng';
      setEmail(generated);
    }
  }, [fullName]);

  // Passport preview
  useEffect(() => {
    if (passportFile) {
      const url = URL.createObjectURL(passportFile);
      setPassportPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [passportFile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce nominal roll selection
    if (!selectedStaffId) {
      alert("You cannot create a user account unless they exist on the nominal roll. If the name is not found, please contact the Civil Service Commission.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    const doa = dateOfFirstAppointment || new Date().toISOString().split('T')[0];
    const dob = dateOfBirth || '1990-01-01';
    const calculateRetirement = useNominalRollStore.getState().calculateRetirement;
    const expectedRetirement = calculateRetirement(dob, doa);
    const idToUse = selectedStaffId;
    let passportUrl = passportPreview;
    if (passportFile) {
      passportUrl = await uploadFile(`user_passports/${idToUse}.jpg`, passportFile);
    }

    if (staffType === 'Civil Servant') {
      const existing = nominalRecords.find(r => r.staffId === idToUse) || nominalRecords.find(r => r.fullName === fullName);
      const recordData = {
        ...existing,
        staffId: idToUse,
        fullName,
        email,
        staffType: staffType as any,
        department,
        mda,
        gradeLevel,
        dateOfBirth,
        passportUrl,
        isRegistered: true,
        sex,
        stateOfOrigin,
        lgaOfOrigin,
        dateOfFirstAppointment: doa,
        dateOfConfirmation,
        presentAppointment,
        dateOfAppointment,
        highestQualification,
        phoneNumber,
        step,
        rollNumber,
        psnNumber,
        nin,
        bvn,
        status: existing?.status || 'Active',
        verificationStatus: existing?.verificationStatus || 'Verified',
        expectedRetirementDate: dateOfRetirement || existing?.expectedRetirementDate || expectedRetirement,
        
        // Custom fields
        password,
        nextOfKin,
        nextOfKinPhone,
        nextOfKinRelationship,
        role: userRole
      };

      await useNominalRollStore.getState().addRecord(recordData);

      try {
        
        await dbRegisterUser({
          data: {
            staffId: idToUse,
            password: password || 'password',
            role: userRole || 'staff'
          }
        });
      } catch (err: any) {
        console.error("Failed to register user credentials in DB:", err);
      }

      if (existing) {
        alert(`User Account Created/Updated. Staff ID: ${idToUse}. Updated Nominal Roll.`);
      } else {
        alert(`User Account Created. Staff ID Generated: ${idToUse}. Added to Nominal Roll.`);
      }
      navigate({ to: '/dashboard/staff/nominal-roll' });
    } else {
      // All users must exist on the nominal roll first as per the new constraint
      alert("Error: All staff must exist on the Nominal Roll before creating a user account.");
    }
  };

  const session = getSession();
  if (session?.role !== 'super_admin' && session?.role !== 'civil_service_commission') {
    return (
      <div className="p-6 max-w-[800px] mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
        <Lock className="size-16 text-rose-500 mb-4 opacity-80" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Restricted</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Only the Civil Service Commission or the Super Admin can register new users on this system.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create User Account</h1>
        <p className="text-muted-foreground mt-1">Register a new user and map them to the State Nominal Roll or Adhoc registries.</p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2"><UserPlus className="size-5 text-primary" /> New User Profile</CardTitle>
            <CardDescription>Enter the user's details to provision an account.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-700 rounded-lg flex gap-3">
              <AlertTriangle className="size-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">Important Notice</p>
                <p>Users cannot be created unless they exist on the nominal roll. If a staff name is not found in the nominal roll, please contact the Civil Service Commission.</p>
              </div>
            </div>

            {isAlreadyRegistered && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-lg flex gap-3 animate-in fade-in">
                <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">Already Registered</p>
                  <p>This staff member is already registered in the system. Saving will update their current record.</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Select Nominal Roll */}
              <div className="space-y-1.5 p-4 rounded-xl bg-muted/40 border border-border/40">
                <label className="text-xs font-black uppercase tracking-wider text-[#C5A059] block mb-1">Select Staff from Nominal Roll (To Sync/Prefill)</label>
                <select
                  value={selectedStaffId}
                  onChange={handleNominalSelect}
                  className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-bold shadow-sm"
                >
                  <option value="">-- Select Staff Name --</option>
                  {nominalRecords.map(rec => {
                    const uniqueId = (rec as any).id || rec.staffId;
                    return (
                      <option key={uniqueId} value={uniqueId}>
                        {rec.fullName} ({rec.staffId || 'No ID'}){rec.isRegistered ? ' [Already Registered]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* SECTION 1: Administrative Posting & Core Details */}
              <div className="p-4 border border-border/50 rounded-xl bg-card/50 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#C5A059] border-b border-border/50 pb-1.5">Administrative & Posting Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Full Name (Editable)</label>
                    <input required value={fullName} onChange={e => setFullName(e.target.value)} type="text" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. John Doe" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                    <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono" placeholder="e.g. user@kogistate.gov.ng" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Staff Type</label>
                    <select
                      value={staffType}
                      onChange={e => setStaffType(e.target.value)}
                      className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                    >
                      {staffTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">MDA / Ministry</label>
                    <select value={mda} onChange={e => setMda(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold">
                      <option value="">-- Select MDA / Ministry --</option>
                      {mdas?.map((org: any) => (
                        <option key={org.id} value={org.name}>{org.name}</option>
                      ))}
                      <option value="GDU Command Center">GDU Command Center</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Department</label>
                    <input value={department} onChange={e => setDepartment(e.target.value)} type="text" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Administration" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Grade Level (GL)</label>
                      <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-bold">
                        {Array.from({ length: 17 }, (_, i) => `GL-${(i + 1).toString().padStart(2, '0')}`).map(gl => (
                          <option key={gl} value={gl}>{gl}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Step</label>
                      <select value={step} onChange={e => setStep(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-bold">
                        {Array.from({ length: 15 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(st => (
                          <option key={st} value={st}>Step {st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Clearance & Security Settings */}
              <div className="p-4 border border-border/50 rounded-xl bg-card/50 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#C5A059] border-b border-border/50 pb-1.5">Clearance & Security Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">System Clearance Role</label>
                    <select value={userRole} onChange={e => setUserRole(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold">
                      {ROLES.map(r => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Password</label>
                      <div className="relative flex items-center">
                        <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2.5 pr-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Confirm Password</label>
                      <input required type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Confirm password" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Next of Kin Details */}
              <div className="p-4 border border-border/50 rounded-xl bg-card/50 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#C5A059] border-b border-border/50 pb-1.5">Next of Kin Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Full Name</label>
                    <input required={!!selectedStaffId} value={nextOfKin} onChange={e => setNextOfKin(e.target.value)} type="text" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Next of Kin Name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Relationship</label>
                    <input required={!!selectedStaffId} value={nextOfKinRelationship} onChange={e => setNextOfKinRelationship(e.target.value)} type="text" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Spouse / Brother" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Contact Number</label>
                    <input required={!!selectedStaffId} value={nextOfKinPhone} onChange={e => setNextOfKinPhone(e.target.value)} type="tel" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono" placeholder="Next of Kin Phone" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Personal Records & Identification */}
              <div className="p-4 border border-border/50 rounded-xl bg-card/50 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#C5A059] border-b border-border/50 pb-1.5">Personal & Identification Records</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Sex (Gender)</label>
                    <select value={sex} onChange={e => setSex(e.target.value)} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</label>
                    <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} type="tel" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono" placeholder="e.g. +234..." />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Date of Birth</label>
                    <input value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} type="date" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">State of Origin</label>
                      <input value={stateOfOrigin} onChange={e => setStateOfOrigin(e.target.value)} type="text" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Kogi" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">L.G.A of Origin</label>
                      <input value={lgaOfOrigin} onChange={e => setLgaOfOrigin(e.target.value)} type="text" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Lokoja" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Highest Academic/Professional Qualification</label>
                    <input value={highestQualification} onChange={e => setHighestQualification(e.target.value)} type="text" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. B.Sc. Public Administration" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Nominal Roll Record No. (Roll Number)</label>
                    <input value={rollNumber} onChange={e => setRollNumber(e.target.value)} type="text" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono" placeholder="e.g. KGS-ROLL-0842" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">PSN Number</label>
                    <input value={psnNumber} onChange={e => setPsnNumber(e.target.value)} type="text" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono" placeholder="e.g. PSN-041923" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">NIN (11 Digits)</label>
                      <input maxLength={11} value={nin} onChange={e => setNin(e.target.value)} type="text" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono" placeholder="11-digit NIN" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">BVN (11 Digits)</label>
                      <input maxLength={11} value={bvn} onChange={e => setBvn(e.target.value)} type="text" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono" placeholder="11-digit BVN" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Career Timeline & Photo Upload */}
              <div className="p-4 border border-border/50 rounded-xl bg-card/50 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#C5A059] border-b border-border/50 pb-1.5">Career Timeline & Photo</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Date of First Appointment</label>
                    <input value={dateOfFirstAppointment} onChange={e => setDateOfFirstAppointment(e.target.value)} type="date" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Date of Confirmation</label>
                    <input value={dateOfConfirmation} onChange={e => setDateOfConfirmation(e.target.value)} type="date" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Present Appointment (Current Rank)</label>
                    <input value={presentAppointment} onChange={e => setPresentAppointment(e.target.value)} type="text" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Principal Admin Officer" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Date of Present Appointment</label>
                    <input value={dateOfAppointment} onChange={e => setDateOfAppointment(e.target.value)} type="date" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Date of Retirement</label>
                    <input value={dateOfRetirement} onChange={e => setDateOfRetirement(e.target.value)} type="date" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Passport / Photo</label>
                    <input type="file" accept="image/*" onChange={e => setPassportFile(e.target.files?.[0] || null)} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                    {passportPreview && (
                      <div className="mt-3 relative inline-block group">
                        <img src={passportPreview} alt="Passport preview" className="h-32 w-32 object-cover rounded-lg border border-border shadow-sm" />
                        <button 
                          type="button" 
                          onClick={() => { setPassportFile(null); setPassportPreview(''); }} 
                          className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-colors shadow-sm"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold inline-flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                <Save className="size-4" /> Create Account & Generate ID
              </button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
