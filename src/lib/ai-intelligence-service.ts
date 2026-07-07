// AI Intelligence Service Layer
// Manages the connection state and interactions for the dedicated ERP Intelligence Assistant

export interface AIConnectionStatus {
  isConnected: boolean;
  provider: 'gemini' | 'openai' | 'none';
  hasDataConnection: boolean;
  message?: string;
}

const IS_AI_CONNECTED = true;

export async function checkAIConnection(): Promise<boolean> {
  return IS_AI_CONNECTED;
}

export async function getAIProviderStatus(): Promise<AIConnectionStatus> {
  return {
    isConnected: true,
    provider: 'gemini',
    hasDataConnection: true,
    message: 'Active'
  };
}

export async function getDataConnectionStatus(): Promise<boolean> {
  return true;
}

export interface AIContextPayload {
  contextTitle: string;
  module: string;
  permissionScope: string;
  mockInsight?: string;
}

export function openAIIntelligencePanel(context?: AIContextPayload) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('openAIPanel', { detail: context });
    window.dispatchEvent(event);
  }
}

export function handleAskAI(contextTitle: string, module: string, permissionScope: string, mockInsight?: string) {
  openAIIntelligencePanel({
    contextTitle,
    module,
    permissionScope,
    mockInsight
  });
}
