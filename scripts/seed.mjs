/**
 * KOGI OneGov - PostgreSQL Comprehensive Demo Seed Script
 * Seeds: users, organizations, nominal_roll, projects, programmes,
 * budgets, memos, notifications, chat_groups, lgas, development plan.
 *
 * Run: node scripts/seed.mjs
 */

import postgres from 'postgres';
import crypto from 'crypto';

const sql = postgres({
  host: '127.0.0.1',
  port: 5432,
  database: 'kogi_erp_test',
  username: 'postgres',
  password: 'Prince@123',
  max: 5,
});

function hashPassword(plain) {
  return 'sha256:' + crypto.createHash('sha256').update(plain).digest('hex');
}

// ── ORGANIZATIONS ───────────────────────────────────────────────────────────
const ALL_ORGS = [
  // Executive Offices
  { name: 'Office of the Executive Governor', short_name: 'OEG', code: 'OEG', type: 'office' },
  { name: 'Office of the Deputy Governor', short_name: 'ODG', code: 'ODG', type: 'office' },
  { name: 'Office of the SSG', short_name: 'OSSG', code: 'OSSG', type: 'office' },
  { name: 'Chief of Staff Office', short_name: 'COS', code: 'COS', type: 'office' },
  { name: 'Office of the Head of Service', short_name: 'OHS', code: 'OHS', type: 'office' },
  { name: 'Governance Delivery Unit', short_name: 'GDU', code: 'GDU', type: 'standalone_office' },
  { name: 'System Administration', short_name: 'SYS', code: 'SYS', type: 'standalone_office' },
  // Ministries
  { name: 'Ministry of Education', short_name: 'MOE', code: 'MOE', type: 'ministry' },
  { name: 'Ministry of Health', short_name: 'MOH', code: 'MOH', type: 'ministry' },
  { name: 'Ministry of Finance, Budget & Economic Planning', short_name: 'MOFEP', code: 'MOFEP', type: 'ministry' },
  { name: 'Ministry of Works', short_name: 'MOW', code: 'MOW', type: 'ministry' },
  { name: 'Ministry of Agriculture & Food Security', short_name: 'MOAFS', code: 'MOAFS', type: 'ministry' },
  { name: 'Ministry of Justice', short_name: 'MOJ', code: 'MOJ', type: 'ministry' },
  { name: 'Ministry of Information & Communication', short_name: 'MOIC', code: 'MOIC', type: 'ministry' },
  { name: 'Ministry of Housing & Urban Development', short_name: 'MOHUD', code: 'MOHUD', type: 'ministry' },
  { name: 'Ministry of Transport', short_name: 'MOT', code: 'MOT', type: 'ministry' },
  { name: 'Ministry of Water Resources', short_name: 'MOWR', code: 'MOWR', type: 'ministry' },
  { name: 'Ministry of Rural & Energy Development', short_name: 'MORED', code: 'MORED', type: 'ministry' },
  { name: 'Ministry of Environment', short_name: 'MENV', code: 'MENV', type: 'ministry' },
  { name: 'Ministry of Youth & Sports Development', short_name: 'MOYSD', code: 'MOYSD', type: 'ministry' },
  { name: 'Ministry of Women Affairs & Social Development', short_name: 'MOWASD', code: 'MOWASD', type: 'ministry' },
  { name: 'Ministry of Commerce & Industry', short_name: 'MOCI', code: 'MOCI', type: 'ministry' },
  { name: 'Ministry of Local Government & Chieftaincy Affairs', short_name: 'MOLG', code: 'MOLG', type: 'ministry' },
  { name: 'Ministry of Solid Minerals & Natural Resources', short_name: 'MOSM', code: 'MOSM', type: 'ministry' },
  { name: 'Ministry of Innovation, Science & Technology', short_name: 'MOIST', code: 'MOIST', type: 'ministry' },
  { name: 'Ministry of Culture & Tourism', short_name: 'MOCT', code: 'MOCT', type: 'ministry' },
  { name: 'Ministry of Livestock Development', short_name: 'MOLD', code: 'MOLD', type: 'ministry' },
  { name: 'Ministry of Humanitarian Affairs & Poverty Alleviation', short_name: 'MOHAP', code: 'MOHAP', type: 'ministry' },
  { name: 'Ministry of Special Duties & Intergovernmental Affairs', short_name: 'MOSDIG', code: 'MOSDIG', type: 'ministry' },
  // Agencies & Boards
  { name: 'Kogi State Internal Revenue Service', short_name: 'KIRS', code: 'KIRS', type: 'agency' },
  { name: 'Kogi State Civil Service Commission', short_name: 'KGCSC', code: 'KGCSC', type: 'commission' },
  { name: 'Office of the Auditor General', short_name: 'OAG', code: 'OAG', type: 'office' },
  { name: 'Office of the Accountant General', short_name: 'OAAG', code: 'OAAG', type: 'office' },
  { name: 'Bureau of Public Procurement', short_name: 'BPP', code: 'BPP', type: 'agency' },
  { name: 'Rural Development Agency', short_name: 'RDA', code: 'RDA', type: 'agency' },
  { name: 'Hospital Management Board', short_name: 'HMB', code: 'HMB', type: 'board' },
  { name: 'Pension Board', short_name: 'PB', code: 'PB', type: 'board' },
  { name: 'Kogi Investment Promotion Agency', short_name: 'KIPA', code: 'KIPA', type: 'agency' },
];

