// Strategic governance spine: Vision -> Pillar -> Objective -> Programme -> Project -> Activity -> Task -> Evidence -> KPI
// Single source of truth referenced by all new modules.

import { MINISTRIES, LGAS, PROJECTS, PILLARS } from "./mock-data";
export { MINISTRIES, LGAS, PILLARS };

export const VISION = {
  title: "Kogi State Development Plan 2024–2056",
  statement:
    "A state distinguished by its exceptional innovation, health and wealth, firmly established on the foundations of peace, durable infrastructure, environmental sustainability and exemplary governance, presenting a confluence of diverse opportunities.",
  horizon: "32-Year Development Plan (2024 – 2056)",
};

export type EvidenceItem = {
  kind: "photo" | "video" | "report" | "gps" | "certificate";
  label: string;
  uploadedBy: string;
  at: string;
  verified: boolean;
};

export type TaskStatus = "Green" | "Amber" | "Red" | "Pending Review" | "Completed";

export interface Task {
  id: string;
  activityId: string;
  name: string;
  description: string;
  officer: string;
  inspector: string;
  approver: string;
  start: string;
  end: string;
  budget: number; // ₦M
  status: TaskStatus;
  progress: number;
  evidence: EvidenceItem[];
  deliverables: string[];
}

export interface Activity {
  id: string;
  programmeId: string;
  name: string;
  ministry: string;
  officer: string;
  approver: string;
  start: string;
  end: string;
  budget: number; // ₦M
  spent: number;
  kpi: string;
  deliverables: string[];
  progress: number;
  lga: string;
}

export interface Programme {
  id: string;
  name: string;
  ministry: string;
  pillar: string;
  objective: string;
  budget: number;
  spent: number;
  start: string;
  end: string;
  expectedOutcome: string;
  contribution: number; // % expected contribution to plan this year
  actualContribution: number;
}

export const PROGRAMMES: Programme[] = [
  {
    id: "PRG-EDU-01",
    name: "Classroom Construction & Renovation Programme",
    ministry: "Education",
    pillar: "Building Resilience",
    objective: "Universal access to quality basic education across the 21 LGAs",
    budget: 9800,
    spent: 6420,
    start: "2026-01-15",
    end: "2026-12-20",
    expectedOutcome: "500 classrooms rehabilitated; 120 new blocks; pupil/teacher ratio < 35:1",
    contribution: 5,
    actualContribution: 3.2,
  },
  {
    id: "PRG-WTR-01",
    name: "Five Boreholes Deployment Programme",
    ministry: "Water Resources",
    pillar: "Building Resilience",
    objective: "Increase rural potable water access from 47% to 75% by 2030",
    budget: 1240,
    spent: 612,
    start: "2026-02-01",
    end: "2026-09-30",
    expectedOutcome: "5 motorised boreholes commissioned across underserved LGAs",
    contribution: 4,
    actualContribution: 2.6,
  },
  {
    id: "PRG-HLT-01",
    name: "Maternal & Child Health Outreach Programme",
    ministry: "Health",
    pillar: "Building Resilience",
    objective: "Reduce maternal mortality by 40% by 2030",
    budget: 3400,
    spent: 1980,
    start: "2026-01-10",
    end: "2026-11-30",
    expectedOutcome: "1.2M outreach contacts; 18 LGA PHC upgrades",
    contribution: 3.5,
    actualContribution: 2.1,
  },
  {
    id: "PRG-WRK-01",
    name: "Confluence Roads Reconstruction Programme",
    ministry: "Works & Infrastructure",
    pillar: "Fostering Prosperity",
    objective: "120km arterial road network reconstructed",
    budget: 28400,
    spent: 21300,
    start: "2025-08-01",
    end: "2027-03-31",
    expectedOutcome: "Lokoja-Ajaokuta, Kabba-Obajana, Ankpa-Idah corridors restored",
    contribution: 6,
    actualContribution: 5.4,
  },
];

