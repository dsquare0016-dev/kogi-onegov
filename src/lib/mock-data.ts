export const LGAS = [
  "Adavi","Ajaokuta","Ankpa","Bassa","Dekina","Ibaji","Idah","Igalamela-Odolu",
  "Ijumu","Kabba/Bunu","Kogi","Lokoja","Mopa-Muro","Ofu","Ogori/Magongo","Okehi",
  "Okene","Olamaboro","Omala","Yagba East","Yagba West",
];

export const MINISTRIES = [
  { name: "Ministry of Education", score: 90, projects: 71, budget: 1403, spent: 950 },
  { name: "Ministry of Health", score: 88, projects: 62, budget: 1324, spent: 890 },
  { name: "Ministry of Information & Communication", score: 86, projects: 19, budget: 188, spent: 110 },
  { name: "Ministry of Innovation, Science & Technology", score: 84, projects: 18, budget: 200, spent: 150 },
  { name: "Ministry of Culture & Tourism", score: 68, projects: 17, budget: 85, spent: 50 },
  { name: "Ministry of Environment", score: 72, projects: 28, budget: 70, spent: 45 },
  { name: "Ministry of Commerce & Industry", score: 77, projects: 21, budget: 300, spent: 180 },
  { name: "Ministry of Local Government & Chieftaincy Affairs", score: 78, projects: 23, budget: 600, spent: 450 },
  { name: "Ministry of Agriculture & Food Security", score: 85, projects: 48, budget: 1178, spent: 780 },
  { name: "Ministry of Livestock Development", score: 74, projects: 12, budget: 100, spent: 65 },
  { name: "Ministry of Housing & Urban Development", score: 81, projects: 29, budget: 400, spent: 250 },
  { name: "Ministry of Transport", score: 73, projects: 24, budget: 150, spent: 90 },
  { name: "Ministry of Water Resources", score: 76, projects: 35, budget: 300, spent: 200 },
  { name: "Ministry of Rural & Energy Development", score: 76, projects: 35, budget: 350, spent: 220 },
  { name: "Ministry of Justice", score: 83, projects: 14, budget: 450, spent: 310 },
  { name: "Ministry of Youth & Sports Development", score: 74, projects: 26, budget: 100, spent: 65 },
  { name: "Ministry of Women Affairs & Social Development", score: 79, projects: 31, budget: 300, spent: 180 },
  { name: "Ministry of Humanitarian Affairs & Poverty Alleviation", score: 75, projects: 15, budget: 180, spent: 110 },
  { name: "Ministry of Works", score: 82, projects: 84, budget: 602, spent: 410 },
  { name: "Ministry of Solid Minerals & Natural Resources", score: 71, projects: 12, budget: 120, spent: 80 },
  { name: "Ministry of Finance, Budget & Economic Planning", score: 95, projects: 22, budget: 1709, spent: 1200 },
  { name: "Ministry of Special Duties & Intergovernmental Affairs", score: 80, projects: 16, budget: 140, spent: 100 },
  { name: "Governor", score: 98, projects: 5, budget: 1000, spent: 800 },
  { name: "Deputy Governor", score: 95, projects: 3, budget: 500, spent: 400 },
  { name: "SSG", score: 90, projects: 8, budget: 400, spent: 300 },
  { name: "Chief of Staff", score: 92, projects: 2, budget: 300, spent: 250 },
  { name: "Deputy Chief of Staff", score: 90, projects: 1, budget: 150, spent: 100 },
  { name: "Head of Service", score: 88, projects: 4, budget: 200, spent: 150 },
  { name: "Civil Service Commission", score: 85, projects: 2, budget: 150, spent: 100 },
  { name: "Auditor General", score: 91, projects: 3, budget: 120, spent: 90 },
  { name: "Accountant General", score: 93, projects: 4, budget: 180, spent: 140 },
  { name: "GDU", score: 96, projects: 10, budget: 600, spent: 450 },
];

export const PILLARS = [
  { name: "Fostering Prosperity", progress: 72, weight: 45 },
  { name: "Building Resilience", progress: 81, weight: 35 },
  { name: "Providing Direction", progress: 64, weight: 20 },
];