// ── USERS ───────────────────────────────────────────────────────────────────
const USERS_SEED = [
  { email: 'superadmin@kogistate.gov.ng', staff_id: 'KGS/SYS/001', password: 'Admin@1234', role: 'super_admin', first_name: 'Yusuf', last_name: 'Musa', display_name: 'Engr. Yusuf Musa (Super Admin)', org_code: 'SYS', gender: 'male', staff_type: 'civil_servant', grade_level: 17 },
  { email: 'governor@kogistate.gov.ng', staff_id: 'KGS/GOV/001', password: 'Gov@1234', role: 'governor', first_name: 'Ahmed', last_name: 'Ododo', display_name: 'H.E. Alh. Ahmed Usman Ododo', org_code: 'OEG', gender: 'male', staff_type: 'political_appointee', grade_level: 17 },
  { email: 'deputy@kogistate.gov.ng', staff_id: 'KGS/GOV/002', password: 'Deputy@1234', role: 'deputy_governor', first_name: 'Joel', last_name: 'Oyibo', display_name: 'H.E. Joel Salifu Oyibo', org_code: 'ODG', gender: 'male', staff_type: 'political_appointee', grade_level: 17 },
  { email: 'ssg@kogistate.gov.ng', staff_id: 'KGS/SSG/001', password: 'Ssg@1234', role: 'ssg', first_name: 'Folashade', last_name: 'Ayoade', display_name: 'Dr. Folashade Arike Ayoade', org_code: 'OSSG', gender: 'female', staff_type: 'political_appointee', grade_level: 17 },
  { email: 'cos@kogistate.gov.ng', staff_id: 'KGS/COS/001', password: 'Cos@1234', role: 'chief_of_staff', first_name: 'Ali', last_name: 'Bello', display_name: 'Barr. Ali Bello', org_code: 'COS', gender: 'male', staff_type: 'political_appointee', grade_level: 17 },
  { email: 'dcos@kogistate.gov.ng', staff_id: 'KGS/COS/002', password: 'Dcos@1234', role: 'deputy_chief_of_staff', first_name: 'Deputy', last_name: 'Chief', display_name: 'Hon. Deputy Chief of Staff', org_code: 'COS', gender: 'male', staff_type: 'political_appointee', grade_level: 16 },
  { email: 'hos@kogistate.gov.ng', staff_id: 'KGS/HOS/001', password: 'Hos@1234', role: 'head_of_service', first_name: 'Hannatu', last_name: 'Adejoh', display_name: 'Mrs. Hannatu Adejoh', org_code: 'OHS', gender: 'female', staff_type: 'civil_servant', grade_level: 17 },
  { email: 'dg.gdu@kogistate.gov.ng', staff_id: 'KGS/GDU/001', password: 'Gdu@1234', role: 'dg_gdu', first_name: 'Abubakar', last_name: 'Yusuf', display_name: 'Engr. Abubakar Yusuf', org_code: 'GDU', gender: 'male', staff_type: 'civil_servant', grade_level: 17 },
  { email: 'commissioner.works@kogistate.gov.ng', staff_id: 'KGS/MOW/001', password: 'Works@1234', role: 'commissioner', first_name: 'Mohammed', last_name: 'Yusuf', display_name: 'Hon. Mohammed Avohi Yusuf', org_code: 'MOW', gender: 'male', staff_type: 'political_appointee', grade_level: 17 },
  { email: 'permsec.health@kogistate.gov.ng', staff_id: 'KGS/MOH/001', password: 'Health@1234', role: 'perm_secretary', first_name: 'Sule', last_name: 'Enehe', display_name: 'Mr. Sule Enehe', org_code: 'HMB', gender: 'male', staff_type: 'civil_servant', grade_level: 15 },
  { email: 'director.planning@kogistate.gov.ng', staff_id: 'KGS/MOFEP/001', password: 'Plan@1234', role: 'director', first_name: 'Fatima', last_name: 'Onogwu', display_name: 'Mrs. Fatima Onogwu', org_code: 'MOFEP', gender: 'female', staff_type: 'civil_servant', grade_level: 14 },
  { email: 'budget@kogistate.gov.ng', staff_id: 'KGS/MOFEP/002', password: 'Budget@1234', role: 'budget_officer', first_name: 'Ibrahim', last_name: 'Yakubu', display_name: 'Alhaji Ibrahim Yakubu', org_code: 'MOFEP', gender: 'male', staff_type: 'civil_servant', grade_level: 13 },
  { email: 'hr@kogistate.gov.ng', staff_id: 'KGS/KGCSC/001', password: 'Hr@1234', role: 'hr_officer', first_name: 'Joseph', last_name: 'Adejo', display_name: 'Mr. Joseph Adejo', org_code: 'KGCSC', gender: 'male', staff_type: 'civil_servant', grade_level: 11 },
  { email: 'accounts@kogistate.gov.ng', staff_id: 'KGS/OAAG/001', password: 'Acct@1234', role: 'accountant', first_name: 'David', last_name: 'Achimugu', display_name: 'Mr. David Achimugu', org_code: 'OAAG', gender: 'male', staff_type: 'civil_servant', grade_level: 12 },
  { email: 'auditor.general@kogistate.gov.ng', staff_id: 'KGS/OAG/001', password: 'Audit@1234', role: 'auditor_general', first_name: 'Sunday', last_name: 'Oyibo', display_name: 'Mr. Sunday Oyibo', org_code: 'OAG', gender: 'male', staff_type: 'civil_servant', grade_level: 16 },
  { email: 'accountant.general@kogistate.gov.ng', staff_id: 'KGS/OAAG/002', password: 'AcctGen@1234', role: 'accountant_general', first_name: 'Comfort', last_name: 'Bamidele', display_name: 'Mrs. Comfort Bamidele', org_code: 'OAAG', gender: 'female', staff_type: 'civil_servant', grade_level: 16 },
  { email: 'staff@kogistate.gov.ng', staff_id: 'KGS/KIRS/001', password: 'Staff@1234', role: 'staff', first_name: 'Grace', last_name: 'Onah', display_name: 'Miss. Grace Onah', org_code: 'KIRS', gender: 'female', staff_type: 'civil_servant', grade_level: 9 },
  { email: 'procurement@kogistate.gov.ng', staff_id: 'KGS/BPP/001', password: 'Proc@1234', role: 'procurement_officer', first_name: 'Aisha', last_name: 'Bello', display_name: 'Mrs. Aisha Bello', org_code: 'BPP', gender: 'female', staff_type: 'civil_servant', grade_level: 12 },
  { email: 'projects@kogistate.gov.ng', staff_id: 'KGS/RDA/001', password: 'Proj@1234', role: 'project_officer', first_name: 'Samuel', last_name: 'Oguche', display_name: 'Engr. Samuel Oguche', org_code: 'RDA', gender: 'male', staff_type: 'civil_servant', grade_level: 10 },
  { email: 'ict.admin@kogistate.gov.ng', staff_id: 'KGS/GDU/002', password: 'Ict@1234', role: 'ict_admin', first_name: 'Emmanuel', last_name: 'Itodo', display_name: 'Engr. Emmanuel Itodo', org_code: 'GDU', gender: 'male', staff_type: 'civil_servant', grade_level: 11 },
  { email: 'csc@kogistate.gov.ng', staff_id: 'KGS/KGCSC/002', password: 'Csc@1234', role: 'civil_service_commission', first_name: 'Chairman', last_name: 'CSC', display_name: 'Hon. Chairman CSC', org_code: 'KGCSC', gender: 'male', staff_type: 'political_appointee', grade_level: 17 },
  { email: 'retiree@kogistate.gov.ng', staff_id: 'KGS/PB/001', password: 'Retire@1234', role: 'retiree', first_name: 'Musa', last_name: 'Usman', display_name: 'Alhaji. Musa Usman', org_code: 'PB', gender: 'male', staff_type: 'retiree', grade_level: 14 },
  { email: 'mne@kogistate.gov.ng', staff_id: 'KGS/GDU/003', password: 'Mne@1234', role: 'm_and_e_officer', first_name: 'Victor', last_name: 'Ameh', display_name: 'Mr. Victor Ameh', org_code: 'GDU', gender: 'male', staff_type: 'civil_servant', grade_level: 10 },
  { email: 'legal@kogistate.gov.ng', staff_id: 'KGS/MOJ/001', password: 'Legal@1234', role: 'legal_officer', first_name: 'Kemi', last_name: 'Olukotun', display_name: 'Barr. Kemi Olukotun', org_code: 'MOJ', gender: 'female', staff_type: 'civil_servant', grade_level: 13 },
  { email: 'internal.audit@kogistate.gov.ng', staff_id: 'KGS/OAG/002', password: 'Intaudit@1234', role: 'internal_auditor', first_name: 'Fatima', last_name: 'Bello', display_name: 'Mrs. Fatima Bello', org_code: 'OAG', gender: 'female', staff_type: 'civil_servant', grade_level: 12 },
];

