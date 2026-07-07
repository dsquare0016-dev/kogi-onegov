import { createServerFn } from "@tanstack/react-start";
import sql from "./postgres";

// Helper to safely format dates for pg
const formatDate = (dStr?: string | null) => {
  if (!dStr) return null;
  const parsed = new Date(dStr);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString().split('T')[0];
};

// GET /api/organizations
export const getNominalRollOrganizations = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const rows = await sql`
        SELECT id, name, type 
        FROM organizations 
        WHERE type IN ('ministry', 'agency', 'board', 'commission', 'parastatal', 'executive_office', 'bureau', 'authority', 'special_office')
          AND is_active = true
        ORDER BY name ASC
      `;
      return rows;
    } catch (err: any) {
      console.error("getNominalRollOrganizations error:", err);
      return [];
    }
  });

// GET /api/departments?organization_id={id}
export const getNominalRollDepartments = createServerFn({ method: "GET" })
  .validator((orgId: string | null) => orgId)
  .handler(async ({ data: orgId }) => {
    try {
      if (!orgId) return [];
      const rows = await sql`
        SELECT id, name, type 
        FROM organizations 
        WHERE type = 'department' 
          AND parent_id = ${orgId}
          AND is_active = true
        ORDER BY name ASC
      `;
      return rows;
    } catch (err: any) {
      console.error("getNominalRollDepartments error:", err);
      return [];
    }
  });

// GET /api/units?department_id={id}
export const getNominalRollUnits = createServerFn({ method: "GET" })
  .validator((deptId: string | null) => deptId)
  .handler(async ({ data: deptId }) => {
    try {
      if (!deptId) return [];
      const rows = await sql`
        SELECT id, name, type 
        FROM organizations 
        WHERE type = 'unit' 
          AND parent_id = ${deptId}
          AND is_active = true
        ORDER BY name ASC
      `;
      return rows;
    } catch (err: any) {
      console.error("getNominalRollUnits error:", err);
      return [];
    }
  });

// GET /api/positions
export const getNominalRollPositions = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const rows = await sql`
        SELECT DISTINCT official_title as name
        FROM positions
        WHERE official_title IS NOT NULL AND official_title <> ''
        ORDER BY official_title ASC
      `;
      // If empty, return some default options
      if (rows.length === 0) {
        return [
          { name: "Director" },
          { name: "Assistant Director" },
          { name: "Principal Officer" },
          { name: "Senior Officer" },
          { name: "Officer I" },
          { name: "Officer II" }
        ];
      }
      return rows;
    } catch (err: any) {
      console.error("getNominalRollPositions error:", err);
      return [];
    }
  });

// GET /api/grade-levels
export const getNominalRollGradeLevels = createServerFn({ method: "GET" })
  .handler(async () => {
    return Array.from({ length: 17 }, (_, i) => ({
      name: `GL-${(i + 1).toString().padStart(2, '0')}`,
      value: (i + 1).toString()
    }));
  });

// GET /api/ranks
export const getNominalRollRanks = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const rows = await sql`
        SELECT DISTINCT rank as name
        FROM nominal_roll
        WHERE rank IS NOT NULL AND rank <> ''
        ORDER BY rank ASC
      `;
      if (rows.length === 0) {
        return [
          { name: "Grade I" },
          { name: "Grade II" },
          { name: "Grade III" },
          { name: "Senior" },
          { name: "Principal" }
        ];
      }
      return rows;
    } catch (err: any) {
      console.error("getNominalRollRanks error:", err);
      return [];
    }
  });

// GET /api/nigerian-states
export const getNominalRollStates = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const rows = await sql`
        SELECT id, state_name as name, state_code as code
        FROM nigerian_states
        ORDER BY state_name ASC
      `;
      return rows;
    } catch (err: any) {
      console.error("getNominalRollStates error:", err);
      return [];
    }
  });