const PROJECT_NAMES = [
  "Reconstruction of Lokoja–Ajaokuta Road",
  "Construction of 200-bed Specialist Hospital, Okene",
  "Solar Mini-grid for 40 Rural Communities",
  "Renovation of 500 Primary Schools",
  "Confluence Industrial Park, Lokoja",
  "Kogi Skills & Vocational Centre",
  "Idah Riverine Erosion Control",
  "Kabba Township Stadium Upgrade",
  "Statewide Digital ID Rollout",
  "Ankpa Water Treatment Plant",
  "Dekina Agro-Processing Zone",
  "Smart Traffic System — Lokoja",
  "Geriatric Care Centre, Kabba",
  "Maternal & Child Health Outreach",
  "Rural Feeder Roads — Yagba",
  "Kogi e-Procurement Portal",
  "Women Empowerment Fund Cohort 3",
  "Cassava Value Chain Initiative",
  "Iron Ore Logistics Corridor",
  "State-wide CCTV Safe City Phase 2",
  "Confluence University Faculty Block",
  "Public Service Performance Bonus Scheme",
  "Okehi General Hospital Equipment",
  "Kogi Tourism Mega-Resort",
  "Statewide Drug Distribution System",
  "Bassa Bridge & Approach Roads",
  "Lokoja Bus Rapid Transit Phase 1",
  "Idah Solar Hospital",
  "Smart Schools Tablet Program",
  "Kogi Investment Promotion Agency",
];

const STATUSES = ["On-Track", "At-Risk", "Delayed", "Completed", "Planning"] as const;
export type ProjectStatus = (typeof STATUSES)[number];

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const r = rand(7);

export const PROJECTS = PROJECT_NAMES.map((name, i) => {
  const budget = Math.round((50 + r() * 950) * 10) / 10; // ₦M*10 -> we'll treat as ₦M
  const spent = Math.round(budget * (0.2 + r() * 0.75) * 10) / 10;
  const progress = Math.min(100, Math.round((spent / budget) * 100 + r() * 10));
  const status: ProjectStatus =
    progress >= 100 ? "Completed" : progress < 15 ? "Planning" : progress > 70 ? "On-Track" : r() > 0.6 ? "At-Risk" : r() > 0.5 ? "Delayed" : "On-Track";
  return {
    id: `KGP-${(1000 + i).toString()}`,
    name,
    ministry: MINISTRIES[i % MINISTRIES.length].name,
    lga: LGAS[i % LGAS.length],
    budget,
    spent,
    progress,
    status,
    pillar: PILLARS[i % PILLARS.length].name,
    contractor: ["Julius Berger","CCECC","Setraco","Reynolds Construction","Hartland Nig. Ltd","Kogi Build Ltd"][i % 6],
    start: `2024-0${(i % 9) + 1}-1${i % 9}`,
    due: `2026-0${(i % 9) + 1}-2${i % 9}`,
    risk: ["Low","Medium","High"][i % 3] as "Low" | "Medium" | "High",
  };
});

export const KPIS = {
  statePerformance: 84,
  developmentPlan: 76,
  budgetUtil: 71,
  revenue: 119, // % of target
  projectsTotal: PROJECTS.length * 17, // pretend > 500
  projectsDelayed: 47,
  staffActive: 1248,
  citizenScore: 4.3,
};

export const BUDGET_TREND = [
  { m: "Jan", planned: 38, actual: 31 },
  { m: "Feb", planned: 42, actual: 39 },
  { m: "Mar", planned: 55, actual: 50 },
  { m: "Apr", planned: 61, actual: 58 },
  { m: "May", planned: 70, actual: 65 },
  { m: "Jun", planned: 78, actual: 72 },
  { m: "Jul", planned: 84, actual: 80 },
  { m: "Aug", planned: 90, actual: 86 },
  { m: "Sep", planned: 96, actual: 89 },
  { m: "Oct", planned: 104, actual: 95 },
  { m: "Nov", planned: 112, actual: 101 },
  { m: "Dec", planned: 120, actual: 108 },
];

export const REVENUE_MIX = [
  { name: "IGR", value: 38 },
  { name: "FAAC", value: 42 },
  { name: "Grants & Aid", value: 12 },
  { name: "Capital Receipts", value: 8 },
];