export const ACTIVITIES: Activity[] = [
  // Education
  {
    id: "ACT-EDU-01",
    programmeId: "PRG-EDU-01",
    name: "Construction of 60-Classroom Block, Adavi LGA",
    ministry: "Education",
    officer: "Engr. Samuel Oguche",
    approver: "Hon. Commissioner, Education",
    start: "2026-02-01",
    end: "2026-08-30",
    budget: 820,
    spent: 514,
    kpi: "Classrooms completed = 60",
    deliverables: ["Foundation works", "Walling & roofing", "Furniture supply", "Commissioning"],
    progress: 62,
    lga: "Adavi",
  },
  {
    id: "ACT-EDU-02",
    programmeId: "PRG-EDU-01",
    name: "Renovation of 180 Primary Schools (Phase 1)",
    ministry: "Education",
    officer: "Mrs. Halima Yusuf",
    approver: "Permanent Secretary, Education",
    start: "2026-01-20",
    end: "2026-10-15",
    budget: 2640,
    spent: 1820,
    kpi: "Schools fully renovated = 180",
    deliverables: ["Roof replacement", "Window/door fitting", "Painting", "Toilets"],
    progress: 71,
    lga: "Statewide",
  },
  {
    id: "ACT-EDU-03",
    programmeId: "PRG-EDU-01",
    name: "ICT Equipment Deployment to 50 Schools",
    ministry: "Education",
    officer: "Mr. Tunde Olaniyi",
    approver: "Hon. Commissioner, Education",
    start: "2026-03-10",
    end: "2026-07-30",
    budget: 410,
    spent: 188,
    kpi: "ICT-equipped schools = 50",
    deliverables: ["Procurement", "Installation", "Teacher training"],
    progress: 46,
    lga: "Statewide",
  },
  // Water Resources
  {
    id: "ACT-WTR-01",
    programmeId: "PRG-WTR-01",
    name: "Deploy 5 Boreholes Across Kogi State",
    ministry: "Water Resources",
    officer: "Engr. Musa Bello",
    approver: "Hon. Commissioner, Water Resources",
    start: "2026-02-10",
    end: "2026-08-15",
    budget: 540,
    spent: 286,
    kpi: "Boreholes commissioned = 5",
    deliverables: ["Site inspection", "Procurement", "Drilling", "Installation", "Testing", "Commissioning"],
    progress: 58,
    lga: "Ibaji, Bassa, Omala, Yagba East, Mopa-Muro",
  },
  {
    id: "ACT-WTR-02",
    programmeId: "PRG-WTR-01",
    name: "Solar Powering of 5 Borehole Sites",
    ministry: "Water Resources",
    officer: "Engr. Aliyu Mohammed",
    approver: "Permanent Secretary, Water",
    start: "2026-05-01",
    end: "2026-09-15",
    budget: 220,
    spent: 60,
    kpi: "PV systems installed = 5",
    deliverables: ["Panel procurement", "Inverter/battery install", "Commissioning"],
    progress: 28,
    lga: "Statewide",
  },
];

