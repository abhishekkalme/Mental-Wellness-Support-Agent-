import { config } from '@/config/env';
import type { ProviderId } from '@/lib/types';

export interface LlmSettings {
  provider: ProviderId;
  apiKey: string;
  model: string;
  groqApiKey: string;
  geminiApiKey: string;
}

export async function readSettings(): Promise<LlmSettings> {
  if (config.groqApiKey) {
    return {
      provider: 'groq',
      apiKey: config.groqApiKey,
      model: 'llama-3.1-8b-instant',
      groqApiKey: config.groqApiKey,
      geminiApiKey: config.geminiApiKey || '',
    };
  }
  if (config.geminiApiKey) {
    return {
      provider: 'gemini',
      apiKey: config.geminiApiKey,
      model: 'gemini-1.5-flash',
      groqApiKey: '',
      geminiApiKey: config.geminiApiKey,
    };
  }
  return {
    provider: 'groq',
    apiKey: '',
    model: 'llama-3.1-8b-instant',
    groqApiKey: '',
    geminiApiKey: '',
  };
}