// ── LGAs ────────────────────────────────────────────────────────────────────
const LGAS_DATA = [
  "Adavi","Ajaokuta","Ankpa","Bassa","Dekina","Ibaji","Idah","Igalamela-Odolu",
  "Ijumu","Kabba/Bunu","Kogi","Lokoja","Mopa-Muro","Ofu","Ogori/Magongo","Okehi",
  "Okene","Olamaboro","Omala","Yagba East","Yagba West",
];

// ── PROJECTS ─────────────────────────────────────────────────────────────────
const PROJECTS_DATA = [
  { title: 'Reconstruction of Lokoja–Ajaokuta Road', status: 'ongoing', progress: 65, budget: 4800000000, spent: 3120000000, lga: 'Lokoja', org_code: 'MOW', contractor: 'Julius Berger', start: '2024-01-15', end: '2026-06-30' },
  { title: 'Construction of 200-bed Specialist Hospital, Okene', status: 'ongoing', progress: 42, budget: 3200000000, spent: 1344000000, lga: 'Okene', org_code: 'MOH', contractor: 'CCECC Nigeria Ltd', start: '2024-03-01', end: '2026-12-31' },
  { title: 'Solar Mini-grid for 40 Rural Communities', status: 'ongoing', progress: 80, budget: 1500000000, spent: 1200000000, lga: 'Yagba East', org_code: 'MORED', contractor: 'Setraco Nigeria', start: '2023-06-01', end: '2025-12-31' },
  { title: 'Renovation of 500 Primary Schools', status: 'delayed', progress: 35, budget: 2800000000, spent: 980000000, lga: 'Lokoja', org_code: 'MOE', contractor: 'Reynolds Construction', start: '2024-01-01', end: '2025-12-31' },
  { title: 'Confluence Industrial Park, Lokoja', status: 'ongoing', progress: 55, budget: 6500000000, spent: 3575000000, lga: 'Lokoja', org_code: 'MOCI', contractor: 'Hartland Nig. Ltd', start: '2024-02-01', end: '2027-06-30' },
  { title: 'Kogi Skills & Vocational Centre, Kabba', status: 'completed', progress: 100, budget: 800000000, spent: 800000000, lga: 'Kabba/Bunu', org_code: 'MOYSD', contractor: 'Kogi Build Ltd', start: '2022-09-01', end: '2024-08-31' },
  { title: 'Idah Riverine Erosion Control', status: 'ongoing', progress: 70, budget: 1200000000, spent: 840000000, lga: 'Idah', org_code: 'MENV', contractor: 'Julius Berger', start: '2024-01-01', end: '2025-12-31' },
  { title: 'Statewide Digital ID Rollout', status: 'ongoing', progress: 60, budget: 2200000000, spent: 1320000000, lga: 'Lokoja', org_code: 'GDU', contractor: 'CCECC Nigeria Ltd', start: '2024-04-01', end: '2026-03-31' },
  { title: 'Ankpa Water Treatment Plant', status: 'delayed', progress: 25, budget: 900000000, spent: 225000000, lga: 'Ankpa', org_code: 'MOWR', contractor: 'Reynolds Construction', start: '2024-01-01', end: '2025-12-31' },
  { title: 'Dekina Agro-Processing Zone', status: 'ongoing', progress: 48, budget: 1800000000, spent: 864000000, lga: 'Dekina', org_code: 'MOAFS', contractor: 'Hartland Nig. Ltd', start: '2024-03-01', end: '2026-06-30' },
  { title: 'Smart Traffic System — Lokoja', status: 'ongoing', progress: 75, budget: 700000000, spent: 525000000, lga: 'Lokoja', org_code: 'MOT', contractor: 'Kogi Build Ltd', start: '2024-06-01', end: '2025-11-30' },
  { title: 'Geriatric Care Centre, Kabba', status: 'completed', progress: 100, budget: 450000000, spent: 450000000, lga: 'Kabba/Bunu', org_code: 'MOH', contractor: 'Julius Berger', start: '2022-01-01', end: '2024-01-31' },
  { title: 'Maternal & Child Health Outreach Programme', status: 'ongoing', progress: 85, budget: 300000000, spent: 255000000, lga: 'Lokoja', org_code: 'MOH', contractor: 'CCECC Nigeria Ltd', start: '2024-01-01', end: '2025-12-31' },
  { title: 'Rural Feeder Roads — Yagba West', status: 'ongoing', progress: 55, budget: 1100000000, spent: 605000000, lga: 'Yagba West', org_code: 'MORED', contractor: 'Setraco Nigeria', start: '2024-02-01', end: '2026-01-31' },
  { title: 'Kogi e-Procurement Portal', status: 'completed', progress: 100, budget: 200000000, spent: 200000000, lga: 'Lokoja', org_code: 'BPP', contractor: 'Reynolds Construction', start: '2023-01-01', end: '2023-12-31' },
  { title: 'Women Empowerment Fund Cohort 3', status: 'ongoing', progress: 90, budget: 500000000, spent: 450000000, lga: 'Lokoja', org_code: 'MOWASD', contractor: 'Hartland Nig. Ltd', start: '2024-01-01', end: '2025-06-30' },
  { title: 'Cassava Value Chain Initiative', status: 'ongoing', progress: 65, budget: 750000000, spent: 487500000, lga: 'Ofu', org_code: 'MOAFS', contractor: 'Kogi Build Ltd', start: '2024-04-01', end: '2025-12-31' },
  { title: 'Iron Ore Logistics Corridor', status: 'planned', progress: 5, budget: 5000000000, spent: 250000000, lga: 'Ajaokuta', org_code: 'MOSM', contractor: 'Julius Berger', start: '2025-01-01', end: '2028-12-31' },
  { title: 'Statewide CCTV Safe City Phase 2', status: 'ongoing', progress: 50, budget: 1600000000, spent: 800000000, lga: 'Lokoja', org_code: 'GDU', contractor: 'CCECC Nigeria Ltd', start: '2024-06-01', end: '2026-05-31' },
  { title: 'Confluence University Faculty Block Extension', status: 'ongoing', progress: 40, budget: 2000000000, spent: 800000000, lga: 'Lokoja', org_code: 'MOE', contractor: 'Setraco Nigeria', start: '2024-03-01', end: '2026-08-31' },
  { title: 'Okehi General Hospital Equipment Procurement', status: 'completed', progress: 100, budget: 350000000, spent: 350000000, lga: 'Okehi', org_code: 'MOH', contractor: 'Reynolds Construction', start: '2023-06-01', end: '2024-05-31' },
  { title: 'Kogi Tourism Mega-Resort, Lokoja', status: 'planned', progress: 8, budget: 3800000000, spent: 304000000, lga: 'Lokoja', org_code: 'MOCT', contractor: 'Hartland Nig. Ltd', start: '2025-07-01', end: '2029-06-30' },
  { title: 'Statewide Drug Distribution System', status: 'ongoing', progress: 70, budget: 600000000, spent: 420000000, lga: 'Lokoja', org_code: 'MOH', contractor: 'Kogi Build Ltd', start: '2024-01-01', end: '2025-12-31' },
  { title: 'Bassa Bridge & Approach Roads', status: 'ongoing', progress: 30, budget: 2500000000, spent: 750000000, lga: 'Bassa', org_code: 'MOW', contractor: 'Julius Berger', start: '2024-07-01', end: '2027-06-30' },
  { title: 'Lokoja Bus Rapid Transit Phase 1', status: 'planned', progress: 15, budget: 4200000000, spent: 630000000, lga: 'Lokoja', org_code: 'MOT', contractor: 'CCECC Nigeria Ltd', start: '2025-01-01', end: '2027-12-31' },
  { title: 'Idah Solar Hospital', status: 'completed', progress: 100, budget: 550000000, spent: 550000000, lga: 'Idah', org_code: 'MOH', contractor: 'Setraco Nigeria', start: '2022-03-01', end: '2024-02-28' },
  { title: 'Smart Schools Tablet Program', status: 'ongoing', progress: 60, budget: 1200000000, spent: 720000000, lga: 'Lokoja', org_code: 'MOE', contractor: 'Reynolds Construction', start: '2024-01-01', end: '2025-12-31' },
  { title: 'Public Service Performance Management System', status: 'ongoing', progress: 55, budget: 300000000, spent: 165000000, lga: 'Lokoja', org_code: 'GDU', contractor: 'Kogi Build Ltd', start: '2024-02-01', end: '2025-07-31' },
  { title: 'Agric Extension Services Expansion', status: 'ongoing', progress: 45, budget: 650000000, spent: 292500000, lga: 'Olamaboro', org_code: 'MOAFS', contractor: 'Julius Berger', start: '2024-04-01', end: '2026-03-31' },
  { title: 'State Housing Scheme — Phase 3', status: 'ongoing', progress: 38, budget: 3500000000, spent: 1330000000, lga: 'Lokoja', org_code: 'MOHUD', contractor: 'CCECC Nigeria Ltd', start: '2024-06-01', end: '2027-05-31' },
];

