export const BUDGET_PROFILE = {
  year: 2026,
  entity: "Kogi Local Government",
  totalApproved: 8458927600,
  revenue: {
    total: 8458927600,
    faac: 8382658630,
    independent: 76268970
  },
  expenditure: {
    personnel: 2666117960,
    overhead: 1953784630,
    capital: 3839025010
  }
};

export const REVENUE_SOURCES = {
  faac: [
    { name: "Statutory Allocation", amount: 4952037230 },
    { name: "VAT Allocation", amount: 3250064310 },
    { name: "Excess Crude Allocation", amount: 180557090 }
  ],
  independent: {
    licenses: [
      "Boat & Canoe Licenses", "Voluntary Organization Registration", "Bake House License", 
      "Brick Making License", "Cattle Dealer License", "Fishing Permit", 
      "Hawkers Permit", "Hunting Permit", "Produce Buying License", "Abattoir License"
    ],
    fees: [
      "Contractor Registration", "Marriage Registration", "Divorce Registration", 
      "Billboard Fees", "Association Fees", "Birth Registration", "Death Registration", 
      "Burial Fees", "Business Operating Fees", "Timber Fees"
    ],
    sales: [
      "ID Cards", "Government Assets", "Seeds", "Chemicals", "Government Vehicles"
    ],
    earnings: [
      "Equipment Hire", "Government Vehicle Use", "Hall Rentals", "Commercial Activities", "Shopping Centers"
    ]
  }
};

export const SECTORS = [
  {
    name: "Administration Sector",
    totalAllocation: 1709000000,
    mdas: [
      { name: "Office of the LG Chairman", allocation: 261000000, subUnits: ["Chairman", "Vice Chairman", "Secretary to Local Government"] },
      { name: "Local Government Council", allocation: 80000000, subUnits: ["Legislative Council"] },
      { name: "Director of Personnel Management", allocation: 1368000000, subUnits: ["Staff Management", "Promotions", "Payroll", "Leave", "Attendance"] }
    ]
  },
  {
    name: "Economic Sector",
    totalAllocation: 3212142970,
    mdas: [
      { name: "Department of Agriculture & Natural Resources", allocation: 1178000000, subUnits: ["Farm Support", "Farmers Registry", "Inputs Distribution"] },
      { name: "Finance & Supply (Treasury)", allocation: 1140000000, subUnits: ["Budget Monitoring", "Revenue Collection", "Procurement"] },
      { name: "Planning Budget & Research Statistics Office", allocation: 292117960, subUnits: ["KPI Monitoring", "Development Plan Tracking"] },
      { name: "Department of Works & Housing", allocation: 602025010, subUnits: ["Roads", "Housing", "Construction Projects"] }
    ]
  },
  {
    name: "Social Sector",
    totalAllocation: 3537784630,
    mdas: [
      { name: "Department of Education", allocation: 1403000000, subUnits: ["School Projects", "Teacher Performance", "Education KPIs"] },
      { name: "Primary School System", allocation: 810784630, subUnits: ["School Monitoring", "Enrollment", "Attendance"] },
      { name: "Department of Health Care", allocation: 1324000000, subUnits: ["Hospitals", "PHCs", "Immunization", "Maternal Health"] }
    ]
  }
];

export const CAPITAL_PROJECTS = {
  total: 3839025010,
  categories: [
    {
      name: "Education",
      projects: [
        { name: "Public Schools Construction", amount: 50000000 },
        { name: "Public Schools Rehabilitation", amount: 40000000 }
      ]
    },
    {
      name: "Health",
      projects: [
        { name: "Health Centre Construction", amount: 360000000 },
        { name: "Medical Equipment", amount: 260000000 }
      ]
    },
    {
      name: "Agriculture",
      projects: [
        { name: "Agricultural Equipment", amount: 390000000 },
        { name: "Agricultural Facilities", amount: 700000000 }
      ]
    },
    {
      name: "Infrastructure",
      projects: [
        { name: "Roads Construction", amount: 200000000 },
        { name: "Roads Rehabilitation", amount: 80000000 },
        { name: "Water Facilities", amount: 50000000 },
        { name: "Infrastructure Development", amount: 80000000 },
        { name: "Markets & Parks", amount: 81060000 }
      ]
    }
  ]
};

export type AIPerformanceLine = {
  department: string;
  budgetLine: string;
  approvedBudget: number;
  amountReleased: number;
  amountSpent: number;
  projectsCreated: number;
  projectsCompleted: number;
  completionPercent: number;
  beneficiaries: string;
  expectedOutcome: string;
  actualOutcome: string;
  variance: string;
  performanceScore: number;
  aiRecommendation: string;
  status: "Overperforming" | "On Track" | "Underperforming" | "Critical";
};

export const AI_PERFORMANCE_LINES: AIPerformanceLine[] = [
  {
    department: "Department of Health Care",
    budgetLine: "Health Centre Construction & Medical Equipment",
    approvedBudget: 1324000000,
    amountReleased: 800000000,
    amountSpent: 750000000,
    projectsCreated: 15,
    projectsCompleted: 8,
    completionPercent: 53,
    beneficiaries: "15,000 Citizens",
    expectedOutcome: "15 PHCs renovated",
    actualOutcome: "8 PHCs renovated",
    variance: "-7 PHCs",
    performanceScore: 53,
    status: "Underperforming",
    aiRecommendation: "Increase project execution rate and release outstanding funds."
  },
  {
    department: "Department of Education",
    budgetLine: "Public Schools Construction & Rehabilitation",
    approvedBudget: 1403000000,
    amountReleased: 1000000000,
    amountSpent: 900000000,
    projectsCreated: 20,
    projectsCompleted: 14,
    completionPercent: 70,
    beneficiaries: "30,000 Students",
    expectedOutcome: "20 Schools Upgraded",
    actualOutcome: "14 Schools Upgraded",
    variance: "-6 Schools",
    performanceScore: 70,
    status: "On Track",
    aiRecommendation: "Maintain current contractor pace. Address supply bottlenecks in LGA East to close variance."
  },
  {
    department: "Department of Agriculture",
    budgetLine: "Agricultural Equipment & Facilities",
    approvedBudget: 1178000000,
    amountReleased: 900000000,
    amountSpent: 850000000,
    projectsCreated: 8,
    projectsCompleted: 7,
    completionPercent: 87,
    beneficiaries: "5,000 Farmers",
    expectedOutcome: "8 Tractors deployed, 5 storage silos built",
    actualOutcome: "7 Tractors deployed, 4 storage silos built",
    variance: "-1 Tractor, -1 Silo",
    performanceScore: 87,
    status: "Overperforming",
    aiRecommendation: "Excellent delivery rate. Allocate remaining ₦278M balance to procure additional irrigation pumps."
  },
  {
    department: "Department of Works & Housing",
    budgetLine: "Road Construction & Rehabilitation",
    approvedBudget: 602025010,
    amountReleased: 200000000,
    amountSpent: 180000000,
    projectsCreated: 5,
    projectsCompleted: 1,
    completionPercent: 20,
    beneficiaries: "8,500 Commuters",
    expectedOutcome: "5 major local roads rehabilitated",
    actualOutcome: "1 road rehabilitated",
    variance: "-4 roads",
    performanceScore: 20,
    status: "Critical",
    aiRecommendation: "Execution critically stalled. Escalate contractor reviews for 4 delayed roads. Release tranche 2 immediately if milestones are met."
  }
];