export const NOTIFICATIONS = [
  { id: 1, title: "AI Brief Ready", body: "Weekly Governor Brief is ready for review.", time: "2m", tone: "info" as const },
  { id: 2, title: "High-risk project flagged", body: "Lokoja–Ajaokuta Road delivery risk score moved to 78.", time: "12m", tone: "warning" as const },
  { id: 3, title: "Procurement award", body: "Contract KGP-1004 awarded to CCECC.", time: "1h", tone: "success" as const },
  { id: 4, title: "Budget release", body: "Q3 capital release of ₦18.4B disbursed to MDAs.", time: "3h", tone: "success" as const },
  { id: 5, title: "Attendance dip", body: "Ministry of Tourism attendance below 75% this week.", time: "Yesterday", tone: "warning" as const },
];

export const AI_INSIGHTS = [
  "Capital projects in Works are 12% ahead of plan — reallocating ₦2.1B from underperforming votes could accelerate 4 stalled school projects.",
  "Predicted IGR shortfall of 6% in Q4 unless 3 high-yield revenue lines (PAYE, Land Use, Vehicle Licensing) are intensified within 21 days.",
  "Procurement turnaround time improved 28% MoM after e-Procurement rollout. Average award now 19 days vs. 27.",
  "Top performing MDA this month: Ministry of Finance (95). Bottom: Tourism, Culture & Arts (68). Recommend coaching review.",
  "Predicted delay risk: 7 capital projects (>₦500M each) are likely to miss completion within 45 days based on disbursement velocity.",
];

export const STAFF_SAMPLE = Array.from({ length: 24 }).map((_, i) => ({
  id: `KGS/${(i + 1).toString().padStart(3, '0')}/${(15 + (i % 8)).toString()}/${(40 + (i % 12)).toString()}`,
  name: ["Amaka Okoro","Ibrahim Suleiman","Halima Yusuf","Peter Adamu","Chika Eze","Musa Bello","Joy Etim","Tunde Olaniyi","Fatima Sani","Aliyu Mohammed"][i % 10] + " " + (i + 1),
  cadre: ["GL-08","GL-10","GL-12","GL-14","GL-16","GL-17"][i % 6],
  gradeLevel: ["GL-08","GL-10","GL-12","GL-14","GL-16","GL-17"][i % 6],
  ministry: MINISTRIES[i % MINISTRIES.length].name,
  attendance: 78 + ((i * 7) % 22),
  performance: 60 + ((i * 11) % 40),
  status: i % 9 === 0 ? "On Leave" : "Active",
}));

export const PROCUREMENTS = Array.from({ length: 10 }).map((_, i) => ({
  id: `KGP-PR-${1000 + i}`,
  title: PROJECT_NAMES[i],
  ministry: MINISTRIES[i].name,
  value: Math.round((80 + i * 47) * 10) / 10,
  stage: ["Planning","Tender","Bid Eval","Award","Contract","Delivery"][i % 6],
  vendor: ["Julius Berger","CCECC","Setraco","Reynolds","Hartland","Kogi Build"][i % 6],
  awarded: i > 3,
}));