export const TASKS: Task[] = [
  // Borehole activity — full task chain (signature prototype)
  {
    id: "TSK-WTR-01-01",
    activityId: "ACT-WTR-01",
    name: "Site Inspection — 5 LGA sites",
    description: "Hydrogeological survey and community consultation in target LGAs.",
    officer: "Engr. Musa Bello",
    inspector: "Director, Field Ops (Water)",
    approver: "Permanent Secretary, Water",
    start: "2026-02-10", end: "2026-02-25",
    budget: 18, status: "Completed", progress: 100,
    deliverables: ["Survey report", "Site coordinates", "Community MoU"],
    evidence: [
      { kind: "report", label: "Hydrogeological Survey.pdf", uploadedBy: "Engr. Bello", at: "2026-02-24", verified: true },
      { kind: "gps", label: "5 site coordinates set", uploadedBy: "Field Ops", at: "2026-02-24", verified: true },
      { kind: "photo", label: "Site photos x 22", uploadedBy: "Field Ops", at: "2026-02-23", verified: true },
    ],
  },
  {
    id: "TSK-WTR-01-02",
    activityId: "ACT-WTR-01",
    name: "Procurement of drilling contractor & materials",
    description: "Award of drilling contract via e-Procurement portal.",
    officer: "Mrs. Aisha Bello",
    inspector: "Director, Procurement",
    approver: "Hon. Commissioner, Water",
    start: "2026-02-26", end: "2026-03-20",
    budget: 96, status: "Completed", progress: 100,
    deliverables: ["Bid evaluation report", "Contract award letter", "Performance bond"],
    evidence: [
      { kind: "certificate", label: "Award Letter — Hartland Nig. Ltd.pdf", uploadedBy: "Procurement", at: "2026-03-18", verified: true },
      { kind: "report", label: "Bid Eval Report.pdf", uploadedBy: "Procurement", at: "2026-03-15", verified: true },
    ],
  },
  {
    id: "TSK-WTR-01-03",
    activityId: "ACT-WTR-01",
    name: "Drilling — 5 sites",
    description: "Mobilisation and drilling at all 5 LGA sites.",
    officer: "Site Engineer, Hartland",
    inspector: "Engr. Musa Bello",
    approver: "Permanent Secretary, Water",
    start: "2026-03-25", end: "2026-06-10",
    budget: 260, status: "Green", progress: 80,
    deliverables: ["Drilling logs per site", "Water yield test", "Borehole completion certs"],
    evidence: [
      { kind: "photo", label: "Drilling progress photos x 48", uploadedBy: "Site Engineer", at: "2026-05-20", verified: true },
      { kind: "video", label: "Yield test — Ibaji site.mp4", uploadedBy: "Site Engineer", at: "2026-05-22", verified: false },
    ],
  },
  {
    id: "TSK-WTR-01-04",
    activityId: "ACT-WTR-01",
    name: "Pump installation & overhead tanks",
    description: "Install submersible pumps, overhead tanks and reticulation.",
    officer: "Site Engineer, Hartland",
    inspector: "Engr. Musa Bello",
    approver: "Permanent Secretary, Water",
    start: "2026-06-15", end: "2026-07-20",
    budget: 88, status: "Amber", progress: 35,
    deliverables: ["Pump install report", "Tank install photos"],
    evidence: [],
  },
  {
    id: "TSK-WTR-01-05",
    activityId: "ACT-WTR-01",
    name: "Quality testing & water analysis",
    description: "Water sampling & NAFDAC-grade lab analysis.",
    officer: "Lab Officer, Water Quality",
    inspector: "Director, Water Quality",
    approver: "Permanent Secretary, Water",
    start: "2026-07-25", end: "2026-08-05",
    budget: 22, status: "Red", progress: 0,
    deliverables: ["Lab certificates per site"],
    evidence: [],
  },
  {
    id: "TSK-WTR-01-06",
    activityId: "ACT-WTR-01",
    name: "Commissioning & handover",
    description: "Formal commissioning by His Excellency and handover to LGAs.",
    officer: "Commissioner Aide",
    inspector: "GDU Project Manager",
    approver: "Hon. Commissioner, Water",
    start: "2026-08-10", end: "2026-08-15",
    budget: 56, status: "Pending Review", progress: 0,
    deliverables: ["Commissioning photos", "Handover certificate"],
    evidence: [],
  },
  // Education classroom block tasks
  {
    id: "TSK-EDU-01-01",
    activityId: "ACT-EDU-01",
    name: "Site mobilisation — Adavi",
    description: "Contractor mobilisation, site clearing, fencing.",
    officer: "Engr. Samuel Oguche",
    inspector: "Director, Works (Education)",
    approver: "Permanent Secretary, Education",
    start: "2026-02-01", end: "2026-02-20",
    budget: 64, status: "Completed", progress: 100,
    deliverables: ["Site cleared", "Site office set up"],
    evidence: [
      { kind: "photo", label: "Site mobilisation photos.zip", uploadedBy: "Field Officer", at: "2026-02-19", verified: true },
    ],
  },
  {
    id: "TSK-EDU-01-02",
    activityId: "ACT-EDU-01",
    name: "Foundation works — 4 blocks",
    description: "Excavation, blinding, raft slab.",
    officer: "Engr. Samuel Oguche",
    inspector: "Resident Engineer",
    approver: "Permanent Secretary, Education",
    start: "2026-02-22", end: "2026-04-10",
    budget: 218, status: "Completed", progress: 100,
    deliverables: ["Concrete test cubes", "Foundation completion report"],
    evidence: [
      { kind: "report", label: "Concrete cube test results.pdf", uploadedBy: "Lab", at: "2026-04-08", verified: true },
      { kind: "photo", label: "Foundation photos x 30", uploadedBy: "Resident Engr.", at: "2026-04-09", verified: true },
    ],
  },
  {
    id: "TSK-EDU-01-03",
    activityId: "ACT-EDU-01",
    name: "Walling, roofing & finishing",
    description: "Walls, roof structure, plastering, paint.",
    officer: "Engr. Samuel Oguche",
    inspector: "Resident Engineer",
    approver: "Permanent Secretary, Education",
    start: "2026-04-15", end: "2026-07-30",
    budget: 380, status: "Green", progress: 65,
    deliverables: ["Roof completion cert", "Painting photos"],
    evidence: [
      { kind: "photo", label: "Walling progress.jpg", uploadedBy: "Field Officer", at: "2026-06-12", verified: true },
    ],
  },
  {
    id: "TSK-EDU-01-04",
    activityId: "ACT-EDU-01",
    name: "Furniture supply & commissioning",
    description: "Procure & install desks/chairs; formal commissioning.",
    officer: "Procurement Officer",
    inspector: "GDU Project Manager",
    approver: "Hon. Commissioner, Education",
    start: "2026-08-05", end: "2026-08-25",
    budget: 158, status: "Pending Review", progress: 0,
    deliverables: ["Delivery notes", "Commissioning photos"],
    evidence: [],
  },
];

