import { detectCrisis, generateCrisisResponse } from './safetyService';
import { memoryService } from './memoryService';
import { callLlm } from '@/ai/llm';
import { buildMultilingualSystemPrompt, getLanguageById } from '@/lib/chat/indianLanguages';
import type { ChatMessage } from '@/lib/types';

export async function agenticReply(
  userId: string,
  message: string,
  history: ChatMessage[] = []
): Promise<string> {
  if (detectCrisis(message)) {
    return generateCrisisResponse();
  }

  const contexts = await memoryService.fetchRelevantContext(userId, message);
  const contextString =
    contexts.length > 0 ? `Previous context:\n${contexts.map((c) => `• ${c}`).join('\n')}` : '';

  const lang = getLanguageById('en');
  const system = buildMultilingualSystemPrompt(lang, {
    safeMode: false,
    liteMode: false,
    firstGen: false,
    context: contextString,
  });

  const reply = await callLlm({
    system,
    messages: history.slice(-10),
    maxOutputTokens: 512,
    userId,
  });

  memoryService.storeInteraction(userId, message, 'user').catch(() => {});
  memoryService.storeInteraction(userId, reply, 'agent').catch(() => {});

  return reply;
}