export const MESSAGES = [
  { from: "DG, GDU", channel: "Governor Brief", text: "Weekly briefing dossier ready for sign-off.", time: "09:14" },
  { from: "Commissioner, Works", channel: "Projects", text: "Lokoja flyover concrete pour rescheduled to Saturday.", time: "08:51" },
  { from: "SSG", channel: "EXCO", text: "Memo on FY27 Budget Call Circular attached.", time: "Yesterday" },
  { from: "Director, Planning", channel: "Development Plan", text: "Pillar 2 mid-year review uploaded.", time: "Yesterday" },
  { from: "Procurement", channel: "Procurement", text: "Bid evaluation for KGP-1007 concluded.", time: "Mon" },
];export const MDA_HIERARCHY = [
  {
    ministry: "Ministry of Education",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "School Inspection", "Educational Technology", "Basic & Secondary Education", "Higher Education"],
    agencies: [
      { name: "State Universal Basic Education Board (SUBEB)", departments: ["School Services", "Quality Assurance", "Finance", "Human Resources", "ICT"] },
      { name: "Confluence University of Science & Technology, Osara", departments: ["Academic Planning", "Registry", "Bursary", "Works & Physical Planning"] },
      { name: "Prince Abubakar Audu University, Anyigba", departments: ["Academic Affairs", "Registry", "Bursary", "Student Affairs"] },
      { name: "Kogi State University, Kabba", departments: ["Registry", "Bursary", "Student Affairs", "Works"] },
      { name: "Kogi State Polytechnic, Lokoja", departments: ["Registry", "Bursary", "Academic Planning", "Student Affairs"] },
      { name: "College of Education (Technical), Mopa", departments: ["Registry", "Bursary", "Academic Affairs"] },
      { name: "Nigeria Korea Friendship Institute", departments: ["Training & Operations", "Finance", "Admin"] },
      { name: "Adult & Non-Formal Education", departments: ["Programme Implementation", "Monitoring & Evaluation", "Admin"] },
      { name: "Kogi State Scholarship Board", departments: ["Local Scholarship", "Foreign Scholarship", "Finance", "Admin"] },
      { name: "College of Education, Ankpa", departments: ["Registry", "Bursary", "Works"] },
      { name: "Kogi State Senior Secondary School Education Board (KGSSEB)", departments: ["Academic Services", "School Admin", "Finance", "Human Resources"] }
    ]
  },
  {
    ministry: "Ministry of Health",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Public Health", "Medical Services", "Nursing Services"],
    agencies: [
      { name: "Kogi State Primary Health Care Development Agency", departments: ["Immunization", "Maternal & Child Health", "Disease Control", "Finance"] },
      { name: "Kogi State Hospital Management Board", departments: ["Medical Services", "Nursing", "Pharmacy", "Admin"] },
      { name: "Kogi State Health Insurance Agency", departments: ["Enrollment", "Claims", "Provider Management", "Finance"] },
      { name: "Kogi State HIV/AIDS Control Agency", departments: ["Prevention", "Treatment", "M&E", "Admin"] },
      { name: "Kogi State Drugs & Medical Supply Management Agency", departments: ["Procurement", "Storage & Distribution", "Quality Control", "Finance"] },
      { name: "Prince Abubakar Audu University Teaching Hospital, Anyigba", departments: ["Clinical Services", "Nursing", "Pharmacy", "Admin"] },
      { name: "Specialist Hospital Lokoja", departments: ["Clinical Services", "Nursing", "Admin"] },
      { name: "College of Nursing & Midwifery, Obangede", departments: ["Academic Affairs", "Registry", "Bursary"] },
      { name: "College of Health Sciences & Technology, Idah", departments: ["Academic Affairs", "Registry", "Bursary"] },
      { name: "Reference Hospital Okene", departments: ["Clinical Services", "Diagnostics", "Admin", "Finance"] }
    ]
  },
  {
    ministry: "Ministry of Information & Communication",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Public Relations", "Information Services", "Digital Media"],
    agencies: [
      { name: "Kogi State Broadcasting Corporation", departments: ["News", "Programmes", "Engineering", "Marketing", "Admin"] },
      { name: "Kogi State Newspaper Corporation", departments: ["Editorial", "Circulation", "Printing", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Innovation, Science & Technology",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Science & Tech Promotion", "Innovation Hubs"],
    agencies: [
      { name: "Kogi State Information and Technology Development Agency (KITDA)", departments: ["E-Government", "Infrastructure", "Cybersecurity", "Capacity Building", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Culture & Tourism",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Tourism Promotion", "Cultural Heritage"],
    agencies: [
      { name: "Hotel & Tourism Board", departments: ["Hospitality Management", "Tourism Development", "Admin"] },
      { name: "Council for Arts & Culture", departments: ["Performing Arts", "Visual Arts", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Environment",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Climate Change", "Forestry"],
    agencies: [
      { name: "State Environmental Protection Agency", departments: ["Environmental Inspection", "Pollution Control", "Lab Services", "Admin"] },
      { name: "Sanitation & Waste Management Board", departments: ["Waste Collection", "Disposal Sites", "Enforcement", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Commerce & Industry",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Trade Promotion", "Industrial Development"],
    agencies: [
      { name: "Kogi State Enterprise Development Agency", departments: ["SME Support", "Training", "Monitoring", "Admin"] },
      { name: "Kogi State Commodity Exchange, Export Promotion & Market Development Agency", departments: ["Export Promotion", "Market Research", "Commodity Trading", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Local Government & Chieftaincy Affairs",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Chieftaincy Affairs", "Local Govt Admin"],
    agencies: [
      { name: "Kogi Agro-Allied Company", departments: ["Operations", "Sales", "Finance"] },
      { name: "Kogi Land Development Board", departments: ["Land Allocation", "Surveying", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Agriculture & Food Security",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Agricultural Services", "Fisheries"],
    agencies: [
      { name: "Kogi State Agricultural Development Project (KADP)", departments: ["Extension Services", "Crop Production", "M&E", "Finance"] }
    ]
  },
  {
    ministry: "Ministry of Livestock Development",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Veterinary Services", "Livestock Production"],
    agencies: []
  },
  {
    ministry: "Ministry of Housing & Urban Development",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Housing Policy", "Public Buildings"],
    agencies: [
      { name: "Bureau for Lands", departments: ["Land Registry", "Deeds", "Valuation", "Admin"] },
      { name: "Kogi State Utility Infrastructure Management & Compliance Agency", departments: ["Infrastructure Monitoring", "Compliance", "Admin"] },
      { name: "Kogi State Geographic Information System (KOGIS)", departments: ["GIS Mapping", "Data Management", "ICT", "Admin"] },
      { name: "Kogi State Town Planning & Development Board", departments: ["Development Control", "Urban Planning", "Enforcement", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Transport",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Road Transport", "Marine Transport"],
    agencies: []
  },
  {
    ministry: "Ministry of Water Resources",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Hydrology", "Water Supply"],
    agencies: [
      { name: "Kogi State Water Board", departments: ["Production", "Distribution", "Engineering", "Admin"] },
      { name: "Rural Water & Sanitation Agency (RUWASSA)", departments: ["Rural Supply", "Sanitation", "Community Mobilization", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Rural & Energy Development",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Rural Electrification", "Community Development"],
    agencies: [
      { name: "Rural Access Road Agency (RARA)", departments: ["Road Construction", "Maintenance", "Engineering", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Justice",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Public Prosecution", "Civil Litigation", "Legal Drafting"],
    agencies: [
      { name: "Kogi State Office of the Public Defender / Citizen's Rights Commission", departments: ["Legal Aid", "Human Rights", "Admin"] },
      { name: "Judicial Service Commission", departments: ["Appointments", "Discipline", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Youth & Sports Development",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Youth Development", "Sports Promotion"],
    agencies: [
      { name: "Kogi State Sports Council", departments: ["Coaching", "Facilities", "Admin"] },
      { name: "Kogi State Fire Service Agency", departments: ["Operations", "Fire Prevention", "Training", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Women Affairs & Social Development",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Child Welfare", "Women Empowerment"],
    agencies: [
      { name: "Kogi State Office for Disability Affairs", departments: ["Rehabilitation", "Advocacy", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Humanitarian Affairs & Poverty Alleviation",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Relief Operations", "Poverty Reduction"],
    agencies: [
      { name: "Kogi State Social Investment Programme Agency (KOSSIPA)", departments: ["Conditional Cash Transfer", "Empowerment", "M&E", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Works",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Civil Engineering", "Mechanical & Electrical"],
    agencies: [
      { name: "Road Maintenance Agency", departments: ["Highway Maintenance", "Equipment", "Engineering", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Solid Minerals & Natural Resources",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Mining Operations", "Geological Services"],
    agencies: [
      { name: "Kogi State Solid Mineral Development Agency", departments: ["Exploration", "Investment Promotion", "Admin"] },
      { name: "Kogi State Solid Minerals Processing Company Limited", departments: ["Processing", "Sales", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Finance, Budget & Economic Planning",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Budget", "Economic Planning", "Treasury"],
    agencies: [
      { name: "State Bureau of Statistics", departments: ["Economic Statistics", "Social Statistics", "Admin"] },
      { name: "Debt Management Office", departments: ["Domestic Debt", "Foreign Debt", "Admin"] },
      { name: "Office of the Accountant General", departments: ["Treasury", "Final Accounts", "Payroll", "Admin"] },
      { name: "Kogi Internal Revenue Service (KGIRS)", departments: ["Tax Assessment", "Collection", "Audit", "Admin"] },
      { name: "Bureau of Public Procurement", departments: ["Compliance", "Price Intelligence", "Admin"] },
      { name: "Kogi State Investment Promotion & Public Private Partnership Agency", departments: ["Investment Promotion", "PPP Transactions", "Admin"] }
    ]
  },
  {
    ministry: "Ministry of Special Duties & Intergovernmental Affairs",
    departments: ["Planning, Research & Statistics", "Human Resources", "Finance & Accounts", "Intergovernmental Relations", "Special Projects"],
    agencies: []
  },
  {
    ministry: "Independent Commissions, Offices & Constitutional Bodies",
    departments: [],
    agencies: [
      { name: "Kogi State Civil Service Commission", departments: ["Recruitment", "Discipline", "Promotions", "Admin"] },
      { name: "Office of the Secretary to the Government of Kogi State", departments: ["Cabinet Affairs", "General Services", "Political Affairs", "Admin"] },
      { name: "Office of the Head of Civil Service", departments: ["Establishment", "Training", "Welfare", "Admin"] },
      { name: "Government House", departments: ["Protocol", "Media", "Security", "Admin"] },
      { name: "Deputy Governor's Office", departments: ["Administration", "Protocol", "Special Duties"] },
      { name: "Office of the State Auditor General", departments: ["State Audit", "Parastatals Audit", "Admin"] },
      { name: "State Audit Service Board", departments: ["Board Administration", "Finance"] },
      { name: "Office of the Local Government Auditor General", departments: ["LGA Audit", "Admin"] },
      { name: "Local Government Audit Board", departments: ["Board Administration", "Finance"] },
      { name: "State Independent Electoral Commission (KOSIEC)", departments: ["Electoral Operations", "Voter Education", "Logistics", "Admin"] },
      { name: "Local Government Service Commission", departments: ["Appointments", "Postings", "Discipline", "Admin"] },
      { name: "Kogi State Hajj Commission", departments: ["Pilgrim Operations", "Welfare", "Admin"] },
      { name: "Christian Pilgrim Commission", departments: ["Pilgrim Operations", "Welfare", "Admin"] },
      { name: "State Security Trust Fund", departments: ["Fund Management", "Procurement", "Admin"] },
      { name: "Office of the State Security Adviser", departments: ["Intelligence", "Operations Coordination", "Admin"] },
      { name: "Kogi State House of Assembly", departments: ["Legislative Matters", "Committees", "Information", "Admin"] },
      { name: "Kogi State House of Assembly Service Commission", departments: ["Staff Appointments", "Discipline", "Admin"] },
      { name: "State Emergency Management Agency (SEMA)", departments: ["Relief Operations", "Disaster Risk Reduction", "Admin"] }
    ]
  },
  { ministry: "Governor", departments: [], agencies: [] },
  { ministry: "Deputy Governor", departments: [], agencies: [] },
  { ministry: "SSG", departments: [], agencies: [] },
  { ministry: "Chief of Staff", departments: [], agencies: [] },
  { ministry: "Deputy Chief of Staff", departments: [], agencies: [] },
  { ministry: "Head of Service", departments: [], agencies: [] },
  { ministry: "Civil Service Commission", departments: [], agencies: [] },
  { ministry: "Auditor General", departments: [], agencies: [] },
  { ministry: "Accountant General", departments: [], agencies: [] },
  { ministry: "GDU", departments: [], agencies: [] }
];

export const AGENCIES = MDA_HIERARCHY.flatMap(m => (m.agencies || []).map(a => a.name));
export const DEPARTMENTS = Array.from(new Set(MDA_HIERARCHY.flatMap(m => [
  ...(m.departments || []),
  ...(m.agencies || []).flatMap(a => a.departments || [])
])));