/* ───────── Delay / bottleneck analytics ───────── */

export type DelaySource =
  | "Governor Approval"
  | "Commissioner"
  | "Permanent Secretary"
  | "Procurement"
  | "Funding"
  | "Contractor"
  | "Desk Officer"
  | "Staff"
  | "Implementation";

export interface Bottleneck {
  id: string;
  project: string;
  ministry: string;
  source: DelaySource;
  durationDays: number;
  riskScore: number; // 0-100
  impact: "Low" | "Medium" | "High" | "Critical";
  responsible: string;
  escalation: "L1" | "L2" | "L3" | "L4";
  noted: string;
}

export const BOTTLENECKS: Bottleneck[] = [
  { id: "BTL-001", project: "Lokoja–Ajaokuta Road", ministry: "Works & Infrastructure", source: "Funding", durationDays: 38, riskScore: 82, impact: "Critical", responsible: "Ministry of Finance", escalation: "L4", noted: "2026-05-04" },
  { id: "BTL-002", project: "200-bed Specialist Hospital, Okene", ministry: "Health", source: "Procurement", durationDays: 21, riskScore: 64, impact: "High", responsible: "BPP", escalation: "L3", noted: "2026-05-19" },
  { id: "BTL-003", project: "Renovation of 500 Primary Schools", ministry: "Education", source: "Contractor", durationDays: 12, riskScore: 41, impact: "Medium", responsible: "Hartland Nig. Ltd", escalation: "L2", noted: "2026-06-02" },
  { id: "BTL-004", project: "Ankpa Water Treatment Plant", ministry: "Water Resources", source: "Permanent Secretary", durationDays: 9, riskScore: 36, impact: "Medium", responsible: "Perm. Sec., Water", escalation: "L2", noted: "2026-06-07" },
  { id: "BTL-005", project: "Smart Traffic System — Lokoja", ministry: "Transport", source: "Governor Approval", durationDays: 16, riskScore: 58, impact: "High", responsible: "Office of the Governor", escalation: "L3", noted: "2026-05-28" },
  { id: "BTL-006", project: "Kogi e-Procurement Portal", ministry: "Information & Communications", source: "Desk Officer", durationDays: 6, riskScore: 22, impact: "Low", responsible: "ICT Desk Officer", escalation: "L1", noted: "2026-06-10" },
  { id: "BTL-007", project: "Bassa Bridge & Approach Roads", ministry: "Works & Infrastructure", source: "Contractor", durationDays: 28, riskScore: 71, impact: "High", responsible: "CCECC", escalation: "L3", noted: "2026-05-12" },
  { id: "BTL-008", project: "Maternal & Child Health Outreach", ministry: "Health", source: "Implementation", durationDays: 4, riskScore: 18, impact: "Low", responsible: "PHC Coordinator", escalation: "L1", noted: "2026-06-15" },
];