// GET /api/lgas?state_id={id}
export const getNominalRollLgas = createServerFn({ method: "GET" })
  .validator((stateId: string | null) => stateId)
  .handler(async ({ data: stateId }) => {
    try {
      // In this DB, lgas table does not have state_id column. 
      // Since Kogi is the primary state, we return the lgas from the database.
      // If we want state-specific lgas, we fallback to static if not Kogi.
      const rows = await sql`
        SELECT id, name 
        FROM lgas 
        ORDER BY name ASC
      `;
      return rows;
    } catch (err: any) {
      console.error("getNominalRollLgas error:", err);
      return [];
    }
  });

// GET /api/workforce-types
export const getNominalRollWorkforceTypes = createServerFn({ method: "GET" })
  .handler(async () => {
    return [
      { name: "Civil Servant", value: "civil_servant" },
      { name: "Political Appointee", value: "political_appointee" },
      { name: "Public Officer", value: "public_officer" },
      { name: "Adhoc Staff", value: "adhoc" },
      { name: "Consultant", value: "consultant" },
      { name: "Contract Staff", value: "contract_staff" },
      { name: "Retiree", value: "retiree" }
    ];
  });

// GET /api/employment-types
export const getNominalRollEmploymentTypes = createServerFn({ method: "GET" })
  .handler(async () => {
    return [
      { name: "Permanent & Pensionable", value: "permanent" },
      { name: "Temporary/Contract", value: "temporary" },
      { name: "Ad-hoc/Part-time", value: "adhoc" }
    ];
  });

// POST /api/nominal-roll
export const createNominalRollRecord = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    try {
      const parts = (data.fullName || '').split(' ');
      const firstName = parts[0] || 'Unknown';
      const lastName = parts.slice(1).join(' ') || 'Staff';
      const dob = formatDate(data.dateOfBirth);
      const employmentDate = formatDate(data.dateOfFirstAppointment);
      const confirmationDate = formatDate(data.dateOfConfirmation);
      
      // Calculate expected retirement date (35 years of service or 60 years of age, whichever comes first)
      let retirementDate = null;
      if (dob && employmentDate) {
        const birthDateObj = new Date(dob);
        const ageRetirement = new Date(birthDateObj.setFullYear(birthDateObj.getFullYear() + 60));
        
        const empDateObj = new Date(employmentDate);
        const serviceRetirement = new Date(empDateObj.setFullYear(empDateObj.getFullYear() + 35));
        
        const retDate = ageRetirement < serviceRetirement ? ageRetirement : serviceRetirement;
        retirementDate = retDate.toISOString().split('T')[0];
      }

      let motherOrgId = data.mda || null;
      let currentOrgId = data.department || null;

      const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

      if (motherOrgId && !isUUID(motherOrgId)) {
        // Auto-create MDA
        const [newMda] = await sql`
          INSERT INTO organizations (name, type, is_active)
          VALUES (${motherOrgId}, 'ministry', true)
          RETURNING id
        `;
        motherOrgId = newMda.id;
      }

      if (currentOrgId && !isUUID(currentOrgId)) {
        // Auto-create Department
        const [newDept] = await sql`
          INSERT INTO organizations (name, type, parent_id, is_active)
          VALUES (${currentOrgId}, 'department', ${motherOrgId}, true)
          RETURNING id
        `;
        currentOrgId = newDept.id;
      }

      const gender = data.sex?.toLowerCase() === 'female' ? 'female' : 'male';
      const staffType = data.workforceType || 'civil_servant';
      const status = 'active'; 
      const gradeVal = String(data.gradeLevel || '').replace(/[^0-9]/g, '') || '10';
      const stepVal = String(data.step || '1');

      if (data.id) {
        // Update existing record
        await sql`
          UPDATE nominal_roll SET
            first_name = ${firstName},
            last_name = ${lastName},
            gender = ${gender},
            date_of_birth = ${dob},
            phone = ${data.phoneNumber || null},
            email = ${data.email || null},
            address = ${data.address || null},
            state_of_origin = ${data.stateOfOrigin || null},
            lga = ${data.lgaOfOrigin || null},
            mother_organization_id = ${motherOrgId},
            current_organization_id = ${currentOrgId},
            position = ${data.position || null},
            rank = ${data.rank || null},
            grade_level = ${gradeVal},
            step = ${stepVal},
            employment_date = ${employmentDate},
            confirmation_date = ${confirmationDate},
            retirement_due_date = ${retirementDate},
            staff_type = ${staffType}::staff_type,
            status = ${status}::user_status,
            nin = ${data.nin || null},
            bvn = ${data.bvn || null},
            passport_url = ${data.passportUrl || null},
            signature_url = ${data.signatureUrl || null},
            updated_at = NOW()
          WHERE id = ${data.id}
        `;
        return { success: true, id: data.id };
      } else {
        // Create new record with staffId = NULL (pending superadmin approval)
        const [result] = await sql`
          INSERT INTO nominal_roll (
            staff_id, psn, title, first_name, middle_name, last_name, gender, date_of_birth,
            phone, email, address, state_of_origin, lga, mother_organization_id, current_organization_id,
            position, rank, grade_level, step, employment_date, confirmation_date, retirement_due_date,
            staff_type, status, passport_url, signature_url, source
          ) VALUES (
            null, ${data.psnNumber || null}, ${data.title || null}, ${firstName}, null, ${lastName}, ${gender}, ${dob},
            ${data.phoneNumber || null}, ${data.email || null}, ${data.address || null}, ${data.stateOfOrigin || null}, ${data.lgaOfOrigin || null}, ${motherOrgId}, ${currentOrgId},
            ${data.position || null}, ${data.rank || null}, ${gradeVal}, ${stepVal}, ${employmentDate}, ${confirmationDate}, ${retirementDate},
            ${staffType}::staff_type, ${status}::user_status, ${data.passportUrl || null}, ${data.signatureUrl || null}, 'form_entry'
          )
          RETURNING id
        `;
        return { success: true, id: result.id };
      }
    } catch (err: any) {
      console.error("createNominalRollRecord error:", err);
      throw new Error(err.message || "Failed to save nominal roll record");
    }
  });

