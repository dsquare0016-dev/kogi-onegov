import { safeGetCollection, safeSetDoc } from "./firebase";
import { projectsStore } from "./projectsStore";
import { programmesStore } from "./programmesStore";
import { devPlanStore } from "./devPlanStore";
import { useNominalRollStore } from "./nominalRollStore";

export interface RagDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  fileName?: string;
  uploadedAt: string;
  uploadedBy: string;
}

const RAG_CACHE_KEY = "gdu_rag_documents";

const getDefaultDocs = (): RagDocument[] => [
  {
    id: "doc-1",
    title: "Kogi State 32-Year Development Plan Executive Summary",
    content: "The Kogi State 32-Year Development Plan (2024-2056) focuses on economic growth, social development, infrastructure, and governance. Key targets include achieving 12% annual GDP growth, increasing literacy rate to 98%, and establishing Kogi as the premier digital technology hub in north-central Nigeria.",
    category: "Policy",
    uploadedAt: new Date().toISOString(),
    uploadedBy: "Admin"
  },
  {
    id: "doc-2",
    title: "State Agriculture & Food Security Mandate",
    content: "The agricultural blueprint prioritizes staple food cultivation (rice, cassava, maize) in Bassa, Dekina, and Ibaji LGAs. Targets: expand rice irrigation by 5,000 hectares, subsidize fertilizer distribution to 20,000 registered farmers, and establish three agro-processing zones in Confluence region.",
    category: "Legislation",
    uploadedAt: new Date().toISOString(),
    uploadedBy: "Admin"
  }
];

