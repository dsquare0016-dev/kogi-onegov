export type Role =
  | "super_admin"
  | "governor"
  | "deputy_governor"
  | "chief_of_staff"
  | "deputy_chief_of_staff"
  | "ssg"
  | "head_of_service"
  | "dg_gdu"
  | "commissioner"
  | "perm_secretary"
  | "director"
  | "secretary_mda"
  | "project_officer"
  | "procurement_officer"
  | "budget_officer"
  | "hr_officer"
  | "accountant"
  | "auditor_general"
  | "accountant_general"
  | "staff"
  | "retiree"
  | "civil_service_commission"
  | "director_admin"
  | "director_finance"
  | "director_prs"
  | "m_and_e_officer"
  | "internal_auditor"
  | "ict_admin"
  | "legal_officer"
  | "store_officer"
  | "fleet_officer"
  | "payroll_officer"
  | "procurement_committee"
  | "board_secretary"
  | "board_member"
  | "nysc_member"
  | "intern"
  | "consultant"
  | "adhoc_staff"
  | "political_appointee";

export interface RoleProfile {
  id: Role;
  title: string;
  shortTitle: string;
  scope: "executive" | "command" | "ministry" | "department" | "staff";
  demoEmail: string;
  demoName: string;
  ministry?: string;
  mda?: string;
  motherMinistry?: string;
  gender?: "male" | "female";
}