// ── PROGRAMMES ───────────────────────────────────────────────────────────────
const PROGRAMMES_DATA = [
  { title: 'Classroom Construction & Renovation Programme', org_code: 'MOE', budget: 9800000000, status: 'ongoing' },
  { title: 'Universal Basic Health Coverage Initiative', org_code: 'MOH', budget: 12400000000, status: 'ongoing' },
  { title: 'Kogi State Road Infrastructure Programme', org_code: 'MOW', budget: 18000000000, status: 'ongoing' },
  { title: 'Agricultural Value Chain Development Programme', org_code: 'MOAFS', budget: 7800000000, status: 'ongoing' },
  { title: 'Rural Electrification & Energy Access Programme', org_code: 'MORED', budget: 5500000000, status: 'ongoing' },
  { title: 'Digital Governance Transformation Programme', org_code: 'GDU', budget: 3800000000, status: 'ongoing' },
  { title: 'Poverty Alleviation & Social Protection Programme', org_code: 'MOHAP', budget: 4200000000, status: 'ongoing' },
  { title: 'Water, Sanitation & Hygiene Programme', org_code: 'MOWR', budget: 3500000000, status: 'ongoing' },
  { title: 'Tourism & Cultural Heritage Promotion', org_code: 'MOCT', budget: 1800000000, status: 'ongoing' },
  { title: 'Youth Empowerment & Skills Development', org_code: 'MOYSD', budget: 2200000000, status: 'ongoing' },
  { title: 'Solid Minerals Exploration & Development', org_code: 'MOSM', budget: 2800000000, status: 'planned' },
  { title: 'Justice Sector Reform Programme', org_code: 'MOJ', budget: 1500000000, status: 'ongoing' },
];