/* ───────── E-Memo & Letters ───────── */

export type MemoStage = "Drafted" | "Secretary" | "Director" | "Perm. Sec." | "Commissioner" | "Governor" | "Approved" | "Returned";

export interface Memo {
  id: string;
  ref: string;
  subject: string;
  from: string;
  ministry: string;
  to: string;
  stage: MemoStage;
  classification: "Routine" | "Confidential" | "Top Secret";
  date: string;
  body: string;
  trail: { actor: string; role: string; action: string; at: string; remark?: string }[];
  signatures: { name: string; role: string; signedAt: string }[];
  attachments: { name: string; size: string }[];
}

export const MEMOS: Memo[] = [
  {
    id: "MEM-001",
    ref: "KGS/EDU/2026/041",
    subject: "Request for Supplementary Vote — Phase 2 School Renovation",
    from: "Director, Planning (Education)",
    ministry: "Education",
    to: "His Excellency, the Governor",
    stage: "Commissioner",
    classification: "Confidential",
    date: "2026-06-09",
    body:
      "Following the completion of Phase 1 renovation of 180 primary schools, this memo requests approval of a supplementary ₦1.4B vote to extend works to 120 additional schools in underserved LGAs (Bassa, Omala, Ibaji, Ofu).",
    trail: [
      { actor: "Mrs. Fatima Onogwu", role: "Director, Planning", action: "Drafted", at: "2026-06-09 09:14" },
      { actor: "Secretary, Education", role: "Secretary", action: "Routed", at: "2026-06-09 11:02" },
      { actor: "Director, Education", role: "Director", action: "Cleared", at: "2026-06-10 14:30" },
      { actor: "Perm. Sec., Education", role: "Perm. Sec.", action: "Endorsed", at: "2026-06-11 10:08", remark: "Strong strategic alignment." },
      { actor: "Hon. Commissioner, Education", role: "Commissioner", action: "Forwarded to HE", at: "2026-06-12 16:44" },
    ],
    signatures: [
      { name: "Mrs. Fatima Onogwu", role: "Director, Planning", signedAt: "2026-06-09" },
      { name: "Perm. Sec., Education", role: "Perm. Sec.", signedAt: "2026-06-11" },
    ],
    attachments: [
      { name: "Phase 2 Scope.pdf", size: "1.8 MB" },
      { name: "BoQ Summary.xlsx", size: "284 KB" },
    ],
  },
  {
    id: "MEM-002",
    ref: "KGS/WTR/2026/017",
    subject: "Award Recommendation — Solar Powering of Borehole Sites",
    from: "Procurement Officer, Water",
    ministry: "Water Resources",
    to: "Permanent Secretary, Water",
    stage: "Perm. Sec.",
    classification: "Routine",
    date: "2026-06-12",
    body: "Bid evaluation concluded for solar powering of the 5 deployed borehole sites. Recommended bidder: Reynolds Construction. Contract value: ₦220M.",
    trail: [
      { actor: "Procurement Officer", role: "Officer", action: "Drafted", at: "2026-06-12 08:30" },
      { actor: "Director, Procurement", role: "Director", action: "Cleared", at: "2026-06-13 11:11" },
    ],
    signatures: [{ name: "Procurement Officer", role: "Officer", signedAt: "2026-06-12" }],
    attachments: [{ name: "Bid Evaluation Report.pdf", size: "624 KB" }],
  },
  {
    id: "MEM-003",
    ref: "KGS/HLT/2026/088",
    subject: "Quarterly Report — Maternal & Child Health Outreach",
    from: "Director, PHC",
    ministry: "Health",
    to: "Hon. Commissioner, Health",
    stage: "Approved",
    classification: "Routine",
    date: "2026-06-04",
    body: "Q2 2026 outreach coverage: 412,000 contacts (Plan 360,000). 9 PHC upgrades completed.",
    trail: [
      { actor: "Director, PHC", role: "Director", action: "Submitted", at: "2026-06-04" },
      { actor: "Perm. Sec., Health", role: "Perm. Sec.", action: "Endorsed", at: "2026-06-05" },
      { actor: "Hon. Commissioner, Health", role: "Commissioner", action: "Approved", at: "2026-06-06" },
    ],
    signatures: [
      { name: "Director, PHC", role: "Director", signedAt: "2026-06-04" },
      { name: "Hon. Commissioner, Health", role: "Commissioner", signedAt: "2026-06-06" },
    ],
    attachments: [{ name: "Q2 Outreach Report.pdf", size: "2.4 MB" }],
  },
];