export const ROLES: RoleProfile[] = [
  { id: "super_admin", title: "Super Administrator", shortTitle: "Super Admin", scope: "executive", demoEmail: "superadmin@kogistate.gov.ng", demoName: "Engr. Yusuf Musa (Super Admin)", mda: "System Administration", motherMinistry: "State Government", gender: "male" },
  { id: "governor", title: "Executive Governor", shortTitle: "Governor", scope: "executive", demoEmail: "governor@kogistate.gov.ng", demoName: "H.E. Alh. Ahmed Usman Ododo", mda: "Office of the Executive Governor", motherMinistry: "State Government", gender: "male" },
  { id: "deputy_governor", title: "Deputy Governor", shortTitle: "Deputy Governor", scope: "executive", demoEmail: "deputy@kogistate.gov.ng", demoName: "H.E. Joel Salifu Oyibo", mda: "Office of the Deputy Governor", motherMinistry: "State Government", gender: "male" },
  { id: "ssg", title: "Secretary to the State Government", shortTitle: "SSG", scope: "executive", demoEmail: "ssg@kogistate.gov.ng", demoName: "Dr. Folashade Arike Ayoade", mda: "Office of the SSG", motherMinistry: "State Government", gender: "female" },
  { id: "chief_of_staff", title: "Chief of Staff", shortTitle: "Chief of Staff", scope: "executive", demoEmail: "cos@kogistate.gov.ng", demoName: "Barr. Ali Bello", mda: "Chief of Staff Office", motherMinistry: "Office of the Executive Governor", gender: "male" },
  { id: "deputy_chief_of_staff", title: "Deputy Chief of Staff", shortTitle: "Deputy Chief of Staff", scope: "executive", demoEmail: "dcos@kogistate.gov.ng", demoName: "Hon. Deputy Chief", mda: "Chief of Staff Office", motherMinistry: "Office of the Executive Governor", gender: "male" },
  { id: "head_of_service", title: "Head of Service", shortTitle: "Head of Service", scope: "executive", demoEmail: "hos@kogistate.gov.ng", demoName: "Mrs. Hannatu Adejoh", mda: "Office of the Head of Service", motherMinistry: "State Government", gender: "female" },
  { id: "dg_gdu", title: "Director-General, Governance Delivery Unit", shortTitle: "DG, GDU", scope: "command", demoEmail: "dg.gdu@kogistate.gov.ng", demoName: "Engr. Abubakar Yusuf", mda: "Governance Delivery Unit", motherMinistry: "Office of the Executive Governor", gender: "male" },
  { id: "commissioner", title: "Honourable Commissioner", shortTitle: "Commissioner", scope: "ministry", demoEmail: "commissioner.works@kogistate.gov.ng", demoName: "Hon. Mohammed Avohi Yusuf", ministry: "Ministry of Works", mda: "Ministry Headquarters", motherMinistry: "Ministry of Works", gender: "male" },
  { id: "perm_secretary", title: "Permanent Secretary", shortTitle: "Perm. Sec.", scope: "ministry", demoEmail: "permsec.health@kogistate.gov.ng", demoName: "Mr. Sule Enehe", ministry: "Ministry of Health", mda: "Hospital Management Board", motherMinistry: "Ministry of Health", gender: "male" },
  { id: "director", title: "Director", shortTitle: "Director", scope: "department", demoEmail: "director.planning@kogistate.gov.ng", demoName: "Mrs. Fatima Onogwu", ministry: "Ministry of Finance, Budget & Economic Planning", mda: "Economic Planning Dept.", motherMinistry: "Ministry of Finance, Budget & Economic Planning", gender: "female" },
  { id: "secretary_mda", title: "Secretary to MDA Head", shortTitle: "MDA Sec.", scope: "department", demoEmail: "secretary.works@kogistate.gov.ng", demoName: "Mr. Emmanuel Ojo", ministry: "Ministry of Works", mda: "Office of the Commissioner", motherMinistry: "Ministry of Works", gender: "male" },
  { id: "project_officer", title: "Project Officer", shortTitle: "Project Officer", scope: "staff", demoEmail: "projects@kogistate.gov.ng", demoName: "Engr. Samuel Oguche", mda: "Rural Development Agency", motherMinistry: "Ministry of Rural & Energy Development", gender: "male" },
  { id: "procurement_officer", title: "Procurement Officer", shortTitle: "Procurement", scope: "staff", demoEmail: "procurement@kogistate.gov.ng", demoName: "Mrs. Aisha Bello", mda: "Bureau of Public Procurement", motherMinistry: "Ministry of Finance, Budget & Economic Planning", gender: "female" },
  { id: "budget_officer", title: "Budget Officer", shortTitle: "Budget Officer", scope: "staff", demoEmail: "budget@kogistate.gov.ng", demoName: "Alhaji Ibrahim Yakubu", mda: "Budget & Planning Office", motherMinistry: "Ministry of Finance, Budget & Economic Planning", gender: "male" },
  { id: "hr_officer", title: "HR Officer", shortTitle: "HR", scope: "staff", demoEmail: "hr@kogistate.gov.ng", demoName: "Mr. Joseph Adejo", mda: "Kogi State Civil Service Commission", motherMinistry: "State Government", gender: "male" },
  { id: "accountant", title: "Accountant", shortTitle: "Accountant", scope: "staff", demoEmail: "accounts@kogistate.gov.ng", demoName: "Mr. David Achimugu", mda: "Office of the Accountant General", motherMinistry: "Ministry of Finance, Budget & Economic Planning", gender: "male" },
  { id: "auditor_general", title: "Auditor General", shortTitle: "Auditor Gen.", scope: "executive", demoEmail: "auditor.general@kogistate.gov.ng", demoName: "Mr. Sunday Oyibo", mda: "Office of the Auditor General", motherMinistry: "State Government", gender: "male" },
  { id: "accountant_general", title: "Accountant General", shortTitle: "Accountant Gen.", scope: "executive", demoEmail: "accountant.general@kogistate.gov.ng", demoName: "Mrs. Comfort Bamidele", mda: "Office of the Accountant General", motherMinistry: "Ministry of Finance, Budget & Economic Planning", gender: "female" },
  { id: "staff", title: "Civil Servant", shortTitle: "Staff", scope: "staff", demoEmail: "staff@kogistate.gov.ng", demoName: "Miss. Grace Onah", mda: "Kogi Internal Revenue Service", motherMinistry: "Ministry of Finance, Budget & Economic Planning", gender: "female" },
  { id: "retiree", title: "Retired Civil Servant", shortTitle: "Retiree", scope: "staff", demoEmail: "retiree@kogistate.gov.ng", demoName: "Alhaji. Musa Usman", mda: "Pension Board", motherMinistry: "State Government", gender: "male" },
  { id: "civil_service_commission", title: "Chairman, Civil Service Commission", shortTitle: "CSC Chairman", scope: "executive", demoEmail: "csc@kogistate.gov.ng", demoName: "Hon. Chairman CSC", mda: "Kogi State Civil Service Commission", motherMinistry: "State Government", gender: "male" },
  { id: "director_admin", title: "Director of Administration", shortTitle: "Dir. Admin", scope: "department", demoEmail: "dir.admin@kogistate.gov.ng", demoName: "Alh. Umar Farouq", mda: "Administration Dept", motherMinistry: "Ministry of Administration", gender: "male" },
  { id: "director_finance", title: "Director of Finance & Accounts", shortTitle: "Dir. Finance", scope: "department", demoEmail: "dir.finance@kogistate.gov.ng", demoName: "Mrs. Sarah Omakoji", mda: "Finance & Accounts Dept", motherMinistry: "Ministry of Finance", gender: "female" },
  { id: "director_prs", title: "Director of Planning, Research & Statistics", shortTitle: "Dir. PRS", scope: "department", demoEmail: "dir.prs@kogistate.gov.ng", demoName: "Dr. Hassan Usman", mda: "PRS Dept", motherMinistry: "Ministry of Planning", gender: "male" },
  { id: "m_and_e_officer", title: "Monitoring & Evaluation Officer", shortTitle: "M&E Officer", scope: "staff", demoEmail: "mne@kogistate.gov.ng", demoName: "Mr. Victor Ameh", mda: "M&E Unit", motherMinistry: "Ministry of Planning", gender: "male" },
  { id: "internal_auditor", title: "Internal Auditor", shortTitle: "Int. Auditor", scope: "staff", demoEmail: "internal.audit@kogistate.gov.ng", demoName: "Mrs. Fatima Bello", mda: "Internal Audit Unit", motherMinistry: "Ministry of Finance", gender: "female" },
  { id: "ict_admin", title: "ICT/System Administrator", shortTitle: "ICT Admin", scope: "staff", demoEmail: "ict.admin@kogistate.gov.ng", demoName: "Engr. Emmanuel Itodo", mda: "ICT Dept", motherMinistry: "Ministry of Science & Tech", gender: "male" },
  { id: "legal_officer", title: "Legal Officer", shortTitle: "Legal Officer", scope: "staff", demoEmail: "legal@kogistate.gov.ng", demoName: "Barr. Kemi Olukotun", mda: "Legal Dept", motherMinistry: "Ministry of Justice", gender: "female" },
  { id: "store_officer", title: "Store Officer", shortTitle: "Store Officer", scope: "staff", demoEmail: "store@kogistate.gov.ng", demoName: "Mr. Yakubu Isah", mda: "Procurement & Store", motherMinistry: "Ministry of Works", gender: "male" },
  { id: "fleet_officer", title: "Transport/Fleet Officer", shortTitle: "Fleet Officer", scope: "staff", demoEmail: "fleet@kogistate.gov.ng", demoName: "Mr. Usman Ademu", mda: "Transport Unit", motherMinistry: "Ministry of Transport", gender: "male" },
  { id: "payroll_officer", title: "Payroll Officer", shortTitle: "Payroll Officer", scope: "staff", demoEmail: "payroll@kogistate.gov.ng", demoName: "Mrs. Maryam Sanni", mda: "Payroll Dept", motherMinistry: "Office of the Accountant General", gender: "female" },
  { id: "procurement_committee", title: "Procurement Committee Member", shortTitle: "Proc. Member", scope: "staff", demoEmail: "proc.committee@kogistate.gov.ng", demoName: "Hon. Suleiman", mda: "Procurement Committee", motherMinistry: "Bureau of Public Procurement", gender: "male" },
  { id: "board_secretary", title: "Board Secretary", shortTitle: "Board Sec.", scope: "department", demoEmail: "board.sec@kogistate.gov.ng", demoName: "Mrs. Amina Yusuf", mda: "Board Secretariat", motherMinistry: "State Government", gender: "female" },
  { id: "board_member", title: "Board Member", shortTitle: "Board Member", scope: "staff", demoEmail: "board.member@kogistate.gov.ng", demoName: "Chief Okapanachi", mda: "State Boards", motherMinistry: "State Government", gender: "male" },
  { id: "nysc_member", title: "NYSC Member", shortTitle: "Corper", scope: "staff", demoEmail: "corper@kogistate.gov.ng", demoName: "Mr. Adebayo Kunle", mda: "Information Dept", motherMinistry: "Ministry of Information", gender: "male" },
  { id: "intern", title: "Intern", shortTitle: "Intern", scope: "staff", demoEmail: "intern@kogistate.gov.ng", demoName: "Miss. Chidinma Okafor", mda: "IT Unit", motherMinistry: "Ministry of Science & Tech", gender: "female" },
  { id: "consultant", title: "Consultant", shortTitle: "Consultant", scope: "staff", demoEmail: "consultant@kogistate.gov.ng", demoName: "Dr. John Doe", mda: "Special Projects", motherMinistry: "Office of the Executive Governor", gender: "male" },
  { id: "adhoc_staff", title: "Adhoc Staff", shortTitle: "Adhoc", scope: "staff", demoEmail: "adhoc@kogistate.gov.ng", demoName: "Mr. Tunde Lawal", mda: "Elections Taskforce", motherMinistry: "State Government", gender: "male" },
  { id: "political_appointee", title: "Political Appointee", shortTitle: "Appointee", scope: "staff", demoEmail: "appointee@kogistate.gov.ng", demoName: "Hon. Special Adviser", mda: "Political Affairs", motherMinistry: "Office of the Executive Governor", gender: "male" }
];

export const roleById = (id: Role): RoleProfile => {
  const found = ROLES.find((r) => r.id === id);
  if (found) return found;
  return ROLES.find((r) => r.id === 'staff') || ROLES[0];
};