// ── BUDGETS ──────────────────────────────────────────────────────────────────
const BUDGETS_DATA = [
  { org_code: 'MOE', allocated: 14030000000, released: 9821000000, spent: 9500000000 },
  { org_code: 'MOH', allocated: 13240000000, released: 9268000000, spent: 8900000000 },
  { org_code: 'MOFEP', allocated: 17090000000, released: 13272000000, spent: 12000000000 },
  { org_code: 'MOW', allocated: 6020000000, released: 4514000000, spent: 4100000000 },
  { org_code: 'MOAFS', allocated: 11780000000, released: 8246000000, spent: 7800000000 },
  { org_code: 'MOJ', allocated: 4500000000, released: 3400000000, spent: 3100000000 },
  { org_code: 'MOIC', allocated: 1880000000, released: 1254000000, spent: 1100000000 },
  { org_code: 'MOHUD', allocated: 4000000000, released: 2800000000, spent: 2500000000 },
  { org_code: 'MOT', allocated: 1500000000, released: 1035000000, spent: 900000000 },
  { org_code: 'MOWR', allocated: 3000000000, released: 2200000000, spent: 2000000000 },
  { org_code: 'MORED', allocated: 3500000000, released: 2450000000, spent: 2200000000 },
  { org_code: 'GDU', allocated: 6000000000, released: 4800000000, spent: 4500000000 },
  { org_code: 'OEG', allocated: 10000000000, released: 8200000000, spent: 8000000000 },
  { org_code: 'KIRS', allocated: 2500000000, released: 1800000000, spent: 1600000000 },
  { org_code: 'MOAFS', allocated: 11780000000, released: 8246000000, spent: 7800000000 },
];

// ── NOTIFICATIONS ────────────────────────────────────────────────────────────
const NOTIF_DATA = [
  { title: 'Q2 Budget Released', message: 'The Q2 2025 budget allocation of ₦8.2B has been released to all MDAs. Finance Directors are to acknowledge receipt.', type: 'budget' },
  { title: 'New E-Memo Received', message: 'You have a new memo from the Office of the Governor requiring your immediate attention regarding security enhancement.', type: 'memo' },
  { title: 'Project Delay Alert', message: 'Ankpa Water Treatment Plant project is now 30 days behind schedule. Immediate action and updated timeline required.', type: 'alert' },
  { title: 'Staff Leave Approved', message: 'Leave request for Grace Onah (KGS/KIRS/001) has been approved for 30 working days commencing 14th July 2025.', type: 'hr' },
  { title: 'System Maintenance Scheduled', message: 'Kogi OneGov will undergo routine maintenance on Saturday, 12th July 2025 from 2:00 AM to 6:00 AM. Please save your work.', type: 'system' },
  { title: 'Performance Score Updated', message: 'Your MDA Q2 2025 performance score has been updated. Ministry of Education scores 90/100. View dashboard for details.', type: 'performance' },
  { title: 'Procurement Approval Pending', message: 'A procurement request of ₦450M is pending your approval. Reference: BPP/2025/Q2/087. Deadline: 72 hours.', type: 'procurement' },
  { title: 'Audit Report Ready', message: 'The Q1 2025 internal audit report for Ministry of Works is ready for your review. Access it in the Documents portal.', type: 'audit' },
  { title: 'New Staff Registration', message: '12 new civil servants have been registered on the nominal roll for the current month. HR verification pending.', type: 'hr' },
  { title: 'Budget Utilization Alert', message: 'Ministry of Transport has utilized only 60% of Q2 budget with 2 weeks remaining. Expenditure acceleration required.', type: 'budget' },
];