// POST /api/nominal-roll/bulk
export const validateBulkNominalRoll = createServerFn({ method: "POST" })
  .validator((rows: any[]) => rows)
  .handler(async ({ data: rows }) => {
    try {
      const report = {
        total: rows.length,
        valid: 0,
        errors: 0,
        duplicates: 0,
        results: [] as any[]
      };

      const allOrgs = await sql`SELECT id, name FROM organizations`;
      const allStates = await sql`SELECT id, state_name FROM nigerian_states`;
      const allLgas = await sql`SELECT id, name FROM lgas`;

      for (const row of rows) {
        const issues: string[] = [];
        let isDuplicate = false;

        // Basic validation
        if (!row.fullName || row.fullName.length < 3) {
          issues.push("Full Name is required and must be at least 3 characters.");
        }
        if (!row.gender || !['male', 'female', 'm', 'f'].includes(row.gender.toLowerCase())) {
          issues.push("Gender must be 'male' or 'female'.");
        }
        if (!row.dateOfBirth) {
          issues.push("Date of Birth is required.");
        }
        if (!row.employmentDate) {
          issues.push("Employment Date is required.");
        }
        if (!row.rank && !row.gradeLevel) {
          issues.push("Rank or Grade Level is required.");
        }

        // Email and phone formats
        if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
          issues.push("Invalid Email format.");
        }
        if (row.phone && !/^\+?234\d{10}$/.test(row.phone.replace(/\s+/g, ''))) {
          issues.push("Invalid Nigerian phone number format.");
        }

        // Validate state & LGA
        let stateId = null;
        if (!row.stateOfOrigin) {
          issues.push("State of Origin is required.");
        } else {
          const sMatch = allStates.find(s => s.state_name.toLowerCase() === row.stateOfOrigin.toLowerCase() || s.state_name.toLowerCase().includes(row.stateOfOrigin.toLowerCase()) || row.stateOfOrigin.toLowerCase().includes(s.state_name.toLowerCase()));
          if (sMatch) stateId = sMatch.id;
          else issues.push(`Unrecognized State of Origin: "${row.stateOfOrigin}"`);
        }

        let lgaId = null;
        if (!row.lga) {
          issues.push("LGA of Origin is required.");
        } else {
          const lMatch = allLgas.find(l => l.name.toLowerCase() === row.lga.toLowerCase() || l.name.toLowerCase().includes(row.lga.toLowerCase()) || row.lga.toLowerCase().includes(l.name.toLowerCase()));
          if (lMatch) lgaId = lMatch.id;
          else issues.push(`Unrecognized LGA: "${row.lga}"`);
        }

        // Match MDA
        let mdaId = null;
        let mdaToCreate = null;
        if (row.mda && row.mda !== "Unknown MDA") {
          const match = allOrgs.find(m => m.name.toLowerCase() === row.mda.toLowerCase() || m.name.toLowerCase().includes(row.mda.toLowerCase()) || row.mda.toLowerCase().includes(m.name.toLowerCase()));
          if (match) {
            mdaId = match.id;
          } else {
            mdaToCreate = row.mda; // Will auto-create on confirm
          }
        } else {
          issues.push("Supervising MDA heading missing.");
        }

        // Duplicate checks (Email, NIN, BVN in DB)
        if (row.email) {
          const [exists] = await sql`SELECT id FROM nominal_roll WHERE email = ${row.email} LIMIT 1`;
          if (exists) {
            isDuplicate = true;
            issues.push(`Duplicate check: Email "${row.email}" already exists in Nominal Roll.`);
          }
        }
        if (row.nin) {
          const [exists] = await sql`SELECT id FROM nominal_roll WHERE nin = ${row.nin} LIMIT 1`;
          if (exists) {
            isDuplicate = true;
            issues.push(`Duplicate check: NIN "${row.nin}" already registered.`);
          }
        }
        if (row.bvn) {
          const [exists] = await sql`SELECT id FROM nominal_roll WHERE bvn = ${row.bvn} LIMIT 1`;
          if (exists) {
            isDuplicate = true;
            issues.push(`Duplicate check: BVN "${row.bvn}" already registered.`);
          }
        }

        const hasError = issues.length > 0;
        if (isDuplicate) report.duplicates++;
        else if (hasError) report.errors++;
        else report.valid++;

        report.results.push({
          ...row,
          mdaId,
          mdaToCreate,
          stateId,
          lgaId,
          hasError,
          isDuplicate,
          issues
        });
      }

      return report;
    } catch (err: any) {
      console.error("validateBulkNominalRoll error:", err);
      throw new Error(err.message || "Failed to validate bulk upload");
    }
  });

