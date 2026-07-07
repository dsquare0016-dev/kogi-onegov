import { createServerFn } from "@tanstack/react-start";

// Mock Database for AI Audit Logs
const AI_AUDIT_LOGS: any[] = [];

export const logAiAction = createServerFn({ method: "POST" })
  .validator((data: { 
    userId: string; 
    role: string; 
    prompt: string; 
    moduleUsed: string; 
    dataAccessed: string; 
    status: 'success' | 'failure'; 
  }) => data)
  .handler(async ({ data }) => {
    const logEntry = {
      ...data,
      id: `AILOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    // In a real app, this writes to PostgreSQL/Firebase
    AI_AUDIT_LOGS.push(logEntry);
    console.log("[AI AUDIT LOG]", logEntry);
    
    return { success: true, logId: logEntry.id };
  });

export const getAiAuditLogs = createServerFn({ method: "GET" })
  .handler(async () => {
    return AI_AUDIT_LOGS;
  });