/* ───────── Communication groups ───────── */

export interface ChatGroup {
  id: string;
  name: string;
  members: number;
  classification: "Restricted" | "Confidential" | "Open";
  unread: number;
  lastMessage: { from: string; text: string; at: string };
}

export const GROUPS: ChatGroup[] = [
  { id: "G-EXCO", name: "Executive Council (EXCO)", members: 32, classification: "Confidential", unread: 4, lastMessage: { from: "SSG", text: "EXCO memo on FY27 Call Circular circulated.", at: "09:14" } },
  { id: "G-COMM", name: "Commissioners Forum", members: 24, classification: "Confidential", unread: 1, lastMessage: { from: "Hon. Comm., Works", text: "Site visit to Lokoja flyover rescheduled.", at: "08:51" } },
  { id: "G-PS", name: "Permanent Secretaries Forum", members: 26, classification: "Restricted", unread: 0, lastMessage: { from: "Perm. Sec., Finance", text: "Q3 release schedule attached.", at: "Yesterday" } },
  { id: "G-GDU", name: "GDU Delivery Room", members: 18, classification: "Restricted", unread: 7, lastMessage: { from: "DG, GDU", text: "Weekly Governor brief ready for sign-off.", at: "10:02" } },
  { id: "G-EDU", name: "Education Ministry Team", members: 64, classification: "Restricted", unread: 2, lastMessage: { from: "Director, Planning", text: "Phase 2 scope shared.", at: "Tue" } },
  { id: "G-WTR", name: "Water Resources Ministry Team", members: 41, classification: "Restricted", unread: 0, lastMessage: { from: "Engr. Bello", text: "Ibaji yield test passed.", at: "Mon" } },
  { id: "G-PRJ-WTR-01", name: "5 Boreholes — Project Room", members: 12, classification: "Restricted", unread: 3, lastMessage: { from: "Site Engineer", text: "Pump install begins next week.", at: "07:40" } },
  { id: "G-PRJ-EDU-01", name: "Adavi Classroom Block — Project Room", members: 9, classification: "Restricted", unread: 0, lastMessage: { from: "Engr. Oguche", text: "Roofing 65% done.", at: "Yesterday" } },
];