// POST /api/nominal-roll/bulk/confirm
export const confirmBulkNominalRoll = createServerFn({ method: "POST" })
  .validator((rows: any[]) => rows)
  .handler(async ({ data: rows }) => {
    try {
      let importedCount = 0;
      await sql.begin(async (trx) => {
        const [{ count }] = await trx`SELECT COUNT(*)::int as count FROM nominal_roll`;
        let baseCount = count;

        for (const row of rows) {
          if (row.hasError || row.isDuplicate) continue;

          // Auto-create MDA if not matched
          let finalMdaId = row.mdaId;
          if (!finalMdaId && row.mdaToCreate) {
             const [newOrg] = await trx`
               INSERT INTO organizations (name, type, is_active) 
               VALUES (${row.mdaToCreate}, 'ministry', true)
               RETURNING id
             `;
             finalMdaId = newOrg.id;
             // Update references in the current batch to avoid duplicate creations
             for (const r of rows) {
               if (r.mdaToCreate === row.mdaToCreate) {
                 r.mdaId = finalMdaId;
                 r.mdaToCreate = null;
               }
             }
          }

          const parts = (row.fullName || '').split(' ');
          const firstName = parts[0] || 'Unknown';
          const lastName = parts.slice(1).join(' ') || 'Staff';
          const dob = formatDate(row.dateOfBirth);
          const employmentDate = formatDate(row.employmentDate);
          const confirmationDate = formatDate(row.confirmationDate);

          // Generate permanent Staff ID immediately for approved bulk import
          baseCount++;
          const empYear = employmentDate ? new Date(employmentDate).getFullYear() : new Date().getFullYear();
          const birthDateObj = new Date(dob || '');
          const ageRetirement = new Date(birthDateObj.setFullYear(birthDateObj.getFullYear() + 60));
          const empDateObj = new Date(employmentDate || '');
          const serviceRetirement = new Date(empDateObj.setFullYear(empDateObj.getFullYear() + 35));
          const retDate = ageRetirement < serviceRetirement ? ageRetirement : serviceRetirement;
          const retYear = isNaN(retDate.getFullYear()) ? empYear + 35 : retDate.getFullYear();
          
          const seq = baseCount.toString().padStart(6, '0');
          const empYearStr = empYear.toString().slice(-2);
          const retYearStr = retYear.toString().slice(-2);
          const generatedStaffId = `KGS/CS/${seq}/${empYearStr}/${retYearStr}`;

          const gender = row.gender?.toLowerCase() === 'female' || row.gender?.toLowerCase() === 'f' ? 'female' : 'male';
          const staffType = row.workforceType || 'civil_servant';
          const status = 'active'; 
          const gradeVal = String(row.gradeLevel || '').replace(/[^0-9]/g, '') || '10';
          const stepVal = String(row.step || '1');

          await trx`
            INSERT INTO nominal_roll (
              staff_id, psn, title, first_name, middle_name, last_name, gender, date_of_birth,
              phone, email, address, state_of_origin, lga, state_of_origin_id, lga_id, mother_organization_id, current_organization_id,
              position, rank, grade_level, step, employment_date, confirmation_date, retirement_due_date,
              employment_year, retirement_year, serial_number,
              staff_type, status, nin, bvn, source
            ) VALUES (
              ${generatedStaffId}, ${row.psnNumber || null}, ${row.title || null}, ${firstName}, null, ${lastName}, ${gender}, ${dob},
              ${row.phone || null}, ${row.email || null}, ${row.address || null}, ${row.stateOfOrigin || null}, ${row.lga || null}, ${row.stateId || null}, ${row.lgaId || null}, ${finalMdaId}, ${finalMdaId},
              ${row.position || null}, ${row.rank || null}, ${gradeVal}, ${stepVal}, ${employmentDate}, ${confirmationDate}, ${retDate.toISOString().split('T')[0]},
              ${empYear}, ${retYear}, ${baseCount},
              ${staffType}::staff_type, ${status}::user_status, ${row.nin || null}, ${row.bvn || null}, 'bulk_import'
            )
          `;
          
          // Initial posting history
          await trx`
            INSERT INTO staff_postings (staff_id, organization_id, start_date, status)
            VALUES (${generatedStaffId}, ${finalMdaId}, CURRENT_DATE, 'active')
          `;
          
          // Initial audit log
          await trx`
            INSERT INTO audit_logs (action, table_name, record_id, user_id, description)
            VALUES ('INSERT', 'nominal_roll', ${generatedStaffId}, NULL, 'Bulk import staff record')
          `;

          importedCount++;
        }
      });

      return { success: true, count: importedCount };
    } catch (err: any) {
      console.error("confirmBulkNominalRoll error:", err);
      throw new Error(err.message || "Failed to commit bulk nominal roll entries");
    }
  });
