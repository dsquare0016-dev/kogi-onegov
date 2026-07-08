export type Role =
  | "super_admin"
  | "governor"
  | "deputy_governor"
  | "ssg"
  | "chief_of_staff"
  | "deputy_chief_of_staff"
  | "commissioner"
  | "head_of_service"
  | "auditor_general"
  | "accountant_general"
  | "dg_gdu"
  | "dg_chairman"
  | "civil_service_commission"
  | "perm_secretary"
  | "deputy_director"
  | "assistant_director"
  | "staff"
  | "ict_admin"
  | "desk_officer"
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
  { id: "governor", title: "Executive Governor", shortTitle: "Governor", scope: "executive", demoEmail: "governor@kogistate.gov.ng", demoName: "H.E. Alh. Ahmed Usman Ododo", mda: "Office of the Executive Governor", motherMinistry: "State Government", gender: "male" },
  { id: "deputy_governor", title: "Deputy Governor", shortTitle: "Deputy Governor", scope: "executive", demoEmail: "deputy@kogistate.gov.ng", demoName: "H.E. Joel Salifu Oyibo", mda: "Office of the Deputy Governor", motherMinistry: "State Government", gender: "male" },
  { id: "ssg", title: "Secretary to State Government", shortTitle: "SSG", scope: "executive", demoEmail: "ssg@kogistate.gov.ng", demoName: "Dr. Folashade Arike Ayoade", mda: "Office of the SSG", motherMinistry: "State Government", gender: "female" },
  { id: "chief_of_staff", title: "Chief of Staff", shortTitle: "Chief of Staff", scope: "executive", demoEmail: "cos@kogistate.gov.ng", demoName: "Barr. Ali Bello", mda: "Chief of Staff Office", motherMinistry: "Office of the Executive Governor", gender: "male" },
  { id: "deputy_chief_of_staff", title: "Deputy Chief of Staff", shortTitle: "Deputy Chief of Staff", scope: "executive", demoEmail: "dcos@kogistate.gov.ng", demoName: "Hon. Deputy Chief", mda: "Chief of Staff Office", motherMinistry: "Office of the Executive Governor", gender: "male" },
  { id: "commissioner", title: "Commissioner", shortTitle: "Commissioner", scope: "ministry", demoEmail: "commissioner.works@kogistate.gov.ng", demoName: "Hon. Mohammed Avohi Yusuf", ministry: "Ministry of Works", mda: "Ministry Headquarters", motherMinistry: "Ministry of Works", gender: "male" },
  { id: "head_of_service", title: "Head of Service", shortTitle: "Head of Service", scope: "executive", demoEmail: "hos@kogistate.gov.ng", demoName: "Mrs. Hannatu Adejoh", mda: "Office of the Head of Service", motherMinistry: "State Government", gender: "female" },
  { id: "auditor_general", title: "State Auditor General", shortTitle: "Auditor Gen.", scope: "executive", demoEmail: "auditor.general@kogistate.gov.ng", demoName: "Mr. Sunday Oyibo", mda: "Office of the Auditor General", motherMinistry: "State Government", gender: "male" },
  { id: "accountant_general", title: "Accountant General", shortTitle: "Accountant Gen.", scope: "executive", demoEmail: "accountant.general@kogistate.gov.ng", demoName: "Mrs. Comfort Bamidele", mda: "Office of the Accountant General", motherMinistry: "Ministry of Finance, Budget & Economic Planning", gender: "female" },
  { id: "dg_gdu", title: "Director General GDU", shortTitle: "DG, GDU", scope: "command", demoEmail: "dg.gdu@kogistate.gov.ng", demoName: "Engr. Abubakar Yusuf", mda: "Governance Delivery Unit", motherMinistry: "Office of the Executive Governor", gender: "male" },
  { id: "dg_chairman", title: "Director General/Chiarman", shortTitle: "DG/Chairman", scope: "department", demoEmail: "dg.chairman@kogistate.gov.ng", demoName: "Hon. Chairman", mda: "State Boards", motherMinistry: "State Government", gender: "male" },
  { id: "civil_service_commission", title: "Civil Service Commission", shortTitle: "CSC", scope: "executive", demoEmail: "csc@kogistate.gov.ng", demoName: "Hon. Chairman CSC", mda: "Kogi State Civil Service Commission", motherMinistry: "State Government", gender: "male" },
  { id: "perm_secretary", title: "Permanent Secretary", shortTitle: "Perm. Sec.", scope: "ministry", demoEmail: "permsec.health@kogistate.gov.ng", demoName: "Mr. Sule Enehe", ministry: "Ministry of Health", mda: "Hospital Management Board", motherMinistry: "Ministry of Health", gender: "male" },
  { id: "deputy_director", title: "Deputy Director", shortTitle: "Deputy Director", scope: "department", demoEmail: "deputy.director@kogistate.gov.ng", demoName: "Mr. Emeka Obi", mda: "Administration", motherMinistry: "State Government", gender: "male" },
  { id: "assistant_director", title: "Assistant Director", shortTitle: "Asst. Director", scope: "department", demoEmail: "asst.director@kogistate.gov.ng", demoName: "Mrs. Amina Yusuf", mda: "Operations", motherMinistry: "State Government", gender: "female" },
  { id: "staff", title: "Staff (civil servant, ad-hoc)", shortTitle: "Staff", scope: "staff", demoEmail: "staff@kogistate.gov.ng", demoName: "Miss. Grace Onah", mda: "Kogi Internal Revenue Service", motherMinistry: "Ministry of Finance, Budget & Economic Planning", gender: "female" },
  { id: "ict_admin", title: "ICT/Helpdesk/User Support Officer", shortTitle: "ICT Support", scope: "staff", demoEmail: "ict@kogistate.gov.ng", demoName: "Engr. Emmanuel Itodo", mda: "ICT Dept", motherMinistry: "Ministry of Science & Tech", gender: "male" },
  { id: "desk_officer", title: "Desk Officer/Staff Support Officer", shortTitle: "Desk Officer", scope: "staff", demoEmail: "desk.officer@kogistate.gov.ng", demoName: "Mr. Tunde Lawal", mda: "HR Desk", motherMinistry: "State Government", gender: "male" },
  { id: "political_appointee", title: "Political Appointee", shortTitle: "Appointee", scope: "staff", demoEmail: "appointee@kogistate.gov.ng", demoName: "Hon. Special Adviser", mda: "Political Affairs", motherMinistry: "Office of the Executive Governor", gender: "male" },
  { id: "super_admin", title: "Super Admin", shortTitle: "Super Admin", scope: "executive", demoEmail: "superadmin@kogistate.gov.ng", demoName: "Engr. Yusuf Musa (Super Admin)", mda: "System Administration", motherMinistry: "State Government", gender: "male" }
];

export const roleById = (id: Role): RoleProfile => {
  const found = ROLES.find((r) => r.id === id);
  if (found) return found;
  return ROLES.find((r) => r.id === 'staff') || ROLES[0];
};