// ── MEMOS ────────────────────────────────────────────────────────────────────
const MEMOS_DATA = [
  { subject: 'Budget Release for Q2 2025 Capital Projects', body: 'This circular authorizes the release of Q2 2025 capital project allocations to all MDAs as per approved budget lines. Finance Directors are to acknowledge receipt within 48 hours and ensure funds are applied strictly to approved project codes.', priority: 'high', status: 'approved', from_role: 'accountant_general', to_role: 'commissioner' },
  { subject: 'State Security Alert: Enhanced Monitoring Required', body: 'Following credible intelligence reports, all MDAs are directed to heighten internal security awareness immediately. All access control measures are to be reviewed, and any suspicious activities must be reported to security operatives within 1 hour.', priority: 'urgent', status: 'approved', from_role: 'governor', to_role: 'ssg' },
  { subject: 'Nomination of Personnel for Overseas Training 2025', body: 'MDAs are invited to nominate qualified officers for the World Bank-sponsored governance excellence training programme scheduled for August 2025 in Nairobi, Kenya. Nominees must be GL 12 and above. Nominations are due at the HOS office by 30th July 2025.', priority: 'normal', status: 'submitted', from_role: 'head_of_service', to_role: 'hr_officer' },
  { subject: 'Annual Performance Evaluation — 2025 Mid-Year Review', body: 'All Heads of Department are required to submit mid-year performance assessment reports for their units using the GDU-approved template. The GDU monitoring team will conduct field verification for MDAs with performance ratings below 70%.', priority: 'high', status: 'under_review', from_role: 'dg_gdu', to_role: 'director' },
  { subject: 'Approval of Budget Supplementary Estimates', body: 'The Executive Council has approved the Supplementary Budget Estimates for FY2025 amounting to ₦18.5B. Relevant MDAs should submit activity plans for the supplementary allocations within 14 working days.', priority: 'urgent', status: 'approved', from_role: 'governor', to_role: 'budget_officer' },
];

// ── CHAT GROUPS ──────────────────────────────────────────────────────────────
const GROUPS_DATA = [
  { name: 'Executive Governance Team', classification: 'confidential' },
  { name: 'GDU Operations', classification: 'restricted' },
  { name: 'Finance & Accounts Officers Forum', classification: 'internal' },
  { name: 'Project Officers Coordination', classification: 'internal' },
  { name: 'HR & Civil Service Commission', classification: 'internal' },
  { name: 'ICT & Digital Systems Support', classification: 'internal' },
  { name: 'Audit & Compliance Network', classification: 'restricted' },
  { name: 'Bureau of Public Procurement Committee', classification: 'restricted' },
  { name: 'All Staff Notice Board', classification: 'public' },
  { name: 'Health Sector Coordination', classification: 'internal' },
];

// ── DEVELOPMENT PILLARS & OBJECTIVES ─────────────────────────────────────────
const PILLARS_DATA = [
  { name: 'Fostering Prosperity', code: 'FP', description: 'Economic growth, job creation, agriculture, mining, and trade', weight: 45 },
  { name: 'Building Resilience', code: 'BR', description: 'Health, education, social protection, environment, housing, and water', weight: 35 },
  { name: 'Providing Direction', code: 'PD', description: 'Good governance, rule of law, security, digital transformation, and accountability', weight: 20 },
];

// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting Kogi OneGov database seed...\n');
  try {

    // ── 1. LGAs ─────────────────────────────────────────────────────────────
    console.log('📍 Seeding LGAs...');
    for (const lgaName of LGAS_DATA) {
      await sql`
        INSERT INTO lgas (name) VALUES (${lgaName})
        ON CONFLICT (name) DO NOTHING
      `;
    }
    const lgaRows = await sql`SELECT id, name FROM lgas ORDER BY name`;
    const lgaByName = Object.fromEntries(lgaRows.map(r => [r.name, r.id]));
    console.log(`  ✅ ${lgaRows.length} LGAs`);

    // ── 2. Organizations ─────────────────────────────────────────────────────
    console.log('\n🏢 Seeding Organizations...');
    const validOrgTypes = ['ministry', 'department', 'agency', 'office', 'standalone_office', 'unit', 'commission', 'board', 'parastatal'];
    for (const org of ALL_ORGS) {
      const t = validOrgTypes.includes(org.type) ? org.type : 'office';
      const [existOrg] = await sql`SELECT id FROM organizations WHERE name = ${org.name} LIMIT 1`;
      if (!existOrg) {
        await sql`
          INSERT INTO organizations (name, short_name, type, code, is_active)
          VALUES (${org.name}, ${org.short_name || null}, ${t}::org_type, ${org.code || null}, true)
        `.catch(() => {});
      } else {
        await sql`UPDATE organizations SET code = ${org.code || null}, short_name = ${org.short_name || null} WHERE id = ${existOrg.id}`;
      }
    }
    const orgRows = await sql`SELECT id, name, short_name, code, type FROM organizations ORDER BY name`;
    const orgByCode = Object.fromEntries(orgRows.filter(r => r.code).map(r => [r.code, r]));
    console.log(`  ✅ ${orgRows.length} Organizations`);


    // ── 3. Nominal Roll ──────────────────────────────────────────────────────
    console.log('\n👥 Seeding Nominal Roll...');
    const nrMap = {}; // email -> id
    for (const u of USERS_SEED) {
      const org = orgByCode[u.org_code];
      const [existing] = await sql`SELECT id FROM nominal_roll WHERE staff_id = ${u.staff_id} LIMIT 1`;
      if (!existing) {
        const statusVal = u.role === 'retiree' ? 'retired' : 'active';
        const [ins] = await sql`
          INSERT INTO nominal_roll (
            first_name, last_name, staff_id, email, grade_level, step,
            gender, staff_type, status, position,
            mother_organization_id, current_organization_id,
            employment_date
          ) VALUES (
            ${u.first_name}, ${u.last_name}, ${u.staff_id}, ${u.email},
            ${u.grade_level || 10}, 1,
            ${u.gender || 'male'}, ${u.staff_type || 'civil_servant'}::staff_type,
            ${statusVal}::user_status,
            ${u.role.replace(/_/g, ' ')},
            ${org?.id || null}, ${org?.id || null},
            '2010-01-01'
          )
          RETURNING id
        `;
        nrMap[u.email] = ins.id;
      } else {
        nrMap[u.email] = existing.id;
      }
    }
    console.log(`  ✅ ${Object.keys(nrMap).length} Nominal Roll entries`);

    // ── 4. Users ─────────────────────────────────────────────────────────────
    console.log('\n🔐 Seeding User Accounts...');
    const userMap = {};
    for (const u of USERS_SEED) {
      const org = orgByCode[u.org_code];
      const pwHash = hashPassword(u.password);
      const nrId = nrMap[u.email] || null;

      const [existing] = await sql`SELECT id FROM users WHERE email = ${u.email} LIMIT 1`;
      if (!existing) {
        const [ins] = await sql`
          INSERT INTO users (
            email, staff_id, password_hash, nominal_roll_id,
            primary_organization_id, is_active, email_verified, status, created_at
          ) VALUES (
            ${u.email}, ${u.staff_id}, ${pwHash}, ${nrId},
            ${org?.id || null}, true, true, 'active'::user_status, NOW()
          )
          RETURNING id
        `;
        userMap[u.email] = ins.id;
      } else {
        await sql`UPDATE users SET password_hash = ${pwHash}, is_active = true WHERE email = ${u.email}`;
        userMap[u.email] = existing.id;
      }
    }
    console.log(`  ✅ ${Object.keys(userMap).length} Users`);

    // ── 5. Roles ─────────────────────────────────────────────────────────────
    console.log('\n🔑 Seeding Roles...');
    const roleNames = [...new Set(USERS_SEED.map(u => u.role))];
    const roleMap = {};
    for (const rname of roleNames) {
      await sql`
        INSERT INTO roles (name, display_name, scope, is_system_role)
        VALUES (${rname}, ${rname.replace(/_/g,' ')}, 'organization', true)
        ON CONFLICT (name) DO NOTHING
      `.catch(() => {});
      const [r] = await sql`SELECT id FROM roles WHERE name = ${rname} LIMIT 1`;
      if (r) roleMap[rname] = r.id;
    }

    // Assign roles — unique on (user_id, role_id, organization_id)
    for (const u of USERS_SEED) {
      const userId = userMap[u.email];
      const roleId = roleMap[u.role];
      const orgId = orgByCode[u.org_code]?.id || null;
      if (userId && roleId) {
        // Use IS NOT DISTINCT FROM to handle nulls
        const [urExist] = await sql`
          SELECT id FROM user_roles
          WHERE user_id = ${userId} AND role_id = ${roleId}
            AND organization_id IS NOT DISTINCT FROM ${orgId}::uuid
          LIMIT 1
        `;
        if (!urExist) {
          await sql`
            INSERT INTO user_roles (user_id, role_id, organization_id, is_active, assigned_at)
            VALUES (${userId}, ${roleId}, ${orgId}, true, NOW())
          `.catch(() => {});
        }
      }
    }
    console.log(`  ✅ Roles and assignments done`);

    // ── 6. Budgets ───────────────────────────────────────────────────────────
    console.log('\n💰 Seeding Budgets...');
    const [existFy] = await sql`SELECT id FROM fiscal_years ORDER BY start_date DESC LIMIT 1`.catch(() => [null]);
    const fyId = existFy?.id || null;

    for (const b of BUDGETS_DATA) {
      const org = orgByCode[b.org_code];
      if (!org) continue;

      let existing;
      if (fyId) {
        [existing] = await sql`SELECT id FROM budgets WHERE organization_id = ${org.id} AND fiscal_year_id = ${fyId} AND budget_type = 'capital' LIMIT 1`;
      } else {
        [existing] = await sql`SELECT id FROM budgets WHERE organization_id = ${org.id} LIMIT 1`;
      }

      if (!existing) {
        if (fyId) {
          await sql`
            INSERT INTO budgets (
              organization_id, fiscal_year_id, title, budget_type,
              total_allocated, total_released, total_spent, status
            ) VALUES (
              ${org.id}, ${fyId},
              ${org.name + ' Capital Budget 2025'},
              'capital',
              ${b.allocated}, ${b.released}, ${b.spent}, 'approved'
            )
          `.catch(() => {});
        } else {
          await sql`
            INSERT INTO budgets (
              organization_id, title, budget_type,
              total_allocated, total_released, total_spent, status
            ) VALUES (
              ${org.id},
              ${org.name + ' Capital Budget 2025'},
              'capital',
              ${b.allocated}, ${b.released}, ${b.spent}, 'approved'
            )
          `.catch(() => {});
        }
      }
    }
    console.log(`  ✅ Budgets done`);


    // ── 7. Programmes ────────────────────────────────────────────────────────
    console.log('\n📋 Seeding Programmes...');
    for (const prog of PROGRAMMES_DATA) {
      const org = orgByCode[prog.org_code];
      await sql`
        INSERT INTO programmes (
          organization_id, title, status, estimated_amount,
          start_date, end_date, description
        ) VALUES (
          ${org?.id || null}, ${prog.title},
          ${prog.status}::implementation_status,
          ${prog.budget},
          '2024-01-01', '2028-12-31',
          ${prog.title + ' - Kogi State Government Programme'}
        )
        ON CONFLICT DO NOTHING
      `.catch(() => {});
    }
    console.log(`  ✅ Programmes done`);

    // ── 8. Projects ──────────────────────────────────────────────────────────
    console.log('\n🏗️  Seeding Projects...');
    for (const proj of PROJECTS_DATA) {
      const org = orgByCode[proj.org_code];
      const pgStatus = proj.status === 'planned' ? 'not_started' : proj.status;
      await sql`
        INSERT INTO projects (
          organization_id, title, status, estimated_amount, amount_spent,
          progress_percentage, start_date, end_date, contractor_name, location
        ) VALUES (
          ${org?.id || null}, ${proj.title},
          ${pgStatus}::implementation_status,
          ${proj.budget}, ${proj.spent},
          ${proj.progress},
          ${proj.start}, ${proj.end},
          ${proj.contractor},
          ${proj.lga}
        )
        ON CONFLICT DO NOTHING
      `.catch(() => {});
    }
    console.log(`  ✅ ${PROJECTS_DATA.length} Projects done`);

    // ── 9. Development Pillars ────────────────────────────────────────────────
    console.log('\n🎯 Seeding Development Pillars...');
    // First, ensure a development plan exists
    let planId = null;
    const [existingPlan] = await sql`SELECT id FROM development_plans LIMIT 1`.catch(() => [null]);
    if (!existingPlan) {
      const [newPlan] = await sql`
        INSERT INTO development_plans (title, description, start_year, end_year, is_active)
        VALUES ('Kogi State Development Plan 2024-2056', 'A 32-Year Development Plan', 2024, 2056, true)
        RETURNING id
      `.catch(() => [null]);
      planId = newPlan?.id;
    } else {
      planId = existingPlan.id;
    }

    if (planId) {
      for (const p of PILLARS_DATA) {
        await sql`
          INSERT INTO development_pillars (plan_id, name, code, description, weight)
          VALUES (${planId}, ${p.name}, ${p.code}, ${p.description}, ${p.weight})
          ON CONFLICT DO NOTHING
        `.catch(() => {});
      }
      console.log(`  ✅ Development pillars done`);
    } else {
      console.log(`  ⚠️  Skipped pillars (no plan found)`);
    }

    // ── 10. Memos ────────────────────────────────────────────────────────────
    console.log('\n📨 Seeding Memos...');
    const roleToEmail = Object.fromEntries(USERS_SEED.map(u => [u.role, u.email]));
    for (const memo of MEMOS_DATA) {
      const fromId = userMap[roleToEmail[memo.from_role]] || null;
      const toId = userMap[roleToEmail[memo.to_role]] || null;
      await sql`
        INSERT INTO memos (
          from_user_id, to_user_id, subject, body, priority, status, created_at
        ) VALUES (
          ${fromId}, ${toId}, ${memo.subject}, ${memo.body},
          ${memo.priority}::memo_priority,
          ${memo.status}::workflow_status,
          NOW() - (RANDOM() * INTERVAL '10 days')
        )
        ON CONFLICT DO NOTHING
      `.catch(() => {});
    }
    console.log(`  ✅ Memos done`);

    // ── 11. Notifications ────────────────────────────────────────────────────
    console.log('\n🔔 Seeding Notifications...');
    const superAdminId = userMap['superadmin@kogistate.gov.ng'];
    const govId = userMap['governor@kogistate.gov.ng'];
    const hosId = userMap['hos@kogistate.gov.ng'];
    const notifTargets = [superAdminId, govId, hosId].filter(Boolean);

    for (const n of NOTIF_DATA) {
      for (const uid of notifTargets) {
        await sql`
          INSERT INTO notifications (user_id, title, message, notification_type, is_read, created_at)
          VALUES (
            ${uid}, ${n.title}, ${n.message},
            ${n.type || 'info'}, false,
            NOW() - (RANDOM() * INTERVAL '7 days')
          )
          ON CONFLICT DO NOTHING
        `.catch(async () => {
          // Try with 'body' column instead of 'message'
          await sql`
            INSERT INTO notifications (user_id, title, is_read, created_at)
            VALUES (${uid}, ${n.title}, false, NOW())
            ON CONFLICT DO NOTHING
          `.catch(() => {});
        });
      }
    }
    console.log(`  ✅ Notifications done`);

    // ── 12. Chat Groups ──────────────────────────────────────────────────────
    console.log('\n💬 Seeding Chat Groups...');
    for (const g of GROUPS_DATA) {
      await sql`
        INSERT INTO chat_groups (name, classification, created_at)
        VALUES (${g.name}, ${g.classification || 'internal'}, NOW())
        ON CONFLICT DO NOTHING
      `.catch(async () => {
        await sql`
          INSERT INTO chat_groups (name, created_at)
          VALUES (${g.name}, NOW())
          ON CONFLICT DO NOTHING
        `.catch(() => {});
      });
    }
    console.log(`  ✅ Chat Groups done`);

    // ── 13. Final Summary ────────────────────────────────────────────────────
    console.log('\n📊 Final record counts:');
    const summary = [
      'users', 'organizations', 'nominal_roll', 'projects', 'programmes',
      'budgets', 'memos', 'notifications', 'chat_groups', 'lgas', 'roles', 'user_roles'
    ];
    for (const t of summary) {
      try {
        const [res] = await sql`SELECT COUNT(*) as cnt FROM ${sql(t)}`;
        console.log(`  ${t.padEnd(20)}: ${res.cnt}`);
      } catch(e) {
        console.log(`  ${t.padEnd(20)}: (error)`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ SEED COMPLETE! DEMO LOGIN CREDENTIALS');
    console.log('='.repeat(70));
    USERS_SEED.forEach(u => {
      console.log(`  ${u.role.padEnd(28)} ${u.email.padEnd(44)} ${u.password}`);
    });
    console.log('='.repeat(70));

  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    console.error(err.stack);
  } finally {
    await sql.end();
  }
}

seed();