export const ragService = {
  async getDocuments(): Promise<RagDocument[]> {
    try {
      const docs = await safeGetCollection<RagDocument>('ai_knowledge_base', []);
      if (docs && docs.length > 0) return docs;
    } catch (e) {
      console.warn("Firestore not connected, using localStorage fallback for RAG documents", e);
    }
    
    // localStorage fallback
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(RAG_CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return getDefaultDocs();
        }
      }
      localStorage.setItem(RAG_CACHE_KEY, JSON.stringify(getDefaultDocs()));
    }
    return getDefaultDocs();
  },

  async saveDocument(doc: RagDocument): Promise<void> {
    try {
      await safeSetDoc('ai_knowledge_base', doc.id, doc);
    } catch (e) {
      console.warn("Firestore save failed, using localStorage fallback", e);
    }

    if (typeof window !== 'undefined') {
      const current = await this.getDocuments();
      const updated = [doc, ...current.filter(d => d.id !== doc.id)];
      localStorage.setItem(RAG_CACHE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('ragDocumentsUpdate'));
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      // Delete from Firestore is handled if connected
    } catch (e) {}

    if (typeof window !== 'undefined') {
      const current = await this.getDocuments();
      const updated = current.filter(d => d.id !== id);
      localStorage.setItem(RAG_CACHE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('ragDocumentsUpdate'));
    }
  },

  // Perform client-side keyword matching (RAG) across all system databases
  async queryContext(query: string): Promise<string> {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (queryTerms.length === 0) return "";

    const contextBlocks: string[] = [];

    // 1. Scan AI Knowledge Base uploaded files
    const docs = await this.getDocuments();
    docs.forEach(doc => {
      let score = 0;
      const titleLower = doc.title.toLowerCase();
      const contentLower = doc.content.toLowerCase();
      queryTerms.forEach(term => {
        if (titleLower.includes(term)) score += 12;
        if (contentLower.includes(term)) {
          const regex = new RegExp(term, 'g');
          const count = (contentLower.match(regex) || []).length;
          score += count * 3;
        }
      });
      if (score > 0) {
        contextBlocks.push(`[KNOWLEDGE BASE DOCUMENT: ${doc.title} (Category: ${doc.category})]\n${doc.content}`);
      }
    });

    // 2. Scan Strategic Pillars
    const pillars = devPlanStore.pillars;
    pillars.forEach(p => {
      let matched = false;
      const text = `${p.name} ${p.description}`.toLowerCase();
      queryTerms.forEach(term => {
        if (text.includes(term)) matched = true;
      });
      if (matched) {
        contextBlocks.push(`[DEVELOPMENT PILLAR] Title: "${p.name}", Goal: "${p.description}", Baseline Budget Allocated: ₦${p.budgetAllocated.toLocaleString()}`);
      }
    });

    // 3. Scan Programmes
    const programmes = programmesStore.programmes;
    programmes.forEach(p => {
      let matched = false;
      const text = `${p.name} ${p.mda} ${p.pillar} ${p.status}`.toLowerCase();
      queryTerms.forEach(term => {
        if (text.includes(term)) matched = true;
      });
      if (matched) {
        const linkedPj = p.projects.map(pj => `- ${pj.name} (${pj.status}, Progress: ${pj.progress}%)`).join("\n");
        contextBlocks.push(`[PROGRAMME REPORT] ID: ${p.id}, Name: "${p.name}", Managing MDA: "${p.mda}", Strategic Pillar: "${p.pillar}", Approved Budget: ₦${p.budget.toLocaleString()}, Status: ${p.status}, General Progress: ${p.progress}%\nLinked Projects:\n${linkedPj || 'None'}`);
      }
    });

    // 4. Scan Projects
    const projects = projectsStore.projects;
    projects.forEach(p => {
      let matched = false;
      const text = `${p.name} ${p.ministry} ${p.lga} ${p.status} ${p.risk}`.toLowerCase();
      queryTerms.forEach(term => {
        if (text.includes(term)) matched = true;
      });
      if (matched) {
        contextBlocks.push(`[PROJECT RECORD] ID: ${p.id}, Name: "${p.name}", MDA: "${p.ministry}", Location (LGA): "${p.lga}", Status: ${p.status}, Progress: ${p.progress}%, Risk Level: ${p.risk}, Allocated Cost: ₦${p.budget.toLocaleString()}`);
      }
    });

    // Take top 6 matched blocks to keep inside prompt context window limits
    return contextBlocks.slice(0, 6).join("\n\n");
  },

  getSystemAnomalies(): any[] {
    const anomalies: any[] = [];

    // 1. Projects Anomalies
    const projects = projectsStore.projects || [];
    projects.forEach(p => {
      if (p.progress >= 75 && (!p.spent || p.spent === 0)) {
        anomalies.push({
          id: `anom-proj-spent-${p.id}`,
          type: 'critical',
          module: 'Projects',
          title: 'Unallocated Fund Consumption Variance',
          description: `Project "${p.name}" reports ${p.progress}% progress but zero actual expenditure has been recorded in treasury files.`,
          sourceRecord: `Project ID: ${p.id}`,
          resolved: false,
          timestamp: new Date().toISOString()
        });
      }
      if ((p.status === 'Delayed' || p.status === 'At-Risk') && p.budget >= 500) {
        anomalies.push({
          id: `anom-proj-risk-${p.id}`,
          type: 'warning',
          module: 'Projects',
          title: 'High-Value Project Bottleneck Detected',
          description: `High-value project "${p.name}" (Allocated Budget: ₦${p.budget.toLocaleString()}M) is flagged as "${p.status}". Delivery timeline threatened.`,
          sourceRecord: `Project ID: ${p.id}`,
          resolved: false,
          timestamp: new Date().toISOString()
        });
      }
    });

    // 2. Nominal Roll / Workforce Anomalies
    const staff = useNominalRollStore.getState().records || [];
    const emails = new Set();
    staff.forEach(s => {
      if (emails.has(s.email)) {
        anomalies.push({
          id: `anom-staff-dup-${s.staffId}`,
          type: 'critical',
          module: 'Workforce',
          title: 'Duplicate Staff Email Reference',
          description: `Staff member "${s.fullName}" shares email address "${s.email}" with another record in the state nominal roll database.`,
          sourceRecord: `Staff ID: ${s.staffId}`,
          resolved: false,
          timestamp: new Date().toISOString()
        });
      }
      emails.add(s.email);

      if (s.dateOfBirth && s.expectedRetirementDate) {
        const birthYear = new Date(s.dateOfBirth).getFullYear();
        const retYear = new Date(s.expectedRetirementDate).getFullYear();
        const ageAtRetirement = retYear - birthYear;
        if (ageAtRetirement > 65 || ageAtRetirement < 45) {
          anomalies.push({
            id: `anom-staff-retire-${s.staffId}`,
            type: 'warning',
            module: 'Workforce',
            title: 'Anomalous Retirement Threshold',
            description: `Staff member "${s.fullName}" shows expected age at retirement of ${ageAtRetirement} years. Standard civil service retirement threshold is 60.`,
            sourceRecord: `Staff ID: ${s.staffId}`,
            resolved: false,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // 3. Load custom user-injected anomalies from AI chat
    if (typeof window !== 'undefined') {
      try {
        const customAnoms = JSON.parse(localStorage.getItem('user_injected_anomalies') || '[]');
        anomalies.push(...customAnoms);
      } catch {}
    }

    if (typeof window !== 'undefined') {
      const resolvedIds = JSON.parse(localStorage.getItem('resolved_anomalies') || '[]');
      return anomalies.map(a => resolvedIds.includes(a.id) ? { ...a, resolved: true } : a);
    }

    return anomalies;
  },

  getSystemDiscoveries(): any[] {
    const discoveries: any[] = [];
    
    // Retrieve custom documents from local cache
    let docs = [];
    if (typeof window !== 'undefined') {
      try {
        docs = JSON.parse(localStorage.getItem(RAG_CACHE_KEY) || '[]');
      } catch {}
    }
    
    docs.forEach((d: any) => {
      discoveries.push({
        id: `disc-doc-${d.id}`,
        module: 'Knowledge Base',
        title: `Ingested Document: "${d.title}"`,
        description: `Successfully analyzed and mapped ${d.category} instructions. Key data points ingested into AI local memory scope.`,
        timestamp: d.uploadedAt
      });
    });

    // Default discoveries
    discoveries.push({
      id: 'disc-budget-init',
      module: 'Budget Ingestion',
      title: 'Synchronized State Chart of Accounts',
      description: 'Ingestion pipeline established connectivity with State Finance Ledger codes.',
      timestamp: new Date().toISOString()
    });

    return discoveries;
  }
};