/* ───────── Commissioners ranking ───────── */

export const COMMISSIONERS = MINISTRIES.slice(0, 22).map((m, i) => ({
  ministry: m.name,
  name: [
    "Hon. Wemi Ojo Jones",
    "Hon. Abdullazeez Adams Adeiza",
    "Muizudeen Yunus Abdullahi SAN",
    "Hon. Idris Asiru",
    "Hon. Kingsley Olorunfemi Fanwo",
    "Hon. Timothy Ojomah",
    "Hon. Fatimah Momoh",
    "Hon. Mohammed Abdulmutalib",
    "Hon. Salami Ozigi Deedat",
    "Hon. Mohammed Avohi Yusuf",
    "Hon. Abanika Taye",
    "Hon. Helen Adeniyi Aderibigbe",
    "Hon. Joseph Oluwasegun Stephen",
    "Hon. Yahaya M. D. Farouk",
    "Hon. Olufemi Bolarin",
    "Hon. Muhammed Shuaibu",
    "Hon. Aridaojo Monday Anyebe",
    "Hon. Rabietu Okute",
    "Awaiting Appointment",
    "Awaiting Appointment",
    "Awaiting Appointment",
    "Awaiting Appointment"
  ][i],
  score: m.score,
  delivery: Math.max(50, m.score - ((i * 3) % 12)),
  budgetUtil: Math.round((m.spent / m.budget) * 100),
  flagged: i % 4 === 0,
}));

/* ───────── Service requests (GDU change request) ───────── */

export type SRStage = "Submitted" | "Under Review" | "Approved" | "Costed" | "Payment" | "Delivered" | "Rejected";
export interface ServiceRequest {
  id: string; ministry: string; requester: string; title: string; type: string;
  cost: number; stage: SRStage; submitted: string;
}
export const SERVICE_REQUESTS: ServiceRequest[] = [
  { id: "SR-001", ministry: "Education", requester: "Director, Planning", title: "Restore 2024 procurement archive for audit", type: "Data Recovery", cost: 0.85, stage: "Approved", submitted: "2026-05-21" },
  { id: "SR-002", ministry: "Health", requester: "Perm. Sec.", title: "Custom outreach analytics dashboard", type: "Custom Analytics", cost: 2.4, stage: "Costed", submitted: "2026-05-29" },
  { id: "SR-003", ministry: "Works & Infrastructure", requester: "Director, Engineering", title: "Integration with GIS mapping vendor", type: "Integration", cost: 4.8, stage: "Under Review", submitted: "2026-06-04" },
  { id: "SR-004", ministry: "Finance", requester: "Director, Treasury", title: "Quarterly expenditure variance report", type: "Additional Report", cost: 0.6, stage: "Delivered", submitted: "2026-04-12" },
  { id: "SR-005", ministry: "Water Resources", requester: "Permanent Secretary", title: "Historical activity modification — borehole records", type: "Historical Edit", cost: 1.2, stage: "Submitted", submitted: "2026-06-12" },
];

/* ───────── Desk officers ───────── */

export interface DeskOfficer {
  id: string; name: string; ministry: string; assignment: string; trained: boolean;
  certified: boolean; status: "Active" | "On Leave" | "Replacement Requested"; competency: number;
}

export const DESK_OFFICERS: DeskOfficer[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `DO-${100 + i}`,
  name: ["Amaka Okoro","Ibrahim Suleiman","Halima Yusuf","Peter Adamu","Chika Eze","Musa Bello","Joy Etim","Tunde Olaniyi","Fatima Sani","Aliyu Mohammed","Grace Onah","Joseph Adejo","David Achimugu","Sule Enehe"][i],
  ministry: MINISTRIES[i % MINISTRIES.length].name,
  assignment: ["DGOS Reporting","Budget Returns","Procurement Returns","Project Verification","Memo Routing","HR Returns","Evidence Upload","Performance Returns"][i % 8],
  trained: i % 5 !== 0,
  certified: i % 4 !== 0,
  status: i === 3 ? "Replacement Requested" : i === 7 ? "On Leave" : "Active",
  competency: 60 + ((i * 7) % 40),
}));

