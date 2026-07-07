import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Save, 
  ArrowLeft, Loader2, Play, FileText, CheckCircle
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getSession } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/staff/upload')({
  component: BulkUploadWorkflowPage,
});

function BulkUploadWorkflowPage() {
  const navigate = useNavigate();
  const session = getSession();
  const isSuperAdmin = session?.role === 'super_admin';

  // Access Control: Only Super Admin can perform bulk upload
  if (!isSuperAdmin) {
    return (
      <div className="p-6 max-w-[800px] mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
        <AlertTriangle className="size-16 text-rose-500 mb-4 opacity-80" />
        <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Access Restricted</h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Only the Super Administrator is authorized to perform bulk staff nominal roll ingestion.
        </p>
        <Link to="/dashboard/staff/nominal-roll" className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm">
          Back to Nominal Roll
        </Link>
      </div>
    );
  }

  // Upload/Parse States
  const [uploadStep, setUploadStep] = useState(1);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV Ingestion Parser
  const parseCSVData = (text: string): any[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) return [];

    let headerRowIdx = 0;
    let headers: string[] = [];
    
    // Find the header row by looking for a row that has 'name', 'gender', 'dob', etc.
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const potentialHeaders = lines[i].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const hasName = potentialHeaders.some(h => ['fullname', 'name', 'employee', 'fullnameofofficer'].includes(h.replace(/[^a-z]/g, '')));
      const hasGender = potentialHeaders.some(h => ['gender', 'sex'].includes(h.replace(/[^a-z]/g, '')));
      if (hasName && hasGender) {
        headerRowIdx = i;
        headers = potentialHeaders;
        break;
      }
    }

    // Default to row 0 if no clear header row found
    if (headers.length === 0) {
      headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    }
    
    const findHeaderIdx = (keys: string[]) => {
      return headers.findIndex(h => keys.some(k => h.replace(/[^a-z]/g, '') === k));
    };

    const idxSn = findHeaderIdx(['sn', 'serial', 'serialnumber']);
    const idxName = findHeaderIdx(['fullname', 'name', 'employee', 'fullnameofofficer']);
    const idxGender = findHeaderIdx(['gender', 'sex']);
    const idxDob = findHeaderIdx(['dob', 'dateofbirth', 'birthdate']);
    const idxState = findHeaderIdx(['state', 'stateoforigin']);
    const idxLga = findHeaderIdx(['lga', 'lgaoforigin']);
    const idxEmploymentDate = findHeaderIdx(['doa', 'dateoffirstappointment', 'employmentdate', 'dateoffirstappt']);
    const idxConfirmationDate = findHeaderIdx(['doc', 'dateofconfirmation']);
    const idxPresentAppointment = findHeaderIdx(['presentappointment', 'dateofpresentappointment']);
    const idxHighestQualification = findHeaderIdx(['highestqualification', 'qualification']);
    const idxRank = findHeaderIdx(['rank']);
    const idxGrade = findHeaderIdx(['grade', 'gradelevel', 'gl']);
    
    const idxPhone = findHeaderIdx(['phone', 'phonenumber', 'telephone']);
    const idxEmail = findHeaderIdx(['email', 'emailaddress']);
    const idxNin = findHeaderIdx(['nin', 'nationalid']);
    const idxBvn = findHeaderIdx(['bvn', 'bankverification']);

    let currentMdaHeading = "Unknown MDA";
    const parsedRows = [];

    for (let rowIdx = 0; rowIdx < lines.length; rowIdx++) {
      // Skip the main header row
      if (rowIdx === headerRowIdx) continue;
      
      const line = lines[rowIdx];
      
      const columns: string[] = [];
      let insideQuote = false;
      let cell = "";
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          columns.push(cell.trim());
          cell = "";
        } else {
          cell += char;
        }
      }
      columns.push(cell.trim());

      const getVal = (idx: number, fallback = '') => {
        return idx >= 0 && idx < columns.length ? columns[idx].replace(/"/g, '') : fallback;
      };

      // Skip blank rows
      if (columns.every(c => c.replace(/"/g, '').trim() === '')) {
        continue; 
      }

      // Check if this row is just repeating the headers (sometimes happens in multi-page exports)
      if (getVal(idxName).toLowerCase().replace(/[^a-z]/g, '') === 'fullname' || getVal(idxName).toLowerCase().replace(/[^a-z]/g, '') === 'name') {
        continue;
      }

      const nameCell = getVal(idxName);
      const dobCell = getVal(idxDob);
      const genderCell = getVal(idxGender);
      const empDateCell = getVal(idxEmploymentDate);
      const rankCell = getVal(idxRank);
      
      // Determine if row is likely an MDA heading
      // A heading row typically doesn't have staff details like DOB or Employment Date
      const hasStaffDetails = nameCell && (dobCell || genderCell || empDateCell || rankCell);
      
      if (!hasStaffDetails) {
         // Find the first non-empty cell that might be a title
         const potentialHeading = columns.find(c => c.replace(/"/g, '').trim().length > 5); 
         if (potentialHeading) {
           const cleanHeading = potentialHeading.replace(/"/g, '').trim();
           if (/ministry|board|bureau|office|agency|commission|service/i.test(cleanHeading)) {
             currentMdaHeading = cleanHeading;
           } else if (columns.filter(c => c.replace(/"/g, '').trim() !== '').length <= 2) {
             // If it's just a lonely string in a row, assume it's a heading
             currentMdaHeading = cleanHeading;
           }
         }
         continue; // Skip the heading row
      }

      // If it looks like a purely serial number row with no name, skip
      if (!nameCell || nameCell.toLowerCase() === 'sn' || nameCell.toLowerCase() === 's/n') continue;

      parsedRows.push({
        rowNumber: rowIdx + 1,
        serial_import_number: getVal(idxSn, ''),
        fullName: nameCell,
        gender: genderCell,
        dateOfBirth: dobCell,
        stateOfOrigin: getVal(idxState, ''),
        lga: getVal(idxLga, ''),
        employmentDate: empDateCell,
        confirmationDate: getVal(idxConfirmationDate, ''),
        presentAppointmentDate: getVal(idxPresentAppointment, ''),
        highestQualification: getVal(idxHighestQualification, ''),
        rank: rankCell,
        gradeLevel: getVal(idxGrade, ''),
        mda: currentMdaHeading,
        
        phone: getVal(idxPhone, ''),
        email: getVal(idxEmail, ''),
        nin: getVal(idxNin, ''),
        bvn: getVal(idxBvn, '')
      });
    }

    return parsedRows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setUploadStep(2);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsedRows = parseCSVData(text);

        if (parsedRows.length === 0) {
          alert("No records found in CSV file.");
          setUploadStep(1);
          setLoading(false);
          return;
        }

        // Call backend server function to validate parsed rows
        const { validateBulkNominalRoll } = await import('@/lib/nominal-roll-endpoints');
        const validationReport = await validateBulkNominalRoll({ data: parsedRows });
        
        setReport(validationReport);
        setUploadStep(3);
      } catch (err: any) {
        alert("Failed to parse and validate spreadsheet: " + err.message);
        setUploadStep(1);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!report || report.valid === 0) return;
    
    setLoading(true);
    try {
      const { confirmBulkNominalRoll } = await import('@/lib/nominal-roll-endpoints');
      const res = await confirmBulkNominalRoll({ data: report.results });
      
      if (res.success) {
        alert(`Successfully imported ${res.count} staff records. State Staff IDs have been generated.`);
        navigate({ to: '/dashboard/staff/nominal-roll' });
      }
    } catch (err: any) {
      alert("Failed to confirm ingestion: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-24 text-white">
      <div className="flex items-center gap-2">
        <Link to="/dashboard/staff/nominal-roll" className="p-2 hover:bg-card border border-border rounded-lg text-muted-foreground hover:text-white transition-all">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Bulk Staff Ingestion</h1>
          <p className="text-muted-foreground mt-1 text-sm">Upload master nominal rolls to validate and batch-import certified state employee data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          
          {uploadStep === 1 && (
            <Card className="border-dashed border-2 border-primary/30 bg-card/40 h-[350px] flex items-center justify-center hover:border-primary/50 transition-all">
              <CardContent 
                className="p-12 flex flex-col items-center justify-center text-center cursor-pointer w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".csv" 
                  className="hidden" 
                />
                <div className="p-6 rounded-2xl mb-4 bg-muted/40 shadow border border-border">
                  <UploadCloud className="size-12 text-[#C5A059]" />
                </div>
                <h3 className="font-extrabold text-xl mb-1 text-white">Upload Nominal Roll CSV</h3>
                <p className="text-muted-foreground mb-6 max-w-md text-xs leading-relaxed">
                  Select a certified CSV file containing your state staff directory rows. The system will run comprehensive validation checks.
                </p>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer">
                  <FileSpreadsheet className="size-4" /> Browse CSV Spreadsheet
                </button>
              </CardContent>
            </Card>
          )}

          {uploadStep === 2 && (
            <Card className="h-[350px] flex items-center justify-center border-primary/20 bg-card/40">
              <CardContent className="text-center space-y-4">
                <Loader2 className="size-10 text-primary animate-spin mx-auto" />
                <h3 className="font-extrabold text-xl text-primary">Validating Spreadsheet Rows...</h3>
                <p className="text-muted-foreground text-xs max-w-sm leading-relaxed">
                  Parsing names, verifying State/LGA mappings, validating NIN/BVN uniqueness, and matching supervising MDAs.
                </p>
              </CardContent>
            </Card>
          )}

          {uploadStep === 3 && report && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Audit Summary Grid */}
              <Card className="border-border/60 bg-card/60 backdrop-blur-md">
                <CardHeader className="py-4 bg-muted/20 border-b border-border/50">
                  <CardTitle className="text-md flex items-center gap-2 text-white">
                    <CheckCircle className="size-5 text-emerald-500" /> Ingestion Audit Results
                  </CardTitle>
                  <CardDescription className="text-xs">Nominal roll spreadsheet validation summary.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                      <p className="font-black text-xl">{report.total}</p>
                      <p className="text-[9px] uppercase font-bold text-blue-500 mt-1">Total Rows</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                      <p className="font-black text-xl">{report.valid}</p>
                      <p className="text-[9px] uppercase font-bold text-emerald-500 mt-1">Valid Matches</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                      <p className="font-black text-xl">{report.errors}</p>
                      <p className="text-[9px] uppercase font-bold text-amber-500 mt-1">Mismatches/Errors</p>
                    </div>
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                      <p className="font-black text-xl">{report.duplicates}</p>
                      <p className="text-[9px] uppercase font-bold text-rose-500 mt-1">Duplicate Keys</p>
                    </div>
                  </div>

                  {/* Preview Checklist */}
                  <div className="border border-border/60 rounded-lg overflow-hidden bg-card/30 text-xs">
                    <div className="p-3 bg-muted/30 font-bold border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                      Validation Preview Logs
                    </div>
                    <div className="max-h-[220px] overflow-y-auto divide-y divide-border/40">
                      {report.results.map((row: any, i: number) => (
                        <div key={i} className="p-3 flex items-center justify-between hover:bg-muted/10 transition-all">
                          <div className="space-y-0.5">
                            <p className="font-bold text-white">{row.fullName}</p>
                            <p className="text-muted-foreground text-[10px]">MDA: {row.mda || 'N/A'} | Dept: {row.department || 'N/A'}</p>
                            {row.issues.map((iss: string, idx: number) => (
                              <p key={idx} className="text-rose-500 text-[10px] flex items-center gap-1 font-semibold">
                                <AlertTriangle className="size-3 shrink-0" /> {iss}
                              </p>
                            ))}
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              row.hasError || row.isDuplicate 
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {row.isDuplicate ? 'Duplicate' : row.hasError ? 'Failed' : 'Valid'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-border/40">
                    {(report.errors > 0 || report.duplicates > 0) && (
                      <button 
                        onClick={() => {
                          const errorRows = report.results.filter((r: any) => r.hasError || r.isDuplicate);
                          const csvContent = "data:text/csv;charset=utf-8," 
                            + "Row,Name,MDA,Issues\n"
                            + errorRows.map((e: any) => `${e.rowNumber},"${e.fullName || ''}","${e.mda || ''}","${e.issues.join('; ')}"`).join("\n");
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute("download", "skipped_records.csv");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }} 
                        className="px-4 py-2 bg-muted/40 border border-border text-white hover:bg-muted rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <AlertTriangle className="size-4 text-rose-500" /> Export Errors
                      </button>
                    )}
                    <button onClick={() => setUploadStep(1)} className="px-4 py-2 border border-border text-white hover:bg-muted rounded-lg text-xs font-bold cursor-pointer">
                      Ingest New File
                    </button>
                    <button 
                      onClick={handleConfirmImport}
                      disabled={loading || report.valid === 0}
                      className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Importing...
                        </>
                      ) : (
                        <>
                          <Save className="size-4" /> Approve & Import ({report.valid})
                        </>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}

        </div>

        {/* Ingestion Rules Panel */}
        <div className="lg:col-span-1">
          <Card className="border-border/60 bg-card/60 backdrop-blur-md sticky top-6">
            <CardHeader className="bg-muted/20 border-b border-border/50 py-3.5">
              <CardTitle className="text-md flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> Ingestion Rules</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-4 leading-relaxed text-muted-foreground pt-4">
              <p>1. <strong>Fuzzy Name Mappings</strong>: The importer validates Supervising MDAs and Internal Departments case-insensitively, correcting spellings or rejecting unrecognized entities.</p>
              <p>2. <strong>Dynamic ID Allocation</strong>: Upon Super Admin approval, the system assigns permanent Kogi State Staff IDs dynamically by calculating next sequential indicators.</p>
              <p>3. <strong>Identity Constraints</strong>: Records containing conflicting emails, NINs, or BVNs that already exist in the database are automatically flagged for correction.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
