import { readSettings } from '@/lib/settings';
import { ChatMessage } from '@/lib/types';
import { llmResponseCache } from '@/lib/cache';

export type LlmCallParams = {
  system: string;
  messages: ChatMessage[];
  maxOutputTokens?: number;
  userId?: string;
};

const PROVIDER_PRIORITY: Array<{
  provider: 'groq' | 'gemini' | 'openrouter' | 'ollama' | 'huggingface';
  model: string;
  maxTokens: number;
}> = [
  { provider: 'groq', model: 'llama-3.1-8b-instant', maxTokens: 768 },
  { provider: 'gemini', model: 'gemini-1.5-flash', maxTokens: 512 },
];

async function tryProvider(
  provider: string,
  apiKey: string,
  model: string,
  system: string,
  messages: ChatMessage[],
  maxTokens?: number
): Promise<string | null> {
  try {
    if (provider === 'gemini') {
      const { geminiChat } = await import('./gemini');
      return await geminiChat({ apiKey, model, system, messages, maxOutputTokens: maxTokens });
    }
    if (provider === 'groq') {
      const { groqChat } = await import('./groq');
      return await groqChat({ apiKey, model, system, messages, maxOutputTokens: maxTokens });
    }
    if (provider === 'openrouter') {
      const { openRouterChat } = await import('./openrouter');
      return await openRouterChat({ apiKey, model, system, messages });
    }
    if (provider === 'ollama') {
      const { ollamaChat } = await import('./ollama');
      return await ollamaChat({ model, system, messages });
    }
  } catch {
    return null;
  }
  return null;
}

function compressSystemPrompt(system: string): string {
  const lines = system.split('\n').filter(Boolean);
  const compressed = lines.map((l) => l.trim()).join(' | ');
  return compressed.length < system.length ? compressed : system;
}

function truncateHistory(messages: ChatMessage[], maxMsgs = 10): ChatMessage[] {
  if (messages.length <= maxMsgs) return messages;
  return messages.slice(-maxMsgs);
}

export async function callLlm(params: LlmCallParams): Promise<string> {
  const settings = await readSettings();
  const maxTokens = params.maxOutputTokens ?? 512;

  const system = compressSystemPrompt(params.system);
  const messages = truncateHistory(params.messages, 10);

  if (params.userId) {
    const cached = llmResponseCache.get(params.userId, messages.at(-1)?.content ?? '', system);
    if (cached) return cached;
  }

  for (const p of PROVIDER_PRIORITY) {
    const apiKey =
      p.provider === 'groq'
        ? settings.groqApiKey
        : p.provider === 'gemini'
          ? settings.geminiApiKey
          : settings.apiKey;

    if (!apiKey) continue;

    const reply = await tryProvider(
      p.provider,
      apiKey,
      p.provider === 'gemini' ? 'gemini-1.5-flash' : 'llama-3.1-8b-instant',
      system,
      messages,
      Math.min(maxTokens, p.maxTokens)
    );

    if (reply) {
      if (params.userId) {
        llmResponseCache.set(params.userId, messages.at(-1)?.content ?? '', system, reply);
      }
      return reply;
    }
  }

  throw new Error('All LLM providers failed');
}