/* ───────── Geo (stylised LGA coordinates within an SVG viewBox 0..100) ───────── */

export const LGA_GEO: { name: string; x: number; y: number }[] = LGAS.map((name, i) => {
  // pseudo-positions across the SVG canvas
  const seed = name.length * 13 + i * 7;
  const x = 12 + ((seed * 17) % 76);
  const y = 10 + ((seed * 31) % 78);
  return { name, x, y };
});

export const GEO_PROJECT_PINS = PROJECTS.slice(0, 24).map((p, i) => {
  const lga = LGA_GEO[i % LGA_GEO.length];
  return {
    id: p.id,
    name: p.name,
    ministry: p.ministry,
    lga: lga.name,
    status: p.status,
    progress: p.progress,
    budget: p.budget,
    x: lga.x + ((i % 5) - 2) * 1.6,
    y: lga.y + ((i % 3) - 1) * 1.4,
  };
});

/* ───────── State Performance Index ───────── */

export const SPI = {
  current: 78,
  monthAgo: 74,
  quarterAgo: 71,
  components: [
    { name: "Dev Plan Performance", value: 76, weight: 22 },
    { name: "Budget Performance", value: 71, weight: 18 },
    { name: "Programme Performance", value: 82, weight: 14 },
    { name: "Project Delivery", value: 80, weight: 16 },
    { name: "KPI Achievement", value: 75, weight: 12 },
    { name: "Expenditure Efficiency", value: 84, weight: 10 },
    { name: "Compliance Rate", value: 88, weight: 8 },
  ],
};

/* ───────── Briefings ───────── */

export const BRIEFINGS = {
  daily: {
    title: "Daily Executive Brief",
    date: new Date().toISOString().slice(0, 10),
    bullets: [
      "State Performance Index at 78 (+1 day-on-day).",
      "Capital release of ₦18.4B disbursed across 4 MDAs.",
      "Lokoja–Ajaokuta Road: contractor mobilisation resumed after 38-day funding delay.",
      "Smart Traffic System — Lokoja awaits HE approval (16 days outstanding).",
      "Education: 65% completion on Adavi 60-classroom block.",
    ],
  },
  weekly: {
    title: "Weekly Executive Brief",
    date: new Date().toISOString().slice(0, 10),
    bullets: [
      "7 high-value projects trending toward delay risk over next 45 days.",
      "Procurement cycle time down 28% MoM after e-Procurement rollout.",
      "Top MDA: Finance, Budget & Planning (95). Bottom: Tourism, Culture & Arts (68).",
      "Dev Plan contribution gap of 1.8pp this quarter — recommend reallocation to stalled programmes.",
      "GDU generated 146 briefs this quarter — 100% MDA reporting compliance.",
    ],
  },
  monthly: {
    title: "Monthly Executive Brief",
    date: new Date().toISOString().slice(0, 10),
    bullets: [
      "FY26 Budget Utilization at 71% (target 68%).",
      "Development Plan 2057 cumulative progress: 76%.",
      "Citizen Service Score 4.3 / 5 (state-wide).",
      "Risk register: 47 delayed projects, 9 critical bottlenecks.",
      "Strategic recommendation: accelerate Pillar 1 (Fostering Prosperity) — currently 12pp behind plan.",
    ],
  },
};

/* ───────── Performance cascade ───────── */

export const PERFORMANCE_CASCADE = {
  state: 84,
  ministries: MINISTRIES.slice(0, 8).map((m) => ({
    name: m.name, score: m.score,
    depts: ["Planning","Operations","Finance","Field"].map((d, i) => ({
      name: d, score: Math.max(55, m.score - ((i * 5) % 18)),
      staff: 8 + ((i * 3) % 9),
    })),
  })),
};

export { PROJECTS };
